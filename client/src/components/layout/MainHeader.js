import Account from "../header/Account";
import AccountDisplayer from "../header/AccountDisplayer";

//import classes from './MainHeader.module.css';

const MainHeader = (props) => {
  return (
    <header /*className={classes.header}*/>
      <Account />
      <AccountDisplayer />
    </header>
  );
};

export default MainHeader;
