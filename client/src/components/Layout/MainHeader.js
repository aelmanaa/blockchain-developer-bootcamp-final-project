import Account from "../header/Account";

//import classes from './MainHeader.module.css';

const MainHeader = (props) => {
  return (
    <header /*className={classes.header}*/>
      <h1>ReduxCart</h1>
      <Account />
    </header>
  );
};

export default MainHeader;
