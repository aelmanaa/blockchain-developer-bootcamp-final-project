import { createSlice } from "@reduxjs/toolkit";

const ONBOARD_TEXT = "Click here to install MetaMask!";
const CONNECT_TEXT = "Connect Account";
const CONNECTED_TEXT = "Connected";

const accountSlice = createSlice({
  name: "account",
  initialState: {
    accountButtonText: ONBOARD_TEXT,
    accountButtonEnabled: true,
    accounts: [],
    accountsBalances: {},
    accountsOracleEscrow: {},
    accountsInsuranceEscrow: {},
    isMetamaskInstalled: false,
    isConnected: false,
    web3Loaded: false,
    chainId: null,
    providerRpcError: null,
  },
  reducers: {
    showNotification(state, action) {
      state.notification = {
        status: action.payload.status,
        title: action.payload.title,
        message: action.payload.message,
      };
    },
    checkMetamaskInstalled(state, action) {
      state.isMetamaskInstalled = action.payload.isMetamaskInstalled;
    },
    connect(state, action) {
      state.isConnected = action.payload.isConnected;
      if (action.payload.providerRpcError) {
        state.providerRpcError = action.payload.providerRpcError;
      }
    },
    loadAccounts(state, action) {
      state.accounts = action.payload.accounts;
    },
    loadChainId(state, action) {
      state.chainId = action.payload.chainId;
    },
    afterAccountsLoading(state, action) {
      state.accountButtonEnabled = action.payload.accountButtonEnabled;
      if (action.payload.accountButtonEnabled) {
        state.accountButtonText = CONNECT_TEXT;
      } else {
        state.accountButtonText = CONNECTED_TEXT;
      }
    },
    loadWeb3(state, action) {
      state.web3Loaded = action.payload.web3Loaded;
    },
    updateAccountBalance(state,action){
      state.accountsBalances[action.payload.account]=action.payload.balance;
    },
    updateOracleEscrow(state,action){
      state.accountsOracleEscrow[action.payload.account]=action.payload.balance;
    }
  },
});

export const accountActions = accountSlice.actions;

export default accountSlice;
