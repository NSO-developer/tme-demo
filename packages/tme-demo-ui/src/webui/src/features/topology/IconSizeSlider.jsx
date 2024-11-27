import React from 'react';
import { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';

import { getIconSize, getDimensions, iconSizeChanged } from './topologySlice';

import { ICON_INITIAL_MAX_SIZE_PC,
         ICON_INITIAL_MAX_SIZE_PX } from 'constants/Layout';


const mapDispatchToProps = { iconSizeChanged };

const mapStateToProps = state => ({
  iconSize: getIconSize(state),
  dimensions: getDimensions(state)
});

const calculateInitialIconSize = ({ width, height })  => {
  if (width === 0 || height === 0) {
    return undefined;
  }
  const sizePc = ICON_INITIAL_MAX_SIZE_PX / Math.min(width, height) * 100;
  return Math.min(Math.ceil(sizePc), ICON_INITIAL_MAX_SIZE_PC);
};


class IconSizeSlider extends PureComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const { iconSizeChanged } = this.props;
    iconSizeChanged(Number(event.target.value));
  }

  componentDidMount() {
    // IE fix: Ensure any cached value is reset
    setTimeout(() => { this.forceUpdate(); }, 500);
  }

  componentDidUpdate() {
    const { iconSize, dimensions, iconSizeChanged } = this.props;
    if (!iconSize && dimensions) {
      iconSizeChanged(calculateInitialIconSize(dimensions));
    }
  }

  render() {
    console.debug('IconSizeSlider Render');
    const { iconSize } = this.props;
    return (iconSize !== undefined &&
      <Fragment>
        <span className="footer__text footer__text--right">Icon Size</span>
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
