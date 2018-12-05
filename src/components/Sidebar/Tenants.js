import React from 'react';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import Tenant from './Tenant';
import NewItem from './NewItem';
import Btn from '../icons/BtnWithTooltip';
import { BTN_ADD } from '../../constants/Icons';
import LoadingOverlay from '../common/LoadingOverlay';

import { getTenants, getEndpoints, getNetworkServices,
         getIsFetchingTenants, getIsFetchingEndpoints } from '../../reducers';
import { bodyOverlayToggled } from '../../actions/uiState';

import { fetchSidebarData } from '../../actions';


const mapDispatchToProps = { fetchSidebarData, bodyOverlayToggled };

const mapStateToProps = state => ({
  tenants: getTenants(state),
  endpoints: getEndpoints(state),
  networkServices: getNetworkServices(state),
  isFetchingTenants: getIsFetchingTenants(state),
  isFetchingEndpoints: getIsFetchingEndpoints(state)
});

// TODO: Move defaults into the YANG model or read from demo-settings
const getTenantDefaults = () => ([ {path: 'as-number', value: '65000'} ]);


class Tenants extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      openTenantName: undefined,
      newItemOpen: false
    };
  }

  openTenant(tenantName) {
    this.setState({ openTenantName: this.state.openTenantName === tenantName
      ? undefined : tenantName
    });
  }

  openNewItem = () => {
    const { bodyOverlayToggled } = this.props;
    this.setState({ newItemOpen: true });
    bodyOverlayToggled(true);
  }

  closeNewItem = () => {
    const { bodyOverlayToggled } = this.props;
    this.setState({ newItemOpen: false });
    bodyOverlayToggled(false);
  }

  render() {
    console.debug('Tenants Render');
    const { tenants, endpoints, networkServices,
            isFetchingTenants, isFetchingEndpoints } = this.props;
    const { openTenantName, newItemOpen } = this.state;
    const isFetching = isFetchingTenants || isFetchingEndpoints;
    return (
      <div className="tenants">
        <div className="sidebar__header">
          <span className="sidebar__title-text">Tenants</span>
          <div
            className="sidebar__round-btn sidebar__round-btn--add"
            onClick={this.openNewItem}
          >
            <Btn type={BTN_ADD} tooltip="Add New Tenant" />
          </div>
            <NewItem
              path="/l3vpn:vpn/l3vpn"
              defaults={getTenantDefaults()}
              label="Tenant Name"
              isOpen={newItemOpen}
              close={this.closeNewItem}
            />
        </div>
        <div className="sidebar__body">
          {tenants && tenants.map(tenant =>
            <Tenant
              key={tenant.name}
              tenant={tenant}
              endpoints={endpoints && endpoints.filter(
                endpoint => endpoint.tenant === tenant.name
              )}
              networkServices={networkServices && networkServices.filter(
                networkService => networkService.tenant === tenant.name
              )}
              isOpen={openTenantName === tenant.name}
              fade={openTenantName !== undefined}
              toggle={() => {this.openTenant(tenant.name);}}
            />
          )}
          <LoadingOverlay items={[
            { isFetching: isFetchingTenants, label: 'Fetching Tenants' },
            { isFetching: isFetchingEndpoints, label: 'Fetching Endpoints...' }
          ]}/>
        </div>
      </div>
    );
  }

  componentDidMount() {
    const { fetchSidebarData } = this.props;
    fetchSidebarData();
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tenants);
