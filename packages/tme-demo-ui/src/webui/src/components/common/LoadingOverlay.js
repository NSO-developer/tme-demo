import React from 'react';

export default function LoadingOverlay (props) {
  const { items } = props;
  const isFetching = items.reduce((acc, data) => acc || data.isFetching, false);
  return (
    <div
      className="loading__overlay"
      style={{ opacity: isFetching | 0 }}
    >
      {isFetching &&
      <div className="loading__lines">
        <div className="loading__line"></div>
        <div className="loading__line"></div>
        <div className="loading__line"></div>
      </div>
      }
      <div className="loading__text">
        {items.map((data, idx) =>
          data.isFetching && <div key={idx}>{data.label}</div>)}
      </div>
    </div>
  );
}
