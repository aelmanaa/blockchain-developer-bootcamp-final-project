const GateKeeper = artifacts.require("./access/GateKeeper.sol");
const OracleCore = artifacts.require("./oracle/OracleCore.sol");

module.exports = async deployer => {
  await deployer.deploy(GateKeeper);
  await deployer.deploy(OracleCore, GateKeeper.address);
};
