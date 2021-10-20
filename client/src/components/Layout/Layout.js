import { Fragment } from 'react';
import MainHeader from './MainHeader';
import Main from '../Main/Main';

const Layout = (props) => {
  return (
    <Fragment>
      <MainHeader />
      <main>
        <Main />
      </main>
    </Fragment>
  );
};

export default Layout;
