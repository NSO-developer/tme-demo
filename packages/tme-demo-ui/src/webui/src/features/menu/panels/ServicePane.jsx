import React from 'react';
import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { COMMIT_MANAGER_URL } from 'constants/Layout';
import * as IconTypes from 'constants/Icons';

import NodePane from './NodePane';
import InlineBtn from 'features/common/buttons/InlineBtn';

import { getOpenService, serviceToggled } from '../menuSlice';
import { highlightedIconsUpdated } from 'features/topology/topologySlice';

import { stopThenGoToUrl } from 'api/comet';
import { useActionMutation, useGetValueQuery } from 'api/data';


function ServicePane({ keypath, children, title, label, ...rest }) {
  console.debug('ServicePane Render');

  const queryPath = keypath.endsWith('/..')
      ? keypath.substring(0, keypath.lastIndexOf('/', keypath.length - 4))
      : keypath;

  const { data } = useGetValueQuery({
    keypath: `${queryPath}/modified/devices`,
    tag: 'device-list'
  });

  const isOpen = useSelector((state) => getOpenService(state) === keypath);
  const fade = useSelector((state) => !!getOpenService(state));

  const highlightedIcons = isOpen ? data : [];

  const dispatch = useDispatch();
  const toggled = useCallback(keypath => dispatch(
    serviceToggled({ keypath, highlightedIcons })
  ));

  useEffect(() => dispatch(
    highlightedIconsUpdated({ highlightedIcons })
  ), [ data ]);

  const [ action ] = useActionMutation();
  const redeploy = useCallback(async (event) => {
    event.stopPropagation();
    await action({
      transType: 'read_write',
      path: `${keypath}/touch`
    });
    dispatch(stopThenGoToUrl(COMMIT_MANAGER_URL));
  });

  return (
    <NodePane
      keypath={keypath}
      title={title || label}
      label={label}
      isOpen={isOpen}
      fade={fade}
      nodeToggled={toggled}
      extraButtons={
        <InlineBtn
          icon={IconTypes.BTN_REDEPLOY}
          classSuffix="redeploy"
          tooltip={`Redeploy (Touch) ${label}`}
          onClick={redeploy}
        />
      }
      {...rest}
    >
      {children}
    </NodePane>
  );
}

export default ServicePane;
