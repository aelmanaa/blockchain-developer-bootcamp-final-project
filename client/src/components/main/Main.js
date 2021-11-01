import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadContracts } from "../../store/interactions/contracts";
import { afterOracleCoreLoading } from "../../store/interactions/oraclecore";
import {
  afterInsuranceLoading,
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
  const oracleCoreLoaded = useSelector(
    (state) => state.contract.oracleCoreLoaded
  );
  const insuranceLoaded = useSelector(
    (state) => state.contract.insuranceLoaded
  );
  const seasons = useSelector((state) => state.oracleCore.seasons);

  useEffect(() => {
    dispatch(afterOracleCoreLoading(oracleCoreLoaded));
  }, [dispatch, oracleCoreLoaded]);

  useEffect(() => {
    dispatch(afterInsuranceLoading(insuranceLoaded));
  }, [dispatch, insuranceLoaded]);

  useEffect(() => {
    dispatch(loadInsuranceContracts(seasons));
  }, [dispatch, seasons]);

  useEffect(() => {
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
