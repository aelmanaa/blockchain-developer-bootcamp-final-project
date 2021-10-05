const OracleCore = artifacts.require("OracleCore");
const Gatekeeper = artifacts.require("GateKeeper");
const Dummy = artifacts.require("Dummy");
const Escrow = require("@openzeppelin/contracts/build/contracts/Escrow.json");


const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const { ROLES_CONST, addBigNumbers, isEventFound } = require("./helper");
const {
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

contract("GateKeeper", async (accounts) => {
    const owner = accounts[0];
    const admin = accounts[1];
    const insurer = accounts[2];
    const keepers = accounts.slice(3, 5);
    let oracleCore, gateKeeper, escrow;
    let defaultAdminRoleId;
    let season = '2021';

    beforeEach(async () => {
        oracleCore = await OracleCore.deployed();
        gateKeeper = await Gatekeeper.at(await oracleCore.getGateKeeper());
        escrow = await new web3.eth.Contract(
            Escrow.abi,
            await oracleCore.getEscrow(),
        );
        defaultAdminRoleId = await gateKeeper.DEFAULT_ADMIN_ROLE();
        await gateKeeper.addRole(ROLES_CONST.ADMIN_ROLE, defaultAdminRoleId, { from: owner });
        await gateKeeper.addAssignment(ROLES_CONST.ADMIN_ROLE, admin);
        await gateKeeper.addRole(ROLES_CONST.INSURER_ROLE, ROLES_CONST.ADMIN_ROLE, { from: admin });
        await gateKeeper.addRole(ROLES_CONST.KEEPER_ROLE, ROLES_CONST.ADMIN_ROLE, { from: admin });
        await gateKeeper.addAssignment(ROLES_CONST.INSURER_ROLE, insurer, { from: admin });
        await gateKeeper.addAssignment(ROLES_CONST.KEEPER_ROLE, keepers[0], { from: admin });
        await gateKeeper.addAssignment(ROLES_CONST.KEEPER_ROLE, keepers[1], { from: admin });
    });


    describe("Check initial state", () => {
        it("Can change gateKeeper", async () => {
            let oldGateKeeper = await oracleCore.getGateKeeper();
            gateKeeper = await Gatekeeper.new();
            let trans = await oracleCore.setGateKeeper(gateKeeper.address, { from: owner });
            expectEvent(trans, 'NewGateKeeper', { oldGateKeeper: oldGateKeeper, newGateKeeper: gateKeeper.address });
        });

        it("Cannot change gateKeeper if not owner", async () => {
            let gateKeeper = await Gatekeeper.new();
            await expectRevert(oracleCore.setGateKeeper(gateKeeper.address, { from: accounts[1] }), "Ownable: caller is not the owner");
        });

        it("Cannot change gateKeeper if not implement right interface", async () => {
            let gateKeeper = await Dummy.new();
            await expectRevert(oracleCore.setGateKeeper(gateKeeper.address, { from: owner }), `Provided gatekeeper address ${gateKeeper.address.toLowerCase()} does not implement IGateKeeper interface which interfaceID is ${await oracleCore.getGateKeeperSupportedInterface()}`);
        });

        it("Initial balance is 0", async () => {
            let balance = await oracleCore.getBalance();
            expect(balance.toString(), `Initial balance ${balance} is not 0`).to.equal('0');
        });

        it("Keeper cannot open season if not enough ETH in the contract", async () => {
            await expectRevert(oracleCore.openSeason(season, { from: keepers[0] }), "Not enough balance in the contract");
        });

        it("Only an insurer can provide liquidity", async () => {
            await expectRevert((web3.eth.sendTransaction({
                from: owner,
                to: oracleCore.address,
                value: 1
            })), "Restricted to insurers.");

            await web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: 1
            }); // success
        });


        it("Only a keeper can open a season", async () => {
            await expectRevert(oracleCore.openSeason(season, { from: insurer }), "Restricted to keepers.");
        });

        it("Only a keeper can close a season", async () => {
            await expectRevert(oracleCore.closeSeason(season, { from: insurer }), "Restricted to keepers.");
        });

    });


    describe("Check keepers", () => {
        let amount = web3.utils.toWei('10', 'ether');
        let balance, expectedBalance, keeperFee, trans;


        beforeEach(async () => {
            expectedBalance = addBigNumbers(amount, await oracleCore.getBalance());
            trans = await (web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: amount
            }));
            keeperFee = await oracleCore.KEEPER_FEE();

        });
        it("Balance and events are correct", async () => {
            balance = await oracleCore.getBalance();
            expect(balance.toString(), `Balance ${balance} is not ${expectedBalance}`).to.equal(expectedBalance.toString());
            let events = await oracleCore.getPastEvents('ReceivedETH', { fromBlock: 'latest' });
            expect(isEventFound(events, 'ReceivedETH', { value: amount, balance: balance.toString(), sender: insurer }), `ReceivedETH with expected args not found in ${JSON.stringify(events)}`).to.equal(true);
        });

        it("Keeper can open season. Also, keeper balance is correct", async () => {
            balance = await oracleCore.depositsOf(keepers[0]);
            expect(balance.toString(), `Balance ${balance} is not 0`).to.equal('0');
            trans = await oracleCore.openSeason(season, { from: keepers[0] });
            expectEvent(trans, 'SeasonOpen', { season: season, keeper: keepers[0] });

            // keeper balance correct
            expectedBalance = addBigNumbers(balance, keeperFee);
            balance = await oracleCore.depositsOf(keepers[0]);
            expect(balance.toString(), `Balance ${balance} is not ${expectedBalance}`).to.equal(expectedBalance.toString());
            let events = await escrow.getPastEvents('Deposited', { fromBlock: 'latest' });
            expect(isEventFound(events, 'Deposited', { payee: keepers[0], weiAmount: keeperFee.toString() }), `Deposited with expected args not found in ${JSON.stringify(events)}`).to.equal(true);
        });

        it("Keeper can close season. Also, keeper balance is correct", async () => {
            await oracleCore.openSeason(season, { from: keepers[0] });

            balance = await oracleCore.depositsOf(keepers[0]);
            await oracleCore.closeSeason(season, { from: keepers[0] });

        });

    });

    describe("Check oracles", () => {
        let amount = web3.utils.toWei('10', 'ether');
        let balance, expectedBalance, keeperFee, trans;

        beforeEach(async () => {
            expectedBalance = addBigNumbers(amount, await oracleCore.getBalance());
            trans = await (web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: amount
            }));
            keeperFee = await oracleCore.KEEPER_FEE();

        });

        it("Only oracle can submit")

        it("Season must be opened in order to submit")

        it("Enough balance in the contract in order to submit")

        it("Severity must be correct")

        it("Oracle submit: balance is correct, event correct, submission data correct")

        it("Oracle cannot submit twice")

        it("Oracle submit: multiple submissions, data correct")

    });

});