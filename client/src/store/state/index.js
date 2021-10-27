import { configureStore } from "@reduxjs/toolkit";

import accountSlice from "./account";
import contractSlice from "./contract";
import oracleCoreSlice from "./oraclecore";
import uiSlice from "./ui";

const store = configureStore({
  reducer: {
    account: accountSlice.reducer,
    contract: contractSlice.reducer,
    oracleCore: oracleCoreSlice.reducer,
    ui: uiSlice.reducer,
  },
});

export default store;
