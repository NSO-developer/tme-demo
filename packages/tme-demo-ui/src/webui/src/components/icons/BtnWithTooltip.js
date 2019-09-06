import React from 'react';
import Tippy from '@tippy.js/react';
import * as IconTypes from '../../constants/Icons';

import BtnAddIcon from '../icons/BtnAdd';
import BtnDeleteIcon from '../icons/BtnDelete';
import BtnGoToIcon from '../icons/BtnGoTo';
import BtnRedeployIcon from '../icons/BtnRedeploy';
import BtnConfirmIcon from '../icons/BtnConfirm';
import BtnDragIcon from '../icons/BtnDrag';
import BtnZoomIn from '../icons/BtnZoomIn';
import BtnZoomOut from '../icons/BtnZoomOut';
import BtnHideUnderlay from '../icons/BtnHideUnderlay';
import BtnShowUnderlay from '../icons/BtnShowUnderlay';

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
  }
};

export default ({ type, tooltip, size }) => {
  return (
    <Tippy placement="bottom" content={tooltip}>{getBtnIcon(type, size)}</Tippy>
  );
};
