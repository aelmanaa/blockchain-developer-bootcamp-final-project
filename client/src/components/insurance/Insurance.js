import { Fragment } from "react";
import InsuranceOpenList from "./InsuranceOpenList";
import InsuranceManagement from "./InsuranceManagement";
import InsuranceClosedList from "./InsuranceClosedList";

const Insurance = () => {
  return (
    <Fragment>
      <h1>INSURANCE MANAGEMENT</h1>
      <InsuranceManagement />
      <InsuranceOpenList />
      <InsuranceClosedList />
    </Fragment>
  );
};

export default Insurance;
