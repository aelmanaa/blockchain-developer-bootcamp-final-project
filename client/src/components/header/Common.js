import { Fragment, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toEther, toTwoDec } from "../../utils/format";
import { liquidity } from "../../store/interactions/insurance";
import { insuranceActions } from "../../store/state/insurance";
import { subBigNumbers } from "../../utils/operations";
import { withdrawInsurer } from "../../store/interactions/insurance-actors";

const Common = (props) => {
  const dispatch = useDispatch();
  const chainId = useSelector((state) => state.account.chainId);
  const networkId = useSelector((state) => state.contract.networkId);
  const insuranceContractAddress = useSelector(
    (state) => state.contract.insuranceAddress
  );

  const insuranceLoaded = useSelector(
    (state) => state.contract.insuranceLoaded
  );
  const insuranceContractMinimumLiquidity = useSelector(
    (state) => state.insurance.minimumLiquidity
  );
  const insuranceContractbalance = useSelector(
    (state) => state.insurance.contractBalance
  );

  const insuranceCounter = useSelector(
    (state) => state.insurance.insuranceCounter
  );

  let connectedAccount = useSelector((state) => state.account.accounts[0]);
  const accountsRoles = useSelector((state) => state.account.accountsRoles);
  const currentRoles = accountsRoles[connectedAccount];

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        liquidity(
          insuranceLoaded,
          insuranceContractAddress,
          insuranceContractMinimumLiquidity,
          insuranceContractbalance
        )
      );
      dispatch(insuranceActions.incrementInsuranceCounter());
    }, 5000);
    return () => clearTimeout(timer);
  }, [dispatch, insuranceLoaded, insuranceCounter]);

  const insuranceWithdrawClickHandler = (event) => {
    event.preventDefault();
    dispatch(
      withdrawInsurer(
        subBigNumbers(
          insuranceContractbalance,
          insuranceContractMinimumLiquidity
        ),
        connectedAccount
      )
    );
  };

  const insuranceInfoElement = insuranceContractbalance && (
    <p>
      Insurance contract - Current balance:{" "}
      {toTwoDec(toEther(insuranceContractbalance))} ETH
      {currentRoles &&
      currentRoles.isInsurer &&
      subBigNumbers(
        insuranceContractbalance,
        insuranceContractMinimumLiquidity
      ) > 0 ? (
        <button onClick={insuranceWithdrawClickHandler}>Withdraw</button>
      ) : (
        ""
      )}
    </p>
  );

  let info = insuranceLoaded && (
    <Fragment>
      {insuranceContractMinimumLiquidity && (
        <p>
          Insurance contract - Minimum liquidity to cover:
          {toTwoDec(toEther(insuranceContractMinimumLiquidity))} ETH
        </p>
      )}
      {insuranceInfoElement}
    </Fragment>
  );

  return (
    <Fragment>
      {info}
      <p>ChainID: {chainId}</p>
      <p>NetworkId: {networkId}</p>
    </Fragment>
  );
};

export default Common;
