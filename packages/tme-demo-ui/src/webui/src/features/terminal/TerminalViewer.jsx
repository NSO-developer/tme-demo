import './terminal.css';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';

import * as IconTypes from 'constants/Icons';
import { getOpenTerminals, getConsoleViewerHidden, hideConsoleViewer,
         terminalToggled } from 'features/topology/topologySlice';

import InlineBtn from 'features/common/buttons/InlineBtn';
import DeviceTerminal from './DeviceTerminal';


function TerminalViewer() {
  console.debug('TerminalViewer Render');

  const dispatch = useDispatch();
  const openTerminals = useSelector((state) => getOpenTerminals(state));
  const consoleViewerHidden = useSelector(
    (state) => getConsoleViewerHidden(state));
  const openTerminal = openTerminals[0];
  const numOpen = openTerminals.length;

  return (
    <div className={classNames(
      'terminal__viewer',
      'component__layer', {
      'terminal__viewer--hidden': consoleViewerHidden || numOpen == 0
    })}>
      <div className="component__layer terminal__viewer-background"/>
      <div className="component__layer terminal__viewer-body">
        <div className="header">
          <InlineBtn
            icon={IconTypes.BTN_CONSOLE_DISCONNECT}
            style="danger"
            tooltip={`Disconnect from ${openTerminal} console`}
            onClick={() => dispatch(terminalToggled(openTerminal))}
          />
          <span
            className="header__title-text"
          >Console Viewer | {openTerminal}</span>
          <span
            className="header__title-text header__title-text--right"
          >[{numOpen} open console{numOpen > 1 ? 's' : ''}]</span>
          <InlineBtn
            icon={IconTypes.BTN_HIDE_CONSOLE_VIEWER}
            tooltip={'Hide console viewer'}
            onClick={() => dispatch(hideConsoleViewer())}
          />
        </div>
        {openTerminals.map(terminal => <DeviceTerminal
          key={terminal}
          device={terminal}
          active={terminal == openTerminal}
        />)}
      </div>
    </div>
  );
}

export default TerminalViewer;
