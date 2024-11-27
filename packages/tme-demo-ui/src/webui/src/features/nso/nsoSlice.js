import { createSlice } from '@reduxjs/toolkit';

// === Selectors ==============================================================

export const getBodyOverlayVisible = state => state.nso.bodyOverlayVisible;
export const getHasWriteTransaction = state => state.nso.hasWriteTransaction;
export const getCommitInProgress = state => state.nso.commitInProgress;
export const getError = state => state.nso.error;


// === Reducer ================================================================

const nsoSlice = createSlice({
  name: 'nso',
  initialState: {},
  reducers: {
    bodyOverlayToggled: (state, { payload }) => {
      state.bodyOverlayVisible = payload;
    },

    writeTransactionToggled: (state, { payload }) => {
      state.hasWriteTransaction = payload;
    },

    commitInProgressToggled: (state, { payload }) => {
      state.commitInProgress = payload;
    },

    errorRaised: (state, { payload }) => {
      state.error = payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase('topology/editModeToggled', (state, { payload }) => {
      state.bodyOverlayVisible = payload;
    });
  }
});

const { actions, reducer } = nsoSlice;
export const {
  dimensionsChanged, bodyOverlayToggled, writeTransactionToggled,
  commitInProgressToggled, errorRaised } = actions;
export default reducer;


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
