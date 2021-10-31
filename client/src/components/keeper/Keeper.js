import { Fragment } from "react";
import Season from "./season/Season";
import Severity from "./severity/Severity";

const Keeper = () => {
  return (
    <Fragment>
      <h1>KEEPER MANAGEMENT</h1>
      <Season />
      <Severity />
    </Fragment>
  );
};

export default Keeper;
