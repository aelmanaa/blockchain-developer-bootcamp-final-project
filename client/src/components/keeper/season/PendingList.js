import { useSelector } from "react-redux";
import PendingItem from "./PendingItem";

const PendingList = () => {
  const pendings = useSelector((state) => state.insurance.pendings);

  const tableHeaders = (
    <thead>
      <tr>
        <th>Season</th>
        <th>Region</th>
        <th>Number Pending Contracts</th>
        <th>Action</th>
      </tr>
    </thead>
  );
  const tbody = (
    <tbody>
      {pendings.map((pending) => {
        const key =
          pending.seasonId +
          "_" +
          pending.region +
          "_" +
          pending.numberOpenContracts;
        return (
          <PendingItem
            key={key}
            id={key}
            seasonId={pending.seasonId}
            region={pending.region}
            numberOpenContracts={pending.numberOpenContracts}
          />
        );
      })}
    </tbody>
  );

  return (
    pendings.length > 0 && (
      <table>
        <caption>Queue contracts (to be processed)</caption>
        {tableHeaders}
        {tbody}
      </table>
    )
  );
};

export default PendingList;
