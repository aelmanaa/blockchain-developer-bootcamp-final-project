import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { loadSeasonList } from "../../store/artifact";
import SeasonItem from "./SeasonItem";

const SeasonList = () => {
  const dispatch = useDispatch();
  const oracleCoreLoaded = useSelector((state) => state.contract.oracleCoreLoaded);
  const seasonsNumber = useSelector((state) => state.oracleCore.seasonsNumber);
  const seasons = useSelector((state) => state.oracleCore.seasons);

  useEffect(() => {
    dispatch(loadSeasonList(oracleCoreLoaded));
  }, [dispatch, oracleCoreLoaded]);


  
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
