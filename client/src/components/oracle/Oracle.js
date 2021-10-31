import { Fragment } from "react";
import OracleList from "./OracleList";
import OracleManagement from "./OracleManagement";

const Oracle = () => {
  return (
    <Fragment>
      <h1>ORACLE MANAGEMENT</h1>
      <OracleManagement />
      <OracleList />
    </Fragment>
  );
};

export default Oracle;
