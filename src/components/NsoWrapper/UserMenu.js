import React from 'react';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import classNames from 'classnames';

import { LOGIN_URL } from '../../constants/Layout';
import { handleError } from '../../actions/uiState';

import JsonRpc from '../../utils/JsonRpc';
import Comet from '../../utils/Comet';


const mapDispatchToProps = {
  handleError
};


class UserMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
      logoutDialogOpen: false,
      transactionChanges: 0
    };
  }

  openMenu = () => {
    this.setState({ menuOpen: true });
  }

  closeMenu = () => {
    this.setState({ menuOpen: false });
  }

  openLogoutDialog = () => {
    this.setState({ logoutDialogOpen: true });
  }

  closeLogoutDialog = () => {
    this.setState({ logoutDialogOpen: false });
  }

  logout = async () => {
    const { handleError } = this.props;
    try {
      await Comet.stop();
      await JsonRpc.request('logout');
      window.location.assign(LOGIN_URL);
    } catch(error) {
      handleError('Error logging out', error);
    }
  }

  safeLogout = async () => {
    this.closeMenu();
    const th = JsonRpc.getWriteTransaction();
    if (th) {
      this.openLogoutDialog();
      const result = await JsonRpc.request('get_trans_changes', {
        output: 'compact', th: th
      });
      this.setState({ transactionChanges: result.changes.length });
    } else {
      this.logout();
    }
  }

  render() {
    console.debug('UserMenu Render');
    const { menuOpen, logoutDialogOpen, transactionChanges } = this.state;
    const { user } = this.props;
    return (
      <div className="nso-user-menu">
        <button
          className="btn-reset nso-user-menu__user"
          onClick={this.openMenu}
        >{user} ▾</button>
        <div className={classNames('nso-user-menu__popup', {
          'nso-user-menu__popup--open': this.state.menuOpen
        })}>
          <div className="nso-user-menu__overlay" onClick={this.closeMenu}/>
          <div className="nso-user-menu__arrow nso-user-menu__arrow--shadow"/>
          <div className="nso-user-menu__popup-inner">
            <a
              className="btn nso-user-menu__logout"
              onClick={this.safeLogout}
            >Log Out</a>
          </div>
          <div className="nso-user-menu__arrow"/>
        </div>
        <Modal
          isOpen={logoutDialogOpen}
          contentLabel="Logout Warning"
          onRequestClose={this.closeLogoutDialog}
          className="nso-modal__content"
          overlayClassName="nso-modal__overlay"
        >
          <div className="nso-modal__title">Sure you want to log out?</div>
          <div className="nso-modal__body">{transactionChanges} change{
            transactionChanges !== 1 && 's'} will be lost.</div>
          <div className="nso-modal__footer">
            <button
              className="nso-btn nso-btn--alt"
              onClick={this.closeLogoutDialog}
            >Cancel</button>
            <div className="nso-btn__spacer"/>
            <button className="nso-btn" onClick={this.logout}>Confirm</button>
          </div>
        </Modal>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(UserMenu);
