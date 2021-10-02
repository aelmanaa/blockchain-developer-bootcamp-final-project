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
      expect(await gateKeeper.isAssigned(defaultAdminRoleId, owner), `${owner} should be admin`).to.equal(true);
      expect(await gateKeeper.isAssigned(defaultAdminRoleId, newOwner), `${newOwner} should not be admin`).to.equal(false);
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
      expectEvent(assignFirstAdminTrans, 'NewAssignment', { roleId: adminRoleId, account: admins[0], admin: owner });
      expectEvent(assignFirstAdminTrans, 'RoleGranted', { role: adminRoleId, account: admins[0], sender: owner });
      expectEvent(assigneSecondAdminTrans, 'NewAssignment', { roleId: adminRoleId, account: admins[1], admin: owner });
      expectEvent(assigneSecondAdminTrans, 'RoleGranted', { role: adminRoleId, account: admins[1], sender: owner });
      expectEvent(addInsurRoleTrans, 'RoleAdminChanged', { role: insurerRoleId, previousAdminRole: defaultAdminRoleId, newAdminRole: adminRoleId });
      expectEvent(addInsurRoleTrans, 'NewRole', { roleId: insurerRoleId, adminRoleId: adminRoleId, admin: admins[0] });
      expectEvent(addFarmerRoleTrans, 'RoleAdminChanged', { role: farmerRoleId, previousAdminRole: defaultAdminRoleId, newAdminRole: adminRoleId });
      expectEvent(addFarmerRoleTrans, 'NewRole', { roleId: farmerRoleId, adminRoleId: adminRoleId, admin: admins[0] });
      expectEvent(addOracleRoleTrans, 'RoleAdminChanged', { role: oracleRoleId, previousAdminRole: defaultAdminRoleId, newAdminRole: adminRoleId });
      expectEvent(addOracleRoleTrans, 'NewRole', { roleId: oracleRoleId, adminRoleId: adminRoleId, admin: admins[1] });
    });

    it("Check admin state", async () => {
      expect(await gateKeeper.isAdmin(adminRoleId, owner), `${owner} should be root admin`).to.equal(true);
      expect(await gateKeeper.isAssigned(defaultAdminRoleId, owner), `${owner} should be root admin`).to.equal(true);
      expect(await gateKeeper.isAssigned(adminRoleId, admins[0]), `${admins[0]} should be admin`).to.equal(true);
      expect(await gateKeeper.isAssigned(adminRoleId, admins[1]), `${admins[1]} should be admin`).to.equal(true);
      expect(await gateKeeper.isAdmin(insurerRoleId, admins[0]), `${admins[0]} should be admin`).to.equal(true);
      expect(await gateKeeper.isAdmin(insurerRoleId, admins[1]), `${admins[1]} should be admin`).to.equal(true);
      expect(await gateKeeper.isAdmin(farmerRoleId, admins[0]), `${admins[0]} should be admin`).to.equal(true);
      expect(await gateKeeper.isAdmin(farmerRoleId, admins[1]), `${admins[1]} should be admin`).to.equal(true);
      expect(await gateKeeper.isAdmin(oracleRoleId, admins[0]), `${admins[0]} should be admin`).to.equal(true);
      expect(await gateKeeper.isAdmin(oracleRoleId, admins[1]), `${admins[1]} should be admin`).to.equal(true);
      expect(await gateKeeper.isAdmin(oracleRoleId, owner), `owner should not be admin. roles not inherited`).to.equal(false);
    });

    it("Only member of admin role can create subroles", async () => {
      await gateKeeper.addAssignment(insurerRoleId, insurer, { from: admins[0] }); // admin 1 assign insurer role to insurer
      await expectRevert(gateKeeper.addRole(keccak256("FICTIVE_ROLE"), adminRoleId, { from: insurer }), 'Restricted to members.'); // insurer cannot  create a subrole under adminRoleId
      await gateKeeper.addRole(keccak256("FICTIVE_ROLE"), insurerRoleId, { from: insurer }); // success. insurer is assigned insurerRoleId so he can create subroles under insurerRoleId
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
      //assign roles to 3 farmers
      await gateKeeper.addAssignment(farmerRoleId, farmers[0], { from: admins[0] }); // admin 1 can assign
      await gateKeeper.addAssignment(farmerRoleId, farmers[1], { from: admins[1] }); // admin 2 can assign
      await gateKeeper.addAssignment(farmerRoleId, farmers[2], { from: admins[1] }); // admin 2 can assign
      // check number of assignees is 3
      let assigneesCount = await gateKeeper.getAssigneesCount(farmerRoleId);
      expect(assigneesCount.toString(), `${assigneesCount} Should be ${farmers.length}`).to.equal(farmers.length.toString());
      // remove 2 farmers and check events
      let trans = await gateKeeper.removeAssignment(farmerRoleId, farmers[1], { from: admins[1] }); // admin 2 revokes assignment of 1
      expectEvent(trans, 'RemoveAssignment', { roleId: farmerRoleId, account: farmers[1], admin: admins[1] });
      expectEvent(trans, 'RoleRevoked', { role: farmerRoleId, account: farmers[1], sender: admins[1] });
      trans = await gateKeeper.removeAssignment(farmerRoleId, farmers[0], { from: admins[0] }); // admin 1 revokes assignment of 1
      expectEvent(trans, 'RemoveAssignment', { roleId: farmerRoleId, account: farmers[0], admin: admins[0] });
      expectEvent(trans, 'RoleRevoked', { role: farmerRoleId, account: farmers[0], sender: admins[0] });
      // non admin cannot remove Assignment of 3rd farmer
      await expectRevert(gateKeeper.removeAssignment(farmerRoleId, farmers[2], { from: owner }), 'Restricted to admins.'); // even owner of the contract cannot remove assignment as he is not admin
      // check new assignment count is 1 and only farmer 3 is remaining
      assigneesCount = await gateKeeper.getAssigneesCount(farmerRoleId);
      expect(assigneesCount.toString(), `${assigneesCount} Should be 1`).to.equal('1');
      let assignee = await gateKeeper.getAssigneeAt(farmerRoleId, 0);
      expect(assignee, `${assignee} Should be equal to ${farmers[2]}`).to.equal(farmers[2]);
    });

    it("Admin of role can renounce being admin", async () => {
      await expectRevert(gateKeeper.renounceAdmin(farmerRoleId, { from: farmers[2] }), 'Restricted to admins.');
      // admin1 renounce being admin 
      expect(await gateKeeper.isAdmin(farmerRoleId, admins[0]), `${admins[0]} should be admin`).to.equal(true);
      let trans = await gateKeeper.renounceAdmin(farmerRoleId, { from: admins[0] });
      expectEvent(trans, 'RenounceAdministration', { roleId: farmerRoleId, admin: admins[0] });
      expectEvent(trans, 'RoleRevoked', { role: adminRoleId, account: admins[0], sender: admins[0] });
      // admin1 not admin anymore
      expect(await gateKeeper.isAdmin(farmerRoleId, admins[0]), `${admins[0]} should not be admin`).to.equal(false);

    });

    it("A new owner can be assigned", async () => {
      expect(await gateKeeper.isAdmin(adminRoleId, newOwner), `${newOwner} should be root admin`).to.equal(false);
      expect(await gateKeeper.isAssigned(defaultAdminRoleId, newOwner), `${newOwner} should be root admin`).to.equal(false);
      let assigneesCount = await gateKeeper.getAssigneesCount(defaultAdminRoleId);
      expect(assigneesCount.toString(), `${assigneesCount} Should be 1 as only the owner has default admin role`).to.equal('1');
      let assignee = await gateKeeper.getAssigneeAt(defaultAdminRoleId, assigneesCount - 1);
      expect(assignee, `${assignee} Should be equal to the owner , which is ${owner}`).to.equal(owner);
      // add new owner
      assignFirstAdminTrans = await gateKeeper.addAssignment(defaultAdminRoleId, newOwner, { from: owner });
      // check new state
      assigneesCount = await gateKeeper.getAssigneesCount(defaultAdminRoleId);
      expect(assigneesCount.toString(), `${assigneesCount} Should be 2 as new owner added`).to.equal('2');
      assignee = await gateKeeper.getAssigneeAt(defaultAdminRoleId, assigneesCount - 1);
      expect(assignee, `${assignee} Should be equal to the owner , which is ${newOwner}`).to.equal(newOwner);
      // newOwner becomes admin of other roles
      expect(await gateKeeper.isAdmin(adminRoleId, newOwner), `${newOwner} should be root admin`).to.equal(true);
      expect(await gateKeeper.isAssigned(defaultAdminRoleId, newOwner), `${newOwner} should be root admin`).to.equal(true);
    })

  });

  describe("Test circuit-breaker", () => {
    it("Initiallty contract must be active", async () => {
      expect(await gateKeeper.isContractActive(), `Contract must be initially active`).to.equal(true);
    });

    it("Only root admin can stop/start the contract", async () => {
      await gateKeeper.addRole(adminRoleId, defaultAdminRoleId, { from: owner });
      await gateKeeper.addAssignment(adminRoleId, admins[0], { from: owner });
      expect(await gateKeeper.isContractActive(), `Contract must be initially active`).to.equal(true);
      await expectRevert(gateKeeper.switchContractOff({ from: admins[0] }), 'Restricted to root admins.');
      let trans = await gateKeeper.switchContractOff({ from: owner })
      expectEvent(trans, 'ContractOff', { rootAdmin: owner });
      expect(await gateKeeper.isContractActive(), `Contract must be stopped`).to.equal(false);
      await expectRevert(gateKeeper.switchContractOn({ from: admins[0] }), 'Restricted to root admins.');
      trans = await gateKeeper.switchContractOn({ from: owner })
      expectEvent(trans, 'ContractOn', { rootAdmin: owner });
      expect(await gateKeeper.isContractActive(), `Contract must be active`).to.equal(true);
    });

    it("Some functionalities not accessible when the contract is stopped", async () => {
      await gateKeeper.switchContractOff({ from: owner });

      await expectRevert(gateKeeper.addRole(adminRoleId, defaultAdminRoleId, { from: owner }), 'Contract is currently suspended.');
      await expectRevert(gateKeeper.addAssignment(adminRoleId, admins[0], { from: owner }), 'Contract is currently suspended.');
      await expectRevert(gateKeeper.removeAssignment(adminRoleId, admins[0], { from: owner }), 'Contract is currently suspended.');
      await expectRevert(gateKeeper.renounceAdmin(farmerRoleId, { from: admins[0] }), 'Contract is currently suspended.');

      await gateKeeper.switchContractOn({ from: owner });
      // contract on, functionalities are back
      await gateKeeper.addRole(adminRoleId, defaultAdminRoleId, { from: owner });
      await gateKeeper.addAssignment(adminRoleId, admins[0], { from: owner });
      await gateKeeper.addAssignment(adminRoleId, admins[1], { from: owner });
      await gateKeeper.addRole(farmerRoleId, adminRoleId, { from: admins[0] });
      await gateKeeper.removeAssignment(adminRoleId, admins[0], { from: owner });
      await gateKeeper.renounceAdmin(farmerRoleId, { from: admins[1] })

    });

  });

});
