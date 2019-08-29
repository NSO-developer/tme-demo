import React from 'react';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import Tenant from './Tenant';
import NewItem from './NewItem';
import Btn from '../icons/BtnWithTooltip';
import { BTN_ADD } from '../../constants/Icons';
import LoadingOverlay from '../common/LoadingOverlay';

import { getTenants, getEndpoints, getNetworkServices,
         getIsFetchingTenants, getIsFetchingEndpoints,
         getIsFetchingNetworkServices } from '../../reducers';
import { bodyOverlayToggled } from '../../actions/uiState';
import { TENANT_PATH } from '../../actions/tenants';

import { fetchSidebarData } from '../../actions';


const mapDispatchToProps = { fetchSidebarData, bodyOverlayToggled };

const mapStateToProps = state => ({
  tenants: getTenants(state),
  endpoints: getEndpoints(state),
  networkServices: getNetworkServices(state),
  isFetchingTenants: getIsFetchingTenants(state),
  isFetchingEndpoints: getIsFetchingEndpoints(state),
  isFetchingNetworkServices: getIsFetchingNetworkServices(state)
});


class Tenants extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      newItemOpen: false
    };
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
    const { tenants, endpoints, networkServices, isFetchingTenants,
            isFetchingEndpoints, isFetchingNetworkServices } = this.props;
    const { newItemOpen } = this.state;
    return (
      <div className="tenants">
        <div className="sidebar__header">
          <span className="sidebar__title-text">Tenants</span>
          <div
            className="inline-round-btn inline-round-btn--add"
            onClick={this.openNewItem}
          >
            <Btn type={BTN_ADD} tooltip="Add New Tenant" />
          </div>
            <NewItem
              path={TENANT_PATH}
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
            />
          )}
          <LoadingOverlay items={[
            { isFetching: isFetchingTenants, label: 'Fetching Tenants' },
            { isFetching: isFetchingEndpoints, label: 'Fetching Endpoints...' },
            { isFetching: isFetchingNetworkServices,
              label: 'Fetching Network Services...' }
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
