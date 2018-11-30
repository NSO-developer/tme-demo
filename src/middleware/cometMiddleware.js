import Comet from '../utils/Comet';
import { handleError } from '../actions/uiState';
import { subscriptionRequest, subscriptionSuccess, subscriptionEvent,
         SUBSCRIPTION_FAILURE } from '../actions/comet';


export default store => next => async action => {
  const { subscribe, actions } = action;

  if (subscribe) {
    const { path, cdbOper } = subscribe;
    const [ getAction, deleteAction ] = actions;
    const regex = new RegExp(`${path}{(.+)}$`);

    next(subscriptionRequest(path, cdbOper));
    try {
      await Comet.subscribe({
        path, cdbOper,
        skipLocalChanges: false,
        callback : evt => {
          evt.changes.forEach(change => {
            const { keypath, op } = change;
            const match = regex.exec(keypath);

            if (match)
              next(subscriptionEvent(keypath, op));
              if (op === 'created') {
                store.dispatch(getAction(match[1]));
              } else if (op === 'deleted') {
                store.dispatch(deleteAction(match[1]));
              }
          });
        }
      });
      return next(subscriptionSuccess(path, cdbOper));
    } catch(exception) {
      return next(handleError(`Failed to subscribe to ${path}`,
        exception, SUBSCRIPTION_FAILURE));
    }
  }

  return next(action);
};
