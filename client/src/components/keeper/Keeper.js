import Season from "./season/Season";
import Severity from "./severity/Severity";

const Keeper = () => {
  return (
    <div>
      <h1>KEEPER MANAGEMENT</h1>
      <Season />
      <Severity />
    </div>
  );
};

export default Keeper;
