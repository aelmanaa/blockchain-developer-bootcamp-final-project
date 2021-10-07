const GateKeeper = artifacts.require("./access/GateKeeper.sol");
const OracleCore = artifacts.require("./oracle/OracleCore.sol");
const OracleFacade = artifacts.require("./oracle/OracleFacade.sol");
const Insurance = artifacts.require("./insurance/Insurance.sol");

module.exports = async deployer => {
  await deployer.deploy(GateKeeper);
  await deployer.deploy(OracleCore, GateKeeper.address);
  await deployer.deploy(OracleFacade, OracleCore.address);
  await deployer.deploy(Insurance, GateKeeper.address, OracleFacade.address);
};
