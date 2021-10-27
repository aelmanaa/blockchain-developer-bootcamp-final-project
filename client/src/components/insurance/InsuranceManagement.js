import { useDispatch, useSelector } from "react-redux";
import Select from "../ui/Select";
import Input from "../ui/Input";
import { Fragment } from "react";
import { SEASON_STATE, REGIONS, SEVERITY, FARMS } from "../../utils/constant";
import { insuranceActions } from "../../store/state/insurance";
import { register } from "../../store/interactions/insurance-actors";

const InsuranceManagement = () => {
  const dispatch = useDispatch();
  const oracleCoreLoaded = useSelector(
    (state) => state.contract.oracleCoreLoaded
  );
  const insuranceLoaded = useSelector(
    (state) => state.contract.insuranceLoaded
  );

  const registerContractSeason = useSelector(
    (state) => state.insurance.registerContractSeason
  );
  const registerContractRegion = useSelector(
    (state) => state.insurance.registerContractRegion
  );
  const registerContractFarm = useSelector(
    (state) => state.insurance.registerContractFarm
  );
  const registerContractSize = useSelector(
    (state) => state.insurance.registerContractSize
  );

  const halfPremiumPerHA = useSelector(
    (state) => state.insurance.halfPremiumPerHA
  );

  let connectedAccount = useSelector((state) => state.account.accounts[0]);

  const seasons = useSelector((state) => state.oracleCore.seasons);

  const openSeasons = seasons
    .filter((season) => season.state === SEASON_STATE[1])
    .map((season) => season.id);
  if (openSeasons.length > 0) {
    dispatch(
      insuranceActions.encodeRegisterContractSeason({
        registerContractSeason: openSeasons[0],
      })
    );
  }

  const regionsOptions = Object.keys(REGIONS);
  const regionsOptionsLabels = regionsOptions.map(
    (region) => REGIONS[region].label
  );

  const farmsOptions = Object.keys(FARMS);
  const farmsOptionsLabels = farmsOptions.map((farm) => FARMS[farm].label);

  const handleChange = (event) => {
    event.preventDefault();
    switch (event.target.id) {
      case "insurance_season":
        dispatch(
          insuranceActions.encodeRegisterContractSeason({
            registerContractSeason: event.target.value,
          })
        );
        break;

      case "insurance_region":
        dispatch(
          insuranceActions.encodeRegisterContractRegion({
            registerContractRegion: event.target.value,
          })
        );
        break;

      case "insurance_farm":
        dispatch(
          insuranceActions.encodeRegisterContractFarm({
            registerContractFarm: event.target.value,
          })
        );
        break;

      case "insurance_size":
        dispatch(
          insuranceActions.encodeRegisterContractSize({
            registerContractSize: event.target.value,
          })
        );
        break;

      default:
        console.error(
          `Not supported element ${event.target.id} ${event.target.value}`
        );
        break;
    }
  };

  const submitHandler = (event) => {
    event.preventDefault();
    console.log(
      registerContractSeason,
      registerContractRegion,
      registerContractFarm,
      registerContractSize,
      halfPremiumPerHA
    );
    dispatch(
      register(
        registerContractSeason,
        registerContractRegion,
        registerContractFarm,
        registerContractSize,
        halfPremiumPerHA,
        connectedAccount
      )
    );
  };

  return (
    <Fragment>
      {oracleCoreLoaded && insuranceLoaded && connectedAccount && (
        <form onSubmit={submitHandler}>
          <Select
            label="Season"
            select={{
              name: "insurance_season",
              id: "insurance_season",
              onChange: handleChange,
              options: openSeasons,
              optionLabels: openSeasons,
            }}
          />
          <Select
            label="Region"
            select={{
              name: "insurance_region",
              id: "insurance_region",
              onChange: handleChange,
              options: regionsOptions,
              optionLabels: regionsOptionsLabels,
            }}
          />
          <Select
            label="Farm"
            select={{
              name: "insurance_farm",
              id: "insurance_farm",
              onChange: handleChange,
              options: farmsOptions,
              optionLabels: farmsOptionsLabels,
            }}
          />
          <Input
            label="Size"
            input={{
              id: "insurance_size",
              type: "number",
              min: 1,
              step: "1",
              defaultValue: 1,
              onChange: handleChange,
            }}
          />
          <button>Submit</button>
        </form>
      )}
    </Fragment>
  );
};

export default InsuranceManagement;
