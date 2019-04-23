import React from 'react';
import { PureComponent, createRef } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { CONFIGURATION_EDITOR_URL } from '../../constants/Layout';
import * as IconTypes from '../../constants/Icons';

import Tenant from './Tenant';
import Btn from '../icons/BtnWithTooltip';

import { handleError } from '../../actions/uiState';
import JsonRpc from '../../utils/JsonRpc';
import Comet from '../../utils/Comet';


const mapDispatchToProps = { handleError };


class NewItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { value: '' };
    this.ref = createRef();
    this.formRef = createRef();
    this.inputRef = createRef();
  }

  processDefaults = (th, context, defaults, value) =>
    Promise.all(defaults.map(val => JsonRpc.request('set_value', {
      th: th,
      path: `${context}/${val.path}`,
      value: `${val.value}${val.prefix ? value : ''}`
    })));

  create = async () => {
    const { value } = this.state;
    const { path, defaultsPath, defaults, close, handleError } = this.props;
    if (value) {
      const keyPath = `${path}{${value}}`;
      const defaultsKeyPath = defaultsPath
        ? `${defaultsPath}{${value}}` : keyPath;
      const th = await JsonRpc.write();
      try {
        await JsonRpc.request('create', { th: th, path: keyPath });
        await this.processDefaults(th, defaultsKeyPath, defaults || [],  value);
        this.setState({ value: '' });
        close();
        Comet.stopThenGoToUrl(CONFIGURATION_EDITOR_URL + keyPath);
      } catch (error) {
        handleError(`Error creating ${value}`, error);
      }
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.create();
  }

  handleChange = (event) => {
    this.setState({ value: event.target.value });
  }

  render() {
    console.debug('New Item Render');
    const { label, isOpen, close } = this.props;
    const { value } = this.state;
    return (
      <div className={classNames('new_item', {
        'new-item--open': isOpen
      })} ref={this.ref}>
        <form
          className="new-item__form"
          onSubmit={this.handleSubmit}
          ref={this.formRef}
        >
          <div
            className="sidebar__round-btn sidebar__round-btn--delete"
            onClick={close}
          >
            <Btn type={IconTypes.BTN_DELETE} tooltip="Cancel"/>
          </div>
          <label className="new-item__label">{label}</label>
          <input
            className="new-item__value"
            onChange={this.handleChange}
            ref={this.inputRef}
            type="text"
            value={value}
          />
          <div className={classNames('sidebar__round-btn', {
            'sidebar__round-btn--confirm-active': value !== '',
            'sidebar__round-btn--confirm-inactive': value === ''
          })} onClick={this.create}>
            <Btn type={IconTypes.BTN_CONFIRM} tooltip="Create"/>
          </div>
        </form>
      </div>
    );
  }

  componentDidUpdate(prevProps) {
    const { isOpen } = this.props;
    if (isOpen != prevProps.isOpen) {
      requestAnimationFrame(() => {
        if (isOpen) {
          this.ref.current.style.width =
            `${this.formRef.current.scrollWidth + 10}px`;
          setTimeout(() => {this.inputRef.current.focus();}, 500);
        } else {
          this.ref.current.style.width = '0px';
        }
      });
    }
  }
}

export default connect(null, mapDispatchToProps)(NewItem);
