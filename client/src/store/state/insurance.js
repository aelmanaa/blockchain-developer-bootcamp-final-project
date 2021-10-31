import { createSlice } from "@reduxjs/toolkit";
import { REGIONS, FARMS } from "../../utils/constant";

const insuranceSlice = createSlice({
  name: "insurance",
  initialState: {
    registerContractSeason: null,
    registerContractRegion: REGIONS.REGA.keyName,
    registerContractFarm: FARMS.FARM1.keyName,
    registerContractSize: 1,
    contracts: [],
    pendings: [],
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
    loadContracts(state, action) {
      state.contracts = action.payload.contracts;
    },
    loadPendings(state, action) {
      state.pendings = action.payload.pendings;
    },
    decrementPending(state, action) {
      const index = state.pendings.findIndex(
        (element) =>
          element.seasonId === action.payload.seasonId &&
          element.region === action.payload.region
      );
      if (index > -1) {
        state.pendings[index].numberOpenContracts -= 1;
        if (state.pendings[index].numberOpenContracts <= 0) {
          state.pendings.splice(index, 1);
        }
      }
    },
    addContract(state, action) {
      // handle duplicates
      const index = state.contracts.findIndex(
        (element) => element.key === action.payload.contract.key
      );
      if (index === -1) {
        state.contracts.push(action.payload.contract);
      }
    },
    updateContract(state, action) {
      // handle duplicates
      const index = state.contracts.findIndex(
        (element) => element.key === action.payload.contract.key
      );
      if (index === -1) {
        state.contracts.push(action.payload.contract);
      } else {
        state.contracts[index] = action.payload.contract;
      }
    },
  },
});

export const insuranceActions = insuranceSlice.actions;

export default insuranceSlice;
