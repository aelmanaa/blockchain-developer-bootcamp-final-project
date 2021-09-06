# Project idea

## DAPP crop insurance

Crop insurance is an insurance purchased by farmers to protect against the loss of their crops due to natural disasters (drought, flood, hail..) [Ref](https://en.wikipedia.org/wiki/Crop_insurance).

In this project, we are going to build a simplified DAPP where the insurance policy is materialized in a smart contract.  For the sake of simplicity , we are going to take many hypotesis

## Hypothesis

- The insurance premium is paid for every agricultural cycle
- DAPP used to insure 1 commodity : Wheat
- DAPP used to insure 1 kind of disaster: Drought . We will use the following [Classification](https://droughtmonitor.unl.edu/About/AbouttheData/DroughtClassification.aspx). Insurance is released only if the severity is D2( Severe drought) , D3(Extreme drought) or D4(Exceptional drought). Drought severity for a specific region and a specific agricultural cycle is regularly provided by Oracles. If severity is D2 , D3 or D4 then impacted farms are paid 2.5 the premium value
- Insurance company has to stake enough ETH for every agricultural cycle in order to ensure that there will be aways enough balance in case there are drought in every region. If there are not enough ETH staked in the contract then onboarding of new farmers are refused 
- Smart contract locks staked ETH and insurance company can takes back its ETH only once the cycle has finished. the remaning ETH will be calculated as follow: Initiality staked ETH - Sum of released insurance - Sum of oracle payouts
- Every oracle is paid 0.01 ETH for its work
- As yield data is not available, insurance company is not able to vet and underwrite wheat accurately. The insurance company asks a premium price of 40 US$/HA (1 hectare = 2,47105 Acres). How the premium was calculated is out of scope of this project
- Farms will be represented by lattitude & longitude coordinates, their region and their size in HA . Hence the premium is proportionate to the size of the farm
- There are 3major regions "RegA" , "RegB" & "RegC"
- KYC of farmers is out of scope
- Governments will participate 50 % of the premium. In fact, Governments are incentivized to transfer risk of natural disasters to private sector (insurance company)
- Farmers are able to interact with the DAPP and protect their identity (private key). In reality , identity protection seems very unlikely as it might be very technical for the farmer so we can foresee several modes of payment in the DAPP (e.g.: ETH or Fiat through wire transfer): In case payment of premium is in Fiat then the insurance in case of disaster will be released via wire transfer. As the project deadline is short, I will focus on ETH payment and maybe dig into the latter case if I've got enough time


## Actors & roles
- Farmers: register himself/herself , providing all the needed data (farm data) and pays 50% of the premium which is calculated by the smart contract
- Government employees (from agriculture department): Approves farmer registration and pays the 50% remaining premium
- Insurance admin: final approval of farmer registration. The insurance admin also registers government employees and oracles
- Oracles: Regularly update Drought severity for every region

## Objectives
Insurance policies still rely on government and insurance company collaboration , however crop insurance DAPPs can have the following advantages:
- Insurance policy is locked within the smart contract. Hence there are no exceptions
- Insurance company cannot default as ETH are staked within the smart contract
- Full transparency. Both  a government employee and an insurance company admin validate information provided by the farmer during his/her onboarding and approval transaction is perform within the blockchain 

