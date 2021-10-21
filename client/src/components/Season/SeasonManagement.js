import { useDispatch, useSelector } from "react-redux";
import Input from "../UI/Input";
import { Fragment } from "react";
import { oracleCoreActions } from "../../store/oraclecore";
import { openSeason } from "../../store/artifact";

const SeasonManagement = () => {
  const dispatch = useDispatch();
  const oracleCoreLoaded = useSelector(
    (state) => state.contract.oracleCoreLoaded
  );
  let defaultSeason = useSelector((state) => state.oracleCore.defaultSeason);
  let maxSeason = useSelector((state) => state.oracleCore.maxSeason);
  let newSeason = useSelector((state) => state.oracleCore.newSeason);
  let connectedAccount = useSelector((state) => state.account.accounts[0]);

  const submitHandler = (event) => {
    event.preventDefault();
    dispatch(openSeason(newSeason, connectedAccount));
  };
  const handleChange = (event) => {
    dispatch(
      oracleCoreActions.encodeNewSeason({ newSeason: event.target.value })
    );
  };

  return (
    <Fragment>
      {oracleCoreLoaded && connectedAccount && (
        <form onSubmit={submitHandler}>
          <Input
            label="Season"
            input={{
              id: "season",
              type: "number",
              min: defaultSeason,
              max: maxSeason,
              step: "1",
              defaultValue: defaultSeason,
              onChange: handleChange,
            }}
          />
          <button>Open new season</button>
        </form>
      )}
    </Fragment>
  );
};

export default SeasonManagement;
