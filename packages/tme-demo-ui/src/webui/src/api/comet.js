import { jsonRpcApi } from './index';
import { updateQueryData, removeKeys, removePredicates } from './query';

export const unsubscribeAll = () => async (dispatch, getState) => {
  const state = getState();
  await Promise.all(
    cometApi.util.selectInvalidatedBy(state, [ 'subscription' ]).map(
      ({ originalArgs }) => dispatch(unsubscribe.initiate({
        handle: subscribe.select(originalArgs)(state).data.result.handle
      }))
    )
  );
};

export const stopThenGoToUrl = (url) => async (dispatch, getState) => {
  await unsubscribeAll();
  window.location.assign(url);
};

const processCometUpdates = (results, dispatch, getState) => {
  const invalidateTags = new Set([]);
  const state = getState();
  const queries = jsonRpcApi.util.selectCachedArgsForQuery(state, 'query');

  results.forEach(({ message }) => {
    message.changes?.forEach(({ keypath, op, value }) => {
      if (op === 'value_set') {
        const [ , itemKeypath, leaf ] = keypath.match(/(.*)\/(.*)/);
        const queryKey = removeKeys(itemKeypath);
        const query = queries.find(({ xpathExpr }) =>
          removePredicates(xpathExpr) === queryKey
        );
        if (query?.selection.includes(leaf)) {
          const { data } = jsonRpcApi.endpoints['query'].select(queryKey)(state);
          if (data.find(({ keypath }) => keypath === itemKeypath)) {
            if (dispatch) {
              dispatch(updateQueryData(itemKeypath, leaf, value));
            }
          } else {
            invalidateTags.add(queryKey);
          }
        }
      } else if (op === 'created') {
        const queryKey = removeKeys(keypath);
        const query = queries.find(({ xpathExpr }) =>
          removePredicates(xpathExpr) === queryKey
        );
        if (query) {
          const { data } = jsonRpcApi.endpoints['query'].select(queryKey)(state);
          if (!data.find(item => item.keypath === keypath)) {
            invalidateTags.add(queryKey);
          }
        }
      } else if (op === 'deleted') {
        queries.filter(({ xpathExpr }) => {
          const queryKey = removePredicates(xpathExpr);
          if (queryKey.startsWith(removeKeys(keypath))) {
            const { data } = jsonRpcApi.endpoints['query'].select(queryKey)(state);
            data.forEach(({ keypath: itemKeypath }) => {
              if (itemKeypath.startsWith(keypath)) {
                dispatch(updateQueryData(itemKeypath));
              }
            });
          }
        });
      }
    });
  });
  return [ ...invalidateTags ].map(id => ({ type: 'data', id }));
};


export const cometApi = jsonRpcApi.injectEndpoints({
  endpoints: (build) => ({

    comet: build.mutation({
      query: () => ({
        method: 'comet'
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled, getState }) {
        const { data } = await queryFulfilled;
        dispatch(comet.initiate());

        const result = data?.result || [];
        const invalidateTags = processCometUpdates(result, dispatch, getState);
        if (invalidateTags.length > 0) {
          console.log(`Invaliding tags ${invalidateTags.map(({ id }) => id)}`);
          dispatch(jsonRpcApi.util.invalidateTags(invalidateTags));
        }
      }
    }),

    subscribe: build.query({
      query: ({ path, cdbOper, skipLocal, hideValues }) => cdbOper === false ? {
        method: 'subscribe_changes',
        params: {
          path: path,
          skip_local_changes: Boolean(skipLocal),
          hide_values: Boolean(hideValues)
        },
      } : {
        method: 'subscribe_cdboper',
        params: { path }
      },
      providesTags: [ 'subscription' ],
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        const response = await queryFulfilled;
        dispatch(startSubscription.initiate(
          { handle: response.data.result.handle }));
      }
    }),

    startSubscription: build.mutation({
      query: ({ handle }) => ({
        method: 'start_subscription',
        params: { handle: handle },
      }),
    }),

    unsubscribe: build.mutation({
      query: ({ handle }) => ({
        method: 'unsubscribe',
        params: { handle: handle },
      }),
    })

  })
});

const { endpoints: { comet, startSubscription } } = cometApi;
export const { endpoints: { subscribe, unsubscribe } } = cometApi;
