import React from 'react';
import Tippy from '@tippy.js/react';
import * as IconTypes from '../../constants/Icons';

import BtnAddIcon from '../icons/BtnAdd';
import BtnDeleteIcon from '../icons/BtnDelete';
import BtnGoToIcon from '../icons/BtnGoTo';
import BtnRedeployIcon from '../icons/BtnRedeploy';
import BtnConfirmIcon from '../icons/BtnConfirm';
import BtnDragIcon from '../icons/BtnDrag';

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
  }
};

export default ({ type, tooltip, size }) => {
  return (
    <Tippy placement="bottom" content={tooltip}>{getBtnIcon(type, size)}</Tippy>
  );
};
