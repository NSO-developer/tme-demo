import React from 'react';
import { Fragment, memo, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { CONFIGURATION_EDITOR_EDIT_URL } from 'constants/Layout';
import * as IconTypes from 'constants/Icons';

import FieldGroup from 'features/common/FieldGroup';
import Accordion from 'features/common/Accordion';
import InlineBtn from 'features/common/buttons/InlineBtn';

import { stopThenGoToUrl } from 'api/comet';
import { useDeletePathMutation } from 'api/data';


const NodePane = memo(function NodePane({
  title, label, keypath, level, isOpen, fade, nodeToggled,
  underscore, queryKey, disableDelete,
  disableGoTo, extraButtons, subHeader, children, ...rest
}) {
  console.debug('NodePane Render');

  const toggle = useCallback(() => {
    Object.keys(rest).length > 0 && nodeToggled(keypath);
  }, [ keypath, nodeToggled ]);

  const dispatch = useDispatch();
  const goToNode = useCallback((event) => {
    event.stopPropagation();
    dispatch(stopThenGoToUrl(CONFIGURATION_EDITOR_EDIT_URL + keypath));
  });

  const [ deletePath ] = useDeletePathMutation();
  const deleteNode = useCallback(async (event) => {
    event.stopPropagation();
    await deletePath({ keypath, queryKey });
    if (isOpen) { toggle(); }
  });

  return (
    <Accordion
      level={level ? level : 1}
      isOpen={isOpen}
      fade={fade}
      toggle={toggle}
      variableHeight={true}
      header={
        <Fragment>
          <span className="header__title-text">{underscore ?
            <u>{title.charAt(0)}</u> : title.charAt(0)}{title.substr(1)}</span>
          {!disableGoTo &&
            <InlineBtn
              icon={IconTypes.BTN_GOTO}
              classSuffix="go-to"
              tooltip={`View ${label} in Configuration Editor`}
              onClick={goToNode}
              style={level === 2 && 'alt'}
            />
          }
          {extraButtons}
          {!disableDelete &&
            <InlineBtn
              icon={IconTypes.BTN_DELETE}
              classSuffix="delete"
              tooltip={`Delete ${label}`}
              onClick={deleteNode}
              style={'danger'}
            />
          }
        </Fragment>
      }>
      {subHeader}
      {rest && <FieldGroup { ...rest } />}
      {children}
    </Accordion>
  );
});

export default NodePane;
