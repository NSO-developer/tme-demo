import React from 'react';
import { PureComponent, Fragment } from 'react';


class ToggleButton extends PureComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const { handleToggle } = this.props;
    const { checked } = event.target;
    handleToggle(checked);
  }

  componentDidMount() {
    // IE fix: Ensure any cached value is reset
    setTimeout(() => { this.forceUpdate(); }, 500);
  }

  render() {
    console.debug('ToggleButton Render');
    const { checked, label } = this.props;
    return (
      <Fragment>
        <label className="toggle">
          <input
            type="checkbox"
            checked={checked}
            onChange={this.handleChange}
          />
          <span className="toggle__switch" />
        </label>
        <div className="topology-footer__label">
          <span className="topology-footer__label-text">{label}</span>
        </div>
      </Fragment>
    );
  }
}

export default ToggleButton;
