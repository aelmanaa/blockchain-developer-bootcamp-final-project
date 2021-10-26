import { useDispatch, useSelector } from "react-redux";
import { REGIONS, SEVERITY, SEVERITY_VALUES } from "../../utils/constant";
//import { aggregateSeverity } from "../../store/artifact";

const SeverityItem = (props) => {
  const dispatch = useDispatch();
  let connectedAccount = useSelector((state) => state.account.accounts[0]);

  const aggregateHandler = (event) => {
    event.preventDefault();
    console.log(event.target);
    console.log(event.target.value);
    //dispatch(aggregateSeverity(event.target.value, connectedAccount));
  };

  const elem =
    (!props.severity || props.severity === SEVERITY_VALUES["0"]) &&
    connectedAccount ? (
      <button onClick={aggregateHandler} value={props.id}>
        Aggregate
      </button>
    ) : (
      <p />
    );
  return (
    <tr>
      <td>{props.seasonId}</td>
      <td>{REGIONS[props.region].label}</td>
      <td>{props.numberOfSubmissions}</td>
      <td>{SEVERITY[props.severity].label}</td>
      <td>{elem}</td>
    </tr>
  );
};

export default SeverityItem;
