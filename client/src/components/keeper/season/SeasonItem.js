import { useDispatch, useSelector } from "react-redux";
import { closeSeason } from "../../../store/interactions/oraclecore-actors";
import { SEASON_STATE } from "../../../utils/constant";

const SeasonItem = (props) => {
  const dispatch = useDispatch();
  let connectedAccount = useSelector((state) => state.account.accounts[0]);
  const accountsRoles = useSelector((state) => state.account.accountsRoles);
  const currentRoles = accountsRoles[connectedAccount];

  const closeHandler = (event) => {
    event.preventDefault();
    dispatch(closeSeason(event.target.value, connectedAccount));
  };

  const elem =
    props.state === SEASON_STATE[1] &&
    connectedAccount &&
    currentRoles &&
    currentRoles.isKeeper ? (
      <button onClick={closeHandler} value={props.id}>
        Close season
      </button>
    ) : (
      <p />
    );
  return (
    <tr>
      <td>{props.id}</td>
      <td>{SEASON_STATE[props.state].label}</td>
      <td>{elem}</td>
    </tr>
  );
};

export default SeasonItem;
