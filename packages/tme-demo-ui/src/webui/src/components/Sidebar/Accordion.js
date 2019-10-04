import React from 'react';
import { PureComponent, createRef } from 'react';
import classNames from 'classnames';

class Accordion extends PureComponent {
  constructor(props) {
    super(props);
    this.ref = createRef();
    this.state = {
      isOpen: false
    };
  }

  componentDidMount() {
    const { variableHeight, isOpen, startOpen } = this.props;
    if (startOpen) {
      this.toggle();
    }
    if (variableHeight && isOpen) {
      this.animateToggle();
    }
  }

  componentDidUpdate(prevProps) {
    const { variableHeight, isOpen } = this.props;
    if (variableHeight && isOpen !== prevProps.isOpen) {
      this.animateToggle();
    }
  }

  toggle = () => {
    const { toggle } = this.props;
    if (typeof(toggle) === 'function') {
      toggle();
    } else {
      this.setState({ isOpen: !this.state.isOpen });
    }
  };

  render() {
    console.debug('Accordion Render');
    const { fade, level, variableHeight, right, header, children } = this.props;
    const { isOver, canDrop } = this.props;

    const isOpen = this.props.isOpen === undefined
      ? this.state.isOpen : this.props.isOpen;

    const accordion =
      <div className={classNames(`accordion accordion--level${level}`, {
        'accordion--right': right,
        'accordion--open': isOpen,
        'accordion--closed-fade': !isOpen && fade,
        'accordion--closed': !isOpen
      })}>
        <div className="accordion__header" onClick={this.toggle}>{header}</div>
        <div
          ref={this.ref}
          className="accordion__panel"
          style={{ maxHeight: (!variableHeight && isOpen && this.ref.current)
            ? `${this.ref.current.scrollHeight}px` : undefined }}
        >
          {children}
        </div>
      </div>;
    return accordion;
  }

  onTransitionEnd = () => {
    this.ref.current.removeEventListener(
      'transitionend', this.onTransitionEnd);
    this.ref.current.style.maxHeight = 'none';
  }

  animateToggle = () => {
    const { isOpen } = this.props;
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

export default Accordion;
