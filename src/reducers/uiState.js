import * as ActionTypes from '../actions/uiState';


// === Selectors ==============================================================

export const getDraggedItem = state => state.draggedItem;
export const getSelectedConnection = state => state.selectedConnection;
export const getSelectedIcon = state => state.selectedIcon;
export const getExpandedIcons = state => state.expandedIcons;

export const getEditMode = state => state.editMode;
export const getHasWriteTransaction = state => state.hasWriteTransaction;
export const getBodyOverlayVisible = state => state.bodyOverlayVisible;

export const getError = state => state.error;


// === Reducer ================================================================

export default function(state = {
  expandedIcons: [],
  editMode: false
}, action) {
  const { type, item, id,
          editMode, hasWriteTransaction, bodyOverlayVisible, error } = action;
  switch (type) {

    case ActionTypes.ITEM_DRAGGED:
      return { ...state, draggedItem: item };

    case ActionTypes.CONNECTION_SELECTED:
      return {
        ...state,
        selectedConnection: state.selectedConnection === id ? null : id,
        selectedIcon: null
      };

    case ActionTypes.ICON_SELECTED:
      return {
        ...state,
        selectedIcon: state.selectedIcon === id ? null : id,
        selectedConnection: null
      };

    case ActionTypes.ICON_EXPAND_TOGGLED:
      return {
        ...state,
        expandedIcons: state.expandedIcons.includes(id)
            ? state.expandedIcons.filter(icon => icon !== id)
            : [ ...state.expandedIcons, id ]
      };

    case ActionTypes.EDIT_MODE_TOGGLED:
      return { ...state, expandedIcons: [], editMode };

    case ActionTypes.WRITE_TRANSACTION_TOGGLED:
      return { ...state, hasWriteTransaction };

    case ActionTypes.BODY_OVERLAY_TOGGLED:
      return { ...state, bodyOverlayVisible };

    case ActionTypes.ERROR_RAISED:
      return { ...state, error };

    default:
      return state;
  }
}
