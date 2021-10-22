// truffle exec scripts/roles.js --network development

const OracleCore = require("../client/src/contracts/OracleCore.json");
const Insurance = require("../client/src/contracts/Insurance.json");

const setup = async () => {
  let accounts = await web3.eth.getAccounts();

  const owner = accounts[0];
  const admin = accounts[1];
  const insurer = accounts[2];

  const networkId = await web3.eth.net.getId();
  const oracleDeployedNetwork = OracleCore.networks[networkId];
  const insuranceDeployedNetwork = Insurance.networks[networkId];

  const oracleContract = new web3.eth.Contract(
    OracleCore.abi,
    oracleDeployedNetwork.address
  );

  const insuranceContract = new web3.eth.Contract(
    Insurance.abi,
    insuranceDeployedNetwork.address
  );

  return {
    owner,
    insurer,
    oracleContract,
    insuranceContract,
  };
};

module.exports = async (callback) => {
  console.log(
    "******************START FUNDING CONTRACTS SCRIPT **********************"
  );

  try {
    const { insurer, oracleContract, insuranceContract } = await setup();
    console.log(oracleContract._address);
    console.log(`FUND oracle contract ${oracleContract._address} `);
    console.log(
      await web3.eth.sendTransaction({
        from: insurer,
        to: oracleContract._address,
        value: web3.utils.toWei("2", "ether"),
      })
    );

    console.log(`FUND insurance contract ${insuranceContract._address} `);

    console.log(
      await web3.eth.sendTransaction({
        from: insurer,
        to: insuranceContract._address,
        value: web3.utils.toWei("2", "ether"),
      })
    );
  } catch (error) {
    console.log(error);
  }
  console.log(
    "******************END FUNDING CONTRACTS SCRIPT **********************"
  );
  callback();
};
