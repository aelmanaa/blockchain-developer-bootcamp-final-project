import { contractActions } from "../state/contract";
import oracleCore from "../../contracts/OracleCore.json";
import insurance from "../../contracts/Insurance.json";
import { getWeb3 } from "./metamask";

let oracleCoreMeta, insuranceMeta;

export const loadContracts = (web3Loaded, chainId) => {
  return async (dispatch) => {
    if (web3Loaded) {
      const web3 = getWeb3();
      const networkId = await web3.eth.net.getId();
      dispatch(contractActions.loadNetworkId({ networkId }));
      // load oracle core
      const oracleDeployedNetwork = oracleCore.networks[networkId];
      oracleCoreMeta = await new web3.eth.Contract(
        oracleCore.abi,
        oracleDeployedNetwork.address
      );
      dispatch(
        contractActions.loadOracleCore({
          oracleCoreLoaded: true,
          address: oracleDeployedNetwork.address,
        })
      );
      // load insurance contract
      const insuranceDeployedNetwork = insurance.networks[networkId];
      insuranceMeta = await new web3.eth.Contract(
        insurance.abi,
        insuranceDeployedNetwork.address
      );
      dispatch(
        contractActions.loadInsurance({
          insuranceLoaded: true,
          address: insuranceDeployedNetwork.address,
        })
      );
    } else {
      // TODO
    }
  };
};

export const getOracleCoreMeta = () => {
  return oracleCoreMeta;
};

export const getInsuranceMeta = () => {
  return insuranceMeta;
};
