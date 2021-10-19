import MetaMaskOnboarding from "@metamask/onboarding";
import Web3 from "web3";
import { accountActions } from "./account";

const onboarding = new MetaMaskOnboarding();
let web3 = null;

export const checkMetamaskInstalled = () => {
  return async (dispatch) => {
    if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
      onboarding.startOnboarding();
    }
    dispatch(
      accountActions.checkMetamaskInstalled({ isMetamaskInstalled: true })
    );
    window.ethereum.on("connect", (connectInfo) => {
      dispatch(accountActions.connect({ isConnected: true, providerRpcError: null }));
      dispatch(accountActions.loadChainId({ chainId: connectInfo.chainId }));
      web3 = new Web3(window.ethereum);
      dispatch(accountActions.loadWeb3({ web3Loaded: true }));
    });

    window.ethereum.on("chainChanged", (chainId) => {
      dispatch(accountActions.loadChainId({ chainId }));
    });

    window.ethereum.on("disconnect", (error) => {
      console.log(JSON.stringify(error));
      dispatch(
        accountActions.connect({ isConnected: false, providerRpcError: error.code })
      );
      dispatch(accountActions.loadChainId({ chainId: null }));
      web3 = null;
      dispatch(accountActions.loadWeb3({ web3Loaded: false }));
    });
  };
};

export const connect = (isMetamaskInstalled) => {
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

export const getWeb3 = () => {
  return web3;
};
