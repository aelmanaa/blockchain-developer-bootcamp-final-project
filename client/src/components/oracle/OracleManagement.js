import { useDispatch, useSelector } from "react-redux";
import Select from "../ui/Select";
import { Fragment } from "react";
import { SEASON_STATE, REGIONS, SEVERITY } from "../../utils/constant";
import { oracleCoreActions } from "../../store/oraclecore";

const OracleManagement = () => {
  const dispatch = useDispatch();
  const oracleCoreLoaded = useSelector(
    (state) => state.contract.oracleCoreLoaded
  );
  const submitOracleSeason = useSelector(
    (state) => state.oracleCore.submitOracleSeason
  );
  const submitOracleRegion = useSelector(
    (state) => state.oracleCore.submitOracleRegion
  );
  const submitOracleSeverity = useSelector(
    (state) => state.oracleCore.submitOracleSeverity
  );

  let connectedAccount = useSelector((state) => state.account.accounts[0]);
  const seasons = useSelector((state) => state.oracleCore.seasons);

  const openSeasons = seasons
    .filter((season) => season.state === SEASON_STATE[1])
    .map((season) => season.id);
  if (openSeasons.length > 0) {
    dispatch(
      oracleCoreActions.encodeSubmitOracleSeason({
        submitOracleSeason: openSeasons[0],
      })
    );
  }

  const regionsOptions = Object.keys(REGIONS);
  const regionsOptionsLabels = regionsOptions.map(
    (region) => REGIONS[region].label
  );

  const severityOptions = Object.keys(SEVERITY);
  const severityOptionsLabels = severityOptions.map(
    (severity) => SEVERITY[severity].label
  );

  const handleChange = (event) => {
    event.preventDefault();
    switch (event.target.id) {
      case "season_select":
        dispatch(
          oracleCoreActions.encodeSubmitOracleSeason({
            submitOracleSeason: event.target.value,
          })
        );
        break;

      case "region_select":
        dispatch(
          oracleCoreActions.encodeSubmitOracleRegion({
            submitOracleRegion: event.target.value,
          })
        );
        break;

      case "severity_select":
        dispatch(
          oracleCoreActions.encodeSubmitOracleSeverity({
            submitOracleSeverity: event.target.value,
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
              onChange: handleChange,
              options: openSeasons,
              optionLabels: openSeasons,
            }}
          />
          <Select
            label="Region"
            select={{
              name: "region_select",
              id: "region_select",
              onChange: handleChange,
              options: regionsOptions,
              optionLabels: regionsOptionsLabels,
            }}
          />
          <Select
            label="Severity"
            select={{
              name: "severity_select",
              id: "severity_select",
              onChange: handleChange,
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
