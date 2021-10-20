import { createSlice } from "@reduxjs/toolkit";

const contractSlice = createSlice({
  name: "contract",
  initialState: {
    oracleCoreLoaded: false,
    oracleCoreAddress: 0x0,
    insuranceLoaded: false,
    insuranceAddress: 0x0,
    networkId: null,
  },
  reducers: {
    loadOracleCore(state, action) {
      state.oracleCoreLoaded = action.payload.oracleCoreLoaded;
      state.oracleCoreAddress = action.payload.address;
    },
    loadInsurance(state, action) {
      state.insuranceLoaded = action.payload.insuranceLoaded;
      state.insuranceAddress = action.payload.address;
    },
    loadNetworkId(state, action) {
      state.networkId = action.payload.networkId;
    },
  },
});

export const contractActions = contractSlice.actions;

export default contractSlice;
