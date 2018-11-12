import React from 'react';
import { PureComponent, createRef } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { CONFIGURATION_EDITOR } from '../../constants/Layout';

import BtnDeleteIcon from '../icons/BtnDelete';
import BtnGoToIcon from '../icons/BtnGoTo';

import { deleteEndpoint } from '../../actions/endpoints';


const mapDispatchToProps = { deleteEndpoint };

class Endpoint extends PureComponent {
  constructor(props) {
    super(props);
    this.ref = createRef();
    this.keyPath = `/l3vpn:vpn/l3vpn{${props.tenant}}/endpoint{${props.name}}`;
  }

  delete = async (event) => {
    event.stopPropagation();
    const { isOpen, toggle, deleteEndpoint, tenant, name } = this.props;
    await deleteEndpoint(tenant, name);
    if (isOpen) { toggle(); }
  }

  goTo = (event) => {
    event.stopPropagation();
    window.location.assign(CONFIGURATION_EDITOR + this.keyPath);
  }

  render() {
    const { isOpen, name, tenant, toggle, deleteEndpoint, ...rest } = this.props;
    console.debug('Site Render');
    return (
      <div className={classNames('accordion accordion--level2', {
          'accordion--closed': !isOpen,
          'accordion--open': isOpen
      })}>
        <div className="accordion__header" onClick={toggle} >
          <span className="sidebar__title-text">{name} ({rest['Device']})</span>
          <div
            className="sidebar__round-btn sidebar__round-btn--go-to"
            onClick={this.goTo}
          >
            <BtnGoToIcon/>
          </div>
          <div
            className="sidebar__round-btn sidebar__round-btn--delete"
            onClick={this.delete}
          >
            <BtnDeleteIcon/>
          </div>
        </div>
        <div
          ref={this.ref}
          className="accordion__panel"
          style={{ maxHeight: (isOpen && this.ref.current)
            ? `${this.ref.current.scrollHeight}px` : undefined }}
        >
          <div className="field-group">
            {rest && Object.keys(rest).map(key =>
              <div key={key} className="field-group__row">
                <span className="field-group__label">{key}</span>
                <span className="field-group__value">{rest[key]}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(Endpoint);
