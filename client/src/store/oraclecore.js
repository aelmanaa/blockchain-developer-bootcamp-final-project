import { createSlice } from "@reduxjs/toolkit";

const oracleCoreSlice = createSlice({
  name: "oracleCore",
  initialState: {
    seasonsNumber: 0,
    seasons: []
  },
  reducers: {
    loadSeasonsNumber(state, action) {
      state.seasonsNumber = action.payload.seasonsNumber;
    }
  },
});

export const oracleCoreActions = oracleCoreSlice.actions;

export default oracleCoreSlice;
