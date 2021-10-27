import { getInsuranceMeta } from "./contracts";
import { uiActions } from "../state/ui";
import { insuranceActions } from "../state/insurance";
import { accountActions } from "../state/account";
import { getWeb3 } from "./metamask";

export const getInsuranceEscrow = (account) => {
  return async (dispatch) => {
    try {
      const insuranceCoreMeta = getInsuranceMeta();
      const { depositsOf } = insuranceCoreMeta.methods;
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
        const insuranceCoreMeta = getInsuranceMeta();
        const web3 = getWeb3();
        const { minimumAmount } = insuranceCoreMeta.methods;
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
          .on("data", (event) => {
            console.log(event); // same results as the optional callback above
            //TODO
          })
          .on("error", (error, receipt) => {
            // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            //TODO
            console.error("Emit error InsuranceRequested event");
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
      // TODO
    }
  };
};

const getPremiumConstants = async (dispatch) => {
  const insuranceCoreMeta = getInsuranceMeta();
  const { PERMIUM_PER_HA, HALF_PERMIUM_PER_HA } = insuranceCoreMeta.methods;
  const premiumPerHA = await PERMIUM_PER_HA().call();
  const halfPremiumPerHA = await HALF_PERMIUM_PER_HA().call();
  dispatch(
    insuranceActions.updateConstants({
      premiumPerHA,
      halfPremiumPerHA,
    })
  );
};
