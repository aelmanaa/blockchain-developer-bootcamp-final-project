import { useSelector } from "react-redux";
import SeverityItem from "./SeverityItem";

const SeverityList = () => {
  const severities = useSelector((state) => state.oracleCore.severities);

  const tableHeaders = (
    <thead>
      <tr>
        <th>Season</th>
        <th>Region</th>
        <th>Number of submissions</th>
        <th>Severity</th>
        <th>Action</th>
      </tr>
    </thead>
  );
  const tbody = (
    <tbody>
      {severities.map((sev) => {
        const key = sev.seasonId + "_" + sev.region;
        return (
          <SeverityItem
            key={key}
            id={key}
            seasonId={sev.seasonId}
            region={sev.region}
            numberOfSubmissions={sev.submissionsCount}
            severity={sev.severity}
          />
        );
      })}
    </tbody>
  );

  return (
    <table>
      <caption>Aggregated Severities</caption>
      {tableHeaders}
      {tbody}
    </table>
  );
};

export default SeverityList;
