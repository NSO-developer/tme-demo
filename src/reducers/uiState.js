import * as ActionTypes from '../actions/uiState';


// === Selectors ==============================================================

export const getDraggedItem = state => state.draggedItem;
export const getSelectedConnection = state => state.selectedConnection;
export const getSelectedIcon = state => state.selectedIcon;
export const getExpandedIcons = state => state.expandedIcons;

export const getOpenTenant = state => state.openTenant;
export const getEditMode = state => state.editMode;
export const getHasWriteTransaction = state => state.hasWriteTransaction;
export const getCommitInProgress = state => state.commitInProgress;
export const getBodyOverlayVisible = state => state.bodyOverlayVisible;

export const getError = state => state.error;


// === Reducer ================================================================

export default function(state = {
  expandedIcons: [],
  editMode: false
}, action) {
  const { type, item, name, editMode, hasWriteTransaction,
          commitInProgress, bodyOverlayVisible, error } = action;
  switch (type) {

    case ActionTypes.ITEM_DRAGGED:
      return { ...state, draggedItem: item };

    case ActionTypes.CONNECTION_SELECTED:
      return {
        ...state,
        selectedConnection: state.selectedConnection === name ? null : name,
        selectedIcon: null
      };

    case ActionTypes.ICON_SELECTED:
      return {
        ...state,
        selectedIcon: state.selectedIcon === name ? null : name,
        selectedConnection: null
      };

    case ActionTypes.ICON_EXPAND_TOGGLED:
      return {
        ...state,
        expandedIcons: state.expandedIcons.includes(name)
            ? state.expandedIcons.filter(icon => icon !== name)
            : [ ...state.expandedIcons, name ]
      };

    case ActionTypes.TENANT_TOGGLED:
      return {
        ...state,
        openTenant: state.openTenant === name ? null : name
      };

    case ActionTypes.EDIT_MODE_TOGGLED:
      return { ...state, expandedIcons: [], editMode };

    case ActionTypes.WRITE_TRANSACTION_TOGGLED:
      return { ...state, hasWriteTransaction };

    case ActionTypes.COMMIT_IN_PROGRESS_TOGGLED:
      return { ...state, commitInProgress };

    case ActionTypes.BODY_OVERLAY_TOGGLED:
      return { ...state, bodyOverlayVisible };

    case ActionTypes.ERROR_RAISED:
      return { ...state, error };

    default:
      return state;
  }
}
