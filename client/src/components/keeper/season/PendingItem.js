import { useDispatch, useSelector } from "react-redux";
import { REGIONS } from "../../../utils/constant";
import { pocessContracts } from "../../../store/interactions/insurance-actors";

const PendingItem = (props) => {
  const dispatch = useDispatch();
  let connectedAccount = useSelector((state) => state.account.accounts[0]);
  const accountsRoles = useSelector((state) => state.account.accountsRoles);
  const currentRoles = accountsRoles[connectedAccount];
  const processHandler = (event) => {
    event.preventDefault();
    const [seasonId, region, numberOpenContracts] =
      event.target.value.split("_");
    dispatch(
      pocessContracts(
        Number(seasonId),
        region,
        Number(numberOpenContracts),
        connectedAccount
      )
    );
  };

  const elem =
    connectedAccount && currentRoles && currentRoles.isKeeper ? (
      <button onClick={processHandler} value={props.id}>
        Process
      </button>
    ) : (
      <p />
    );

  return (
    <tr>
      <td>{props.seasonId}</td>
      <td>{REGIONS[props.region].label}</td>
      <td>{props.numberOpenContracts}</td>
      <td>{elem}</td>
    </tr>
  );
};

export default PendingItem;
