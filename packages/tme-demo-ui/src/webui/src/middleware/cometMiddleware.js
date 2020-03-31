import Comet from '../utils/Comet';
import { handleError } from '../actions/uiState';
import { startSubscriptionRequest, startSubscriptionSuccess,
         stopSubscriptionRequest, stopSubscriptionSuccess,
         START_SUBSCRIPTION_FAILURE, STOP_SUBSCRIPTION_FAILURE,
         subscriptionEvent } from '../actions/comet';


export default store => next => async action => {
  const { subscribe, actions, directCallback, unsubscribe } = action;

  if (subscribe) {
    const { path, cdbOper, skipLocal, hideChanges,
            skipPlanOnlyChanges } = subscribe;
    const regex = new RegExp(`${path}{"?([^}]+?)"?}$`);
    const planRegex = new RegExp(`${path}{[^{]+}/plan/component.*$`);

    next(startSubscriptionRequest(path, cdbOper, skipLocal,
      hideChanges, skipPlanOnlyChanges));
    try {
      const handle = await Comet.subscribe({
        path, cdbOper, skipLocal, hideChanges,
        callback : evt => {
          if (Array.isArray(evt.changes) && (!skipPlanOnlyChanges ||
            !evt.changes.every(({ keypath }) => planRegex.test(keypath)))) {
            if (skipPlanOnlyChanges || hideChanges) {
              next(subscriptionEvent(path, 'changes-hidden'));
              if (actions && typeof actions[0] === 'function') {
                store.dispatch(actions[0]());
              } else if (typeof directCallback === 'function') {
                directCallback();
              }
            } else {
              const [ getAction, deleteAction, modifyAction ] = actions;
              evt.changes.forEach(change => {
                const { keypath, op } = change;
                const match = regex.exec(keypath);

                if (match) {
                  next(subscriptionEvent(keypath, op));
                  if (op === 'created' && typeof getAction === 'function') {
                    store.dispatch(getAction(match[1]));
                  } else if (op === 'deleted' &&
                      typeof deleteAction === 'function') {
                    store.dispatch(deleteAction(match[1]));
                  } else if (op === 'modified' &&
                      typeof modifyAction === 'function') {
                    store.dispatch(modifyAction(match[1]));
                  }
                }
              });
            }
          }
        }
      });
      return next(startSubscriptionSuccess(path, handle));
    } catch(exception) {
      return next(handleError(`Failed to subscribe to ${path}`,
        exception, START_SUBSCRIPTION_FAILURE));
    }
  } else if (unsubscribe) {
    const { path, handle } = unsubscribe;
    next(stopSubscriptionRequest(path, handle));
    try {
      const { handle } = unsubscribe;
      await Comet.unsubscribe(handle);
      return next(stopSubscriptionSuccess(path, handle));
    } catch(exception) {
      return next(handleError(`Failed to unsubscribe from ${path}`,
        exception, STOP_SUBSCRIPTION_FAILURE));
    }
  }

  return next(action);
};
