import React from 'react';
import { PureComponent } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Tenants from './Tenants';
import Topology from './Topology';
import ConfigViewer from './ConfigViewer';
import NsoWrapper from './NsoWrapper';

class App extends PureComponent {
  render() {
    console.debug('App Render');
    return (
      <DndProvider backend={HTML5Backend}>
        <NsoWrapper>
          <Tenants/>
          <Topology/>
          <ConfigViewer/>
        </NsoWrapper>
      </DndProvider>
    );
  }
}

export default App;
