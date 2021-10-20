import { Fragment } from "react";
import Season from "../Season/Season";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadContracts } from "../../store/artifact";

const Main = (props) => {
  const dispatch = useDispatch();
  const web3Loaded = useSelector(
    (state) => state.account.web3Loaded
  );
  const chainId = useSelector(
    (state) => state.account.chainId
  );

  useEffect(() => {
    dispatch(loadContracts(web3Loaded, chainId));
  }, [dispatch, web3Loaded, chainId]);

  return (
    <Fragment>
      <Season />
    </Fragment>
  );
};

export default Main;
