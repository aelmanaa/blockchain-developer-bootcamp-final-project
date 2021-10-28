import { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadContracts } from "../../store/interactions/contracts";
import { afterOracleCoreLoading } from "../../store/interactions/oraclecore";
import {
  afterInsuranceLoading,
  loadInsuranceContracts,
} from "../../store/interactions/insurance";
import Season from "../season/Season";
import Oracle from "../oracle/Oracle";
import Severity from "../severity/Severity";
import Insurance from "../insurance/Insurance";

const Main = (props) => {
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
    <Fragment>
      <Season />
      <Insurance />
      <Oracle />
      <Severity />
    </Fragment>
  );
};

export default Main;
