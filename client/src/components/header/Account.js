import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect, afterAccountsLoading } from "../../store/interactions/metamask";
import { getOracleEscrow } from "../../store/interactions/oraclecore";
import { getInsuranceEscrow } from "../../store/interactions/insurance";

//import { uiActions } from '../../store/ui-slice';
//import classes from './CartButton.module.css';

const Account = () => {
  const dispatch = useDispatch();
  const isMetamaskInstalled = useSelector(
    (state) => state.account.isMetamaskInstalled
  );
  const oracleCoreLoaded = useSelector(
    (state) => state.contract.oracleCoreLoaded
  );
  const insuranceLoaded = useSelector(
    (state) => state.contract.insuranceLoaded
  );

  const accounts = useSelector((state) => state.account.accounts);

  const accountButtonText = useSelector(
    (state) => state.account.accountButtonText
  );
  const accountButtonEnabled = useSelector(
    (state) => state.account.accountButtonEnabled
  );

  useEffect(() => {
    dispatch(afterAccountsLoading(accounts));
  }, [dispatch, accounts]);

  useEffect(() => {
    if (accounts[0]) {
      dispatch(getOracleEscrow(accounts[0]));
    }
  }, [dispatch, accounts, oracleCoreLoaded]);

  useEffect(() => {
    if (accounts[0]) {
      dispatch(getInsuranceEscrow(accounts[0]));
    }
  }, [dispatch, accounts, insuranceLoaded]);



  const connectHandler = () => {
    dispatch(connect(isMetamaskInstalled));
  };

  return (
    <button disabled={!accountButtonEnabled} onClick={connectHandler}>
      {accountButtonText}
    </button>
  );
};

export default Account;
