import * as ActionTypes from '../actions/uiState';


// === Selectors ==============================================================

export const getDraggedItem = state => state.draggedItem;
export const getSelectedConnection = state => state.selectedConnection;
export const getSelectedIcon = state => state.selectedIcon;
export const getExpandedIcons = state => state.expandedIcons;

export const getNewNetworkService = state => state.newNetworkService;
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
  const { type, name } = action;
  switch (type) {

    case ActionTypes.ITEM_DRAGGED:
      return { ...state, draggedItem: action.item };

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

    case ActionTypes.NEW_NETWORK_SERVICE_TOGGLED: {
      const { container, pos } = action;
      return {
        ...state,
        newNetworkService: state.newNetworkService ? null : { container, pos },
        bodyOverlayVisible: state.newNetworkService ? false : true
      };
    }

    case ActionTypes.TENANT_TOGGLED:
      return {
        ...state,
        openTenant: state.openTenant === name ? null : name
      };

    case ActionTypes.EDIT_MODE_TOGGLED: {
      const { editMode } = action;
      return { ...state, expandedIcons: [], editMode };
    }

    case ActionTypes.WRITE_TRANSACTION_TOGGLED: {
      const { hasWriteTransaction } = action;
      return { ...state, hasWriteTransaction };
    }

    case ActionTypes.COMMIT_IN_PROGRESS_TOGGLED: {
      const { commitInProgress } = action;
      return { ...state, commitInProgress };
    }

    case ActionTypes.BODY_OVERLAY_TOGGLED: {
      const { bodyOverlayVisible } = action;
      return { ...state, bodyOverlayVisible };
    }

    case ActionTypes.ERROR_RAISED: {
      const { error } = action;
      return { ...state, error };
    }

    default:
      return state;
  }
}
