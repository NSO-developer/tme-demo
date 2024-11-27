import { createSlice } from '@reduxjs/toolkit';

// === Selectors ==============================================================

export const getOpenService = state => state.menu.openService;

export const getOpenServiceName = state =>
  getOpenService(state) &&  getOpenService(state).match(/{([^}]+)}$/)[1];


// === Reducer ================================================================

const menuSlice = createSlice({
  name: 'menu',
  initialState: {},
  reducers: {
    serviceToggled: (state, { payload }) => {
      const { keypath } = payload;
      state.openService = state.openService === keypath ? undefined : keypath;
    },
  }
});

const { actions, reducer } = menuSlice;
export const { serviceToggled } = actions;
export default reducer;
