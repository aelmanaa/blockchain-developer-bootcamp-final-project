import { getInsuranceMeta } from "./contracts";
import { uiActions } from "../state/ui";
import { insuranceActions } from "../state/insurance";
import { accountActions } from "../state/account";
import { getWeb3 } from "./metamask";
import {
  CONTRACT_VALUES,
  REGIONS_HASHES,
  SEVERITY_VALUES,
  FARMS_HASHES,
} from "../../utils/constant";

export const getInsuranceEscrow = (account) => {
  return async (dispatch) => {
    try {
      const insuranceMeta = getInsuranceMeta();
      const { depositsOf } = insuranceMeta.methods;
      const balance = await depositsOf(account).call({ from: account });
      dispatch(
        accountActions.updateInsuranceEscrow({
          account,
          balance,
        })
      );
    } catch (error) {
      console.error(error);
    }
  };
};

export const liquidity = (
  insuranceLoaded,
  insuranceContractAddress,
  prevMinimum,
  prevBalance
) => {
  return async (dispatch) => {
    if (insuranceLoaded) {
      try {
        const insuranceMeta = getInsuranceMeta();
        const web3 = getWeb3();
        const { minimumAmount } = insuranceMeta.methods;
        const minimumLiquidity = await minimumAmount().call();
        const contractBalance = await web3.eth.getBalance(
          insuranceContractAddress
        );
        if (
          prevMinimum !== minimumLiquidity ||
          contractBalance !== prevBalance
        ) {
          dispatch(
            insuranceActions.updateLiquidity({
              minimumLiquidity,
              contractBalance,
            })
          );
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      dispatch(
        insuranceActions.updateLiquidity({
          minimumLiquidity: 0,
          contractBalance: 0,
        })
      );
    }
  };
};

export const afterInsuranceLoading = (insuranceLoaded) => {
  return async (dispatch) => {
    if (insuranceLoaded) {
      try {
        await getPremiumConstants(dispatch);
        const insuranceMeta = getInsuranceMeta();

        // treat events
        insuranceMeta.events
          .InsuranceRequested({
            fromBlock: "latest",
          })
          .on("connected", (subscriptionId) => {
            console.log(
              `Subscribed to InsuranceRequested event. subscriptionId: ${subscriptionId}`
            );
          })
          .on("data", async (event) => {
            console.log(event); // same results as the optional callback above
            const key = event.returnValues.key;
            const contract = await getContractData(key);

            dispatch(insuranceActions.addContract({ contract }));
          })
          .on("error", (error, receipt) => {
            // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            //TODO
            console.error("Emit error InsuranceRequested event");
            console.error(error, receipt);
          });

        insuranceMeta.events
          .InsuranceValidated({
            fromBlock: "latest",
          })
          .on("connected", (subscriptionId) => {
            console.log(
              `Subscribed to InsuranceValidated event. subscriptionId: ${subscriptionId}`
            );
          })
          .on("data", async (event) => {
            console.log(event); // same results as the optional callback above
            const key = event.returnValues.key;
            const contract = await getContractData(key);

            dispatch(insuranceActions.updateContract({ contract }));
          })
          .on("error", (error, receipt) => {
            // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            //TODO
            console.error("Emit error InsuranceValidated event");
            console.error(error, receipt);
          });

        insuranceMeta.events
          .InsuranceActivated({
            fromBlock: "latest",
          })
          .on("connected", (subscriptionId) => {
            console.log(
              `Subscribed to InsuranceActivated event. subscriptionId: ${subscriptionId}`
            );
          })
          .on("data", async (event) => {
            console.log(event); // same results as the optional callback above
            const key = event.returnValues.key;
            const contract = await getContractData(key);

            dispatch(insuranceActions.updateContract({ contract }));
          })
          .on("error", (error, receipt) => {
            // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            //TODO
            console.error("Emit error InsuranceActivated event");
            console.error(error, receipt);
          });

        insuranceMeta.events
          .InsuranceClosed({
            fromBlock: "latest",
          })
          .on("connected", (subscriptionId) => {
            console.log(
              `Subscribed to InsuranceClosed event. subscriptionId: ${subscriptionId}`
            );
          })
          .on("data", async (event) => {
            console.log(event); // same results as the optional callback above
            const key = event.returnValues.key;
            const contract = await getContractData(key);

            dispatch(insuranceActions.updateContract({ contract }));
          })
          .on("error", (error, receipt) => {
            // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            //TODO
            console.error("Emit error InsuranceClosed event");
            console.error(error, receipt);
          });

        insuranceMeta.events
          .InsuranceCompensated({
            fromBlock: "latest",
          })
          .on("connected", (subscriptionId) => {
            console.log(
              `Subscribed to InsuranceCompensated event. subscriptionId: ${subscriptionId}`
            );
          })
          .on("data", async (event) => {
            console.log(event); // same results as the optional callback above
            const key = event.returnValues.key;
            const contract = await getContractData(key);

            dispatch(insuranceActions.updateContract({ contract }));
          })
          .on("error", (error, receipt) => {
            // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            //TODO
            console.error("Emit error InsuranceCompensated event");
            console.error(error, receipt);
          });
      } catch (error) {
        console.error(error);
        dispatch(
          uiActions.showNotification({
            status: "error",
            title: "Error!",
            message: "Error during unitial loading of Insurance contracts data",
          })
        );
      }
    } else {
      dispatch(insuranceActions.loadContracts({ contracts: [] }));
    }
  };
};

export const loadInsuranceContracts = (seasons) => {
  return async (dispatch) => {
    if (seasons && seasons.length > 0) {
      try {
        await initialLoadContracts(dispatch, seasons);
      } catch (error) {
        console.error(error);
        dispatch(
          uiActions.showNotification({
            status: "error",
            title: "Error!",
            message: "Error during unitial loading of Insurance contracts data",
          })
        );
      }
    } else {
      dispatch(insuranceActions.loadContracts({ contracts: [] }));
    }
  };
};

const getPremiumConstants = async (dispatch) => {
  const insuranceMeta = getInsuranceMeta();
  const { PERMIUM_PER_HA, HALF_PERMIUM_PER_HA } = insuranceMeta.methods;
  const premiumPerHA = await PERMIUM_PER_HA().call();
  const halfPremiumPerHA = await HALF_PERMIUM_PER_HA().call();
  dispatch(
    insuranceActions.updateConstants({
      premiumPerHA,
      halfPremiumPerHA,
    })
  );
};

const initialLoadContracts = async (dispatch, seasons) => {
  const insuranceMeta = getInsuranceMeta();
  const regions = Object.keys(REGIONS_HASHES);
  const {
    getNumberOpenContracts,
    getOpenContractsAt,
    getNumberClosedContracts,
    getClosedContractsAt,
  } = insuranceMeta.methods;
  const contracts = [];
  let numberOpenContracts,
    numberClosedContracts,
    contractKey,
    contract,
    seasonId;
  for (let i = 0; i < seasons.length; i++) {
    seasonId = seasons[i].id;
    for (let j = 0; j < regions.length; j++) {
      numberOpenContracts =
        parseInt(
          await getNumberOpenContracts(seasonId.toString(), regions[j]).call()
        ) || 0;
      numberClosedContracts =
        parseInt(
          await getNumberClosedContracts(seasonId.toString(), regions[j]).call()
        ) || 0;
      // fill in open contracts
      for (let k = 0; k < numberOpenContracts; k++) {
        contractKey = await getOpenContractsAt(
          seasonId.toString(),
          regions[j],
          k.toString()
        ).call();
        contract = await getContractData(contractKey);
        contracts.push(contract);
      }
      // fill in closed contracts
      for (let k = 0; k < numberClosedContracts; k++) {
        contractKey = await getClosedContractsAt(
          seasonId.toString(),
          regions[j],
          k.toString()
        ).call();
        contract = await getContractData(contractKey);
        contracts.push(contract);
      }
    }
  }

  dispatch(insuranceActions.loadContracts({ contracts }));
};

const getContractData = async (contractKey) => {
  const insuranceMeta = getInsuranceMeta();
  const { getContract1, getContract2 } = insuranceMeta.methods;
  const res1 = await getContract1(contractKey).call();
  const res2 = await getContract2(contractKey).call();
  return {
    seasonId: Number(res2.season),
    region: REGIONS_HASHES[res2.region],
    severity: SEVERITY_VALUES[res2.severity],
    farm: FARMS_HASHES[res1.farmID],
    key: res1.key,
    state: CONTRACT_VALUES[res1.state],
    farmer: res1.farmer,
    government: res1.government,
    insurer: res1.insurer,
    size: Number(res1.size),
    totalStaked: res2.totalStaked,
    compensation: res2.compensation,
    changeGovernment: res2.changeGovernment,
  };
};
