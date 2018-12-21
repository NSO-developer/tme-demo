import React from 'react';
import { PureComponent, createRef } from 'react';
import { connect } from 'react-redux';
import { DragSource, DropTarget } from 'react-dnd';
import classNames from 'classnames';

import { ENDPOINT } from '../../constants/ItemTypes';
import { CONFIGURATION_EDITOR_URL,
         COMMIT_MANAGER_URL } from '../../constants/Layout';
import * as IconTypes from '../../constants/Icons';

import Endpoint from './Endpoint';
import NewItem from './NewItem';
import Btn from '../icons/BtnWithTooltip';

import { getOpenTenant } from '../../reducers';
import { tenantToggled, bodyOverlayToggled } from '../../actions/uiState';
import { deleteTenant } from '../../actions/tenants';

import JsonRpc from '../../utils/JsonRpc';
import Comet from '../../utils/Comet';


const mapDispatchToProps = { deleteTenant, tenantToggled, bodyOverlayToggled };

const mapStateToPropsFactory = (initialState, initialProps) => {
  const { name } = initialProps.tenant;
  return state => ({
    isOpen: getOpenTenant(state) === name,
    fade: !!getOpenTenant(state)
  });
};

const dropTarget = {
  drop(props, monitor, component) {
    component.dropDevice(monitor.getItem().icon);
  },
  canDrop(props, monitor) {
    return true;
  }
};

// TODO: Move defaults into the YANG model or read from demo-settings
const getEndpointDefaults = device => {
  const defaults = [
    {path: 'ip-network', value: '10.0.0.0/24'},
    {path: 'bandwidth', value: '10000000'},
    {path: 'ce-interface', value: 'GigabitEthernet0/1'},
  ];

  if (device) {
    defaults.push({ path: 'ce-device', value: device });

    if (device === 'dci0' || device === 'ce7') {
      defaults.push({ path: 'virtual/p-device', value: 'p3' });
      defaults.push({ path: 'virtual/dci-device', value: 'dci0' });
      defaults.push({ path: 'virtual/vnfm', value: 'esc0' });
      defaults.push({ path: 'virtual/mgmt-connection-point', value: 'mgmt' });

      if (device === 'dci0') {
        defaults.push({ path: 'virtual/dci-1-connection-point',
                        value: 'dci-1' });
        defaults.push({ path: 'virtual/dci-2-connection-point',
                        value: 'dci-2' });

      } else if (device === 'ce7') {
        defaults.push({ path: 'virtual/p-connection-point', value: 'a' });
        defaults.push({path: 'virtual/ce-connection-point', value: 'z' });
      }
    }
  }

  return defaults;
};


@DropTarget(ENDPOINT, dropTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))
class Tenant extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      openEndpointName: null,
      newItemDevice: null,
      newItemOpen: false
    };
    this.ref = createRef();
    this.keyPath = `/l3vpn:vpn/l3vpn{${props.tenant.name}}`;
  }

  openEndpoint = endpointName => {
    this.setState({
      openEndpointName: this.state.openEndpointName === endpointName
        ? null : endpointName
    });
  };

  toggle = () => {
    const { tenantToggled, tenant } = this.props;
    tenantToggled(tenant.name);
  }

  openNewItem = () => {
    const { bodyOverlayToggled } = this.props;
    this.setState({ newItemOpen: true });
    bodyOverlayToggled(true);
  }

  closeNewItem = () => {
    const { bodyOverlayToggled } = this.props;
    this.setState({ newItemOpen: false });
    this.setState({ newItemDevice: undefined });
    bodyOverlayToggled(false);
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
      path: `${this.keyPath}/touch`,
    });
    Comet.stopThenGoToUrl(COMMIT_MANAGER_URL);
  }

  dropDevice = deviceName => {
    const { isOpen } = this.props;
    if (!isOpen) { this.toggle(); }
    requestAnimationFrame(() => {
      this.setState({ newItemDevice: deviceName });
      this.openNewItem();
    });
  };

  render() {
    console.debug('Tenant Render');
    const { isOpen, fade, tenant, endpoints, networkServices,
      connectDropTarget, isOver, canDrop } = this.props;
    const { openEndpointName, newItemOpen, newItemDevice } = this.state;
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
            className="sidebar__round-btn sidebar__round-btn--go-to"
            onClick={this.goTo}
          >
            <Btn
              type={IconTypes.BTN_GOTO}
              tooltip="View Tenant in Configuration Editor"
            />
          </div>
          <div
            className="sidebar__round-btn sidebar__round-btn--redeploy"
            onClick={this.redeploy}
          >
            <Btn
              type={IconTypes.BTN_REDEPLOY}
              tooltip="Touch and go to Commit Manager" />
          </div>
          <div
            className="sidebar__round-btn sidebar__round-btn--delete"
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
            <span className="sidebar__title-text">Endpoints</span>
            <div
              className="sidebar__round-btn sidebar__round-btn--add"
              onClick={this.openNewItem}
            >
              <Btn type={IconTypes.BTN_ADD} tooltip="Add New Endpoint" />
            </div>
            <NewItem
              path={`${this.keyPath}/endpoint`}
              defaults={getEndpointDefaults(newItemDevice)}
              label={`Endpoint Name${newItemDevice ?
                ` (${newItemDevice})` : ''}`}
              isOpen={isOpen && newItemOpen}
              close={this.closeNewItem}
            />
          </div>
          {endpoints && endpoints.map((endpoint, index) =>
            <Endpoint
              key={endpoint.name}
              toggle={() => this.openEndpoint(endpoint.name)}
              isOpen={openEndpointName === endpoint.name}
              {...endpoint}
            />
          )}
          <div className="sidebar__sub-header">
            <div className="sidebar__title-text">Network Services</div>
          </div>
          {networkServices && networkServices.map(networkService =>
            <div key={networkService.name}
              className="accordion__empty"
            >{networkService.name}</div>)}
        </div>
        <div className="accordion__overlay-wrapper">
          <div className={`accordion__overlay${
            isOver && canDrop && ' accordion__overlay--hovered'}`
          }/>
        </div>
      </div>)
    );
  }

  onTransitionEnd = () => {
    this.ref.current.removeEventListener(
      'transitionend', this.onTransitionEnd);
    this.ref.current.style.maxHeight = 'none';
  }

 componentDidUpdate(prevProps) {
    const { isOpen } = this.props;
    if (isOpen !== prevProps.isOpen) {
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
  }
}

export default connect(mapStateToPropsFactory, mapDispatchToProps)(Tenant);
