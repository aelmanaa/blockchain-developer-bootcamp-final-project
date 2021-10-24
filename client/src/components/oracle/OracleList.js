import { useSelector } from "react-redux";
import { REGIONS } from "../../utils/constant";
//import OracleItem from "./OracleItem";

const OracleList = () => {
  const seasons = useSelector((state) => state.oracleCore.seasons);
  const regions = Object.keys(REGIONS);

  const tableHeaders = (
    <thead>
      <tr>
        <th>Season</th>
        <th>Region</th>
        <th>Severity</th>
        <th>Oracle</th>
      </tr>
    </thead>
  );
  const tbody = (
    <tbody>
      {seasons.map((season) => (
        <OracleItem key={season.id} id={season.id} state={season.state} />
      ))}
    </tbody>
  );

  const tfoot = (
    <tfoot>
      <tr>
        <td>Number of seasons: {seasonsNumber}</td>
      </tr>
    </tfoot>
  );
  return (
    <table>
      {tableHeaders}
      {tbody}
      {tfoot}
    </table>
  );
};

export default OracleList;
