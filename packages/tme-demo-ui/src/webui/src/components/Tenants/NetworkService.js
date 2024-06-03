import React from 'react';
import { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';

import { CONFIGURATION_EDITOR_EDIT_URL } from '../../constants/Layout';
import * as IconTypes from '../../constants/Icons';

import Accordion from '../Sidebar/Accordion';
import Btn from '../icons/BtnWithTooltip';

import { deleteNetworkService } from '../../actions/networkServices';
import { TENANT_PATH } from '../../actions/tenants';
import { safeKey } from '../../utils/UiUtils';


const mapDispatchToProps = { deleteNetworkService };

class NetworkService extends PureComponent {
  constructor(props) {
    super(props);
    const { tenant, name } = props;
    this.keyPath = `${TENANT_PATH}{${
      safeKey(tenant)}}/nfvo/network-service{${safeKey(name)}}`;
  }

  delete = async (event) => {
    event.stopPropagation();
    const { isOpen, toggle, deleteNetworkService, tenant, name } = this.props;
    await deleteNetworkService(tenant, name);
    if (isOpen) { toggle(); }
  }

  goTo = (event) => {
    event.stopPropagation();
    window.location.assign(CONFIGURATION_EDITOR_EDIT_URL + this.keyPath);
  }

  render() {
    console.debug('Network Service Render');
    const { isOpen, toggle, deleteNetworkService,
            name, tenant, ...rest } = this.props;
    return (
      <Accordion level="2" isOpen={isOpen} toggle={toggle} header={
        <Fragment>
          <span className="sidebar__title-text">{name}</span>
          <div
            className="inline-round-btn inline-round-btn--go-to"
            onClick={this.goTo}
          >
            <Btn
              type={IconTypes.BTN_GOTO}
              tooltip="View Network Service in Configuration Editor"
            />
          </div>
          <div
            className="inline-round-btn inline-round-btn--delete"
            onClick={this.delete}
          >
            <Btn type={IconTypes.BTN_DELETE} tooltip="Delete Network Service"/>
          </div>
        </Fragment>}>
        <div className="field-group">
          {rest && Object.keys(rest).map(key =>
            <div key={key} className="field-group__row">
              <span className="field-group__label">{key}</span>
              <span className="field-group__value">{rest[key]}</span>
            </div>
          )}
        </div>
      </Accordion>
    );
  }
}

export default connect(null, mapDispatchToProps)(NetworkService);
