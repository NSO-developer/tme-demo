import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import * as Colours from '../../constants/Colours';

import { getActualIconSize, getDraggedItem } from '../../reducers';


const mapStateToProps = state => ({
  iconSize: getActualIconSize(state),
  draggedItem: getDraggedItem(state)
});


function Container(props) {
  console.debug('Container Render');
  const { idx, id, width, iconSize, draggedItem, length } = props;
  const shadow = Math.round(iconSize / 4);
  return (
    <div
      className="container__outer"
      style={{
        width: `${width}%`
      }}
    >
      <div
        className="container__layer"
        style={{
          boxShadow: (idx === (length - 1))
            ? `${shadow}px 0px 0px 0px ${Colours.BACKGROUND_1} inset, ${
                shadow + 1}px 0px 0px 0px darkgray inset`
            : (idx % 2)
              ? `0px 0px 0px ${shadow}px ${Colours.BACKGROUND_1
                } inset, 0px 0px 0px ${shadow + 1}px darkgray inset`
              : 'none',
          background: idx % 2 ? Colours.BACKGROUND_2 : Colours.BACKGROUND_1
        }}
      />
      <div className={classNames(
        'container__layer', 'container__layer-overlay', {
        'container__layer-overlay--visible':
          draggedItem && draggedItem.container === id
      })}
        style={{
          boxShadow: `0px 0px ${shadow / 2}px ${shadow}px white inset`
        }}
      />
      <div className={classNames('container__layer',
        'container__layer-overlay', 'container__layer-overlay-disabled', {
        'container__layer-overlay--visible':
          draggedItem && draggedItem.iconId && draggedItem.container !== id
        })}
      />
    </div>
  );
}

export default connect(mapStateToProps)(Container);
