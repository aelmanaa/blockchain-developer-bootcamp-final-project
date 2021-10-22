// truffle exec scripts/roles.js --network development

const Gatekeeper = require("../client/src/contracts/GateKeeper.json");

const setup = async () => {
  let accounts = await web3.eth.getAccounts();
  const keccak256 = (str) => web3.utils.keccak256(str);
  const ROLES_CONST = {
    ADMIN_ROLE: keccak256("INSURANCE_DAPP_ADMIN_ROLE"),
    INSURER_ROLE: keccak256("INSURER_ROLE"),
    GOVERNMENT_ROLE: keccak256("GOVERNMENT_ROLE"),
    FARMER_ROLE: keccak256("FARMER_ROLE"),
    ORACLE_ROLE: keccak256("ORACLE_ROLE"),
    KEEPER_ROLE: keccak256("KEEPER_ROLE"),
  };

  const owner = accounts[0];
  const admin = accounts[1];
  const insurer = accounts[2];
  const keeper = accounts[3];
  const government = accounts[4];
  const farmers = accounts.slice(5, 7);
  const oracles = accounts.slice(7, 17);

  const networkId = await web3.eth.net.getId();
  const deployedNetwork = Gatekeeper.networks[networkId];
  const contract = new web3.eth.Contract(
    Gatekeeper.abi,
    deployedNetwork.address
  );

  return {
    owner,
    admin,
    insurer,
    keeper,
    government,
    farmers,
    oracles,
    contract,
    ROLES_CONST,
  };
};

module.exports = async (callback) => {
  console.log(
    "******************START ASSIGNING ROLES SCRIPT **********************"
  );

  try {
    const {
      owner,
      admin,
      insurer,
      keeper,
      government,
      farmers,
      oracles,
      contract,
      ROLES_CONST,
    } = await setup();
    const methods = contract.methods;
    const defaultAdminRoleId = await methods.DEFAULT_ADMIN_ROLE().call();
    //console.log(methods);
    await methods
      .addRole(ROLES_CONST.ADMIN_ROLE, defaultAdminRoleId)
      .send({ from: owner });

    await methods
      .addAssignment(ROLES_CONST.ADMIN_ROLE, admin)
      .send({ from: owner, gas: 3000000 });

    // set roles
    await methods
      .addRole(ROLES_CONST.INSURER_ROLE, ROLES_CONST.ADMIN_ROLE)
      .send({ from: admin, gas: 3000000 });
    await methods
      .addRole(ROLES_CONST.GOVERNMENT_ROLE, ROLES_CONST.ADMIN_ROLE)
      .send({ from: admin, gas: 3000000 });
    await methods
      .addRole(ROLES_CONST.KEEPER_ROLE, ROLES_CONST.ADMIN_ROLE)
      .send({ from: admin, gas: 3000000 });
    await methods
      .addRole(ROLES_CONST.ORACLE_ROLE, ROLES_CONST.ADMIN_ROLE)
      .send({ from: admin, gas: 3000000 });
    await methods
      .addRole(ROLES_CONST.FARMER_ROLE, ROLES_CONST.ADMIN_ROLE)
      .send({ from: admin, gas: 3000000 });
    // assign roles
    await methods
      .addAssignment(ROLES_CONST.INSURER_ROLE, insurer)
      .send({ from: admin, gas: 3000000 });
    await methods
      .addAssignment(ROLES_CONST.GOVERNMENT_ROLE, government)
      .send({ from: admin, gas: 3000000 });
    await methods
      .addAssignment(ROLES_CONST.KEEPER_ROLE, keeper)
      .send({ from: admin, gas: 3000000 });
    for (let oracle of oracles) {
      await methods
        .addAssignment(ROLES_CONST.ORACLE_ROLE, oracle)
        .send({ from: admin, gas: 3000000 });
    }
    for (let farmer of farmers) {
      await methods
        .addAssignment(ROLES_CONST.FARMER_ROLE, farmer)
        .send({ from: admin, gas: 3000000 });
    }
  } catch (error) {
    console.log(error);
  }
  console.log("******************END ROLE ASSIGNMENT**********************");
  callback();
};
