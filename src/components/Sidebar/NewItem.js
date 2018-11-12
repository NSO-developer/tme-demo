import React from 'react';
import { PureComponent, createRef } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { CONFIGURATION_EDITOR_URL } from '../../constants/Layout';

import Tenant from './Tenant';
import BtnDeleteIcon from '../icons/BtnDelete';
import BtnConfirmIcon from '../icons/BtnConfirm';

import { handleError } from '../../actions/uiState';
import JsonRpc from '../../utils/JsonRpc';


const mapDispatchToProps = { handleError };


class NewItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { value: '' };
    this.ref = createRef();
    this.formRef = createRef();
    this.inputRef = createRef();
  }

  processDefaults = (th, context, defaults) =>
    Promise.all(defaults.map(val => JsonRpc.request('set_value', {
      th: th,
      path: `${context}/${val.path}`,
      value: val.value
    })));

  create = async () => {
    const { value } = this.state;
    const { path, defaults, close, handleError } = this.props;
    if (value) {
      const keyPath = `${path}{${value}}`;
      const th = await JsonRpc.write();
      try {
        await JsonRpc.request('create', { th: th, path: keyPath });
        await this.processDefaults(th, keyPath, defaults || []);
        this.setState({ value: '' });
        close();
        window.location.assign(CONFIGURATION_EDITOR_URL + keyPath);
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
            <BtnDeleteIcon/>
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
            <BtnConfirmIcon/>
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
