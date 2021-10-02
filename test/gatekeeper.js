const Gatekeeper = artifacts.require("GateKeeper");
const GatekeeperInterface = artifacts.require("IGateKeeper");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const { keccak256, interfaceId, isEventFound } = require("./helper");
const {
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');



contract("GateKeeper", async (accounts) => {

  const owner = accounts[0]; // root account with default admin role
  const newOwner = accounts[1];
  const admins = accounts.slice(2, 4); // administrators with given role admin
  const insurer = accounts[4];
  const farmers = accounts.slice(5, 8);
  const oracles = accounts.slice(8, 12);

  const adminRoleName = "INSURANCE_DAPP_ADMIN_ROLE", insurerRoleName = "INSURER_ROLE", farmerRoleName = "FARMER_ROLE", oracleRoleName = "ORACLE_ROLE";
  const adminRoleId = keccak256(adminRoleName), insurerRoleId = keccak256(insurerRoleName), farmerRoleId = keccak256(farmerRoleName), oracleRoleId = keccak256(oracleRoleName);

  let gateKeeper, defaultAdminRoleId;

  beforeEach(async () => {
    gateKeeper = await Gatekeeper.deployed();
    defaultAdminRoleId = await gateKeeper.DEFAULT_ADMIN_ROLE();
    //console.log(await gateKeeper.addRole(adminRoleId,defaultAdminRoleId,{from: owner}));
  });

  describe("Check initial state", () => {
    it("Must support gatekeeper interface", async () => {
      let intID = interfaceId(GatekeeperInterface.abi);
      expect(await gateKeeper.supportsInterface(intID), `GateKeeper doesn't implement IGateKeeper which interfaceID is ${intID}`).to.equal(true);
    });

    it("Contract owner has default admin role", async () => {
      let assigneesCount = await gateKeeper.getAssigneesCount(defaultAdminRoleId);
      expect(assigneesCount.toString(), `${assigneesCount} Should be 1 as only the owner has default admin role`).to.equal('1');

      let assignee = await gateKeeper.getAssigneeAt(defaultAdminRoleId, assigneesCount - 1);
      expect(assignee, `${assignee} Should be equal to the owner , which is ${owner}`).to.equal(owner);
    });

    it("Events during creation", async () => {
      let events = await gateKeeper.getPastEvents('allEvents', { fromBlock: 0, toBlock: 'latest' });
      expect(isEventFound(events, 'RoleGranted', { role: defaultAdminRoleId, account: owner, sender: owner }), `RoleGranted with expected args not found in ${JSON.stringify(events)}`).to.equal(true);
    })

  });

  describe("Check access control", () => {

    let addInitialRoleTrans, assignFirstAdminTrans, assigneSecondAdminTrans, addInsurRoleTrans, addFarmerRoleTrans, addOracleRoleTrans;
    before("Setup roles", async () => {
      addInitialRoleTrans = await gateKeeper.addRole(adminRoleId, defaultAdminRoleId, { from: owner });
      assignFirstAdminTrans = await gateKeeper.addAssignment(adminRoleId, admins[0]);
      assigneSecondAdminTrans = await gateKeeper.addAssignment(adminRoleId, admins[1]);

      addInsurRoleTrans = await gateKeeper.addRole(insurerRoleId, adminRoleId, { from: admins[0] });
      addFarmerRoleTrans = await gateKeeper.addRole(farmerRoleId, adminRoleId, { from: admins[0] });
      addOracleRoleTrans = await gateKeeper.addRole(oracleRoleId, adminRoleId, { from: admins[1] });

    });

    it("Check events", async () => {
      expectEvent(addInitialRoleTrans, 'RoleAdminChanged', { role: adminRoleId, previousAdminRole: defaultAdminRoleId, newAdminRole: defaultAdminRoleId });
      expectEvent(addInitialRoleTrans, 'NewRole', { roleId: adminRoleId, adminRoleId: defaultAdminRoleId, admin: owner });
      expectEvent(addInsurRoleTrans, 'RoleAdminChanged', { role: insurerRoleId, previousAdminRole: defaultAdminRoleId, newAdminRole: adminRoleId });
      expectEvent(addInsurRoleTrans, 'NewRole', { roleId: insurerRoleId, adminRoleId: adminRoleId, admin: admins[0] });
      expectEvent(addFarmerRoleTrans, 'RoleAdminChanged', { role: farmerRoleId, previousAdminRole: defaultAdminRoleId, newAdminRole: adminRoleId });
      expectEvent(addFarmerRoleTrans, 'NewRole', { roleId: farmerRoleId, adminRoleId: adminRoleId, admin: admins[0] });
      expectEvent(addOracleRoleTrans, 'RoleAdminChanged', { role: oracleRoleId, previousAdminRole: defaultAdminRoleId, newAdminRole: adminRoleId });
      expectEvent(addOracleRoleTrans, 'NewRole', { roleId: oracleRoleId, adminRoleId: adminRoleId, admin: admins[1] });
    });

    it("Respect hierarchy when adding admins", async() =>{
      let assigneesCount = await gateKeeper.getAssigneesCount(adminRoleId);
      expect(assigneesCount.toString(), `${assigneesCount} Should be ${admins.length}`).to.equal(admins.length.toString());
      await expectRevert(gateKeeper.addAdmin(insurerRoleId, accounts[19], { from: admins[1]}), `account ${admins[1].toLowerCase()} is missing role ${defaultAdminRoleId}`); // an admin cannot add another admin. Must respect hierarchy
      let trans = await gateKeeper.addAdmin(insurerRoleId, accounts[19], { from: owner}); // succcess as owner has defaultAdminRoleId wich is the admin of  adminRoleId
      expectEvent(trans, 'NewAdmin', { roleId: insurerRoleId, newAdmin: accounts[19], admin: owner });
      expectEvent(trans, 'RoleGranted', { role: adminRoleId, account: accounts[19], sender: owner });

      assigneesCount = await gateKeeper.getAssigneesCount(adminRoleId);
      expect(assigneesCount.toString(), `${assigneesCount} Should be ${admins.length+1}`).to.equal((admins.length+1).toString());

      let assignee = await gateKeeper.getAssigneeAt(adminRoleId, assigneesCount-1);
      expect(assignee, `${assignee} Should be equal to ${accounts[19]}`).to.equal(accounts[19]);
      

    })

    it("Only member of admin role can create subroles", async() => {
      await gateKeeper.addAssignment(insurerRoleId, insurer, { from: admins[0] }); // admin 1 assign insurer role to insurer
      await expectRevert(gateKeeper.addRole(keccak256("FICTIVE_ROLE"), adminRoleId, { from: insurer}), 'Restricted to members.'); // insurer cannot  create a subrole under adminRoleId
      await gateKeeper.addRole(keccak256("FICTIVE_ROLE"), insurerRoleId, { from: insurer}); // success. insurer is assigned insurerRoleId so he can create subroles under insurerRoleId
    })

    it("Only admin can add assignment", async () => {
      await gateKeeper.addAssignment(farmerRoleId, farmers[0], { from: admins[0] }); // admin 1 can assign
      await gateKeeper.addAssignment(farmerRoleId, farmers[1], { from: admins[1] }); // admin 2 can assign aswell as he/she has the admin role
      await expectRevert(gateKeeper.addAssignment(farmerRoleId, farmers[2], { from: owner }), 'Restricted to admins.'); // even owner of the contract add assignment to farmerRoleId as he is not admin of the role
    });

    it("Assignment count and assignees correct after add assignment", async () => {
      let assignee;
      for (let i = 0; i < oracles.length; i++) {
        await gateKeeper.addAssignment(oracleRoleId, oracles[i], { from: admins[0] });
        assignee = await gateKeeper.getAssigneeAt(oracleRoleId, i);
        expect(assignee, `${assignee} Should be equal to ${oracles[i]}`).to.equal(oracles[i]);
      }
      let assigneesCount = await gateKeeper.getAssigneesCount(oracleRoleId);
      expect(assigneesCount.toString(), `${assigneesCount} Should be ${oracles.length}`).to.equal(oracles.length.toString());

    });

    it("Only admin can remove assignment", async () => {
      await gateKeeper.addAssignment(farmerRoleId, farmers[0], { from: admins[0] }); // admin 1 can assign
      let trans = await gateKeeper.removeAssignment(farmerRoleId, farmers[1], { from: admins[1] }); // admin 2 revokes assignment of 1
      await expectRevert(gateKeeper.addAssignment(farmerRoleId, farmers[2], { from: owner }), 'Restricted to admins.'); // even owner of the contract add assignment to farmerRoleId as he is not admin of the role
    });

  });





});
