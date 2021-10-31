import { getInsuranceMeta } from "./contracts";
import { FARMS, REGIONS } from "../../utils/constant";
import { multiplyBigNumbers } from "../../utils/operations";
import { transact } from "./helper";
import { getInsuranceEscrow } from "./insurance";
import { insuranceActions } from "../state/insurance";

export const register = (
  season,
  region,
  farm,
  size,
  halfPremiumPerHA,
  account
) => {
  return async (dispatch) => {
    const { register } = getInsuranceMeta().methods;
    const fee = multiplyBigNumbers(halfPremiumPerHA, size);
    await transact(
      dispatch,
      register,
      [
        season.toString(),
        REGIONS[region].hash,
        FARMS[farm].hash,
        size.toString(),
      ],
      { from: account, value: fee },
      "REGISTER"
    );
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
    const { validate } = getInsuranceMeta().methods;
    const fee = multiplyBigNumbers(halfPremiumPerHA, size);
    await transact(
      dispatch,
      validate,
      [season.toString(), REGIONS[region].hash, FARMS[farm].hash],
      { from: account, value: fee },
      "VALIDATE"
    );
  };
};

export const activate = (season, region, farm, account) => {
  return async (dispatch) => {
    const { activate } = getInsuranceMeta().methods;
    await transact(
      dispatch,
      activate,
      [season.toString(), REGIONS[region].hash, FARMS[farm].hash],
      { from: account },
      "ACTIVATE"
    );
  };
};

export const pocessContracts = (
  season,
  region,
  numberOpenContracts,
  account
) => {
  return async (dispatch) => {
    const { process } = getInsuranceMeta().methods;
    for (let i = 0; i < numberOpenContracts; i++) {
      const res = await transact(
        dispatch,
        process,
        [season.toString(), REGIONS[region].hash],
        { from: account },
        "PROCESS CONTRACTS"
      );
      if (res) {
        dispatch(
          insuranceActions.decrementPending({
            seasonId: season,
            region,
          })
        );
      }
    }
    dispatch(getInsuranceEscrow(account));
  };
};
