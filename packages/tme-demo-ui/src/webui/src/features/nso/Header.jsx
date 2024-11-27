import React from 'react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import ciscoImg from 'resources/cisco.svg';
import { COMMIT_MANAGER_URL } from 'constants/Layout';
import UserMenu from './UserMenu';
import BtnCommitMgr from 'features/common/buttons/BtnCommitMgr';
import InlineBtn from 'features/common/buttons/InlineBtn';

import { useRevertMutation, useApplyMutation, useGetTransChangesQuery } from 'api';
import { stopThenGoToUrl } from 'api/comet';


function Header({ user, version, title, hasWriteTransaction, commitInProgress }) {
  console.debug('NSO Header Render');
  const [ revert ] = useRevertMutation();
  const [ apply ] = useApplyMutation();

  const commitTransaction = useCallback(event => { apply(); });
  const revertTransaction = useCallback(event => { revert(); });

  const dispatch = useDispatch();
  const transChanges = useGetTransChangesQuery()?.data;

  const goToCommitManager = () => {
    dispatch(stopThenGoToUrl(COMMIT_MANAGER_URL));
  };

  return (
    <div className="nso-header">
      <a href="/webui-one/" className="nso-header__link">
        <img
          src={ciscoImg}
          className="nso-header__cisco-logo"
          alt="Cisco"
        />
        <div className="nso-header__title">{title}</div>
      </a>
      <div className="nso-header__utilities">
        <InlineBtn
          disabled={!hasWriteTransaction || commitInProgress}
          label="Revert"
          tooltip="Revert transaction now without going to Commit Manager"
          onClick={revertTransaction}
        />
        <InlineBtn
          disabled={!hasWriteTransaction || commitInProgress}
          label={commitInProgress
            ? <span>
                <span className="loading__dot"/>
                <span className="loading__dot"/>
                <span className="loading__dot"/>
              </span>
            : 'Commit'}
          tooltip="Commit transaction now without going to Commit Manager"
          onClick={commitTransaction}
        />
        <button className="btn__header" onClick={goToCommitManager}>
          <span className="btn__icon">
            <BtnCommitMgr size={24}/>
            {transChanges > 0 && hasWriteTransaction &&
              <span className="btn__badge">
                <span className="btn__badge-text">{transChanges}</span>
              </span>
            }
          </span>
        </button>
        <div className="nso-header__divider"/>
      </div>
      <UserMenu user={user} hasWriteTransaction={hasWriteTransaction}/>
    </div>
  );
}

export default Header;
