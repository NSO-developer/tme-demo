import React from 'react';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { getEditMode } from '../../reducers';
import { editModeToggled, bodyOverlayToggled } from '../../actions/uiState';


const mapDispatchToProps = { editModeToggled, bodyOverlayToggled };

const mapStateToProps = state => ({
  editMode: getEditMode(state)
});


class EditToggle extends PureComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const { editModeToggled, bodyOverlayToggled } = this.props;
    const { checked } = event.target;
    editModeToggled(checked);
    bodyOverlayToggled(checked);
  }

  componentDidMount() {
    // IE fix: Ensure any cached value is reset
    setTimeout(() => { this.forceUpdate(); }, 500);
  }

  render() {
    console.debug('EditToggle Render');
    return (
      <div className="topology-footer__item">
        <label className="toggle">
          <input
            type="checkbox"
            checked={this.props.editMode}
            onChange={this.handleChange}
          />
          <span className="toggle__switch" />
        </label>
        <div className="topology-footer__label">
          <span className="topology-footer__label-text">Edit Topology</span>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditToggle);
