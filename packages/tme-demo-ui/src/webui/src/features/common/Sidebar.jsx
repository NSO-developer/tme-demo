import './index.css';
import React from 'react';
import { PureComponent, createRef } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import classNames from 'classnames';


class Sidebar extends PureComponent {
  constructor(props) {
    super(props);
    this.ref = createRef();
    this.innerRef = createRef();
  }

  resize = () => {
    console.debug('Sidebar resize');
    const top = this.ref.current.clientHeight -
                this.innerRef.current.scrollHeight;
    this.ref.current.style.top = top > 0 ? 0 : `${top}px`;
  };

  render() {
    console.debug('Sidebar Render');
    return (
      <div ref={this.ref} className={classNames('sidebar', {
        'sidebar--hidden': this.props.hidden
      })}>
        <div ref={this.innerRef} className="sidebar__inner">
          <ReactResizeDetector handleHeight
            onResize={this.resize}
            refreshMode="debounce"
            refreshRate={500}
          />
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Sidebar;
