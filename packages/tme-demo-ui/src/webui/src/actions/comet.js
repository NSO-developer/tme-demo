export const START_SUBSCRIPTION_REQUEST = 'start-subscription-request';
export const START_SUBSCRIPTION_SUCCESS = 'start-subscription-success';
export const START_SUBSCRIPTION_FAILURE = 'start-subscription-failure';

export const STOP_SUBSCRIPTION_REQUEST = 'stop-subscription-request';
export const STOP_SUBSCRIPTION_SUCCESS = 'stop-subscription-success';
export const STOP_SUBSCRIPTION_FAILURE = 'stop-subscription-failure';

export const SUBSCRIPTION_EVENT = 'subscription-event';


// === Action Creators ========================================================

export const startSubscriptionRequest = (
  path, cdbOper, skipLocal, hideChanges, skipPlanOnlyChanges) => ({
    type: START_SUBSCRIPTION_REQUEST,
    path, cdbOper, skipLocal, hideChanges, skipPlanOnlyChanges
});

export const startSubscriptionSuccess = (path, handle) => ({
  type: START_SUBSCRIPTION_SUCCESS, path, handle
});

export const stopSubscriptionRequest = (path, handle) => ({
  type: STOP_SUBSCRIPTION_REQUEST, path, handle
});

export const stopSubscriptionSuccess = (path, handle) => ({
  type: STOP_SUBSCRIPTION_SUCCESS, path, handle
});

export const subscriptionEvent = (keypath, op) => ({
  type: SUBSCRIPTION_EVENT, keypath, op
});


// === Comet Middleware =======================================================

export const simpleSubscribe = (path, callback) => ({
  subscribe: {
    path: path,
    cdbOper: false,
    skipLocal: false,
    hideChanges: true
  },
  directCallback: callback
});

export const unsubscribe = (path, handle) => ({
  unsubscribe: { path, handle }
});
