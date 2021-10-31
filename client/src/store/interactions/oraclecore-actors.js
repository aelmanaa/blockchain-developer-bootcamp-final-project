import { getOracleCoreMeta } from "./contracts";
import { getOracleEscrow } from "./oraclecore";
import { REGIONS, SEVERITY } from "../../utils/constant";
import { transact } from "./helper";

export const openSeason = (newSeason, account) => {
  return async (dispatch) => {
    const { openSeason } = getOracleCoreMeta().methods;
    await transact(
      dispatch,
      openSeason,
      [newSeason.toString()],
      { from: account },
      "OPEN SEASON"
    );
    dispatch(getOracleEscrow(account));
  };
};

export const closeSeason = (season, account) => {
  return async (dispatch) => {
    const { closeSeason } = getOracleCoreMeta().methods;
    await transact(
      dispatch,
      closeSeason,
      [season.toString()],
      { from: account },
      "CLOSE SEASON"
    );
    dispatch(getOracleEscrow(account));
  };
};

export const submitSeverity = (season, region, severity, account) => {
  return async (dispatch) => {
    const { submit } = getOracleCoreMeta().methods;
    await transact(
      dispatch,
      submit,
      [season.toString(), REGIONS[region].hash, SEVERITY[severity].value],
      { from: account },
      "SUBMIT SEVERITY"
    );
    dispatch(getOracleEscrow(account));
  };
};

export const aggregateSeverity = (season, region, account) => {
  return async (dispatch) => {
    const { aggregate } = getOracleCoreMeta().methods;
    await transact(
      dispatch,
      aggregate,
      [season.toString(), REGIONS[region].hash],
      { from: account },
      "AGGREGATE SEVERITY"
    );
    dispatch(getOracleEscrow(account));
  };
};
