export const ITEM_DRAGGED = 'item-dragged';
export const CONNECTION_SELECTED = 'connection-selected';
export const ICON_SELECTED = 'icon-selected';
export const ICON_EXPAND_TOGGLED = 'icon-expand-toggled';
export const UNDERLAY_TOGGLED = 'underlay-toggled';

export const NEW_NETWORK_SERVICE_TOGGLED = 'new-network-service-toggled';
export const TENANT_TOGGLED = 'tenant-toggled';
export const EDIT_MODE_TOGGLED = 'edit-mode-toggled';
export const BODY_OVERLAY_TOGGLED = 'body-overlay-toggled';
export const WRITE_TRANSACTION_TOGGLED = 'write-transaction-toggled';
export const COMMIT_IN_PROGRESS_TOGGLED = 'commit-in-progress-toggled';
export const CONFIG_VIEWER_TOGGLED = 'config-viewer-toggled';

export const ERROR_RAISED = 'error-raised';


// === Action Creators ========================================================

export const itemDragged = item => ({
  type: ITEM_DRAGGED, item
});

export const connectionSelected = name => ({
  type: CONNECTION_SELECTED, name
});

export const iconSelected = name => ({
  type: ICON_SELECTED, name
});

export const iconExpandToggled = (name, override) => ({
  type: ICON_EXPAND_TOGGLED, name, override
});

export const underlayToggled = name => ({
  type: UNDERLAY_TOGGLED, name
});

export const newNetworkServiceToggled = (container, pos) => ({
  type: NEW_NETWORK_SERVICE_TOGGLED, container, pos
});

export const tenantToggled = name => ({
  type: TENANT_TOGGLED, name
});

export const editModeToggled = editMode => ({
  type: EDIT_MODE_TOGGLED, editMode
});

export const bodyOverlayToggled = bodyOverlayVisible => ({
  type: BODY_OVERLAY_TOGGLED, bodyOverlayVisible
});

export const writeTransactionToggled = hasWriteTransaction => ({
  type: WRITE_TRANSACTION_TOGGLED, hasWriteTransaction
});

export const commitInProgressToggled = commitInProgress => ({
  type: COMMIT_IN_PROGRESS_TOGGLED, commitInProgress
});

export const configViewerToggled = configViewerVisible => ({
  type: CONFIG_VIEWER_TOGGLED, configViewerVisible
});

export const errorRaised = error => ({
  type: ERROR_RAISED, error
});


// === Thunk Middleware =======================================================

export const handleError = (title, exception, actionType) => dispatch => {
  if (title || exception) {
    const error = {
      title: title
    };
    if (exception) {
      console.error(exception);
      error.message = exception.message;
    }
    if (actionType) {
      dispatch({
        type: actionType,
        error: error
      });
    }
    dispatch(errorRaised(error));
  } else {
    dispatch(errorRaised(undefined));
  }
};
