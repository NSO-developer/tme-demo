import JsonRpc from '../utils/JsonRpc';
import { safeKey } from '../utils/UiUtils';

export const FETCH_LAYOUT_REQUEST = 'fetch-layout-request';
export const FETCH_LAYOUT_SUCCESS = 'fetch-layout-success';
export const FETCH_LAYOUT_FAILURE = 'fetch-layout-failure';


// === JsonRpc Middleware =====================================================

const path = '/webui:webui/webui:data-stores/tme-demo-ui:topology-layout';
const selection = [ 'name',
                    'width',
                    'title',
                    'connection-colour' ];
const resultKeys = [ 'name',
                     'width',
                     'title',
                     'connectionColour' ];

export const fetchLayout = () => ({
  jsonRpcQuery: {
    xpathExpr   : path,
    selection   : selection,
    resultKeys  : resultKeys,
    transform   : addZoomedLayout
  },
  types: [
    FETCH_LAYOUT_REQUEST,
    FETCH_LAYOUT_SUCCESS,
    FETCH_LAYOUT_FAILURE
  ],
  errorMessage: 'Failed to fetch layout'
});

export const addZoomedLayout = layout => Promise.all(
  layout.map(async container => {
    try {
      const zoomedLayoutPath = `${path}{${safeKey(container.name)}}/zoomed`;
      const zoomedLayout = await JsonRpc.query({
        path: `${path}{${safeKey(container.name)}}/zoomed`,
        selection: [ 'title', 'width' ]
      });
      return {
        ...container,
        width: Number(container.width),
        zoomed: zoomedLayout.results.length == 0 ? undefined :
          zoomedLayout.results.map(zoomedContainer => ({
            'title': zoomedContainer[0],
            'width': zoomedContainer[1]
          }))
      };
    } catch(exception) {
      console.error(`Error retrieving zoomed layout for ${container.name}`);
      console.log(exception);
      return container;
    }
  })
);

