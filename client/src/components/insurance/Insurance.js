import InsuranceOpenList from "./InsuranceOpenList";
import InsuranceManagement from "./InsuranceManagement";
import InsuranceClosedList from "./InsuranceClosedList";

const Insurance = () => {
  return (
    <div>
      <h1>INSURANCE MANAGEMENT</h1>
      <InsuranceManagement />
      <InsuranceOpenList />
      <InsuranceClosedList />
    </div>
  );
};

export default Insurance;
