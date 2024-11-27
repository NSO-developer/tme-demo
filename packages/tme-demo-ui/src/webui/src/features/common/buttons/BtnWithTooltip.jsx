import React from 'react';
import Tippy from '@tippyjs/react';
import * as IconTypes from 'constants/Icons';

import BtnAddIcon from './BtnAdd';
import BtnDeleteIcon from './BtnDelete';
import BtnGoToIcon from './BtnGoTo';
import BtnRedeployIcon from './BtnRedeploy';
import BtnConfirmIcon from './BtnConfirm';
import BtnDragIcon from './BtnDrag';
import BtnZoomIn from './BtnZoomIn';
import BtnZoomOut from './BtnZoomOut';
import BtnHideUnderlay from './BtnHideUnderlay';
import BtnShowUnderlay from './BtnShowUnderlay';
import BtnDefineIcon from './BtnDefine';
import BtnUndefineIcon from './BtnUndefine';
import BtnStartIcon from './BtnStart';
import BtnRestartIcon from './BtnRestart';
import BtnResetIcon from './BtnReset';
import BtnStopIcon from './BtnStop';
import BtnConsoleIcon from './BtnConsole';
import BtnConsoleConnectedIcon from './BtnConsoleConnected';
import BtnConsoleDisconnectIcon from './BtnConsoleDisconnect';
import BtnHideConsoleViewerIcon from './BtnHideConsoleViewer';

const getBtnIcon = (type, size) => {
  switch (type) {
    case IconTypes.BTN_ADD:
      return <BtnAddIcon size={size}/>;
    case IconTypes.BTN_DELETE:
      return <BtnDeleteIcon size={size}/>;
    case IconTypes.BTN_GOTO:
      return <BtnGoToIcon size={size}/>;
    case IconTypes.BTN_REDEPLOY:
      return <BtnRedeployIcon size={size}/>;
    case IconTypes.BTN_CONFIRM:
      return <BtnConfirmIcon size={size}/>;
    case IconTypes.BTN_DRAG:
      return <BtnDragIcon size={size}/>;
    case IconTypes.BTN_ZOOM_IN:
      return <BtnZoomIn size={size}/>;
    case IconTypes.BTN_ZOOM_OUT:
      return <BtnZoomOut size={size}/>;
    case IconTypes.BTN_HIDE_UNDERLAY:
      return <BtnHideUnderlay size={size}/>;
    case IconTypes.BTN_SHOW_UNDERLAY:
      return <BtnShowUnderlay size={size}/>;
    case IconTypes.BTN_DEFINE:
      return <BtnDefineIcon size={size}/>;
    case IconTypes.BTN_UNDEFINE:
      return <BtnUndefineIcon size={size}/>;
    case IconTypes.BTN_START:
      return <BtnStartIcon size={size}/>;
    case IconTypes.BTN_RESTART:
      return <BtnRestartIcon size={size}/>;
    case IconTypes.BTN_RESET:
      return <BtnResetIcon size={size}/>;
    case IconTypes.BTN_STOP:
      return <BtnStopIcon size={size}/>;
    case IconTypes.BTN_CONSOLE:
      return <BtnConsoleIcon size={size}/>;
    case IconTypes.BTN_CONSOLE_CONNECTED:
      return <BtnConsoleConnectedIcon size={size}/>;
    case IconTypes.BTN_CONSOLE_DISCONNECT:
      return <BtnConsoleDisconnectIcon size={size}/>;
    case IconTypes.BTN_HIDE_CONSOLE_VIEWER:
      return <BtnHideConsoleViewerIcon size={size}/>;
  }
};

export default function BtnWithTooltip({ type, tooltip, size }) {
  return (tooltip ?
    <Tippy placement="bottom" content={tooltip}>{getBtnIcon(type, size)}</Tippy> :
    getBtnIcon(type, size)
  );
}
