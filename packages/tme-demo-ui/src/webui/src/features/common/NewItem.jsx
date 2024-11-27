import React from 'react';
import ReactDOM from 'react-dom';
import { PureComponent, createRef } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { CONFIGURATION_EDITOR_EDIT_URL } from '../../constants/Layout';
import * as IconTypes from '../../constants/Icons';

import Btn from '../icons/BtnWithTooltip';

import { handleError } from '../../actions/uiState';
import JsonRpc from '../../utils/JsonRpc';
import Comet from '../../utils/Comet';
import { safeKey } from '../../utils/UiUtils';


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
      const keyPath = `${path}{${safeKey(value)}}`;
      const defaultsKeyPath = defaultsPath
        ? `${defaultsPath}{${safeKey(value)}}` : keyPath;
      const th = await JsonRpc.write();
      try {
        await JsonRpc.request('create', { th: th, path: keyPath });
        await this.processDefaults(th, defaultsKeyPath, defaults || [],  value);
        this.setState({ value: '' });
        close();
        Comet.stopThenGoToUrl(CONFIGURATION_EDITOR_EDIT_URL + keyPath);
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
    const { label, isOpen, close, btnRef } = this.props;
    const { value } = this.state;

    const { left, top } = btnRef.current
      && btnRef.current.getBoundingClientRect() || { left: 0, top: 0 };

    return ReactDOM.createPortal(
      <div
        className={classNames('new_item', {
          'new-item--open': isOpen
        })}
        style={{
          top: `${top}px`,
          left: `${left}px` }}
        ref={this.ref}
      >
        <form
          className="new-item__form"
          onSubmit={this.handleSubmit}
          ref={this.formRef}
        >
          <div
            className={classNames('inline-round-btn',
              'inline-round-btn--new-item', 'inline-round-btn--delete')}
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
          <div
            className={classNames('inline-round-btn',
              'inline-round-btn--new-item', {
              'inline-round-btn--confirm-active': value !== '',
              'inline-round-btn--confirm-inactive': value === ''
            })} onClick={this.create}
          >
            <Btn type={IconTypes.BTN_CONFIRM} tooltip="Create"/>
          </div>
        </form>
      </div>,
      document.body
    );
  }

  onOpenTransitionEnd = () => {
    this.ref.current.removeEventListener(
      'transitionend', this.onOpenTransitionEnd);
    this.inputRef.current.focus();
  };

  onCloseTransitionEnd = () => {
    this.ref.current.removeEventListener(
      'transitionend', this.onCloseTransitionEnd);
    setTimeout(() => {
      this.formRef.current.style.width = null;
    }, 500);
  };

  componentDidUpdate(prevProps) {
    const { isOpen } = this.props;
    if (isOpen != prevProps.isOpen) {
      requestAnimationFrame(() => {
        if (isOpen) {
          const formWidth = this.formRef.current.scrollWidth;
          this.formRef.current.style.width = `${formWidth}px`;
          this.ref.current.style.width = `${formWidth}px`;
          this.ref.current.addEventListener(
            'transitionend', this.onOpenTransitionEnd);
        } else {
          this.ref.current.style.width = null;
          this.ref.current.addEventListener(
            'transitionend', this.onCloseTransitionEnd);
        }
      });
    }
  }
}

export default connect(null, mapDispatchToProps)(NewItem);
