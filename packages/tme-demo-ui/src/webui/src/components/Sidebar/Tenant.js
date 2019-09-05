import React from 'react';
import { PureComponent, createRef } from 'react';
import { connect } from 'react-redux';
import { DragSource, DropTarget } from 'react-dnd';
import { renderToStaticMarkup } from 'react-dom/server';
import classNames from 'classnames';

import { ENDPOINT, NETWORK_SERVICE } from '../../constants/ItemTypes';
import { CUSTOMER_ROUTER, SWITCH } from '../../constants/Icons';
import { CONFIGURATION_EDITOR_URL,
         COMMIT_MANAGER_URL } from '../../constants/Layout';
import * as IconTypes from '../../constants/Icons';

import VpnEndpoint from './VpnEndpoint';
import DcEndpoint from './DcEndpoint';
import NetworkService from './NetworkService';
import NewItem from './NewItem';
import Btn from '../icons/BtnWithTooltip';
import IconSvg from '../icons/IconSvg';

import { getActualIconSize, getOpenTenant,
         getNewNetworkService } from '../../reducers';
import { tenantToggled, bodyOverlayToggled, itemDragged,
         newNetworkServiceToggled, handleError } from '../../actions/uiState';
import { TENANT_PATH, deleteTenant } from '../../actions/tenants';

import { connectPngDragPreview } from '../../utils/UiUtils';
import JsonRpc from '../../utils/JsonRpc';
import Comet from '../../utils/Comet';


const mapDispatchToProps = {
  deleteTenant, tenantToggled, bodyOverlayToggled,
  itemDragged, newNetworkServiceToggled, handleError
};

const mapStateToPropsFactory = (initialState, initialProps) => {
  const { name } = initialProps.tenant;
  return state => ({
    isOpen: getOpenTenant(state) === name,
    fade: !!getOpenTenant(state),
    newNetworkService: getNewNetworkService(state),
    iconSize: getActualIconSize(state)
  });
};

const dropTarget = {
  drop({ dcEndpoints, handleError}, monitor, component) {
    const { icon, type } = monitor.getItem();
    if (type === SWITCH) {
      component.dropSwitch(icon, dcEndpoints, handleError);
    } else {
      component.dropDevice(icon);
    }
  },
  canDrop(props, monitor) {
    const { type } = monitor.getItem();
    return type === SWITCH || type === CUSTOMER_ROUTER;
  }
};

const nsSource = {
  beginDrag: ({ itemDragged }) => {
    const item = { icon: 'new-network-service' };
    itemDragged(item);
    return item;
  },
  endDrag: ({ itemDragged }) => {
    itemDragged(undefined);
  }
};

const getNetworkServiceDefaults = (tenant, { container, pos }) => [
    { path: 'ns-info', value: `${tenant}-`, prefix: true },
    { path: 'type', value: IconTypes.SERVICE_CHAIN },
    { path: 'container', value: container },
    { path: 'coord/x', value: pos.x },
    { path: 'coord/y', value: pos.y }
];

const getVpnEndpointDefaults = device => {
  return (device ? [{ path: 'ce-device', value: device }] : []);
};

