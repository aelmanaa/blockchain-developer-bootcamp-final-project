import { getOracleCoreMeta } from "./contracts";
import { uiActions } from "../state/ui";
import { getOracleEscrow } from "./oraclecore";
import { REGIONS, SEVERITY } from "../../utils/constant";

export const openSeason = (newSeason, account) => {
  return async (dispatch) => {
    dispatch(
      uiActions.showNotification({
        status: "pending",
        title: "Sending...",
        message: "Starting openSeason transaction!",
      })
    );
    try {
      const oracleCoreMeta = getOracleCoreMeta();
      const { openSeason } = oracleCoreMeta.methods;
      let res = await openSeason(newSeason.toString()).send({ from: account });
      console.log(res);
      dispatch(
        uiActions.showNotification({
          status: "success",
          title: "Success!",
          message: "openSeason successfull!",
        })
      );

      dispatch(getOracleEscrow(account));
    } catch (error) {
      console.error(error);
      dispatch(
        uiActions.showNotification({
          status: "error",
          title: "Error!",
          message: "openSeason failed!",
        })
      );
    }
  };
};

export const closeSeason = (season, account) => {
  return async (dispatch) => {
    dispatch(
      uiActions.showNotification({
        status: "pending",
        title: "Sending...",
        message: "Starting closeSeason transaction!",
      })
    );
    try {
      const oracleCoreMeta = getOracleCoreMeta();
      const { closeSeason } = oracleCoreMeta.methods;
      let res = await closeSeason(season.toString()).send({ from: account });
      console.log(res);
      dispatch(
        uiActions.showNotification({
          status: "success",
          title: "Success!",
          message: "closeSeason successfull!",
        })
      );
      dispatch(getOracleEscrow(account));
    } catch (error) {
      console.error(error);
      dispatch(
        uiActions.showNotification({
          status: "error",
          title: "Error!",
          message: "closeSeason failed!",
        })
      );
    }
  };
};

export const submitSeverity = (season, region, severity, account) => {
  return async (dispatch) => {
    dispatch(
      uiActions.showNotification({
        status: "pending",
        title: "Sending...",
        message: "Starting openSeason transaction!",
      })
    );
    try {
      const oracleCoreMeta = getOracleCoreMeta();
      const { submit } = oracleCoreMeta.methods;
      let res = await submit(
        season.toString(),
        REGIONS[region].hash,
        SEVERITY[severity].value
      ).send({ from: account });
      console.log(res);
      dispatch(
        uiActions.showNotification({
          status: "success",
          title: "Success!",
          message: "Submission successfull!",
        })
      );

      dispatch(getOracleEscrow(account));
    } catch (error) {
      console.error(error);
      dispatch(
        uiActions.showNotification({
          status: "error",
          title: "Error!",
          message: "Submision failed!",
        })
      );
    }
  };
};

export const aggregateSeverity = (season, region, account) => {
  return async (dispatch) => {
    dispatch(
      uiActions.showNotification({
        status: "pending",
        title: "Sending...",
        message: "Aggregate severity!",
      })
    );
    try {
      const oracleCoreMeta = getOracleCoreMeta();
      const { aggregate } = oracleCoreMeta.methods;
      let res = await aggregate(season.toString(), REGIONS[region].hash).send({
        from: account,
      });
      console.log(res);
      dispatch(
        uiActions.showNotification({
          status: "success",
          title: "Success!",
          message: "Aggregation successfull!",
        })
      );

      dispatch(getOracleEscrow(account));
    } catch (error) {
      console.error(error);
      dispatch(
        uiActions.showNotification({
          status: "error",
          title: "Error!",
          message: "Aggregation of severities failed!",
        })
      );
    }
  };
};
