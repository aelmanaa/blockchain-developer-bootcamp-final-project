import { getWeb3 } from "./metamask";
import { getGateKeeperMeta } from "./contracts";
import { accountActions } from "../state/account";

export const updateRoles = (account) => {
  return async (dispatch) => {
    try {
      const gateKeeperMeta = getGateKeeperMeta();
      const web3 = getWeb3();
      const { isAssigned } = gateKeeperMeta.methods;
      const isInsurer = await isAssigned(
        web3.utils.keccak256("INSURER_ROLE"),
        account
      ).call();
      const isFarmer = await isAssigned(
        web3.utils.keccak256("FARMER_ROLE"),
        account
      ).call();
      const isOracle = await isAssigned(
        web3.utils.keccak256("ORACLE_ROLE"),
        account
      ).call();
      const isKeeper = await isAssigned(
        web3.utils.keccak256("KEEPER_ROLE"),
        account
      ).call();
      const isGovernment = await isAssigned(
        web3.utils.keccak256("GOVERNMENT_ROLE"),
        account
      ).call();
      dispatch(
        accountActions.updateAccountRoles({
          account,
          roles: {
            isInsurer,
            isKeeper,
            isOracle,
            isGovernment,
            isFarmer,
          },
        })
      );
    } catch (error) {
      console.error(error);
      dispatch(
        accountActions.updateAccountRoles({
          account,
          roles: {
            isInsurer: false,
            isKeeper: false,
            isOracle: false,
            isGovernment: false,
            isFarmer: false,
          },
        })
      );
    }
  };
};
