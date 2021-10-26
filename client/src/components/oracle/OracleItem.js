import { REGIONS, SEVERITY } from "../../utils/constant";
import { renderAddress } from "../../utils/format";

const OracleItem = (props) => {
  return (
    <tr>
      <td>{props.seasonId}</td>
      <td>{REGIONS[props.region].label}</td>
      <td>{SEVERITY[props.severity].label}</td>
      <td>{renderAddress(props.submitter)}</td>
    </tr>
  );
};

export default OracleItem;
