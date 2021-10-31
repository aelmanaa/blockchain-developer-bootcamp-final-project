import { Fragment } from "react";
import SeasonList from "./SeasonList";
import PendingList from "./PendingList";
import SeasonManagement from "./SeasonManagement";

const Season = () => {
  return (
    <Fragment>
      <h2>SEASON MANAGEMENT</h2>
      <SeasonManagement />
      <SeasonList />
      <PendingList />
    </Fragment>
  );
};

export default Season;
