import { getInsuranceMeta } from "./contracts";
import { uiActions } from "../state/ui";
import { getInsuranceEscrow } from "./insurance";
import { FARMS, REGIONS } from "../../utils/constant";
import { insuranceActions } from "../state/insurance";
import { getWeb3 } from "./metamask";
import { multiplyBigNumbers } from "../../utils/operations";

export const register = (
  season,
  region,
  farm,
  size,
  halfPremiumPerHA,
  account
) => {
  return async (dispatch) => {
    dispatch(
      uiActions.showNotification({
        status: "pending",
        title: "Sending...",
        message: "Starting register transaction!",
      })
    );
    try {
      const insuranceMeta = getInsuranceMeta();
      const web3 = getWeb3();
      const fee = multiplyBigNumbers(halfPremiumPerHA, size);
      const { register } = insuranceMeta.methods;

      let res = await register(
        season.toString(),
        REGIONS[region].hash,
        FARMS[farm].hash,
        size.toString()
      ).send({ from: account, value: fee });
      console.log(res);
      dispatch(
        uiActions.showNotification({
          status: "success",
          title: "Success!",
          message: "register contract successfull!",
        })
      );
    } catch (error) {
      console.error(error);
      dispatch(
        uiActions.showNotification({
          status: "error",
          title: "Error!",
          message: "register contract failed!",
        })
      );
    }
  };
};
