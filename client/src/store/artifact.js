import { contractActions } from "./contract";
import { oracleCoreActions } from "./oraclecore";
import oracleCore from "../contracts/OracleCore.json";
import insurance from "../contracts/Insurance.json";
import { getWeb3 } from "./metamask";
import { uiActions } from "./ui";

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

export const loadSeasonList = (oracleCoreLoaded) => {
  return async (dispatch) => {
    if (oracleCoreLoaded) {
      const { getSeasonsNumber, getSeasonAt, getSeasonState } =
        oracleCoreMeta.methods;
      const seasonsNumber = parseInt(await getSeasonsNumber().call());
      dispatch(oracleCoreActions.loadSeasonsNumber({ seasonsNumber }));
      if (seasonsNumber > 0) {
        const seasons = [];
        for (let i = 0; i < seasonsNumber; i++) {
          const seasonId = getSeasonAt(i.toString()).call();
          const seasonState = getSeasonState(seasonId).call();
          seasons.push({
            id: seasonId,
            state: seasonState,
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
              id: event.returnValues.season,
            })
          );
        })
        .on("error", (error, receipt) => {
          // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          //TODO
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
              id: event.returnValues.season,
            })
          );
        })
        .on("error", (error, receipt) => {
          // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          //TODO
          console.error(error, receipt);
        });
    } else {
      // TODO
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
