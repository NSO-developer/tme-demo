import React from 'react';
import { PureComponent } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { LOGIN_URL } from 'constants/Layout';
import BtnUser from 'features/common/buttons/BtnUser';
import BtnDropDown from 'features/common/buttons/BtnDropDown';

import { handleError } from './nsoSlice';
import { getTransChanges, logout } from 'api';
import { unsubscribeAll } from 'api/comet';


const mapDispatchToProps = {
  handleError,
  unsubscribeAll: unsubscribeAll,
  doLogout: logout.initiate,
  getTransChanges: getTransChanges.initiate
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
  };

  closeMenu = () => {
    this.setState({ menuOpen: false });
  };

  openLogoutDialog = () => {
    this.setState({ logoutDialogOpen: true });
  };

  closeLogoutDialog = () => {
    this.setState({ logoutDialogOpen: false });
  };

  logout = async () => {
    const { handleError, doLogout, unsubscribeAll } = this.props;
    try {
      await unsubscribeAll();
      await doLogout();
      window.location.assign(LOGIN_URL);
    } catch(error) {
      handleError('Error logging out', error);
    }
  };

  safeLogout = async () => {
    const { getTransChanges, hasWriteTransaction } = this.props;
    this.closeMenu();
    if ( hasWriteTransaction ) {
      this.openLogoutDialog();
      const transChangesQuery = getTransChanges();
      this.setState({ transactionChanges: (await transChangesQuery).data });
      transChangesQuery.unsubscribe();
    } else {
      this.logout();
    }
  };

  render() {
    console.debug('UserMenu Render');
    const { menuOpen, logoutDialogOpen, transactionChanges } = this.state;
    const { user } = this.props;
    return (
      <div className="nso-header__user-menu">

        <button className="btn__header" onClick={this.openMenu}>
          <span className="btn__prefix-icon">
            <BtnUser size={20}/>
          </span>
          <span className="btn__label">
            <span className="nso-user-profile__text">{user}</span>
          </span>
          <span className="btn__suffix-icon">
            <BtnDropDown size={16}/>
          </span>
        </button>

        <div className={classNames('nso-drop-down', {
          'nso-drop-down--open': menuOpen
        })}>
          <div className="nso-drop-down__overlay" onClick={this.closeMenu}/>
            <div className="nso-drop-down__menu">
              <div className="nso-drop-down__menu-item">

                <div className="nso-user-profile">
                  <div className="nso-user-profile__prefix">
                    <BtnUser size={24}/>
                  </div>
                  <div className="nso-user-profile__content">
                    <div className="nso-user-profile__heading">LOGGED IN AS</div>
                    <div className="nso-user-profile__text">{user}</div>
                  </div>
                  <div className="nso-user-profile__suffix">
                    <button
                      className="btn__secondary"
                      onClick={this.safeLogout}
                    >
                      <span className="btn__label">Log Out</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

        <Modal
          isOpen={logoutDialogOpen}
          contentLabel="Logout Warning"
          onRequestClose={this.closeLogoutDialog}
          className="nso-modal__content"
          overlayClassName="nso-modal__overlay"
          closeTimeoutMS={1000}
        >
          <div className="nso-modal__title">Sure you want to logout?</div>
          <div className="nso-modal__body">{transactionChanges} change{
            transactionChanges !== 1 && 's'} will be lost.</div>
          <footer className="nso-modal__footer">
            <button
              className="btn__tertiary"
              onClick={this.closeLogoutDialog}
              style={{marginRight: '16px'}}
            >
              <span className="btn__label">cancel</span>
            </button>
            <button className="btn__primary" onClick={this.logout}>
              <span className="btn__label">confirm</span>
            </button>
          </footer>
        </Modal>
      </div>
    );
  }
}

export default connect(undefined, mapDispatchToProps)(UserMenu);
