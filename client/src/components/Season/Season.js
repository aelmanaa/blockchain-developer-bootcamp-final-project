import { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import SeasonList from "./SeasonList";
import SeasonManagement from "./SeasonManagement";
import { afterOracleCoreLoading } from "../../store/artifact";


const Season = () => {
  const dispatch = useDispatch();
  const oracleCoreLoaded = useSelector(
    (state) => state.contract.oracleCoreLoaded
  );

  useEffect(() => {
    dispatch(afterOracleCoreLoading(oracleCoreLoaded));
  }, [dispatch, oracleCoreLoaded]);


  return (
    <Fragment>
      <SeasonManagement />
      <SeasonList />
    </Fragment>
  );
};

export default Season;
