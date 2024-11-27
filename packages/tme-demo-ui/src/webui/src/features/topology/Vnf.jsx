import React from 'react';
import { Fragment, memo, useContext, useMemo } from 'react';
import classNames from 'classnames';
import Tippy from '@tippyjs/react';

import { createSelector } from 'reselect';
import { LayoutContext } from './LayoutContext';
import { positionStyle, svgStyle } from './Icon';
import { useSelector } from 'react-redux';
import { LINE_ICON_RATIO, ICON_VNF_SPACING } from 'constants/Layout';
import { HIGHLIGHT } from '../../constants/Colours';
import { ICON_NAME_TO_TYPE, GENERIC } from 'constants/Icons';

import IconHighlight from './icons/IconHighlight';
import IconSvg from './icons/IconSvg';

import { getEditMode, getHighlightedIcons } from './topologySlice';

import { useIconPosition } from './Icon';

import { selectItem, createItemsSelector,
         createItemsSelectorWithArray, useQueryQuery } from '/api/query';


const getIconType = name => {
  const key = Object.keys(ICON_NAME_TO_TYPE).find(m => name.includes(m));
  return key ? ICON_NAME_TO_TYPE[key] : GENERIC;
};

export function getVnfVmIndex(vnfs, vmDevice) {
  let vmCount = 0;
  let vnfIndex, vmIndex = undefined;
  vnfs.forEach(({ vmDevices }, i) =>
    vmDevices.forEach(({ name }, j) => {
      vmCount++;
      if (name === vmDevice) {
        vnfIndex = i;
        vmIndex = j;
      }
    })
  );

  return [ vmCount, vnfIndex, vmIndex ];
}


// === Queries ================================================================

function useNsInfosQuery(selectFromResult) {
  return useQueryQuery({
    xpathExpr: '/nfv:nfv/cisco-nfvo:ns-info',
    selection: ['name', 'tenant', 'nsd', 'flavour'],
    subscribe: { cdbOper: false, hideValues: true }
  }, { selectFromResult });
}

function useNsInfo(name) {
  return useNsInfosQuery(selectItem('name', name));
}

function useVnfsQuery(selectFromResult) {
  return useQueryQuery({
    xpathExpr: '/nfv:nfv/cisco-nfvo:ns-info/vnf-info/vdu',
    selection: ['../vnf-profile', '../../name', '../vnfm', 'id', 'image-name']
  }, { selectFromResult });
}

function useNsInfoVnfsQuery(nsInfo) {
  return useVnfsQuery(useMemo(
      () => createItemsSelector('parentName', nsInfo), [ nsInfo ]));
}

function useSapdsQuery(selectFromResult) {
  return useQueryQuery({
    xpathExpr: '/nfv:nfv/nsd/sapd',
    selection: [ 'id', '../id', 'virtual-link-desc' ]
  }, { selectFromResult });
}

function useNsdSapds(nsd) {
  return useSapdsQuery(useMemo(
      () => createItemsSelector('parentId', nsd), [ nsd ]));
}

function useVirtualLinkProfilesQuery(selectFromResult) {
  return useQueryQuery({
    xpathExpr: '/nfv:nfv/nsd/df/virtual-link-profile',
    selection: [ 'id', '../id', '../../id', 'virtual-link-desc-id' ]
  }, { selectFromResult });
}

function useNsdVirtualLinkProfiles(nsd, flavour) {
  return useVirtualLinkProfilesQuery(useMemo(
      () => createItemsSelectorWithArray([
        [ 'parentParentId', nsd ],
        [ 'parentId', flavour ]
      ]), [ nsd, flavour ])
  );
}

function useVirtualLinksQuery(selectFromResult) {
  return useQueryQuery({
    xpathExpr: '/nfv:nfv/nsd/df/vnf-profile/virtual-link-connectivity',
    selection: [ 'virtual-link-profile-id', '../id', '../../id', '../../../id' ]
  }, { selectFromResult });
}

