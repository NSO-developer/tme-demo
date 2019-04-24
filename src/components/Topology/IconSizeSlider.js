import React from 'react';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { getIconSize } from '../../reducers';
import { iconSizeChanged } from '../../actions/layout';


const mapDispatchToProps = { iconSizeChanged };

const mapStateToProps = state => ({
  iconSize: getIconSize(state),
});


class IconSizeSlider extends PureComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const { iconSizeChanged } = this.props;
    iconSizeChanged(Number(event.target.value));
  }

  render() {
    console.debug('IconSizeSlider Render');
    return (
      <div className="topology-footer__item">
        <label className="slider">
          <input
            type="range"
            min="8"
            max="12"
            value={this.props.size}
            onChange={this.handleChange}
          />
        </label>
        <div className="topology-footer__label">
          <span className="topology-footer__label-text">Icon Size</span>
        </div>
      </div>
    );
  }
}

export default connect( mapStateToProps, mapDispatchToProps)(IconSizeSlider);
