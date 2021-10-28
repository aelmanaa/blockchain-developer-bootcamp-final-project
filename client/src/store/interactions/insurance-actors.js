import { getInsuranceMeta } from "./contracts";
import { uiActions } from "../state/ui";
import { FARMS, REGIONS } from "../../utils/constant";
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

export const validate = (
  season,
  region,
  farm,
  halfPremiumPerHA,
  size,
  account
) => {
  return async (dispatch) => {
    dispatch(
      uiActions.showNotification({
        status: "pending",
        title: "Sending...",
        message: "Starting validate transaction!",
      })
    );
    try {
      const insuranceMeta = getInsuranceMeta();
      const fee = multiplyBigNumbers(halfPremiumPerHA, size);
      const { validate } = insuranceMeta.methods;

      let res = await validate(
        season.toString(),
        REGIONS[region].hash,
        FARMS[farm].hash
      ).send({ from: account, value: fee });
      console.log(res);
      dispatch(
        uiActions.showNotification({
          status: "success",
          title: "Success!",
          message: "validate contract successfull!",
        })
      );
    } catch (error) {
      console.error(error);
      dispatch(
        uiActions.showNotification({
          status: "error",
          title: "Error!",
          message: "validate contract failed!",
        })
      );
    }
  };
};

export const activate = (season, region, farm, account) => {
  return async (dispatch) => {
    dispatch(
      uiActions.showNotification({
        status: "pending",
        title: "Sending...",
        message: "Starting activate transaction!",
      })
    );
    try {
      const insuranceMeta = getInsuranceMeta();
      const { activate } = insuranceMeta.methods;

      let res = await activate(
        season.toString(),
        REGIONS[region].hash,
        FARMS[farm].hash
      ).send({ from: account });
      console.log(res);
      dispatch(
        uiActions.showNotification({
          status: "success",
          title: "Success!",
          message: "activate contract successfull!",
        })
      );
    } catch (error) {
      console.error(error);
      dispatch(
        uiActions.showNotification({
          status: "error",
          title: "Error!",
          message: "activate contract failed!",
        })
      );
    }
  };
};