function useNsdVirtualLinks(nsd, flavour) {
  return useVirtualLinksQuery(useMemo(
      () => createItemsSelectorWithArray([
        [ 'parentParentParentId', nsd ],
        [ 'parentParentId', flavour ]
      ]), [ nsd, flavour ])
  );
}

function useDeploymentPlansQuery() {
  return useQueryQuery({
    xpathExpr: '/nfv:nfv/cisco-nfvo:internal/netconf-deployment-plan' +
               '/plan/component[type=\'cisco-nfvo-nano-services:vm-device\' or ' +
               'type=\'cisco-nfvo-nano-services:unmanaged-vm-device\']' +
               '/state',
    selection: [ 'name', 'status', '../name', '../type', '../../../id' ],
    subscribe: { leaf: 'status', cdbOper: true }
  });
}

export function useVmDevicesQuery(selectFromResult) {
  return useQueryQuery({
    xpathExpr: '/nfv:nfv/cisco-nfvo:internal/netconf-deployment-result' +
               '/vm-group/vm-device',
    selection: [ 'name', 'device-name', '../name', '../../id' ],
    subscribe: { leaf: 'name', cdbOper: true }
  }, { selectFromResult });
}

export function useVmDevice(device) {
  return useVmDevicesQuery(selectItem('deviceName', device));
}

export function useNsInfoVmDevices(nsInfo) {
  return useVmDevicesQuery(createSelector(
    res => res.data,
    res => res.isFetching,
    res => res.isSuccess,
    res => res.isError,
    (raw, isFetching, isSuccess, isError) => ({
      data: raw?.reduce(
        (accumulator, { parentParentId: deploymentId, ...data })  => {
          if (nsInfo === deploymentId.replace(/.*ns-info-/, '')) {
            accumulator.push(data);
          }
          return accumulator;
        }, []
      ), isFetching, isSuccess, isError
    })
  ));
}

export function useVnfQueries() {
  return (
    Boolean(useNsInfosQuery()?.data) +
    Boolean(useVnfsQuery()?.data) +
    Boolean(useSapdsQuery()?.data) +
    Boolean(useVirtualLinkProfilesQuery()?.data) +
    Boolean(useVirtualLinksQuery()?.data) +
    Boolean(useVmDevicesQuery()?.data) +
    Boolean(useDeploymentPlansQuery()?.data) == 7
  );
}


// === Hooks ==================================================================

const extractState = state => state?.substr(state.indexOf(':') + 1);

export function useVnfVdus(nsInfo) {
  const vnfs = useNsInfoVnfsQuery(nsInfo)?.data;
  const { nsd, flavour } = useNsInfo(nsInfo)?.data || {};
  const nsSapds = useNsdSapds(nsd)?.data;
  const nsVlps = useNsdVirtualLinkProfiles(nsd, flavour)?.data;
  const nsVls = useNsdVirtualLinks(nsd, flavour)?.data;
  const allVmDevices = useVmDevicesQuery()?.data;
  const allDeploymentPlans = useDeploymentPlansQuery()?.data;

  if (nsSapds === undefined
    || nsVlps === undefined
    || nsVls === undefined
    || allVmDevices === undefined
    || allDeploymentPlans=== undefined
  ) {
    return [];
  }

  const getVlp = (vld) => nsVlps.find(
    ({ virtualLinkDescId }) => virtualLinkDescId === vld).name;

  return vnfs?.reduce((acc, { name: vnfInfo, id: vdu, vnfm }) => {
    const deploymentId = `${vnfm}-ns-info-${nsInfo}`;
    const name = `${vnfInfo}-${vdu}`;

    const vls = nsVls.filter(
      ({ parentId }) => parentId === vnfInfo).map(({ name }) => name);

    const sapds = nsSapds.filter(
      ({ virtualLinkDesc }) => vls.includes(getVlp(virtualLinkDesc))).map(
        ({ name }) => name);
    const vmDevices = allVmDevices.filter(
      ({ parentName, parentParentId }) =>
        parentName === name && parentParentId === deploymentId);
    const deploymentPlans = allDeploymentPlans.filter(
      ({ parentParentParentId }) => parentParentParentId === deploymentId);

    const vmDeviceStates = vmDevices.reduce((accumulator, vmDevice) => {
      const { deviceName } = vmDevice;
      accumulator[deviceName] = {
        vmId: vmDevice.name,
        state: extractState(deploymentPlans.findLast(deploymentPlan => {
          const { status, parentName } = deploymentPlan;
          return (parentName === vmDevice.name && status === 'reached');
        })?.name)
      };
      return accumulator;
    }, {});

    acc[name] = {
      name, deploymentId, nsInfo, vnfInfo, vdu, sapds,
      virtualLinks: vls.filter(vl => !sapds.includes(vl)),
      type: getIconType(vnfInfo),
      vmsScaling: 0,
      vmDevices: vmDevices.length > 0 ? vmDeviceStates : { [name]: { vmId: name, state: 'init' } }
    };
    return acc;
  }, {});
}

