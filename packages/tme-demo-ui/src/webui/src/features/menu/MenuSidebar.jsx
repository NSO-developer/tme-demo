import React from 'react';

import Sidebar from '../common/Sidebar';
import NodeListWrapper from './panels/NodeListWrapper';

import * as Tenant from './modules/Tenant';

function MenuSidebar() {
  console.debug('MenuSidebar Render');

  return (
    <Sidebar>
      <NodeListWrapper
        title="Tenants"
        label="Tenant"
        keypath={Tenant.path}
        fetching={Tenant.useFetchStatus()}
      >
        {Tenant.useQuery().data?.map(({ name }) =>
          <Tenant.Component key={name} name={name} />)}
      </NodeListWrapper>
    </Sidebar>
  );
}

export default MenuSidebar;
