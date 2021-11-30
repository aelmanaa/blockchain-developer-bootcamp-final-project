# Project idea

## DAPP crop insurance

Crop insurance is an insurance purchased by farmers to protect against the loss of their crops due to natural disasters (drought, flood, hail..) [Ref](https://en.wikipedia.org/wiki/Crop_insurance).

In this project, we are going to build a simplified DAPP where the insurance policy is materialized in a smart contract. For the sake of simplicity , we are going to take many hypotesis

## Hypothesis

- The insurance premium is paid for every agricultural cycle. For simplification, an agricultural cycle(aka season) is simple a year (e.g.: 2021)
- DAPP used to insure 1 commodity : Wheat
- DAPP used to insure 1 kind of disaster: Drought
- We wonsider There are several regions. Hence, a Drought severity will be calculated for a combination of season and region. For flexibility, Region will be provided as bytes32 to our smart contracts (which can be calculated as keccak256 hash for any input data)
- a farmer can have several farms in different regions. Hence , every farm is identified by a farmID. An insurance contract is uniquely identified the following combination:
  - Season
  - Region
  - FarmID
- We will use the following [Classification](https://droughtmonitor.unl.edu/About/AbouttheData/DroughtClassification.aspx). Insurance is released only if the severity is D1(Moderate Drought) , D2( Severe drought) , D3(Extreme drought) or D4(Exceptional drought). Drought severity for a specific region and a specific agricultural cycle is regularly provided by Oracles. When a season is open, oracles are elligible to submit a severity for each region. an Oracle cannot submit anymore if a season is closed
- Every oracle is paid 0.5 ETH for its work
- Once a season is closed, By region Severity is aggregated as follow:
  - If number of submissions which are D1 or D0 > 50% of all submissions --> Severity is the one which got the maximum number of submissions (D1 or D0). In case there is an equality then Severity = D1
  - Else, Severity is the one which got the maximum number of submissions (D4 or D3 or D2). In case there is an equality, the worst Severity wins (e.g.: if nD4 = nD3 then Severity = D4)
  - Examples:
    - [D3,D4,D2,D2,D3,D4,D1,D1,D1,D1] ==> 6/10 have D2,D3,D4 ==> equality between nD4,nD2, nD3 so answer aggregate should be D4
    - [D0,D1,D1,D0,D1,D3,D2,D2,D3,D4] ==> 5/10 have D2,D3,D4 ==> equality between nD3, nD2 so aggregate should be D3
    - [D0,D0,D1,D0,D1,D1,D2,D2,D3,D4] ==> 6/10 have D0,D1 ==> equality between nD1, nD0 so aggregate should be D1
- Aggregation of severity can only be calculated once the season is closed. Aggregation of severity for a specific season,region is triggered by keepers
- Keepers are paid 0.1 ETH for opening/closing seasons and for triggering the aggregation of severities.
- As yield data is not available, insurance company is not able to vet and underwrite wheat accurately. The insurance company asks a premium price of 0.15 ETH/HA (1 hectare = 2,47105 Acres). How the premium was calculated is out of scope of this project
- KYC of farmers is out of scope
- Governments will participate 50 % of the premium. In fact, Governments are incentivized to transfer risk of natural disasters to private sector (insurance company)
- Compensation is calculated as follow:
  - D0 doesn't give any compensation
  - D1 gives 0.5 times the premium
  - D2 gives 1 times the premium
  - D3 gives 2 times the premium
  - D4 gives 2.5 times the premium
- Compensation calculation is triggered by keepers offchain. Keepers are paid 0.01 ETH each time a compensation is calculated
- Insurance company has to stake enough ETH for every agricultural cycle in order to ensure that there will be always enough balance to compensate farmers in case there are drought. If there are not enough ETH staked in the contract then onboarding of new farmers are refused
- Smart contract locks staked ETH and insurance company can takes back its ETH only if there is enough liquidity to compensate all farmers
- Farmers are able to interact with the DAPP and protect their identity (private key). In reality , identity protection seems very unlikely as it might be very technical for the farmer so we can foresee several modes of payment in the DAPP (e.g.: ETH or Fiat through wire transfer): In case payment of premium is in Fiat then the insurance in case of disaster will be released via wire transfer. For simplicity sake, I will focus on ETH payment and maybe dig into the latter case if I've got enough time

## Actors & roles

- Farmers: register an insurance contract (season , region , farmID) , providing all the needed data (farm data) and pays 50% of the premium which is calculated by the smart contract
- Government employees (from agriculture department): Approves an insurance contract registration and pays the 50% remaining premium
- Insurance: final approval of insurance contract
- Oracles: Regularly update Drought severity for every region
- Keepers: their role is to trigger some functions under certain conditions (e.g.: declare a season as open, close it , trigger aggregation of oracles answers, trigger calculation of compensation..)

## Objectives

Insurance policies still rely on government and insurance company collaboration , however crop insurance DAPPs can have the following advantages:

- Insurance policy is defined within the smart contract. Hence there are no exceptions
- Insurance company cannot default as ETH are staked within the smart contract
- Full transparency. Both a government employee and an insurance company admin validate information provided by the farmer during his/her onboarding and approval transaction is perform within the blockchain

# Documentation

## [Diagrams & Design patterns](./design_pattern_decisions.md)

## [Avoid common attacks](./avoiding_common_attacks.md)

# ScreenCasts

## Project Idea [link](https://www.loom.com/share/82f4935f03da4797a9b94788abcb60c2)

## Diagrams [link](https://www.loom.com/share/aef0d278999748668b7fa4a810520dc2)

## Project structure [link](https://www.loom.com/share/b20f64707d5a4c81b86f95359aa0fa61)

## Demo [link](https://www.loom.com/share/3b3ed23b3bb64c28bc621164cab19a3b)

# Run the application

## Prerequisites

- Metamask. Recommended to use a test profile (check the following [Link](https://genobank.io/create-metamask-identity)) in order to not "pollute" your main metamask account
- Nvm (node package manager) : 0.38.0 can be installed in [here](https://github.com/nvm-sh/nvm)
- Node: v12.22.5. Use the folloing command to switch to the right node version `nvm use lts/erbium`
- Npm: v8.0.0
- Truffle: v5.4.11
- Ganache-cli: v6.12.2 or Ganache desktop. make sure it runs on port `8545`. Also make sure to have more than 10 accounts. You can start ganache-cli with the following command: `ganache-cli -a 50 -e 10000`

## Project structure

This repository contains:

- Smart Contract code in Solidity (using Truffle) in "contracts" folder
- Unit tests (using mocha and truffle) in "test" folder
- Truffle migration scripts in "migrations" folder
- Truffle scripts in "scripts" folder. There are 2 scripts:
  - "roles.js": used to setup access controles for different actors
  - "fund.js": used to credit contracts and accounts with ETH
- Single Paged Application (SPA) react-redux based in "client" folder
  \*"truffle-config.js": configuration of truffle. In case you want to deploy the DAPP in a public testnet, please make sure to have a ".env" file where you will setup the mnemonic (which is the same as the one used in your Metamask) and Infura key

## Install

To install, download or clone the repo, then:

- `npm install`
- `truffle compile` to make sure everything compiles
- `truffle migrate` . If you would like to deploy on a public testnet then execute the command `truffle migrate --network <network-name>` where "network-name" can be found under "networks" in "truffle-config.js"
- Once your contracts deployed. Run the following scripts:
  - `truffle exec scripts/roles.js` (add the option `--network <network-name>` if you are working on a public testnet)
  - `truffle exec scripts/fund.js` (add the option `--network <network-name>` if you are working on a public testnet)

## Test the contracts

You can run the tests by executing the following commannd in the root directory of the project `truffle test`

You can verify that all the tests run succesfully:

![Tests Results](./img/test-results.JPG)

Remark: there is also a gas reporter which provides some insights regarding the gas usage of the different functions

![Gas usage](./img/gas-usage.JPG)

## Serve the frontend locally

In order to test the react-redux frontend locally. Please follow these steps:

- `cd client`
- `npm install`
- `npm start`. It will serve automatically the frontend to `http://localhost:3000`

![Local frontend](./img/local-frontend.JPG)

- make sure that your metamask is connected to the right network (localhost:8085 for local ganache or select the right network)

![Metamask local](./img/metamask-local.JPG)

# Dapp hosted on Fleek 

the react-redux Single Page Application is also deployed on [Fleek](https://fleek.co/hosting/) which hosts the frontend on IPFS. It is accessible [here](https://wandering-art-7196.on.fleek.co/)

:warning: **Only Rinkeby is supported for now** . In case you would like to test it , please open an issue in the repo with the list of your accounts and I'll grant you the roles.

Once you open the link , you will find the history of interactions with the contracts

![Dapp rinkeby](./img/dapp-rinkeby.JPG)

Also one can verify rinkeby etherscan for the history of transactions:

* [oracle core contract](https://rinkeby.etherscan.io/address/0xB662AE59DFC89263F0d4cF9df476653a3A6AdeF1)
* [main insurance cotract](https://rinkeby.etherscan.io/address/0x7817bEE55EbC2c223a550bc7477cDA83a67A460A)
* [gate keeper for access controls](https://rinkeby.etherscan.io/address/0x2d1c1b0d2bc62cc98977389dba2a767a40b1b04f)
