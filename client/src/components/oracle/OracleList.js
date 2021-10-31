import { useSelector } from "react-redux";
import OracleItem from "./OracleItem";

const OracleList = () => {
  const submissions = useSelector((state) => state.oracleCore.submissions);

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
      {submissions.map((submission) => {
        const key =
          submission.seasonId + submission.region + submission.submitter;
        return (
          <OracleItem
            key={key}
            seasonId={submission.seasonId}
            region={submission.region}
            severity={submission.severity}
            submitter={submission.submitter}
          />
        );
      })}
    </tbody>
  );

  return (
    submissions.length > 0 && (
      <table>
        <caption>Oracles submissions</caption>
        {tableHeaders}
        {tbody}
      </table>
    )
  );
};

export default OracleList;
