import { Fragment } from "react";
import SeasonList from "./SeasonList";
import SeasonManagement from "./SeasonManagement";

const Season = () => {
  return (
    <Fragment>
      <SeasonManagement />
      <SeasonList />
    </Fragment>
  );
};

export default Season;
