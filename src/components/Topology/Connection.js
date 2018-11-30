import React from 'react';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import * as IconTypes from '../../constants/Icons';
import { CIRCLE_ICON_RATIO, LINE_ICON_RATIO } from '../../constants/Layout.js';

import Interface from './Interface';
import RoundButton from './RoundButton';

import { getDraggedItem, getActualIconSize, getSelectedConnection,
         getDimensions, getEditMode } from '../../reducers';

import { connectionSelected } from '../../actions/uiState';
import { deleteConnection } from '../../actions/connections';

import { pointAlongLine, lineLength, lineAngle,
         pxToPc } from '../../utils/UiUtils';


const mapStateToProps = (state, props) => {
  const { name, ep1Icon, ep2Icon } = props;
  const draggedItem = getDraggedItem(state);
  const editMode = getEditMode(state);
  return {
    dragging: !!draggedItem &&
      (draggedItem.connection === name ||
       draggedItem.icon === ep1Icon ||
       draggedItem.icon === ep2Icon),
    iconSize: getActualIconSize(state),
    selected: editMode && getSelectedConnection(state) === name,
    dimensions: getDimensions(state),
    editMode
  };
};

const mapDispatchToProps = { connectionSelected, deleteConnection };


class Connection extends PureComponent {
  constructor(props) {
    super(props);
    this.lineAngle = 0;
  }

  connectionSelected = () => {
    const { name, editMode, connectionSelected } = this.props;
    editMode && connectionSelected(name);
  }

  delete = () => {
    const { name, deleteConnection } = this.props;
    deleteConnection(name);
  }

  render() {
    console.debug('Connection Render');
    const { name, x1, y1, x2, y2, disabled, dragging,
      iconSize, selected, expanded, dimensions, editMode } = this.props;

    const iconRadius = iconSize / 2;
    const circleSize = iconSize * CIRCLE_ICON_RATIO;
    const lineWidth = iconSize * LINE_ICON_RATIO;
    const p1 = pointAlongLine(x1, y1, x2, y2, iconRadius);
    const p2 = pointAlongLine(x2, y2, x1, y1, iconRadius);
    const line = { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
    const length = lineLength(line);
    const p3 = pointAlongLine(p1.x, p1.y, p2.x, p2.y, length / 2);
    const pcP1 = pxToPc(p1, dimensions);
    const pcP2 = pxToPc(p2, dimensions);
    const pcP3 = pxToPc(p3, dimensions);

    // Always apply the shortest rotation
    const newLineAngle = lineAngle(line);
    if ((this.lineAngle - newLineAngle) > 180) {
      this.lineAngle = newLineAngle + 360;
    } else if ((this.lineAngle - newLineAngle) < -180) {
      this.lineAngle = newLineAngle - 360;
    } else {
      this.lineAngle = newLineAngle;
    }

    return (
      <div
        id={name}
        onClick={this.connectionSelected}
        className={classNames('topology__connection', {
          'topology__connection--selected': selected || expanded,
          'topology__connection--disabled': selected && disabled,
          'topology__connection--edit': editMode,
          'topology__connection--dragging': dragging
        })}
        style={{
          height: `${lineWidth}px`,
          left: `${pcP1.pcX}%`,
          top: `${pcP1.pcY}%`,
          transform: `rotate(${this.lineAngle}deg) translate(0, -50%)`,
          width: `${length / dimensions.width * 100}%`
        }}
      >
        <Interface
          connection={name}
          endpoint={1}
          pcX="0"
          pcY="50"
          {...p1}
          size={circleSize}
          active={selected}
          expanded={expanded}
          disabled={disabled}
          type={IconTypes.BTN_DRAG}
        />
        <Interface
          connection={name}
          endpoint={2}
          pcX="100"
          pcY="50"
          {...p2}
          size={circleSize}
          active={selected}
          expanded={expanded}
          disabled={disabled}
          type={IconTypes.BTN_DRAG}
        />
        {!disabled && <RoundButton
          onClick={this.delete}
          pcX="50"
          pcY="50"
          {...p3}
          hide={!selected}
          size={circleSize}
          active={selected}
          type={IconTypes.BTN_DELETE}
        />}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Connection);
