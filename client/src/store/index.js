import { configureStore } from "@reduxjs/toolkit";

import accountSlice from "./account";
import contractSlice from "./contract";
import oracleCoreSlice from "./oraclecore";

const store = configureStore({
  reducer: {
    account: accountSlice.reducer,
    contract: contractSlice.reducer,
    oracleCore: oracleCoreSlice.reducer,
  },
});

export default store;
