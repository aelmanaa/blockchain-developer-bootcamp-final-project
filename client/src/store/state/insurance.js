import { createSlice } from "@reduxjs/toolkit";
import { REGIONS, FARMS } from "../../utils/constant";

const insuranceSlice = createSlice({
  name: "insurance",
  initialState: {
    registerContractSeason: null,
    registerContractRegion: REGIONS.REGA.keyName,
    registerContractFarm: FARMS.FARM1.keyName,
    registerContractSize: 1,
    openContracts: [],
    closedContracts: [],
    premiumPerHA: 0,
    halfPremiumPerHA: 0,
    minimumLiquidity: 0,
    contractBalance: 0,
    insuranceCounter: 0,
  },
  reducers: {
    updateConstants(state, action) {
      state.premiumPerHA = action.payload.premiumPerHA;
      state.halfPremiumPerHA = action.payload.halfPremiumPerHA;
    },
    incrementInsuranceCounter(state, action) {
      state.insuranceCounter++;
    },
    updateLiquidity(state, action) {
      state.minimumLiquidity = action.payload.minimumLiquidity;
      state.contractBalance = action.payload.contractBalance;
    },
    encodeRegisterContractSeason(state, action) {
      state.registerContractSeason = action.payload.registerContractSeason;
    },
    encodeRegisterContractRegion(state, action) {
      state.registerContractRegion = action.payload.registerContractRegion;
    },
    encodeRegisterContractFarm(state, action) {
      state.registerContractFarm = action.payload.registerContractFarm;
    },
    encodeRegisterContractSize(state, action) {
      state.registerContractSize = action.payload.registerContractSize;
    },
  },
});

export const insuranceActions = insuranceSlice.actions;

export default insuranceSlice;
