import MetaMaskOnboarding from "@metamask/onboarding";
import { accountActions } from "./account";

const onboarding = new MetaMaskOnboarding();

export const checkMetamaskInstalled = () => {
  return async (dispatch) => {
    if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
      onboarding.startOnboarding();
    }
    let isMetamaskInstalled = true;
    dispatch(accountActions.checkMetamaskInstalled({ isMetamaskInstalled }));
  };
};

export const loadAccounts = (isMetamaskInstalled) => {
  return async (dispatch) => {
    if (isMetamaskInstalled) {
      let accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      dispatch(accountActions.loadAccounts({ accounts }));

      window.ethereum.on("accountsChanged", (accounts) => {
        dispatch(accountActions.loadAccounts({ accounts }));
      });
    }
  };
};

export const afterAccountsLoading = (accounts) => {
  return async (dispatch) => {
    if (accounts.length > 0) {
      dispatch(
        accountActions.afterAccountsLoading({ accountButtonEnabled: false })
      );
      onboarding.stopOnboarding();
    } else {
      dispatch(
        accountActions.afterAccountsLoading({ accountButtonEnabled: true })
      );
    }
  };
};
