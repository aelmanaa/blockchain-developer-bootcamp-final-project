import { configureStore } from "@reduxjs/toolkit";

import accountSlice from "./account";
import contractSlice from "./contract";
import oracleCoreSlice from "./oraclecore";
import insuranceSlice from "./insurance";
import uiSlice from "./ui";

const store = configureStore({
  reducer: {
    account: accountSlice.reducer,
    contract: contractSlice.reducer,
    oracleCore: oracleCoreSlice.reducer,
    insurance: insuranceSlice.reducer,
    ui: uiSlice.reducer,
  },
});

export default store;
