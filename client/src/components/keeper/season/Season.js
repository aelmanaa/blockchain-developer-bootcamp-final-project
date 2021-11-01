import SeasonList from "./SeasonList";
import PendingList from "./PendingList";
import SeasonManagement from "./SeasonManagement";

const Season = () => {
  return (
    <div>
      <h2>SEASON MANAGEMENT</h2>
      <SeasonManagement />
      <SeasonList />
      <PendingList />
    </div>
  );
};

export default Season;
