import React from 'react';
import { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';

import { CONFIGURATION_EDITOR_EDIT_URL } from '../../constants/Layout';
import * as IconTypes from '../../constants/Icons';

import Accordion from '../Sidebar/Accordion';
import Btn from '../icons/BtnWithTooltip';

import { deleteDcEndpoint } from '../../actions/dcEndpoints';
import { TENANT_PATH } from '../../actions/tenants';
import { safeKey } from '../../utils/UiUtils';


const mapDispatchToProps = { deleteDcEndpoint };

class DcEndpoint extends PureComponent {
  constructor(props) {
    super(props);
    const { tenant, name } = props;
    this.keyPath = `${TENANT_PATH}{${
      safeKey(tenant)}}/data-centre/endpoint{${name}}`;
  }

  delete = async (event) => {
    event.stopPropagation();
    const { isOpen, toggle, deleteDcEndpoint, tenant, name } = this.props;
    await deleteDcEndpoint(tenant, name);
    if (isOpen) { toggle(); }
  }

  goTo = (event) => {
    event.stopPropagation();
    window.location.assign(CONFIGURATION_EDITOR_EDIT_URL + this.keyPath);
  }

  render() {
    console.debug('Data Centre Endpoint Render');
    const { isOpen, toggle, deleteDcEndpoint,
            tenant, name, ...rest } = this.props;

    return (
      <Accordion level="2" isOpen={isOpen} toggle={toggle} header={
        <Fragment>
          <span
            className="sidebar__title-text"
          >{rest['Device']} ({rest['Interface']})</span>
          <div
            className="inline-round-btn inline-round-btn--go-to"
            onClick={this.goTo}
          >
            <Btn
              type={IconTypes.BTN_GOTO}
              tooltip="View Data Centre Endpoint in Configuration Editor"
            />
          </div>
          <div
            className="inline-round-btn inline-round-btn--delete"
            onClick={this.delete}
          >
            <Btn
              type={IconTypes.BTN_DELETE}
              tooltip="Delete Data Centre Endpoint"
            />
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

export default connect(null, mapDispatchToProps)(DcEndpoint);
