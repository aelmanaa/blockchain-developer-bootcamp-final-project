const BN = require("bn.js");
const Web3 = require("web3");

const web3 = new Web3();
const bn = web3.utils.BN;


/**
 * a + b
 * @param {BN} a 
 * @param {BN} b 
 * @returns {BN} Big number
 */
const addBigNumbers = (a, b) => (new bn(a)).add(new bn(b));

/**
 * a - b
 * @param {BN} a 
 * @param {BN} b 
 * @returns {BN} Big number
 */
 const subBigNumbers = (a, b) => (new bn(a)).sub(new bn(b));

/**
 * a * b
 * @param {BN} a 
 * @param {BN} b 
 * @returns {BN} Big number
 */
 const multiplyBigNumbers = (a, b) => (new bn(a)).mul(new bn(b));

 /**
 * a / b
 * @param {BN} a 
 * @param {BN} b 
 * @returns {BN} Big number
 */
  const divideBigNumbers = (a, b) => (new bn(a)).div(new bn(b));

/**
 * 
 * @param {string} str to be hashed
 * @returns {string} keccak256 digest of str
 */
const keccak256 = str => web3.utils.keccak256(str);

/**
 * 
 * @param {array} interfaceABI JSON abi of a given interface is an array of objects 
 * @returns {string} interfaceId which is hexadecimal calculated as binary(XOR) operator of all function selectors
 */
const interfaceId = interfaceABI => {

    let res = '0x' + interfaceABI.filter(x => x.type === "function").map(x => web3.eth.abi.encodeFunctionSignature(x).replace("0x", "")).reduce((prev, current) => {
        let a = new BN(prev, 16);
        let b = new BN(current, 16);
        return a.xor(b).toString(16);
    });

    return res;
};

/**
 * 
 * @param {array} eventArray Array of object events
 * @param {string} eventName Name of the event (case sensitive)
 * @param {Object} argObject Optional. Use to finetune the checks and find out if event's args are as expected
 * @returns {boolean}
 */
const isEventFound = (eventArray, eventName, argObject) => {

    let filteredArray = eventArray.filter(element => {
        if (element.event === eventName) {
            let isAllArgsFound = true;
            Object.keys(argObject).forEach(key => {
                if (element.returnValues[key] !== argObject[key]) {
                    isAllArgsFound = false;
                }
            });
            return isAllArgsFound;
        } else {
            return false;
        }
    });

    return filteredArray.length > 0;

};

const CONST = {
    EMPTY_BYTES32: "0x0000000000000000000000000000000000000000000000000000000000000000",
    EMPTY_ADDRESS: "0x0000000000000000000000000000000000000000"
}

const ROLES_CONST = {
    ADMIN_ROLE: keccak256("INSURANCE_DAPP_ADMIN_ROLE"),
    INSURER_ROLE: keccak256("INSURER_ROLE"),
    GOVERNMENT_ROLE: keccak256("GOVERNMENT_ROLE"),
    FARMER_ROLE: keccak256("FARMER_ROLE"),
    ORACLE_ROLE: keccak256("ORACLE_ROLE"),
    KEEPER_ROLE: keccak256("KEEPER_ROLE")
};

const REGIONS_CONST = {
    A: keccak256("RegA"),
    B: keccak256("RegB"),
    C: keccak256("RegC")
};

const FARMS_CONST = {
    1: keccak256("FARM1"),
    2: keccak256("FARM2"),
    3: keccak256("FARM3")
};

const SEVERITY_CONST = {
    D: "0",
    D0: "1",
    D1: "2",
    D2: "3",
    D3: "4",
    D4: "5"
};

const SEASON_CONST = {
    DEFAULT: "0",
    OPEN: "1",
    CLOSED: "2"
};

const CONTRACT_CONST = {
    DEFAULT: "0",
    REGISTERED: "1",
    VALIDATED: "2",
    INSURED: "3",
    CLOSED: "4",
    COMPENSATED: "5"
};


module.exports = {
    addBigNumbers,
    subBigNumbers,
    multiplyBigNumbers,
    divideBigNumbers,
    keccak256,
    interfaceId,
    isEventFound,
    ROLES_CONST,
    REGIONS_CONST,
    SEVERITY_CONST,
    SEASON_CONST,
    FARMS_CONST,
    CONST,
    CONTRACT_CONST
}