export const getIsFetching = state => state.isFetching;
export const getItems = state => state.items;

export default (types, wrappedReducer) => {
  const [ queryRequestType, querySuccessType, queryFailureType,
          itemDeletedType, itemAddedType ] = types;

  return (state = {
    isFetching: false,
    items: [],
    error: undefined
  }, action) => {
    switch (action.type) {
      case queryRequestType:
        return {
          ...state,
          isFetching: true,
          error: undefined
        };
      case querySuccessType:
        return {
          isFetching: false,
          items: action.items,
          lastUpdated: action.receivedAt
        };
      case queryFailureType:
        return {
          ...state,
          isFetching: false,
          error: action.error
        };
      case itemDeletedType:
        return {
          ...state,
          items: Array.isArray(state.items)
            ? state.items.filter(item => item.name !== action.name)
            : Object.keys(state.items).reduce((accumulator, current) => {
                if (current !== action.name) {
                  accumulator[current] = state.items[current];
                }
                return accumulator;
              }, {})
        };
      case itemAddedType:
        return {
          ...state,
          items: {
            ...state.items,
            [action.name]: action.item
          }
        };
      default: {
        if (wrappedReducer) {
          const items = wrappedReducer(state.items, action);
          return (items === state.items) ? state : { ...state, items };
        }
        return state;
      }
    }
  };
};
