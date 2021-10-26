import { Fragment } from "react";
import OracleList from "./OracleList";
import OracleManagement from "./OracleManagement";

const Oracle = () => {
  return (
    <Fragment>
      <OracleManagement />
      <OracleList />
    </Fragment>
  );
};

export default Oracle;
