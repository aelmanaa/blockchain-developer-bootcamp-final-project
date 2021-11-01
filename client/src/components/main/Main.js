import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadContracts } from "../../store/interactions/contracts";
import {
  loadInsuranceContracts,
} from "../../store/interactions/insurance";
import Oracle from "../oracle/Oracle";
import Insurance from "../insurance/Insurance";
import Keeper from "../keeper/Keeper";
import classes from "./Main.module.css";

const Main = () => {
  const dispatch = useDispatch();
  const web3Loaded = useSelector((state) => state.account.web3Loaded);
  const chainId = useSelector((state) => state.account.chainId);

  const seasons = useSelector((state) => state.oracleCore.seasons);

  useEffect(() => {
    dispatch(loadInsuranceContracts(seasons));
  }, [dispatch, seasons]);

  useEffect(() => {
    console.log("dispatch load contracts");
    dispatch(loadContracts(web3Loaded, chainId));  
  }, [dispatch, web3Loaded, chainId]);

  return (
    <div className={classes.main}>
      <Keeper />
      <Insurance />
      <Oracle />
    </div>
  );
};

export default Main;
