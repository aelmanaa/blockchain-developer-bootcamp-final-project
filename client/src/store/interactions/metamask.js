import MetaMaskOnboarding from "@metamask/onboarding";
import Web3 from "web3";
import { accountActions } from "../state/account";
import { updateRoles } from "./gateKeeper";

const onboarding = new MetaMaskOnboarding();
let web3 = null;

export const updateAccountBalance = (account) => {
  return async (dispatch) => {
    let balance = await web3.eth.getBalance(account);
    dispatch(
      accountActions.updateAccountBalance({
        account: account,
        balance: balance,
      })
    );
  };
};

export const checkMetamaskInstalled = () => {
  return async (dispatch) => {
    if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
      onboarding.startOnboarding();
    }
    dispatch(
      accountActions.checkMetamaskInstalled({ isMetamaskInstalled: true })
    );
    // chainID
    let chainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    dispatch(accountActions.loadChainId({ chainId }));

    // load web3
    web3 = new Web3(window.ethereum);
    dispatch(accountActions.loadWeb3({ web3Loaded: true }));

    window.ethereum.on("chainChanged", (chainId) => {
      console.log("CHAIN CHAINGED!")
      dispatch(accountActions.loadChainId({ chainId }));
    });

    window.ethereum.on("disconnect", (error) => {
      console.log(JSON.stringify(error));
      dispatch(
        accountActions.connect({
          isConnected: false,
          providerRpcError: error.code,
        })
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

    dispatch(
      accountActions.connect({ isConnected: true, providerRpcError: null })
    );
  };
};

export const afterAccountsLoading = (accounts) => {
  return async (dispatch) => {
    if (accounts.length > 0) {
      dispatch(
        accountActions.afterAccountsLoading({ accountButtonEnabled: false })
      );
      // account balance
      for (let i = 0; i < accounts.length; i++) {
        let balance = await web3.eth.getBalance(accounts[i]);
        dispatch(
          accountActions.updateAccountBalance({
            account: accounts[i],
            balance: balance,
          })
        );
        dispatch(updateRoles(accounts[i]));
      }
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
