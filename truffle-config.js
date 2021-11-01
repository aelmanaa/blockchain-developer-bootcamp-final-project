const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");

require("dotenv").config();

const infuraKey = process.env.INFURA_API_KEY || "";
const mnemonic = process.env.mnemonic || "";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*",
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider({
          mnemonic: {
            phrase: mnemonic,
          },
          providerOrUrl: `https://rinkeby.infura.io/v3/${infuraKey}`,
          addressIndex: 0,
          numberOfAddresses: 50,
        }),
      network_id: 4, // Rinkeby's id
    },
  },
  mocha: {
    reporter: "eth-gas-reporter",
  },
  compilers: {
    solc: {
      version: "^0.8.9",
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
        },
      },
    },
  },
};
