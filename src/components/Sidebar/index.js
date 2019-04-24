import './index.css';
import React from 'react';
import Tenants from './Tenants';

function Sidebar() {
  console.debug('Sidebar Render');
  return (
    <div className="sidebar">
      <Tenants/>
    </div>
  );
}

export default Sidebar;
