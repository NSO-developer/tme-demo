import { useMemo } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import { jsonRpcApi } from './index';
import { subscribe, unsubscribe } from './comet';

export const pathKeyRegex = /{[^}]*}/g;
export const xpathPredicateRegex = /\[[^\]]*\]/g;

export const removeKeys = path => path.replace(pathKeyRegex, '');
export const removePredicates = xpath => xpath.replace(xpathPredicateRegex, '');

export const camelCase = value => (value.endsWith('/id') ? value.replace(
  /(\.\.\/)/g, 'parent-') : value).replace(
  /(\.\.\/)+/, '').replace(
  /deref\([^)]+\)\//, '').replace(
  /boolean\(([^)]+)\)/, '$1').replace(
  /[-/]([a-z])/gi, (m, c) => c.toUpperCase()).replace(
  /-/, '');

export const swapLabels = (data, labels) => {
  if (!data || !labels) {
    return data;
  }
  const convertedLabels = convertKeys(labels);
  return Object.entries(data).reduce((accumulator, [ key, value ]) => {
    if (key in convertedLabels) {
      const label = convertedLabels[key];
      if (!(label in accumulator) || !accumulator[label]) {
        accumulator[label ?? key] = value;
      }
    }
    return accumulator;
  }, {});
};

export const convertKeys = (data, replaceName) =>
  Object.fromEntries(Object.entries(data).map(
    ([ key, value ], index) => [
      replaceName && key.endsWith('../name') ? 'parentName'
          : replaceName && index == 0 ? 'name' : camelCase(key), value ]));


export function isFetching (items) {
  return items && Object.values(items).some(value => value !== 'OK');
}

export function useMemoizeWhenFetched(fetching) {
  const fetched = !isFetching(fetching);
  const memoized = useMemo(() => fetching, [ fetched ]);
  return fetched ? memoized : fetching;
}

export function fetchStatus({ isFetching, isSuccess, isError }) {
  return isFetching ? '' : isSuccess ? 'OK' : isError ? 'Error' : 'OK';
}

export function useQueryState(path, queryKey) {
  return fetchStatus(query.useQueryState({ xpathExpr: path, queryKey }));
}

export function createItemsSelectorWithArray(keyValues) {
  return createSelector(
    res => res.data,
    res => res.isFetching,
    res => res.isSuccess,
    res => res.isError,
    (raw, isFetching, isSuccess, isError) => ({
      data: raw?.reduce((accumulator, item) => {
        //const { [key]: itemKey, ...data } = item;
        if (keyValues.every(([ key, value ]) => item[key] === value)) {
          accumulator.push(item);
        }
        return accumulator;
      }, []), isFetching, isSuccess, isError
    })
  );
}

export function createItemsSelector(key, value) {
  return createSelector(
    res => res.data,
    res => res.isFetching,
    res => res.isSuccess,
    res => res.isError,
    (raw, isFetching, isSuccess, isError) => ({
      data: raw?.reduce((accumulator, item) => {
        const { [key]: itemKey, ...data } = item;
        if (itemKey === value) {
          accumulator.push(data);
        }
        return accumulator;
      }, []), isFetching, isSuccess, isError
    })
  );
}

export function selectItemWithArray(keyValues) {
  return result => ({ data: result.data?.find(item =>
    keyValues.every(([ key, value ]) => item[key] === value) )});
}

export function selectItem(key, value) {
  return selectItemWithArray([ [ key, value ] ]);
}

const transformQueryResponse = (selection, response, keys, isLeafList) =>
  response.result.results.map(
    result => convertKeys(result.reduce(
      (accumulator, current, index) => {
        const path = selection[index];
        accumulator[path] = current.value;

        if (!('keypath' in accumulator) && 'keypath' in current
            && !path.includes('/')) {
          accumulator.keypath = isLeafList
            ? `${current.keypath}{${current.value}}`
            : current.keypath.replace(/\/[^/]+$/, '');
        }
        return accumulator;
      }, {}
    ), true)
  );

export function updateQueryData(keypath, name, args, queryKey, dispatch) {
  return jsonRpcApi.util.updateQueryData(
    'query', { xpathExpr: removeKeys(keypath), queryKey }, draft => {
      const index = draft.findIndex(item => item.keypath === keypath);
      if (typeof args === 'object') {
        index === -1 && draft.push({ keypath, name, ...args });
      } else if (typeof args === 'string') {
        if (index == -1) {
          if (dispatch) {
            console.log(`Invalidating ${removeKeys(keypath)}. New item ${keypath}`);
            dispatch(jsonRpcApi.util.invalidateTags([
              { type: 'data', id: removeKeys(keypath) }
            ]));
          }
        } else {
          console.log(`Updating ${keypath}: ${name}=${args}`);
          draft[index][camelCase(name)] = args;
        }
      } else {
        draft.splice(index, 1);
      }
    });
}

export const queryApi = jsonRpcApi.injectEndpoints({
  endpoints: (build) => ({

    query: build.query({
      query: ({ xpathExpr, selection }) => ({
        method: 'query',
        transType: 'read',
        params: {
          xpath_expr : xpathExpr,
          result_as  : 'keypath-value',
          selection
        }
      }),
      providesTags: (_, __, { xpathExpr, tag }) => (
        [ { type: 'data', id: removePredicates(xpathExpr) } ]
      ),
      transformResponse: (response, _, { selection, keys, isLeafList }) => (
        transformQueryResponse(selection, response, keys, isLeafList)
      ),
      serializeQueryArgs: ({ queryArgs }) => (
        typeof queryArgs === 'string'
          ? `query(${queryArgs})`
          : `${queryArgs.queryKey || 'query'}(${
            removePredicates(queryArgs.xpathExpr)})`
      ),
      async onCacheEntryAdded(
        args,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        if (args.subscribe) {
          const { leaf, cdbOper, skipLocal, hideValues } = args.subscribe;
          let subscription = undefined;
          let result = undefined;
          const path = `${removePredicates(args.xpathExpr)}${
            leaf ? `/${leaf}` : ''}`;
          try {
            await cacheDataLoaded;
            subscription = dispatch(subscribe.initiate(
              { path, cdbOper, skipLocal, hideValues })
            );
            const { data } = await subscription;
            result = data.result;
          } catch {
            // no-op in case `cacheEntryRemoved` resolves before
            // `cacheDataLoaded`, in which case `cacheDataLoaded` will throw
          }
          await cacheEntryRemoved;
          console.log('unsubscribing');
          dispatch(unsubscribe.initiate({ handle: result.handle }));
          subscription.unsubscribe();
      }}
    }),

  })
});


export const { useQueryQuery, endpoints: { query } } = queryApi;
export const { useQuerySubscription } = query;
