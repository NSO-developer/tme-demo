import React from 'react';
import ReactDOM from 'react-dom';
import { PureComponent, createRef } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { CONFIGURATION_EDITOR_EDIT_URL } from 'constants/Layout';
import * as IconTypes from 'constants/Icons';

import InlineBtn from './buttons/InlineBtn';

import { create, setValue } from 'api/data';
import { stopThenGoToUrl } from 'api/comet';


const mapDispatchToProps = {
  create: create.initiate,
  setValue: setValue.initiate,
  stopThenGoToUrl
};

class NewItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { value: '' };
    this.ref = createRef();
    this.formRef = createRef();
    this.inputRef = createRef();
  }

  processDefaults = async (keypath, defaults, name) =>
    Promise.all(defaults.map(({ path, value, prefix }) => this.props.setValue({
      keypath, leaf: path,
      value: `${value}${prefix ? name : ''}`
    })));

  create = async () => {
    const { value } = this.state;
    const { path, defaultsPath, defaults, close, create, stopThenGoToUrl } = this.props;
    if (value) {
      const keypath = `${path}{${value}}`;
      const defaultsKeyPath = defaultsPath
        ? `${defaultsPath}{${value}}` : keypath;
      await create({ keypath: path, name: value });
      await this.processDefaults(defaultsKeyPath, defaults || [], value);
      this.setState({ value: '' });
      close();
      stopThenGoToUrl(CONFIGURATION_EDITOR_EDIT_URL + keypath);
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.create();
  };

  handleChange = (event) => {
    this.setState({ value: event.target.value });
  };

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
          <InlineBtn
            icon={IconTypes.BTN_DELETE}
            tooltip="Cancel"
            onClick={close}
          />
          <label className="new-item__label">{label}</label>
          <input
            className="new-item__value"
            onChange={this.handleChange}
            ref={this.inputRef}
            type="text"
            value={value}
          />
          <InlineBtn
            icon={IconTypes.BTN_CONFIRM}
            disabled={value === ''}
            tooltip="Create"
          />
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
