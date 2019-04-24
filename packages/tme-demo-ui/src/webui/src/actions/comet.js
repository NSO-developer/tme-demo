export const SUBSCRIPTION_REQUEST = 'subscription-request';
export const SUBSCRIPTION_SUCCESS = 'subscription-success';
export const SUBSCRIPTION_FAILURE = 'subscription-failure';
export const SUBSCRIPTION_EVENT = 'subscription-event';


// === Action Creators ========================================================

export function subscriptionRequest(path, cdbOper) {
  return ({ type: SUBSCRIPTION_REQUEST, path, cdbOper });
}

export function subscriptionSuccess(path, cdbOper) {
  return ({ type: SUBSCRIPTION_SUCCESS, path, cdbOper });
}

export function subscriptionEvent(keypath, op) {
  return ({ type: SUBSCRIPTION_EVENT, keypath, op });
}
