import { COMMIT_MANAGER_URL, LOGIN_URL } from '../constants/Layout';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { writeTransactionToggled, commitInProgressToggled,
         getCommitInProgress, handleError } from '../features/nso/nsoSlice';


export function findWriteTransaction(transactions, actionPath) {
  return transactions?.find(trans => trans.mode === 'read_write' &&
    trans.actionPath === actionPath)?.th;
}

function rewriteKeys(path) {
  return path.replace(/{([^}]* [^}]*)}/g, '"$1"');
}

const getJsonRpcBaseQuery = () => {
  let id = 0;
  let pendingTrans = undefined;
  let cometId = undefined;
  const baseQuery = fetchBaseQuery({ baseUrl: '/jsonrpc' });
  let subscription = undefined;
  let selector = undefined;

  const getTransType = method =>
    [ 'create',
      'delete',
      'set_value',
      'get_trans_changes',
      'delete_trans',
      'validate_commit',
      'commit' ].includes(method) ? 'read_write' :
    [ 'query',
      'get_value',
      'action' ].includes(method) ? 'read' : undefined;


  const getTransaction = async (
    transType, actionPath, dispatch, api, allowNew
  ) => {
    if (!transType) {
      return undefined;
    }

    if (!subscription) {
      subscription = dispatch(getTrans.initiate(undefined));
    }
    await subscription;

    if (!selector) {
      selector = getTrans.select();
    }
    const { data } = selector(api.getState());

    const writeTrans = findWriteTransaction(data, actionPath);
    if (writeTrans) {
      dispatch(writeTransactionToggled(true));
      return writeTrans;
    } else if (transType === 'read_write' && !allowNew) {
      return undefined;
    }

    const readTrans = data?.find(trans => !trans.actionPath);
    if (transType === 'read' && readTrans) {
      return readTrans.th;
    }

    if (!pendingTrans) {
      pendingTrans = dispatch(newTrans.initiate({ mode: transType, actionPath }));
    }
    const result = await pendingTrans;
    pendingTrans = undefined;
    if (transType === 'read_write') {
      dispatch(writeTransactionToggled(true));
    }
    return result.data;
  };

  const getComet = async (method, dispatch) => {
    if (![
      'comet',
      'subscribe_cdboper',
      'subscribe_changes'
    ].includes(method)) {
      return undefined;
    }
    if ([
      'subscribe_cdboper',
      'subscribe_changes'
    ].includes(method) && !cometId) {
      dispatch(jsonRpcApi.endpoints.comet.initiate());
    } else if (!cometId) {
      cometId = `main-1.${String(Math.random()).substring(2)}`;
    }
    return cometId;
  };

  return async ({ method, actionPath, params }, api) => {
    const comet = { comet_id: await getComet(method, api.dispatch) };

    const transType = getTransType(method);
    const th = await getTransaction(
      transType, actionPath, api.dispatch, api,
      [ 'create', 'delete', 'set_value' ].includes(method)
    );

    if (transType && !th) {
      return {};
    }

    const trans = { th };

    if ([ 'commit', 'delete_trans' ].includes(method)) {
      await api.dispatch(jsonRpcApi.util.updateQueryData('getTrans', undefined,
        draft => draft.filter(({ th }) => th !== trans.th)
      ));
    }

    const path = { path: params?.path && rewriteKeys(params.path) };

    const json = await baseQuery({
      url: method,
      method: 'POST',
      body: {
        jsonrpc: '2.0',
        id: ++id,
        method: method,
        params: {
          ...trans,
          ...comet,
          ...path,
          ...params
        }
      },
    }, api);

    if (json.data?.error) {
      const error = json.data.error;
      if (typeof error.type === 'string' &&
          error.type === 'session.invalid_sessionid' ||
          method === 'comet' && error.code === -32000) {
        window.location.assign(LOGIN_URL);

      } else if (error.message === 'Validation failed') {
        window.location.assign(COMMIT_MANAGER_URL);

      } else if (typeof error.type === 'string' &&
          error.type === 'data.not_found') {
        null;

      } else {
        api.dispatch(handleError(error.message));
        throw new Error(`Json-Rpc response error: ${error.message +
          (error.data ? `\n${JSON.stringify(error.data)}` : '')}`);
      }
    }

    if ([ 'commit', 'delete_trans' ].includes(method)) {
      await subscription.unsubscribe();
      subscription = undefined;
    }

    return {
      data: json.data
    };
  };
};

export const jsonRpcApi = createApi({
  reducerPath: 'jsonRpcApi',
  baseQuery: getJsonRpcBaseQuery(),
  tagTypes: [ 'trans', 'data', 'changes', 'device-list' ],
  keepUnusedDataFor: 300,
  invalidationBehavior: 'immediately',
  endpoints: (build) => ({

    getTrans: build.query({
      query: () => ({ method: 'get_trans' }),
      providesTags: [ 'trans' ],
      transformResponse: (response) => response.result.trans.filter(
        trans => ['running', 'cs_trans'].includes(trans.db)).map(
          trans_running => ({
            th: trans_running.th,
            mode: trans_running.mode,
            actionPath: trans_running.action_path
        }))
    }),

    getTransChanges: build.query({
      query: () => ({
        method: 'get_trans_changes',
        params: { output: 'compact' }
      }),
      providesTags: [ 'changes' ],
      transformResponse: response => response?.result?.changes?.length || 0
    }),

    newTrans: build.mutation({
      query: ({ mode, actionPath }) => ({
        method: 'new_trans',
        params: {
          db: 'running',
          conf_mode: 'private',
          mode,
          tag: 'webui-one',
          action_path: actionPath
        }
      }),
      async onQueryStarted({ mode, actionPath }, { dispatch, queryFulfilled }) {
        const { data: th } = await queryFulfilled;
        dispatch(jsonRpcApi.util.updateQueryData(
          'getTrans', undefined, (draftTrans) => {
            draftTrans.push({ th, mode, actionPath });
        }));
      },
      transformResponse: (repsonse) => repsonse.result.th
    }),

    revert: build.mutation({
      query: () => ({ method: 'delete_trans' }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        await dispatch(writeTransactionToggled(false));
      },
      invalidatesTags: [ 'trans', 'data' ]
    }),

    apply: build.mutation({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        await fetchWithBQ({ method: 'validate_commit' });
        return fetchWithBQ({ method: 'commit' });
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        dispatch(commitInProgressToggled(true));
        await queryFulfilled;
        dispatch(writeTransactionToggled(false));
        dispatch(commitInProgressToggled(false));
      },
      invalidatesTags: [ 'trans', 'device-list', 'changes' ]
    }),

    getSystemSetting: build.query({
      query: (operation) => ({
        method: 'get_system_setting',
        params: { operation }
      })
    }),

    logout: build.mutation({
      query: () => ({
        method: 'logout'
      })
    })

  })
});

const { endpoints: { newTrans, getTrans } } = jsonRpcApi;

export const {
  endpoints: { getTransChanges, getSystemSetting, logout },
  useRevertMutation, useApplyMutation, useGetTransChangesQuery
} = jsonRpcApi;

export default jsonRpcApi.reducer;
