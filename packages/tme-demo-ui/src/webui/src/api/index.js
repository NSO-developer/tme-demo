import { COMMIT_MANAGER_URL, LOGIN_URL } from '../constants/Layout';
import { writeTransactionToggled, commitInProgressToggled,
         handleError } from '../actions/uiState';
import { fetchAll } from '../actions';

class JsonRpc {
  constructor(store) {
    this.id = 0;
    this.thWrite = undefined;
    this.pendingThWrite = undefined;
    this.committing = false;
    this.thRead = undefined;
    this.store = undefined;
  }

  setStore(store) {
    this.store = store;
  }

  async request(method, params) {
    const response = await fetch(`/jsonrpc/${method}`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: ++this.id,
        method: method,
        params: params
      }),
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new Error(`Json-Rpc request failed: Status [${response.status
        }] ${response.statusText}`);
    }

    const json = await response.json();

    if (json.error) {
      const error = json.error;
      if (typeof error.type === 'string' &&
          error.type === 'session.invalid_sessionid') {
        window.location.assign(LOGIN_URL);

      } else if ( error.message === 'Validation failed') {
        window.location.assign(COMMIT_MANAGER_URL);

      } else {
        throw new Error(`Json-Rpc response error: ${error.message +
          (error.data ? `\n${JSON.stringify(error.data)}` : '')}`);
      }
    }

    return json.result;
  }

  async exists(path) {
    const th = await this.read();
    const params = { th, path };
    const result = await this.request('exists', params);
    return result.exists;
  }

  async getValue(path) {
    const th = await this.read();
    const params = { th, path };
    return this.request('get_value', params);
  }

  async getValues(params) {
    const th = await this.read();
    params = { th: th, ...params };
    return this.request('get_values', params);
  }

  async getListKeys(params) {
    const th = await this.read();
    params = { th: th, ...params };
    return this.request('get_list_keys', params);
  }

  async query(params) {
    const th = await this.read();
    params = { th: th, result_as: 'string', ...params };
    return this.request('query', params);
  }

  async runAction(params) {
    const th = await this.read();
    params = { th: th, ...params };
    const json = await this.request('run_action', params);
    return json.reduce((accumulator, { name, value }) => {
      accumulator[name] = value;
      return accumulator;
    }, {});
  }

  async read() {
    const db = 'running';

    if (this.thWrite && !this.committing) { return this.thWrite; }
    if (this.thRead) { return this.thRead; }

    const res = await this.request('get_trans');
    const readTrans = res.trans.filter(c =>
      c.db === db && c.mode === 'read');
    const writeTrans = res.trans.filter(c =>
      c.db === db && c.mode === 'read_write');

    if (writeTrans.length > 0 && !this.committing) {
      this.thWrite = writeTrans[0].th;
      this.store.dispatch(writeTransactionToggled(true));
      return writeTrans[0].th;
    }

    if (readTrans.length > 0) {
      this.thRead = readTrans[0].th;
      return readTrans[0].th;
    }

    const newTrans = await this.request('new_trans', {db: db, mode: 'read'});
    this.thRead = newTrans.th;

    return this.thRead;
  }

  async write() {
    if (this.thWrite) { return this.thWrite; }

    if (this.pendingThWrite) {
      await this.pendingThWrite;
    } else {
      this.pendingThWrite = await this.request('new_trans', {
        db: 'running',
        conf_mode: 'private',
        mode: 'read_write',
        tag: 'webui-one'
      });
    }

    this.thWrite = this.pendingThWrite.th;
    this.pendingThWrite = undefined;
    this.store.dispatch(writeTransactionToggled(true));

    return this.thWrite;
  }

  getWriteTransaction() {
    return this.thWrite;
  }

  apply = async () => {
    try {
      this.store.dispatch(commitInProgressToggled(true));
      await this.request('validate_commit', {th: this.thWrite});
      this.committing = true;
      await this.request('commit', {th: this.thWrite});
      this.thWrite = undefined;
      this.committing = false;
      this.store.dispatch(writeTransactionToggled(false));
      this.store.dispatch(commitInProgressToggled(false));
    } catch(error) {
      this.committing = false;
      this.store.dispatch(handleError('Error committing transaction', error));
      this.store.dispatch(commitInProgressToggled(false));
    }
  }

  revert = async () => {
    try {
      await this.request('delete_trans', {th: this.thWrite});
      this.thWrite = undefined;
      this.store.dispatch(writeTransactionToggled(false));
      this.store.dispatch(fetchAll());
    } catch(error) {
      this.store.dispatch(handleError('Error reverting transaction', error));
    }
  }
}

export default new JsonRpc();
