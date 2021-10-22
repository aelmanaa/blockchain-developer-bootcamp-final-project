import { Fragment } from "react";
import { useSelector } from "react-redux";
import { toEther, toTwoDec } from "../../utils/format";

const AccountDisplayer = (props) => {
  const accounts = useSelector((state) => state.account.accounts);
  const connectedAccount = accounts[0];
  const accountsBalances = useSelector(
    (state) => state.account.accountsBalances
  );
  const accountsOracleEscrow = useSelector(
    (state) => state.account.accountsOracleEscrow
  );

  const chainId = useSelector((state) => state.account.chainId);

  let infoAccount = connectedAccount && (
    <Fragment>
      <p>Connected account: {connectedAccount}</p>
      {accountsBalances[connectedAccount] && (
        <p>
          Balance of account:{" "}
          {toTwoDec(toEther(accountsBalances[connectedAccount]))} ETH
        </p>
      )}
      {accountsOracleEscrow[connectedAccount] && (
        <p>
          Escrow in oracle:{" "}
          {toTwoDec(toEther(accountsOracleEscrow[connectedAccount]))} ETH
        </p>
      )}
    </Fragment>
  );

  return (
    <Fragment>
      {infoAccount}
      <p>ChainID: {chainId}</p>
    </Fragment>
  );
};

export default AccountDisplayer;
