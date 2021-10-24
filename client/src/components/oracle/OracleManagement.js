import { useDispatch, useSelector } from "react-redux";
import Select from "../ui/Select";
import { Fragment } from "react";
import { SEASON_STATE, REGIONS, SEVERITY } from "../../utils/constant";

const OracleManagement = () => {
  const dispatch = useDispatch();
  const oracleCoreLoaded = useSelector(
    (state) => state.contract.oracleCoreLoaded
  );

  let connectedAccount = useSelector((state) => state.account.accounts[0]);
  const seasons = useSelector((state) => state.oracleCore.seasons);

  const openSeasons = seasons
    .filter((season) => season.state === SEASON_STATE[1])
    .map((season) => season.id);

  const regionsOptions = Object.keys(REGIONS);
  const regionsOptionsLabels = regionsOptions.map(
    (region) => REGIONS[region].label
  );

  const severityOptions = Object.keys(SEVERITY);
  const severityOptionsLabels = severityOptions.map(
    (severity) => SEVERITY[severity].label
  );

  const submitHandler = (event) => {
    event.preventDefault();
    //dispatch(openSeason(newSeason, connectedAccount));
  };

  return (
    <Fragment>
      {oracleCoreLoaded && connectedAccount && openSeasons.length > 0 && (
        <form onSubmit={submitHandler}>
          <Select
            label="Season"
            select={{
              name: "season_select",
              id: "season_select",
              options: openSeasons,
              optionLabels: openSeasons,
            }}
          />
          <Select
            label="Region"
            select={{
              name: "region_select",
              id: "region_select",
              options: regionsOptions,
              optionLabels: regionsOptionsLabels,
            }}
          />
          <Select
            label="Severity"
            select={{
              name: "severity_select",
              id: "severity_select",
              options: severityOptions,
              optionLabels: severityOptionsLabels,
            }}
          />
          <button>Submit</button>
        </form>
      )}
    </Fragment>
  );
};

export default OracleManagement;
