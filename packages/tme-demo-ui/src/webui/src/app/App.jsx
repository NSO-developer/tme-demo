import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useSelector } from 'react-redux';
import classNames from 'classnames';

import WebuiOne from 'features/nso/WebuiOne';
import MenuSidebar from 'features/menu/MenuSidebar';
import TopologyViewer from 'features/topology/TopologyViewer';
import ConfigViewer from 'features/config/ConfigViewer';
import TerminalViewer from 'features/terminal/TerminalViewer';

import { getEditMode } from 'features/topology/topologySlice';

function App () {
  console.debug('App Render');

  const editMode = useSelector((state) => getEditMode(state));

  return (
    <DndProvider backend={HTML5Backend}>
      <WebuiOne>
        <MenuSidebar/>
        <div className={classNames('centre-pane', {
          'centre-pane--edit-mode': editMode
        })}>
          <TopologyViewer/>
          <TerminalViewer/>
        </div>
        <ConfigViewer/>
      </WebuiOne>
    </DndProvider>
  );
}

export default App;
