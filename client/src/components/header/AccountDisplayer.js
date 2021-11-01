import { Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toEther, toTwoDec } from "../../utils/format";
import { withdraw as oracleWithdraw}  from "../../store/interactions/oraclecore-actors";
import { withdraw as insuranceWithdraw} from "../../store/interactions/insurance-actors";

const AccountDisplayer = () => {
  const dispatch = useDispatch();
  const accounts = useSelector((state) => state.account.accounts);
  const connectedAccount = accounts[0];
  const accountsBalances = useSelector(
    (state) => state.account.accountsBalances
  );
  const accountsOracleEscrow = useSelector(
    (state) => state.account.accountsOracleEscrow
  );

  const accountsInsuranceEscrow = useSelector(
    (state) => state.account.accountsInsuranceEscrow
  );

  const oracleEscrowClickHandler = (event) => {
    event.preventDefault();
    dispatch(oracleWithdraw(connectedAccount));
  };

  const insuranceEscrowClickHandler = (event) => {
    event.preventDefault();
    dispatch(insuranceWithdraw(connectedAccount));
  };

  const oracleEscrowBalance = accountsOracleEscrow[connectedAccount];
  const oracleEscrowElement = oracleEscrowBalance && (
    <p>
      Escrow in oracle: {toTwoDec(toEther(oracleEscrowBalance))} ETH
      {oracleEscrowBalance > 0 ? (
        <button onClick={oracleEscrowClickHandler}>Withdraw</button>
      ) : (
        ""
      )}
    </p>
  );

  const insuranceEscrowBalance = accountsInsuranceEscrow[connectedAccount];
  const insuranceEscrowElement = insuranceEscrowBalance && (
    <p>
      Escrow in insurance: {toTwoDec(toEther(insuranceEscrowBalance))} ETH
      {insuranceEscrowBalance > 0 ? (
        <button onClick={insuranceEscrowClickHandler}>Withdraw</button>
      ) : (
        ""
      )}
    </p>
  );

  let infoAccount = connectedAccount && (
    <Fragment>
      <p>Connected account: {connectedAccount}</p>
      {accountsBalances[connectedAccount] && (
        <p>
          Balance of account:{" "}
          {toTwoDec(toEther(accountsBalances[connectedAccount]))} ETH
        </p>
      )}
      {oracleEscrowElement}
      {insuranceEscrowElement}
    </Fragment>
  );

  return <Fragment>{infoAccount}</Fragment>;
};

export default AccountDisplayer;
