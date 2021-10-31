import { useSelector } from "react-redux";
import InsuranceItem from "./InsuranceItem";
import {
  CONTRACT_VALUES,
  CONTRACT_ACTIONS,
  CONTRACT,
} from "../../utils/constant";

const InsuranceOpenList = () => {
  const contracts = useSelector((state) => state.insurance.contracts);
  const openContracts = contracts.filter(
    (contract) =>
      contract.state !== CONTRACT_VALUES[4] &&
      contract.state !== CONTRACT_VALUES[5]
  );

  const tableHeaders = (
    <thead>
      <tr>
        <th>Season</th>
        <th>Region</th>
        <th>Farm</th>
        <th>Size</th>
        <th>Status</th>
        <th>Season Severity</th>
        <th>Farmer</th>
        <th>Government</th>
        <th>Insurer</th>
        <th>Total Staked (ETH)</th>
        <th>Compensation (ETH)</th>
        <th>Change for government(ETH)</th>
        <th>Action</th>
      </tr>
    </thead>
  );
  const tbody = (
    <tbody>
      {openContracts.map((contract) => {
        let action;
        switch (contract.state) {
          case CONTRACT.REGISTERED.keyName:
            action = CONTRACT_ACTIONS.VALIDATE.keyName;
            break;
          case CONTRACT.VALIDATED.keyName:
            action = CONTRACT_ACTIONS.ACTIVATE.keyName;
            break;
          case CONTRACT.INSURED.keyName:
            action = CONTRACT_ACTIONS.NONE.keyName;
            break;

          default:
            console.error(
              `ERROR! State ${contract.state} not valid in ths case`
            );
            action = CONTRACT_ACTIONS.NONE.keyName;
            break;
        }
        return (
          <InsuranceItem
            key={contract.key}
            id={contract.key}
            seasonId={contract.seasonId}
            region={contract.region}
            farm={contract.farm}
            size={contract.size}
            state={contract.state}
            severity={contract.severity}
            farmer={contract.farmer}
            government={contract.government}
            insurer={contract.insurer}
            totalStaked={contract.totalStaked}
            compensation={contract.compensation}
            changeGovernment={contract.changeGovernment}
            action={action}
          />
        );
      })}
    </tbody>
  );

  return (
    openContracts.length > 0 && (
      <table>
        <caption>Insurance open contract</caption>
        {tableHeaders}
        {tbody}
      </table>
    )
  );
};

export default InsuranceOpenList;
