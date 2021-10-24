import { useSelector } from "react-redux";
import SeasonItem from "./SeasonItem";

const SeasonList = () => {

  const seasonsNumber = useSelector((state) => state.oracleCore.seasonsNumber);
  const seasons = useSelector((state) => state.oracleCore.seasons);


  const tableHeaders = (
    <thead>
      <tr>
        <th>Season</th>
        <th>State</th>
        <th>Action</th>
      </tr>
    </thead>
  );
  const tbody = (
    <tbody>
        {seasons.map((season) => (
          <SeasonItem
            key={season.id}
            id={season.id}
            state={season.state}
          />
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

export default SeasonList;
