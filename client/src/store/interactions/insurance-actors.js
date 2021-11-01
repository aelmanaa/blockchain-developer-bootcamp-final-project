import { getInsuranceMeta } from "./contracts";
import { FARMS, REGIONS } from "../../utils/constant";
import { multiplyBigNumbers } from "../../utils/operations";
import { transact } from "./helper";
import { getInsuranceEscrow } from "./insurance";
import { insuranceActions } from "../state/insurance";
import { updateAccountBalance } from "./metamask";

export const withdrawInsurer = (amount, account) => {
  return async (dispatch) => {
    const { withdrawInsurer } = getInsuranceMeta().methods;
    await transact(
      dispatch,
      withdrawInsurer,
      [amount.toString()],
      { from: account },
      "WITHDRAW INSURER FROM INSURANCE CONTRACT"
    );
    dispatch(updateAccountBalance(account));
  };
};

export const withdraw = (account) => {
  return async (dispatch) => {
    const { withdraw } = getInsuranceMeta().methods;
    await transact(
      dispatch,
      withdraw,
      [],
      { from: account },
      "WITHDRAW FROM INSURANCE ESCROW"
    );
    dispatch(getInsuranceEscrow(account));
    dispatch(updateAccountBalance(account));
  };
};

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
    dispatch(updateAccountBalance(account));
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
    dispatch(updateAccountBalance(account));
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
    dispatch(updateAccountBalance(account));
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
    dispatch(updateAccountBalance(account));
  };
};
