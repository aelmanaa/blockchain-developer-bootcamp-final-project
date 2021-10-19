import Account from "../header/Account";
import AccountDisplayer from "../header/AccountDisplayer";

//import classes from './MainHeader.module.css';

const MainHeader = (props) => {
  return (
    <header /*className={classes.header}*/>
      <h1>ReduxCart</h1>
      <Account />
      <AccountDisplayer />
    </header>
  );
};

export default MainHeader;
