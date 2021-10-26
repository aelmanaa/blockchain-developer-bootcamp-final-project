import { contractActions } from "./contract";
import { oracleCoreActions } from "./oraclecore";
import oracleCore from "../contracts/OracleCore.json";
import insurance from "../contracts/Insurance.json";
import { getWeb3 } from "./metamask";
import { uiActions } from "./ui";
import { accountActions } from "./account";
import {
  REGIONS,
  SEASON_STATE,
  SEVERITY,
  REGIONS_HASHES,
  SEVERITY_VALUES,
} from "../utils/constant";

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

export const afterOracleCoreLoading = (oracleCoreLoaded) => {
  return async (dispatch) => {
    if (oracleCoreLoaded) {
      try {
        const seasons = await initialLoadSeasons(dispatch);
        const openSeasons = seasons.filter((season) => {
          return season.state === SEASON_STATE[1];
        });
        if (openSeasons.length > 0) {
          await initialLoadSubmissions(dispatch, openSeasons);
        }
      } catch (error) {
        console.error(error);
        dispatch(
          uiActions.showNotification({
            status: "error",
            title: "Error!",
            message: "Error during unitial loading of OracleCore data",
          })
        );
      }
    } else {
      dispatch(oracleCoreActions.loadSeasons({ seasons: [] }));
      dispatch(oracleCoreActions.loadSubmissions({ submissions: [] }));
    }
  };
};

export const openSeason = (newSeason, account) => {
  return async (dispatch) => {
    dispatch(
      uiActions.showNotification({
        status: "pending",
        title: "Sending...",
        message: "Starting openSeason transaction!",
      })
    );
    const { openSeason } = oracleCoreMeta.methods;
    try {
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
    const { closeSeason } = oracleCoreMeta.methods;
    try {
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

export const getOracleEscrow = (account) => {
  return async (dispatch) => {
    const { depositsOf } = oracleCoreMeta.methods;
    try {
      const balance = await depositsOf(account).call({ from: account });
      dispatch(
        accountActions.updateOracleEscrow({
          account,
          balance,
        })
      );
    } catch (error) {
      console.error(error);
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
    const { submit } = oracleCoreMeta.methods;
    try {
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

const initialLoadSeasons = async (dispatch) => {
  const { getSeasonsNumber, getSeasonAt, getSeasonState } =
    oracleCoreMeta.methods;
  const seasons = [];
  const seasonsNumber = parseInt(await getSeasonsNumber().call()) || 0;

  dispatch(oracleCoreActions.loadSeasonsNumber({ seasonsNumber }));
  if (seasonsNumber > 0) {
    for (let i = 0; i < seasonsNumber; i++) {
      const seasonId = await getSeasonAt(i.toString()).call();
      const seasonState = await getSeasonState(seasonId).call();
      seasons.push({
        id: Number(seasonId),
        state: SEASON_STATE[seasonState],
      });
    }
    dispatch(oracleCoreActions.loadSeasons({ seasons }));
  }
  // treat events
  oracleCoreMeta.events
    .SeasonOpen({
      fromBlock: "latest",
    })
    .on("connected", (subscriptionId) => {
      console.log(
        `Subscribed to SeasonOpen event. subscriptionId: ${subscriptionId}`
      );
    })
    .on("data", (event) => {
      console.log(event); // same results as the optional callback above
      dispatch(
        oracleCoreActions.addSeason({
          id: Number(event.returnValues.season),
        })
      );
    })
    .on("error", (error, receipt) => {
      // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      //TODO
      console.error("Emit error season open event");
      console.error(error, receipt);
    });

  oracleCoreMeta.events
    .SeasonClosed({
      fromBlock: "latest",
    })
    .on("connected", (subscriptionId) => {
      console.log(
        `Subscribed to SeasonClosed event. subscriptionId: ${subscriptionId}`
      );
    })
    .on("data", (event) => {
      console.log(event); // same results as the optional callback above
      dispatch(
        oracleCoreActions.closeSeason({
          id: Number(event.returnValues.season),
        })
      );
    })
    .on("error", (error, receipt) => {
      // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      //TODO
      console.error("Emit error season closed event");
      console.error(error, receipt);
    });

  return seasons;
};

const initialLoadSubmissions = async (dispatch, openSeasons) => {
  const { getSubmissionTotal, getSubmitterAt, getSubmission } =
    oracleCoreMeta.methods;

  const submissions = [];
  let seasonId, submissionsCount, regionHash, submitter, submission;
  const regionsHashes = Object.keys(REGIONS).map(
    (region) => REGIONS[region].hash
  );
  for (let i = 0; i < openSeasons.length; i++) {
    seasonId = openSeasons[i].id;
    for (let j = 0; j < regionsHashes.length; j++) {
      regionHash = regionsHashes[j];
      submissionsCount =
        parseInt(
          await getSubmissionTotal(seasonId.toString(), regionHash).call()
        ) || 0;
      for (let k = 0; k < submissionsCount; k++) {
        submitter = await getSubmitterAt(
          seasonId.toString(),
          regionHash,
          k.toString()
        ).call();

        submission = (
          await getSubmission(seasonId.toString(), regionHash, submitter).call()
        ).toString();

        submissions.push({
          seasonId: seasonId,
          region: REGIONS_HASHES[regionHash],
          severity: SEVERITY_VALUES[submission],
          submitter: submitter,
        });
      }
    }
  }

  if (submissions.length > 0) {
    dispatch(oracleCoreActions.loadSubmissions({ submissions }));
  }

  oracleCoreMeta.events
    .SeveritySubmitted({
      fromBlock: "latest",
    })
    .on("connected", (subscriptionId) => {
      console.log(
        `Subscribed to SeveritySubmitted event. subscriptionId: ${subscriptionId}`
      );
    })
    .on("data", (event) => {
      console.log(event); // same results as the optional callback above
      dispatch(
        oracleCoreActions.addSubmission({
          seasonId: Number(event.returnValues.season),
          region: REGIONS_HASHES[event.returnValues.region],
          severity: SEVERITY_VALUES[event.returnValues.severity],
          submitter: event.returnValues.oracle,
        })
      );
    })
    .on("error", (error, receipt) => {
      // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      //TODO
      console.error("Emit error submit event");
      console.error(error, receipt);
    });
};
