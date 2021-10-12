# Mitigation of common attacks

Smart contract Weakness Classification (SWC) can be found in [SWC registry](https://swcregistry.io/) 

## SWC-101 - Integer Overflow and Underflow

Contracts are compiled with `0.8.9` . Default behaviour of Solidty 0.8 is to throw an error if there are overflow/underflows [source](https://docs.soliditylang.org/en/v0.8.9/types.html#addition-subtraction-and-multiplication)


## SWC-107 - Reentrancy

As shown in [Diagrams & Design patterns](./design_pattern_decisions.md) , `Common.sol` and `OracleFacade.sol` inherits from [Openzeppelin ReentrancyGuard contract](https://docs.openzeppelin.com/contracts/4.x/api/security#ReentrancyGuard) . This makes the modifier `nonReentrant` available and which makes sure that there are no recursive calls to them. `nonReentrant` modifier is applied to all public/external functions which make calls to an external account. For instance, in `Insurance.sol` :

```
function withdrawInsurer(uint256 amount)
        external
        onlyInsurer
        nonReentrant
        minimumCovered
{
    require(
        address(this).balance >= amount,
        "Not enough balance in the contract"
    );
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed.");
    emit WithdrawInsurer(msg.sender, amount, address(this).balance);
}

```

## SWC-115 - Authorization through tx.origin

We always use `msg.sender` for authorization. For instance, we use modifiers to check authorization. In `Common.sol`,we can find a modifier which checks that caller is a *farmer :

```
modifier onlyFarmer() {
    require(
        gatekeeper.isAssigned(FARMER_ROLE, msg.sender),
        "Restricted to farmers."
    );
    _;
}
```
## SWC-128 - DoS With Block Gas Limit

In order to avoid looping over arrays on-chain which could lead to function execution exceeding the block gas limit, looping is done off-chain. For instance, in `Insurance.sol` , `process` function is called by a *keeper . at each call, the function processes only one element of `openContracts` array

## SWC-134 - Message call with hardcoded gas amount

Avoid uing `transfer()` and `send()` functions as they forward fixed aount of 2300gas. Th gas cost of EVM instructions may change after hard forks which can break functions which rely on fixed assumption about gas cost. Hence, whenever ETH has to be sent, `.call.value(..)("")` is used. For instance, in `Insurance.sol` , change is returned to *farmers and *government

```
if (msg.value > fee) {
    (bool success, ) = msg.sender.call{value: msg.value - fee}("");
    require(success, "Transfer failed.");
}
```

## SWC-136 - Unencrypted Private Data On-Chain

Rather than having private information such as: farm lattitude, longitude, owner name..ETc. We just expect to receive farmID(bytes32) , which could be a `keccak256` digest of the concatenation of all of the above information.
Hence our smart contracts do not deal with any private data

