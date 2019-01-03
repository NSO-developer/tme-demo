import './index.css';

import React from 'react';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import classNames from 'classnames';

import * as Layout from '../../constants/Layout';

import Header from './Header';
import Footer from './Footer';

import { getError, getHasWriteTransaction, getCommitInProgress,
         getBodyOverlayVisible } from '../../reducers';
import { handleError } from '../../actions/uiState';

import JsonRpc from '../../utils/JsonRpc';


const mapStateToProps = state => ({
  error: getError(state),
  hasWriteTransaction: getHasWriteTransaction(state),
  commitInProgress: getCommitInProgress(state),
  bodyOverlayVisible: getBodyOverlayVisible(state)
});

const mapDispatchToProps = {
  handleError
};


class NsoWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      user: '<username>',
      version: '<version>',
      applications: [{
        href  : Layout.COMMIT_MANAGER_URL,
        title : 'Commit manager',
        abb   : 'C'
      }, {
        href  : Layout.CONFIGURATION_EDITOR_URL,
        title : 'Configuration editor',
        abb   : 'E'
      }, {
        href  : Layout.DASHBOARD_URL,
        title : 'Dashboard',
        abb   : 'B'
      }, {
        href  : Layout.DEVICE_MANAGER_URL,
        title : 'Device manager',
        abb   : 'D'
      }, {
        href  : Layout.SERVICE_MANAGER_URL,
        title : 'Service manager',
        abb   : 'S'
      }]
    };
  }

  closeBodyOverlay = () => {
    const { setBodyOverlay } = this.props;
    setBodyOverlay(false);
  }

  clearError = () => {
    const { handleError } = this.props;
    handleError(undefined);
  }

  getVersion() {
    return JsonRpc.request(
      'get_system_setting', { operation: 'version' }
    );
  }

  getUser() {
    return JsonRpc.request(
      'get_system_setting', { operation: 'user' }
    );
  }

  async getApplications() {
    const json = await JsonRpc.query({
      path: '/webui:webui/webui-one:applications/application',
      selection: [
        'href',
        'title',
        'abbreviation',
        'shortcut'
    ]});
    return json.results.reduce((acc, [href, title, abb, shortcut]) => {
      if (shortcut) {
        acc.push({href, title, abb});
      }
      return acc;
    }, []);
  }

  async componentDidMount() {
    const { handleError } = this.props;
    try {
      const [version, user, applications] = await Promise.all([
        this.getVersion(), this.getUser(), this.getApplications()
      ]);
      this.setState({ user, version,
        applications: [ ...this.state.applications, ...applications ]
      });
    } catch(error) {
      handleError('Error retrieving NSO settings', error);
    }
  }

  render() {
    console.debug('NsoWrapper Render');
    const { user, version, applications } = this.state;
    const { children, error, hasWriteTransaction,
            commitInProgress, bodyOverlayVisible } = this.props;
    return (
      <div className="nso-background">
        <Header
          user={user} version={version} title={Layout.TITLE}
          commitInProgress={commitInProgress}
          hasWriteTransaction={hasWriteTransaction}
        />
          <div className="nso-body">
            <div className={classNames('nso-body__overlay', {
              'nso-body__overlay--visible': bodyOverlayVisible
            })}/>
            <div className="nso-body__content">{children}</div>
          </div>
        <Footer
          applications={applications}
          current={Layout.TITLE}
          hasWriteTransaction={hasWriteTransaction}
        />
        <Modal
          isOpen={!!error}
          contentLabel="Error Message"
          onRequestClose={this.clearError}
          className="nso-modal__content"
          overlayClassName="nso-modal__overlay"
        >
          <div className="nso-modal__title">Oops! Something went wrong....</div>
          <div className="nso-modal__body">{error && error.title}</div>
          <div className="nso-modal__body">{error && error.message}</div>
          <div className="nso-modal__footer">
            <button className="nso-btn" onClick={this.clearError}>Close</button>
          </div>
        </Modal>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NsoWrapper);
