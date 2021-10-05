const OracleCore = artifacts.require("OracleCore");
const Gatekeeper = artifacts.require("GateKeeper");
const Dummy = artifacts.require("Dummy");
const Escrow = require("@openzeppelin/contracts/build/contracts/Escrow.json");


const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const { ROLES_CONST, REGIONS_CONST, SEVERITY_CONST, addBigNumbers, isEventFound } = require("./helper");
const {
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

contract("OracleCore", async (accounts) => {
    const owner = accounts[0];
    const admin = accounts[1];
    const insurer = accounts[2];
    const keepers = accounts.slice(3, 5);
    const oracles = accounts.slice(5, 15);
    let oracleCore, gateKeeper, escrow;
    let defaultAdminRoleId;
    let season = '2021';
    let oracleFee, keeperFee;
    let trans;

    beforeEach(async () => {
        gateKeeper = await Gatekeeper.new({ from: owner });
        oracleCore = await OracleCore.new(gateKeeper.address, { from: owner });
        //oracleCore = await OracleCore.deployed();
        //gateKeeper = await Gatekeeper.at(await oracleCore.getGateKeeper());
        escrow = await new web3.eth.Contract(
            Escrow.abi,
            await oracleCore.getEscrow(),
        );
        defaultAdminRoleId = await gateKeeper.DEFAULT_ADMIN_ROLE();
        await gateKeeper.addRole(ROLES_CONST.ADMIN_ROLE, defaultAdminRoleId, { from: owner });
        await gateKeeper.addAssignment(ROLES_CONST.ADMIN_ROLE, admin);
        await gateKeeper.addRole(ROLES_CONST.INSURER_ROLE, ROLES_CONST.ADMIN_ROLE, { from: admin });
        await gateKeeper.addRole(ROLES_CONST.KEEPER_ROLE, ROLES_CONST.ADMIN_ROLE, { from: admin });
        await gateKeeper.addRole(ROLES_CONST.ORACLE_ROLE, ROLES_CONST.ADMIN_ROLE, { from: admin });
        await gateKeeper.addAssignment(ROLES_CONST.INSURER_ROLE, insurer, { from: admin });
        await gateKeeper.addAssignment(ROLES_CONST.KEEPER_ROLE, keepers[0], { from: admin });
        await gateKeeper.addAssignment(ROLES_CONST.KEEPER_ROLE, keepers[1], { from: admin });
        for (let oracle of oracles) {
            await gateKeeper.addAssignment(ROLES_CONST.ORACLE_ROLE, oracle, { from: admin });
        }
        oracleFee = await oracleCore.ORACLE_FEE();
        keeperFee = await oracleCore.KEEPER_FEE();
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

        it("Default severity when the severity is not aggregated yet", async () => {
            let regionSeverity = await oracleCore.getRegionSeverity(season, REGIONS_CONST.A);
            expect(regionSeverity.toString(), `Default severity ${regionSeverity} is not ${SEVERITY_CONST.D}`).to.equal(SEVERITY_CONST.D.toString());
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

    });


    describe("Check keepers", () => {
        let amount = web3.utils.toWei('10', 'ether');
        let balance, expectedBalance;


        beforeEach(async () => {
            expectedBalance = addBigNumbers(amount, await oracleCore.getBalance());
            trans = await (web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: amount
            }));

        });

        it("Only a keeper can open a season", async () => {
            await expectRevert(oracleCore.openSeason(season, { from: insurer }), "Restricted to keepers.");
        });

        it("Only a keeper can close a season", async () => {
            await expectRevert(oracleCore.closeSeason(season, { from: insurer }), "Restricted to keepers.");
        });

        it("Balance and events are correct", async () => {
            balance = await oracleCore.getBalance();
            expect(balance.toString(), `Balance ${balance} is not ${expectedBalance}`).to.equal(expectedBalance.toString());
            let events = await oracleCore.getPastEvents('ReceivedETH', { fromBlock: 'latest' });
            expect(isEventFound(events, 'ReceivedETH', { value: amount, balance: balance.toString(), sender: insurer }), `ReceivedETH with expected args not found in ${JSON.stringify(events)}`).to.equal(true);
        });

        it("Keeper can open/close season. Also, keeper balance is correct", async () => {
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

            // close season and check balance and events
            balance = await oracleCore.depositsOf(keepers[0]);
            expectedBalance = addBigNumbers(balance, keeperFee);
            trans = await oracleCore.closeSeason(season, { from: keepers[0] });
            expectEvent(trans, 'SeasonClosed', { season: season, keeper: keepers[0] });
            events = await escrow.getPastEvents('Deposited', { fromBlock: 'latest' });
            expect(isEventFound(events, 'Deposited', { payee: keepers[0], weiAmount: keeperFee.toString() }), `Deposited with expected args not found in ${JSON.stringify(events)}`).to.equal(true);
            balance = await oracleCore.depositsOf(keepers[0]);
            expect(balance.toString(), `Balance ${balance} is not ${expectedBalance}`).to.equal(expectedBalance.toString());
        });

    });

    describe("Check oracles", () => {
        it("Only oracle can submit", async () => {
            await expectRevert(oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D0, { from: keepers[0] }), "Restricted to oracles.");
        });

        it("Season must be open in order to submit", async () => {
            await expectRevert(oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D0, { from: oracles[0] }), "Season must be open.");
        });

        it("Enough balance in the contract in order to submit", async () => {
            await (web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: keeperFee
            }));
            await oracleCore.openSeason(season, { from: keepers[0] });
            await expectRevert(oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D0, { from: oracles[0] }), "Not enough balance in the contract");


        });

        it("Severity must be correct", async () => {
            await web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: addBigNumbers(keeperFee, oracleFee)
            });
            await oracleCore.openSeason(season, { from: keepers[0] });
            await expectRevert(oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D, { from: oracles[0] }), "Severity not valid");
            await expectRevert.unspecified(oracleCore.submit(season, REGIONS_CONST.A, "6", { from: oracles[0] }));
        });


        it("Oracle submit: balance is correct, event correct, submission data correct", async () => {
            await web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: addBigNumbers(keeperFee, oracleFee)
            });
            balance = await oracleCore.depositsOf(oracles[0]);
            expectedBalance = addBigNumbers(balance, oracleFee);
            await oracleCore.openSeason(season, { from: keepers[0] });
            trans = await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D3, { from: oracles[0] });
            expectEvent(trans, 'SeveritySubmitted', { season: season, region: REGIONS_CONST.A, severity: SEVERITY_CONST.D3, oracle: oracles[0] });
            let events = await escrow.getPastEvents('Deposited', { fromBlock: 'latest' });
            expect(isEventFound(events, 'Deposited', { payee: oracles[0], weiAmount: oracleFee.toString() }), `Deposited with expected args not found in ${JSON.stringify(events)}`).to.equal(true);

            balance = await oracleCore.depositsOf(oracles[0]);
            expect(balance.toString(), `Balance ${balance} is not ${expectedBalance}`).to.equal(expectedBalance.toString());

        });


        it("Oracle cannot submit twice", async () => {
            await web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: addBigNumbers(keeperFee, oracleFee)
            });
            await oracleCore.openSeason(season, { from: keepers[0] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D3, { from: oracles[0] });
            await web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: oracleFee
            });
            await expectRevert(oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D3, { from: oracles[0] }), "Oracle has already submitted for this season and region");
        });

        it("Oracle cannot submit once season closed", async () => {
            await web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: addBigNumbers(keeperFee, oracleFee)
            });
            await oracleCore.openSeason(season, { from: keepers[0] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D3, { from: oracles[0] });
            await web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: oracleFee
            });
            await web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: addBigNumbers(keeperFee, oracleFee)
            });
            await oracleCore.closeSeason(season, { from: keepers[0] });
            await expectRevert(oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D0, { from: oracles[1] }), "Season must be open.");
        });

        it("Oracle submit: multiple submissions, data correct", async () => {
            let secondSeason = "2022";
            await web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: web3.utils.toWei('10', 'ether')
            });
            await oracleCore.openSeason(season, { from: keepers[0] });
            await oracleCore.openSeason(secondSeason, { from: keepers[1] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D3, { from: oracles[0] });
            await oracleCore.submit(season, REGIONS_CONST.B, SEVERITY_CONST.D4, { from: oracles[0] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D3, { from: oracles[1] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D0, { from: oracles[2] });
            await oracleCore.submit(secondSeason, REGIONS_CONST.A, SEVERITY_CONST.D3, { from: oracles[3] });

            // check submissions
            expect((await oracleCore.getSubmission(season, REGIONS_CONST.A, oracles[0])).toString(), `Severity not correct`).to.equal(SEVERITY_CONST.D3);
            expect((await oracleCore.getSubmission(season, REGIONS_CONST.B, oracles[0])).toString(), `Severity not correct`).to.equal(SEVERITY_CONST.D4);
            expect((await oracleCore.getSubmission(season, REGIONS_CONST.A, oracles[1])).toString(), `Severity not correct`).to.equal(SEVERITY_CONST.D3);
            expect((await oracleCore.getSubmission(season, REGIONS_CONST.A, oracles[2])).toString(), `Severity not correct`).to.equal(SEVERITY_CONST.D0);
            expect((await oracleCore.getSubmission(secondSeason, REGIONS_CONST.A, oracles[3])).toString(), `Severity not correct`).to.equal(SEVERITY_CONST.D3);

            // check number of submissions by severity
            expect((await oracleCore.getSubmissionNumberForSeverity(season, REGIONS_CONST.A, SEVERITY_CONST.D3)).toString(), `Number of submissions for combination not correct`).to.equal('2');
            expect((await oracleCore.getSubmissionNumberForSeverity(season, REGIONS_CONST.A, SEVERITY_CONST.D0)).toString(), `Number of submissions for combination not correct`).to.equal('1');
            expect((await oracleCore.getSubmissionNumberForSeverity(season, REGIONS_CONST.A, SEVERITY_CONST.D1)).toString(), `Number of submissions for combination not correct`).to.equal('0');
            expect((await oracleCore.getSubmissionNumberForSeverity(secondSeason, REGIONS_CONST.A, SEVERITY_CONST.D3)).toString(), `Number of submissions for combination not correct`).to.equal('1');
            expect((await oracleCore.getSubmissionNumberForSeverity(season, REGIONS_CONST.B, SEVERITY_CONST.D4)).toString(), `Number of submissions for combination not correct`).to.equal('1');

            // check total answers
            expect((await oracleCore.getSubmissionTotal(season, REGIONS_CONST.A)).toString(), `Total submission not correct`).to.equal('3');
            expect((await oracleCore.getSubmissionTotal(season, REGIONS_CONST.B)).toString(), `Total submission not correct`).to.equal('1');
            expect((await oracleCore.getSubmissionTotal(secondSeason, REGIONS_CONST.A)).toString(), `Total submission not correct`).to.equal('1');
            expect((await oracleCore.getSubmissionTotal(secondSeason, REGIONS_CONST.B)).toString(), `Total submission not correct`).to.equal('0');
        });


    });


    describe("Check aggegation", () => {

        it("Only keeper can trigger aggregation", async () => {
            await expectRevert(oracleCore.aggregate(season, REGIONS_CONST.A, { from: oracles[0] }), "Restricted to keepers.");
        });

        it("Season must be closed", async () => {
            trans = await (web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: keeperFee
            }));

            await oracleCore.openSeason(season, { from: keepers[0] });
            await expectRevert(oracleCore.aggregate(season, REGIONS_CONST.A, { from: keepers[0] }), "Season must be closed.");
        });

        it("Enough balance in the contract", async () => {
            trans = await (web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: addBigNumbers(keeperFee, keeperFee)
            }));

            await oracleCore.openSeason(season, { from: keepers[0] });
            await oracleCore.closeSeason(season, { from: keepers[0] });
            await expectRevert(oracleCore.aggregate(season, REGIONS_CONST.A, { from: keepers[0] }), "Not enough balance in the contract");

        });

        it("Cannot trigger aggregation twice", async () => {
            await (web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: web3.utils.toWei('10', 'ether')
            }));
            await oracleCore.openSeason(season, { from: keepers[0] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D3, { from: oracles[0] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D2, { from: oracles[1] });
            await oracleCore.closeSeason(season, { from: keepers[1] });
            await oracleCore.aggregate(season, REGIONS_CONST.A, { from: keepers[0] });
            await expectRevert(oracleCore.aggregate(season, REGIONS_CONST.A, { from: keepers[0] }), "Severity already aggregated");

        })


        it("Check aggregation - 1 ", async () => {
            await (web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: web3.utils.toWei('10', 'ether')
            }));
            await oracleCore.openSeason(season, { from: keepers[0] });
            // receive [D3,D4,D2,D2,D3,D4,D1,D1,D1,D1] ==> 6/10 have D2+D3+D4 ==> max between 3 is D4 so answer aggregate should be D4
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D3, { from: oracles[0] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D4, { from: oracles[1] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D2, { from: oracles[2] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D2, { from: oracles[3] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D3, { from: oracles[4] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D4, { from: oracles[5] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D1, { from: oracles[6] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D1, { from: oracles[7] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D1, { from: oracles[8] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D0, { from: oracles[9] });
            await oracleCore.closeSeason(season, { from: keepers[1] });
            trans = await oracleCore.aggregate(season, REGIONS_CONST.A, { from: keepers[0] });
            expectEvent(trans, 'SeverityAggregated', { season: season, region: REGIONS_CONST.A, severity: SEVERITY_CONST.D4, keeper: keepers[0] });
            expect((await oracleCore.getRegionSeverity(season, REGIONS_CONST.A)).toString(), `Severity not correct`).to.equal(SEVERITY_CONST.D4);
        });

        it("Check aggregation - 2 ", async () => {
            await (web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: web3.utils.toWei('10', 'ether')
            }));
            await oracleCore.openSeason(season, { from: keepers[0] });
            // receive [D0,D1,D1,D0,D1,D3,D2,D2,D3,D4] ==> 5/10 have D2+D3+D4 ==> max between D2+D3+D4 is D3 so answer is D3
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D0, { from: oracles[0] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D1, { from: oracles[1] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D1, { from: oracles[2] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D0, { from: oracles[3] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D1, { from: oracles[4] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D3, { from: oracles[5] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D2, { from: oracles[6] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D2, { from: oracles[7] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D3, { from: oracles[8] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D4, { from: oracles[9] });
            await oracleCore.closeSeason(season, { from: keepers[1] });
            trans = await oracleCore.aggregate(season, REGIONS_CONST.A, { from: keepers[0] });
            expectEvent(trans, 'SeverityAggregated', { season: season, region: REGIONS_CONST.A, severity: SEVERITY_CONST.D3, keeper: keepers[0] });
            expect((await oracleCore.getRegionSeverity(season, REGIONS_CONST.A)).toString(), `Severity not correct`).to.equal(SEVERITY_CONST.D3);


        });

        it("Check aggregation - 3 ", async () => {
            await (web3.eth.sendTransaction({
                from: insurer,
                to: oracleCore.address,
                value: web3.utils.toWei('10', 'ether')
            }));
            await oracleCore.openSeason(season, { from: keepers[0] });
            // receive [D0,D0,D1,D0,D1,D1,D2,D2,D3,D4] ==> 6/10 have D0 ,D1  ==> max between D0,D1 is D1 so answer is D1
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D0, { from: oracles[0] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D0, { from: oracles[1] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D1, { from: oracles[2] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D0, { from: oracles[3] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D1, { from: oracles[4] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D1, { from: oracles[5] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D2, { from: oracles[6] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D2, { from: oracles[7] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D3, { from: oracles[8] });
            await oracleCore.submit(season, REGIONS_CONST.A, SEVERITY_CONST.D4, { from: oracles[9] });
            await oracleCore.closeSeason(season, { from: keepers[1] });
            trans = await oracleCore.aggregate(season, REGIONS_CONST.A, { from: keepers[0] });
            expectEvent(trans, 'SeverityAggregated', { season: season, region: REGIONS_CONST.A, severity: SEVERITY_CONST.D1, keeper: keepers[0] });
            expect((await oracleCore.getRegionSeverity(season, REGIONS_CONST.A)).toString(), `Severity not correct`).to.equal(SEVERITY_CONST.D1);


        });



    });

});