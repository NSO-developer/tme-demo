import React from 'react';
import { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';

import { getIconSize, calculateInitialIconSize } from '../../reducers';
import { iconSizeChanged } from '../../actions/uiSizing';


const mapDispatchToProps = { iconSizeChanged };

const mapStateToProps = state => ({
  iconSize: getIconSize(state),
  initialIconSize: calculateInitialIconSize(state)
});


class IconSizeSlider extends PureComponent {
  constructor(props) {
    super(props);
    const { iconSize, initialIconSize, iconSizeChanged } = this.props;
    this.handleChange = this.handleChange.bind(this);
    if (iconSize === null) {
      iconSizeChanged(initialIconSize);
    }
  }

  handleChange(event) {
    const { iconSizeChanged } = this.props;
    iconSizeChanged(Number(event.target.value));
  }

  componentDidMount() {
    // IE fix: Ensure any cached value is reset
    setTimeout(() => { this.forceUpdate(); }, 500);
  }

  render() {
    console.debug('IconSizeSlider Render');
    const { iconSize } = this.props;
    return (iconSize !== null &&
      <Fragment>
        <div className="topology-footer__label topology-footer__label--left">
          <span className="topology-footer__label-text">Icon Size</span>
        </div>
        <label className="slider">
          <input
            type="range"
            min="6"
            max="12"
            value={iconSize}
            onChange={this.handleChange}
          />
        </label>
      </Fragment>
    );
  }
}

export default connect( mapStateToProps, mapDispatchToProps)(IconSizeSlider);
