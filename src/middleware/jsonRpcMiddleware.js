import JsonRpc from '../utils/JsonRpc';
import { handleError } from '../actions/uiState';

export default store => next => async action => {
  const { jsonRpcGetValues, jsonRpcSetValues, jsonRpcDelete, jsonRpcQuery,
          types, actions, errorMessage } = action;

  if (jsonRpcGetValues) {
    const { name, path, leafs, resultKeys } = jsonRpcGetValues;
    const [ requestType, successType, failureType ] = types;

    next({ type: requestType, name });

    try {
      const json = await JsonRpc.getValues({ path, leafs });
      const values = json && json.values ? json.values : [];
      const result = values.reduce((accumulator, current, index) => {
        accumulator[resultKeys[index]] = current.value ? current.value : '';
        return accumulator;
      }, {});

      return next({
        type: successType,
        name: name,
        item: result,
        receivedAt: Date.now()
      });
    } catch(exception) {
      return next(handleError(errorMessage ||
        `Failed to get values from ${path}`, exception, failureType));
    }
  }

  if (jsonRpcSetValues) {
    const [ startAction ] = actions;
    const { pathValues } = jsonRpcSetValues;
    try {
      next(startAction);
      const th = await JsonRpc.write();
      await Promise.all(pathValues.map(pathValue =>
        JsonRpc.request('set_value', {
          th    : th,
          path  : pathValue.path,
          value : pathValue.value
        })
      ));
      return;
    } catch(exception){
      return next(handleError(errorMessage ||
        'Failed to set values', exception));
    }
  }

  if (jsonRpcDelete) {
    const { path, name } = jsonRpcDelete;
    const [ doneType ] = types;

    try {
      const th = await JsonRpc.write();
      await JsonRpc.request('delete', {th, path: `${path}{${name}}`});
      return next({
        type: doneType,
        name: name
      });
    } catch(exception) {
      return next(handleError(errorMessage ||
        `Failed to delete ${name}`, exception));
    }
  }

  if (jsonRpcQuery) {
    const { contextNode, xpathExpr, selection,
            resultKeys, objectKey, transform } = jsonRpcQuery;
    const [ requestType, successType, failureType ] = types;

    next({ type: requestType });

    try {
      const json = await JsonRpc.query({
        context_node : contextNode,
        xpath_expr   : xpathExpr,
        selection    : selection
      });

      const result = json.results.reduce((resultAcc, resultArray) => {
        const item = resultArray.reduce((accumulator, current, index) => {
          accumulator[resultKeys[index]] = current;
          return accumulator;
        }, {});
        if (objectKey) {
          resultAcc[item[objectKey]] = item;
        } else {
          resultAcc.push(item);
        }
        return resultAcc;
      }, objectKey ? {} : []);

      return next({
        type: successType,
        items: typeof transform === 'function' ? transform(result) : result,
        receivedAt: Date.now()
      });
    } catch(exception) {
      return next(handleError(errorMessage ||
        'Failed to execute query', exception, failureType));
    }
  }

  return next(action);
};
