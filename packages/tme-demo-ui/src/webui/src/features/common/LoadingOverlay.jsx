import React from 'react';
import { useState, useEffect, Fragment } from 'react';

import { isFetching } from 'api/query';

const LoadingOverlay = React.forwardRef(
  function LoadingOverlay ({ items }, callbackRef)
{
  console.debug('LoadingOverlay Render');
  const [ opacity, setOpacity ] = useState(1);
  const fetching = isFetching(items);

  useEffect(() => {
    setTimeout(() => setOpacity(fetching || 0), fetching ? 0 : 1000);
  }, [ fetching ]);

  return (
    <div
      className="loading__overlay"
      style={{ opacity }}
      ref={callbackRef}
    >
      <div className="loading__lines">
        {fetching ?
          <Fragment>
            <span className="loading__line" />
            <span className="loading__line" />
            <span className="loading__line" />
          </Fragment> :
          <div className="loading__line-placeholder" />
        }
      </div>
      <div className="loading__text">
        {items && Object.entries(items).map(([label, status], idx) =>
          <div key={idx}>{ `Fetching ${label}... ${status || ''}`}</div>)}
      </div>
    </div>
  );
});

export default React.memo(LoadingOverlay);
