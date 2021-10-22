import { useDispatch, useSelector } from "react-redux";
import { closeSeason } from "../../store/artifact";

const SeasonItem = (props) => {
  const dispatch = useDispatch();
  let connectedAccount = useSelector((state) => state.account.accounts[0]);

  const labels = {
    1: "Open",
    2: "Closed",
  };

  const closeHandler = (event) => {
    event.preventDefault();
    dispatch(closeSeason(event.target.value, connectedAccount));
  };

  const elem =
    (props.state === "1" && connectedAccount) ? (
      <button onClick={closeHandler} value={props.id}>
        Close season
      </button>
    ) : (
      <p />
    );
  return (
    <tr>
      <td>{props.id}</td>
      <td>{labels[props.state]}</td>
      <td>{elem}</td>
    </tr>
  );
};

export default SeasonItem;
