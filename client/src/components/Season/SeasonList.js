import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { loadSeasonList } from "../../store/artifact";

const SeasonList = (props) => {
  const dispatch = useDispatch();
  const oracleCoreLoaded = useSelector((state) => state.contract.oracleCoreLoaded);

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
      <tr>
        <td>2021</td>
        <td>Open</td>
        <td>
          <button>clickme</button>
        </td>
      </tr>
    </tbody>
  );
  return (
    <table>
      {tableHeaders}
      {tbody}
    </table>
  );
};

export default SeasonList;