export function useNsInfoVnfs(nsInfo) {
  console.debug(`Reselect nsInfo Vnfs ${nsInfo}`);
  const vnfs = useVnfVdus(nsInfo);
  const result = [];

  if (!vnfs) {
    return result;
  }

  const vnfKeys = Object.keys(vnfs);
  vnfKeys.sort((a, b) => vnfs[a].virtualLinks.length -
                         vnfs[b].virtualLinks.length);
  vnfKeys.sort((a, b) => vnfs[a].sapds.length - vnfs[b].sapds.length);

  const pushVnf = (vnf, linkToPrevious) => {
    if (vnfKeys.includes(vnf.name)) {
      let vmDevices = [];
      if (vnf.vmDevices && Object.keys(vnf.vmDevices).length > 0) {
        vmDevices = Object.keys(vnf.vmDevices).map(key => ({
          name: key, ...vnf.vmDevices[key]
        }));
      } else {
        vmDevices = [{ name: 'init', status: 'init' }];
      }

      for (let i = 0; i < vnf.vmsScaling; i++) {
        vmDevices.push({ name: `scale-out-${i}`, status: 'init' });
      }

      result.push({ ...vnf, linkToPrevious, vmDevices });
      vnfKeys.splice(vnfKeys.indexOf(vnf.name), 1);
      return true;
    } else {
      return false;
    }
  };

  const links = vnfKeys.reduce((accumulator, key) => {
    const vnf = vnfs[key];
    vnf.virtualLinks.forEach(link => {
      link in accumulator
        ? accumulator[link].push(vnf.name)
        : accumulator[link] = [ vnf.name ];
    });
    return accumulator;
  }, {});

  const sapds = vnfKeys.reduce((accumulator, key) => {
    const vnf = vnfs[key];
    vnf.sapds.forEach(sapd => {
      sapd === 'mgmt' ?
        accumulator[sapd] = [] :
          sapd in accumulator
            ? accumulator[sapd].push(vnf.name)
            : accumulator[sapd] = [ vnf.name ];
    });
    return accumulator;
  }, {});

  const followLink = (vnf, link) => {
    const nextVnf = links[link].find(nextVnf => nextVnf !== vnf);
    if (nextVnf) {
      console.debug(`Link: ${vnf} --[ ${link} ]--> ${nextVnf}`);
      next(nextVnf, link,);
    }
  };

  const followSapd = (vnf, sapd) => {
    const nextVnf = sapds[sapd].find(nextVnf => nextVnf !== vnf);
    if (nextVnf) {
      console.debug(`Sapd: ${vnf} --[ ${sapd} ]--> ${nextVnf}`);
      next(nextVnf, undefined, sapd);
    }
  };

  const next = (vnf, fromLink, fromSapd) => {
    if (pushVnf(vnfs[vnf], !!(fromLink || fromSapd))) {
      console.debug(`Added: ${vnf}`);
      vnfs[vnf].virtualLinks.forEach(nextLink => {
        if (!fromLink || nextLink !== fromLink) {
          followLink(vnf, nextLink);
        }
      });
      vnfs[vnf].sapds.forEach(nextSapd => {
        if (!fromSapd || nextSapd !== fromSapd) {
          followSapd(vnf, nextSapd);
        }
      });
    } else {
      console.debug(`Skipped: ${vnf}`);
    }
  };

  while (vnfKeys.length > 0) {
    next(vnfKeys[0]);
  }
  return result;
}


