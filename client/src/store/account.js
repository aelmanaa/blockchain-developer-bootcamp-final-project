import { createSlice } from "@reduxjs/toolkit";

const ONBOARD_TEXT = "Click here to install MetaMask!";
const CONNECT_TEXT = "Connect";
const CONNECTED_TEXT = "Connected";

const accountSlice = createSlice({
  name: "account",
  initialState: {
    accountButtonText: ONBOARD_TEXT,
    accountButtonEnabled: true,
    accounts: [],
    isMetamaskInstalled: false,
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
    loadAccounts(state, action) {
      state.accounts = action.payload.accounts;
    },
    afterAccountsLoading(state, action) {
      state.accountButtonEnabled = action.payload.accountButtonEnabled;
      if (action.payload.accountButtonEnabled) {
        state.accountButtonText = CONNECT_TEXT;
      } else {
        state.accountButtonText = CONNECTED_TEXT;
      }
    },
  },
});

export const accountActions = accountSlice.actions;

export default accountSlice;