@DragSource(NETWORK_SERVICE, nsSource, connect => ({
  connectDragPreview: connect.dragPreview(),
  connectDragSource: connect.dragSource()
}))
@DropTarget(ENDPOINT, dropTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))
class Tenant extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      openVpnEndpointName: null,
      newVpnEndpointDevice: null,
      newVpnEndpointOpen: false,
      openDcEndpointName: null,
      openNetworkServiceName: null,
    };
    this.ref = createRef();
    this.keyPath = `${TENANT_PATH}{${props.tenant.name}}`;
  }

  openVpnEndpoint = vpnEndpointName => {
    this.setState({
      openVpnEndpointName: this.state.openVpnEndpointName === vpnEndpointName
        ? null : vpnEndpointName
    });
  };

  openDcEndpoint = dcEndpointName => {
    this.setState({
      openDcEndpointName: this.state.openDcEndpointName === dcEndpointName
        ? null : dcEndpointName
    });
  };

  openNetworkService = networkServiceName => {
    this.setState({
      openNetworkServiceName:
        this.state.openNetworkServiceName === networkServiceName
        ? null : networkServiceName
    });
  };

  toggle = () => {
    const { tenantToggled, tenant } = this.props;
    tenantToggled(tenant.name);
  }

  openNewVpnEndpoint = () => {
    const { bodyOverlayToggled } = this.props;
    this.setState({ newVpnEndpointOpen: true });
    bodyOverlayToggled(true);
  }

  closeNewVpnEndpoint = () => {
    const { bodyOverlayToggled } = this.props;
    this.setState({ newVpnEndpointOpen: false });
    this.setState({ newVpnEndpointDevice: undefined });
    bodyOverlayToggled(false);
  }

  closeNewNetworkService = () => {
    const { newNetworkServiceToggled } = this.props;
    newNetworkServiceToggled();
  }

  delete = async (event) => {
    event.stopPropagation();
    const { isOpen, deleteTenant, tenant } = this.props;
    await deleteTenant(tenant.name);
    if (isOpen) { this.toggle(); }
  }

  goTo = (event) => {
    event.stopPropagation();
    Comet.stopThenGoToUrl(CONFIGURATION_EDITOR_URL + this.keyPath);
  }

  redeploy = async (event) => {
    event.stopPropagation();
    const th = await JsonRpc.write();
    await JsonRpc.request('action', {
      th: th,
//      path: `${this.keyPath}/touch`
      path: `/l3vpn:vpn/l3vpn{${this.props.tenant.name}}/touch`
    });
    Comet.stopThenGoToUrl(COMMIT_MANAGER_URL);
  }

  dropDevice = deviceName => {
    const { isOpen } = this.props;
    if (!isOpen) { this.toggle(); }
    requestAnimationFrame(() => {
      this.setState({ newVpnEndpointDevice: deviceName });
      this.openNewVpnEndpoint();
    });
  };

  dropSwitch = async (name, dcEndpoints, handleError) => {
    let compute = 0;
    while (compute < 5) {
      if (!dcEndpoints.filter(dcEndpoint => dcEndpoint.Device === name).find(
        dcEndpoint => dcEndpoint.Compute === `compute${compute}`)) {
          break;
      }
      compute++;
    }

    const path = `${this.keyPath}/data-centre/endpoint{${
                  name} compute${compute}}`;
    const th = await JsonRpc.write();
    try {
      await JsonRpc.request('create', { th, path });
      Comet.stopThenGoToUrl(CONFIGURATION_EDITOR_URL + path);
    } catch (error) {
      handleError(`Error creating data-centre endpiont ${name}`, error);
    }
  };

  componentDidMount() {
    const { connectDragPreview, iconSize, isOpen } = this.props;
    connectPngDragPreview(renderToStaticMarkup(
      <IconSvg type={IconTypes.SERVICE_CHAIN} size={iconSize} />),
      iconSize, connectDragPreview, true
    );

    if (isOpen) {
      this.animateToggle();
    }
  }

  render() {
    console.debug('Tenant Render');
    const { isOpen, fade, newNetworkService,
            tenant, vpnEndpoints, dcEndpoints, networkServices,
            connectDropTarget, connectDragSource,
            isOver, canDrop } = this.props;
    const { openVpnEndpointName, newVpnEndpointOpen, newVpnEndpointDevice,
            openDcEndpointName, openNetworkServiceName } = this.state;
    const { name, deviceList, ...rest } = tenant;
    return (
      connectDropTarget(
      <div className={classNames('accordion accordion--level1', {
        'accordion--open': isOpen,
        'accordion--closed-fade': !isOpen && fade,
        'accordion--closed': !isOpen
      })}>
        <div className="accordion__header" onClick={this.toggle}>
          <span className="sidebar__title-text">{name}</span>
          <div
            className="inline-round-btn inline-round-btn--go-to"
            onClick={this.goTo}
          >
            <Btn
              type={IconTypes.BTN_GOTO}
              tooltip="View Tenant in Configuration Editor"
            />
          </div>
          <div
            className="inline-round-btn inline-round-btn--redeploy"
            onClick={this.redeploy}
          >
            <Btn
              type={IconTypes.BTN_REDEPLOY}
              tooltip="Touch L3 VPN and go to Commit Manager" />
          </div>
          <div
            className="inline-round-btn inline-round-btn--delete"
            onClick={this.delete}
          >
            <Btn type={IconTypes.BTN_DELETE} tooltip="Delete Tenant" />
          </div>
        </div>
        <div
          ref={this.ref}
          className={'accordion__panel'}
        >
          <div className="field-group">
            {rest && Object.keys(rest).map(key =>
              <div key={key} className="field-group__row">
                <div className="field-group__label">{key}</div>
                <div className="field-group__value">{rest[key]}</div>
              </div>
            )}
          </div>
          <div className="sidebar__sub-header">
            <span className="sidebar__title-text">VPN Endpoints</span>
            <div
              className="inline-round-btn inline-round-btn--add"
              onClick={this.openNewVpnEndpoint}
            >
              <Btn type={IconTypes.BTN_ADD} tooltip="Add New VPN Endpoint" />
            </div>
            <NewItem
              path={`${this.keyPath}/l3vpn/endpoint`}
              defaults={getVpnEndpointDefaults(newVpnEndpointDevice)}
              label={`Endpoint Name${newVpnEndpointDevice ?
                ` (${newVpnEndpointDevice})` : ''}`}
              isOpen={isOpen && newVpnEndpointOpen}
              close={this.closeNewVpnEndpoint}
            />
          </div>
          {vpnEndpoints && vpnEndpoints.map(vpnEndpoint =>
            <VpnEndpoint
              key={vpnEndpoint.name}
              toggle={() => this.openVpnEndpoint(vpnEndpoint.name)}
              isOpen={openVpnEndpointName === vpnEndpoint.name}
              {...vpnEndpoint}
            />
          )}
          <div className="sidebar__sub-header">
            <span className="sidebar__title-text">Data Centre Endpoints</span>
          </div>
          {dcEndpoints && dcEndpoints.map(dcEndpoint =>
            <DcEndpoint
              key={dcEndpoint.name}
              toggle={() => this.openDcEndpoint(dcEndpoint.name)}
              isOpen={openDcEndpointName === dcEndpoint.name}
              {...dcEndpoint}
            />
          )}
          <div className="sidebar__sub-header">
            <div className="sidebar__title-text">Network Services</div>
            {connectDragSource(
            <div className="inline-round-btn inline-round-btn--add">
              <Btn
                type={IconTypes.BTN_ADD}
                tooltip="Add New Network Service (drag me)"
              />
            </div>)}
            <NewItem
              path={`${this.keyPath}/nfvo/network-service`}
              defaultsPath="/webui:webui/data-stores/tme-demo-ui:static-map/icon"
              defaults={newNetworkService ?
                getNetworkServiceDefaults(name, newNetworkService) : []}
              label="Network Service Name"
              isOpen={isOpen && newNetworkService}
              close={this.closeNewNetworkService}
            />
          </div>
          {networkServices && networkServices.map(networkService =>
            <NetworkService
              key={networkService.name}
              toggle={() => this.openNetworkService(networkService.name)}
              isOpen={openNetworkServiceName === networkService.name}
              {...networkService}
            />
          )}
        </div>
        <div className="accordion__overlay-wrapper">
          <div className={classNames('accordion__overlay', {
            'accordion__overlay--hovered': isOver && canDrop
          })}/>
        </div>
      </div>)
    );
  }

  onTransitionEnd = () => {
    this.ref.current.removeEventListener(
      'transitionend', this.onTransitionEnd);
    this.ref.current.style.maxHeight = 'none';
  }

  animateToggle = () => {
    const { isOpen } = this.props;
    if (isOpen) {
      requestAnimationFrame(() => {
        this.ref.current.style.maxHeight =
          `${this.ref.current.scrollHeight}px`;
        this.ref.current.addEventListener(
          'transitionend', this.onTransitionEnd);
      });
    } else {
      this.ref.current.removeEventListener(
        'transitionend', this.onTransitionEnd);
      requestAnimationFrame(() => {
        this.ref.current.style.maxHeight =
          `${this.ref.current.scrollHeight}px`;
        requestAnimationFrame(() => {
          this.ref.current.style.maxHeight = 0;
        });
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { isOpen } = this.props;
    if (isOpen !== prevProps.isOpen) {
      this.animateToggle();
    }
  }
}

export default connect(mapStateToPropsFactory, mapDispatchToProps)(Tenant);
