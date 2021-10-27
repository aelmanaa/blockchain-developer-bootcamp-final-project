import Account from "../header/Account";
import AccountDisplayer from "../header/AccountDisplayer";
import Common from "../header/Common";

//import classes from './MainHeader.module.css';

const MainHeader = (props) => {
  return (
    <header /*className={classes.header}*/>
      <Common />
      <Account />
      <AccountDisplayer />
    </header>
  );
};

export default MainHeader;