// === Component ==============================================================

const VnfVmIcon = memo(function VnfVmIcon({ iconName, nsInfo, vmDeviceName, onClick }) {
  console.debug('VnfVmIcon Render');

  const { iconSize: size } = useContext(LayoutContext);
  const highlightedDevices = useSelector((state) => getHighlightedIcons(state));
  const editMode = useSelector((state) => getEditMode(state));

  const vnfs = useNsInfoVnfs(nsInfo);
  const [ vmCount, vnfIndex, vmIndex ] = getVnfVmIndex(vnfs, vmDeviceName);
  const { vnfInfo, vdu, linkToPrevious, vmDevices } = vnfs[vnfIndex];
  const vmDevice = vmIndex !== undefined ? vmDevices[vmIndex] : {};
  const type = getIconType(vnfInfo);
  const isLastVnfVm = vmIndex === vmDevices.length - 1;

  const { pcX, pcY, hidden, expanded } = useIconPosition(
    iconName, vnfs.length, vmCount, vnfIndex, vmIndex);

  const outlineSize = expanded ? Math.round(size * ICON_VNF_SPACING) : size;

  // const vnfVmName = `${name}${vmIndex > 0 ? `-${vmIndex}` : ''}`;
  const tooltip = <table className="tooltip">
    <tbody>
      <tr><td>VNF Info:</td><td>{vnfInfo}</td></tr>
      <tr><td>VDU:</td><td>{vdu}</td></tr>
      <tr><td>Status:</td><td>{vmDevice.state}</td></tr>
    </tbody>
  </table>;

  return (
    <Fragment key={vmDeviceName}>{
      linkToPrevious && vmIndex === 0 &&
        <div
          className={classNames('icon__vnf-connection', {
            'icon__vnf-connection--expanded': expanded && !hidden
          })}
          style={{
            height: `${expanded ? outlineSize : 0}px`,
            width: `${size * LINE_ICON_RATIO}px`,
            left: `${pcX}%`,
            bottom: `${100 - pcY}%`
          }}
        />}
      <div
        className={classNames('icon__container', {
          'icon__container--expanded': expanded,
          'icon__container--hidden': !expanded || hidden ||
            editMode || !highlightedDevices ||
            !highlightedDevices.includes(vmDeviceName)
        })}
        style={positionStyle(pcX, pcY, size*2)}
      >
        <IconHighlight size={size*2} colour={HIGHLIGHT}/>
      </div>
      <div
        id={`${name}-vnf-vm`}
        onClick={onClick}
        className={classNames('icon__container', {
          'icon__container--expanded': expanded,
          'icon__container--hidden': !expanded || hidden
        })}
        style={positionStyle(pcX, pcY, size)}
      >
        <Tippy
          placement="left"
          delay="250"
          content={tooltip}
          disabled={editMode}
        >
          <div
            className="icon__svg-wrapper"
            style={svgStyle(size)}
          >
            <IconSvg type={type} status={vmDevice.state} size={size} />
          </div>
        </Tippy>
        {isLastVnfVm &&
          <div className="icon__label icon__label--vnf" >
            <span className="icon__label-text">{vnfInfo}</span>
          </div>
        }
      </div>
    </Fragment>
  );
});

export default VnfVmIcon;
