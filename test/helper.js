const BN = require("bn.js");
const Web3 = require("web3");

const web3 = new Web3();

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

const ROLES_CONST = {
    ADMIN_ROLE: keccak256("INSURANCE_DAPP_ADMIN_ROLE"),
    INSURER_ROLE: keccak256("INSURER_ROLE"),
    FARMER_ROLE: keccak256("FARMER_ROLE"),
    ORACLE_ROLE: keccak256("ORACLE_ROLE"),
    KEEPER_ROLE: keccak256("KEEPER_ROLE")
}

module.exports = {
    keccak256,
    interfaceId,
    isEventFound,
    ROLES_CONST
}