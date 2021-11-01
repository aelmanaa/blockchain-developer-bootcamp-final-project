import { useDispatch, useSelector } from "react-redux";
import Input from "../../ui/Input";
import { Fragment } from "react";
import { oracleCoreActions } from "../../../store/state/oraclecore";
import { openSeason } from "../../../store/interactions/oraclecore-actors";
import classes from "./SeasonForm.module.css";

const SeasonManagement = () => {
  const dispatch = useDispatch();
  const oracleCoreLoaded = useSelector(
    (state) => state.contract.oracleCoreLoaded
  );
  let defaultSeason = useSelector((state) => state.oracleCore.defaultSeason);

  let maxSeason = useSelector((state) => state.oracleCore.maxSeason);
  let newSeason = useSelector((state) => state.oracleCore.newSeason);
  const connectedAccount = useSelector((state) => state.account.accounts[0]);
  const accountsRoles = useSelector((state) => state.account.accountsRoles);

  const currentRoles = accountsRoles[connectedAccount];

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
      {oracleCoreLoaded &&
        connectedAccount &&
        currentRoles &&
        currentRoles.isKeeper && (
          <Fragment>
            <h3>Open a new season</h3>
            <form className={classes.form} onSubmit={submitHandler}>
              <div className={classes.control}>
                <Input
                  label="Season"
                  input={{
                    id: "season",
                    type: "number",
                    min: defaultSeason,
                    max: maxSeason,
                    step: "1",
                    value: defaultSeason,
                    onChange: handleChange,
                  }}
                />
              </div>
              <button>Open new season</button>
            </form>
          </Fragment>
        )}
    </Fragment>
  );
};

export default SeasonManagement;
