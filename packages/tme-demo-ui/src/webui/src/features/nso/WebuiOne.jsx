import './nso.css';

import React from 'react';
import { PureComponent, Fragment } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { TITLE } from 'constants/Layout';
import Header from './Header';

import { getError, getHasWriteTransaction, getCommitInProgress,
         getBodyOverlayVisible, handleError } from './nsoSlice';
import { getSystemSetting } from 'api';


const mapStateToProps = state => ({
  error: getError(state),
  hasWriteTransaction: getHasWriteTransaction(state),
  commitInProgress: getCommitInProgress(state),
  bodyOverlayVisible: getBodyOverlayVisible(state),
  version: getSystemSetting.select('version')(state).data?.result,
  user: getSystemSetting.select('user')(state).data?.result
});

const mapDispatchToProps = {
  handleError,
  getSystemSettingQuery: getSystemSetting.initiate,
};

class WebuiOne extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      user: '<username>',
      version: '<version>',
    };
  }

  closeBodyOverlay = () => {
    const { setBodyOverlay } = this.props;
    setBodyOverlay(false);
  };

  clearError = () => {
    const { handleError } = this.props;
    handleError(undefined);
  };

  async componentDidMount() {
    const { getSystemSettingQuery } = this.props;
    await getSystemSettingQuery('version');
    await getSystemSettingQuery('user');
  }

  render() {
    console.debug('NsoWrapper Render');
    const { user, version } = this.props;
    const { children, error, hasWriteTransaction,
      commitInProgress, bodyOverlayVisible } = this.props;
    return (
      <div className="nso-background">
        <Header
          user={user} version={version} title={TITLE}
          commitInProgress={commitInProgress}
          hasWriteTransaction={hasWriteTransaction}
        />
        <div className="nso-body">
          <div className={classNames('nso-body__overlay', {
            'nso-body__overlay--visible': bodyOverlayVisible
          })}/>
          <div className="nso-body__content">{children}</div>
        </div>
        <Modal
          isOpen={!!error}
          contentLabel="Error Message"
          onRequestClose={this.clearError}
          className="nso-modal__content"
          overlayClassName="nso-modal__overlay"
          closeTimeoutMS={1000}
        >
          <div className="nso-modal__title">Oops! Something went wrong....</div>
          <div className="nso-modal__body">{error &&
            <Fragment>
              <p>{error.title}</p>
              <p>{error.message}</p>
            </Fragment>}
          </div>
          <div className="nso-modal__footer">
            <button className="btn__primary" onClick={this.clearError}>
              <span className="btn__label">Close</span>
            </button>
          </div>
        </Modal>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WebuiOne);
