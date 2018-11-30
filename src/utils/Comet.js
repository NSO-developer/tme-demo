import { handleError } from '../actions/uiState';
import JsonRpc from './JsonRpc';

class Comet {
  constructor(store) {
    this.callbacks = {};
    this.polling = false;
    this.cometId = `main-1.${String(Math.random()).substring(2)}`;
  }

  poll = async () => {
    if (this.polling) {
      return;
    }

    this.polling = true;

    while (this.polling) {
      try {
        const notifications = await JsonRpc.request('comet', {
          comet_id: this.cometId
        });

        notifications.forEach(notification => {
          const { handle, message } = notification;
          const callback = this.callbacks[handle];

          if (!callback) {
            if (!message || (message.stopped !== true)) {
              console.error(`No callback handler for event handle ${handle}`);
            }
          } else {
            callback(message);
          }
        });
      } catch(exception) {
        this.polling = false;
        handleError('Comet polling error', exception);
      }
    }
  }

  stop = async () => {
    console.log(this.callbacks);
    await Promise.all(Object.keys(this.callbacks).map(
      handle => JsonRpc.request('unsubscribe', { handle })
    ));
    this.polling = false;
    this.callbacks = {};
  }

  stopThenGoToUrl = async url => {
    await this.stop();
    window.location.assign(url);
  }

  start = async () => {
    await this.unsubscribeAll();
    this.poll();
  }

  subscribe = async ({ path, skipLocalChanges, callback, cdbOper }) => {
    try {
      const result = cdbOper
        ? await JsonRpc.request('subscribe_cdboper', {
            comet_id : this.cometId,
            path : path,
          })
        : await JsonRpc.request('subscribe_changes', {
            comet_id : this.cometId,
            path : path,
            skip_local_changes : skipLocalChanges,
            leaf_list_as_leaf: true
          });

      const { handle } = result;
      if (this.callbacks[handle]) {
        console.error(`Callback handler '${handle}' already set`);
      } else {
        this.callbacks[handle] = callback;
      }
      await JsonRpc.request('start_subscription', { handle });
      return handle;
    } catch(exception) {
      handleError(`Comet error subscribing to ${path}`, exception);
    }
  }

  unsubscribeAll = async () => {
    const result = await JsonRpc.request('get_subscriptions');
    if (result && result.subscriptions) {
      await Promise.all(result.subscriptions.map(({ handle }) =>
        JsonRpc.request('unsubscribe', { handle })
      ));
    }
  }
}

export default new Comet();
