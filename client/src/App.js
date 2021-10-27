import { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';

import Layout from "./components/layout/Layout";
import Notification from "./components/ui/Notification";
import { checkMetamaskInstalled } from "./store/interactions/metamask";

const App = () => {
  const dispatch = useDispatch();
  const notification = useSelector((state) => state.ui.notification);

  useEffect(() => {
    dispatch(checkMetamaskInstalled());
  }, [dispatch]);

  return (
    <Fragment>
      {notification && (
        <Notification
          status={notification.status}
          title={notification.title}
          message={notification.message}
        />
      )}
      <Layout></Layout>
    </Fragment>
  );
};

export default App;
