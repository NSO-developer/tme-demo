import './topology.css';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';

import Topology from './Topology';
import ToggleButton from './ToggleButton';
import IconSizeSlider from './IconSizeSlider';

import { getDraggedItem,
         getEditMode, editModeToggled,
         getConfigViewerVisible, configViewerToggled
} from './topologySlice';


function TopologyViewer () {
  console.debug('TopologyViewer Render');

  const draggedItem = useSelector((state) => getDraggedItem(state));
  const editMode = useSelector((state) => getEditMode(state));
  const configViewerVisible = useSelector((state) =>
    getConfigViewerVisible(state));

  const dispatch = useDispatch();

  return (
    <div className="topology__viewer">
      <Topology/>
      <div className="footer">
        <ToggleButton
          handleToggle={(value) => {dispatch(editModeToggled(value));}}
          checked={editMode}
          label="Edit Topology"
          />
        <ToggleButton
          handleToggle={(value) => {dispatch(configViewerToggled(value));}}
          checked={configViewerVisible}
          label="Show Device Config"
          />
        <IconSizeSlider/>
        <div className={classNames('component__layer', 'container__overlay', {
          'container__overlay--inactive': draggedItem
        })}/>
      </div>
    </div>
  );
}

export default TopologyViewer;
