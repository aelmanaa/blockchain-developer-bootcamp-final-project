import { Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";

import Layout from "./components/Layout/Layout";


function App() {
  const dispatch = useDispatch();
  

  return (
    <Fragment>
      <Layout></Layout>
    </Fragment>
  );
}

export default App;
