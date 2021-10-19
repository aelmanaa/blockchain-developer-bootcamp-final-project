import { Fragment } from "react";
import { useSelector } from "react-redux";

const AccountDisplayer = (props) => {
  const accounts = useSelector((state) => state.account.accounts);
  const chainId = useSelector((state) => state.account.chainId);

  return (
    <Fragment>
      <p>Connected account: {accounts[0]}</p>
      <p>ChainID: {chainId}</p>
    </Fragment>
  );
};

export default AccountDisplayer;
