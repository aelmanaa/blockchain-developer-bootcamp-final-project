import { useDispatch, useSelector } from "react-redux";
import {
  FARMS,
  REGIONS,
  CONTRACT,
  SEVERITY,
  CONTRACT_ACTIONS,
} from "../../utils/constant";
import { renderAddress, toTwoDec, toEther } from "../../utils/format";
import { activate, validate } from "../../store/interactions/insurance-actors";

const InsuranceItem = (props) => {
  const dispatch = useDispatch();
  let connectedAccount = useSelector((state) => state.account.accounts[0]);
  const halfPremiumPerHA = useSelector(
    (state) => state.insurance.halfPremiumPerHA
  );
  const clickHandler = (event) => {
    event.preventDefault();
    const [action, seasonId, region, farm, size] = event.target.value.split("_");
    console.log(action, seasonId, region, farm, size)
    switch (action) {
      case CONTRACT_ACTIONS.VALIDATE.keyName:
        dispatch(
          validate(
            seasonId,
            region,
            farm,
            halfPremiumPerHA,
            size,
            connectedAccount
          )
        );
        break;
      case CONTRACT_ACTIONS.ACTIVATE.keyName:
        dispatch(activate(seasonId, region, farm, connectedAccount));
        break;
      default:
        console.error(`action ${action} not supported`);
        break;
    }
  };

  const elem =
    connectedAccount && !(props.action === CONTRACT_ACTIONS.NONE.keyName) ? (
      <button
        onClick={clickHandler}
        value={
          props.action +
          "_" +
          props.seasonId +
          "_" +
          props.region +
          "_" +
          props.farm +
          "_" +
          props.size
        }
      >
        {CONTRACT_ACTIONS[props.action].label}
      </button>
    ) : (
      <p />
    );

  return (
    <tr>
      <td>{props.seasonId}</td>
      <td>{REGIONS[props.region].label}</td>
      <td>{FARMS[props.farm].label}</td>
      <td>{props.size}</td>
      <td>{CONTRACT[props.state].label}</td>
      <td>{SEVERITY[props.severity].label}</td>
      <td>{renderAddress(props.farmer)}</td>
      <td>{renderAddress(props.government)}</td>
      <td>{renderAddress(props.insurer)}</td>
      <td>{toTwoDec(toEther(props.totalStaked))}</td>
      <td>{toTwoDec(toEther(props.compensation))}</td>
      <td>{toTwoDec(toEther(props.changeGovernment))}</td>
      <td>{elem}</td>
    </tr>
  );
};

export default InsuranceItem;
