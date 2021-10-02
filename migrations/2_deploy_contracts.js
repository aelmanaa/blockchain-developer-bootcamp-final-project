const SimpleStorage = artifacts.require("./SimpleStorage.sol");
const GateKeeper = artifacts.require("./access/GateKeeper.sol");

module.exports = async function(deployer) {
  await deployer.deploy(SimpleStorage);
  await deployer.deploy(GateKeeper);
};
