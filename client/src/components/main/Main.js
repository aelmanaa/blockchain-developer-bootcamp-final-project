import { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadContracts } from "../../store/artifact";
import { afterOracleCoreLoading } from "../../store/artifact";
import Season from "../season/Season";
import Oracle from "../oracle/Oracle";
import Severity from "../severity/Severity";

const Main = (props) => {
  const dispatch = useDispatch();
  const web3Loaded = useSelector((state) => state.account.web3Loaded);
  const chainId = useSelector((state) => state.account.chainId);
  const oracleCoreLoaded = useSelector(
    (state) => state.contract.oracleCoreLoaded
  );

  useEffect(() => {
    dispatch(afterOracleCoreLoading(oracleCoreLoaded));
  }, [dispatch, oracleCoreLoaded]);

  useEffect(() => {
    dispatch(loadContracts(web3Loaded, chainId));
  }, [dispatch, web3Loaded, chainId]);

  return (
    <Fragment>
      <Season />
      <Oracle />
      <Severity />
    </Fragment>
  );
};

export default Main;
