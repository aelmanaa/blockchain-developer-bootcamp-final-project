import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  checkMetamaskInstalled,
  loadAccounts,
  afterAccountsLoading,
} from "../../store/metamask";

//import { uiActions } from '../../store/ui-slice';
//import classes from './CartButton.module.css';

const Account = (props) => {
  const dispatch = useDispatch();
  const isMetamaskInstalled = useSelector(
    (state) => state.account.isMetamaskInstalled
  );
  const accounts = useSelector((state) => state.account.accounts);
  const accountButtonText = useSelector(
    (state) => state.account.accountButtonText
  );
  const accountButtonEnabled = useSelector(
    (state) => state.account.accountButtonEnabled
  );

  useEffect(() => {
    dispatch(checkMetamaskInstalled());
  }, [dispatch]);

  /*
  useEffect(() => {
    dispatch(loadAccounts(isMetamaskInstalled));
  }, [dispatch, isMetamaskInstalled]);
*/
  useEffect(() => {
    dispatch(afterAccountsLoading(accounts));
  }, [dispatch, accounts]);

  const connectHandler = () => {
    dispatch(loadAccounts(isMetamaskInstalled));
  };

  return <button disabled={!accountButtonEnabled} onClick={connectHandler}>{accountButtonText}</button>;
};

export default Account;
