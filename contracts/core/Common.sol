// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "../access/IGateKeeper.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/escrow/Escrow.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title common data model to be shared.
 * @dev Import this contract in different smart contracts which will share the same data model.
 */
abstract contract Common is Ownable, ReentrancyGuard {
    /**
     * @dev Emitted when new gateKeepr setup by `owner`.
     */
    event NewGateKeeper(
        address indexed oldGateKeeper,
        address indexed newGateKeeper
    );

    /**
     * @dev Emitted every time ETH staked in an account.
     */
    event ReceivedETH(uint256 value, uint256 balance, address indexed sender);

    /// @dev 4 Drought severity. the 1st one 'D' is invalid and is used to check for null value
    enum Severity {
        D,
        D0,
        D1,
        D2,
        D3,
        D4
    }

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant ADMIN_ROLE = keccak256("INSURANCE_DAPP_ADMIN_ROLE");
    bytes32 public constant INSURER_ROLE = keccak256("INSURER_ROLE");
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");

    /// @dev used for access control
    IGateKeeper private gatekeeper;

    /// @dev used for escrow to deposit/withdraw ETH
    Escrow private escrow;

    constructor(address _gatekeeper) {
        setGateKeeper(_gatekeeper);
        escrow = new Escrow();
    }

    modifier checkBalance() {
        require(depositsOf(msg.sender) > 0, "Not enough balance");
        _;
    }

    modifier checkContractBalance(uint256 amount) {
        require(getBalance() >= amount, "Not enough balance in the contract");
        _;
    }

    modifier checkGateKeeperInterface(address _gatekeeper) {
        require(
            IERC165(_gatekeeper).supportsInterface(
                type(IGateKeeper).interfaceId
            ),
            string(
                abi.encodePacked(
                    "Provided gatekeeper address ",
                    Strings.toHexString(uint160(_gatekeeper), 20),
                    " does not implement IGateKeeper interface which interfaceID is ",
                    Strings.toHexString(
                        uint32(type(IGateKeeper).interfaceId),
                        4
                    )
                )
            )
        );
        _;
    }

    modifier onlyAdmin() {
        require(
            gatekeeper.isAssigned(ADMIN_ROLE, msg.sender),
            "Restricted to administrators."
        );
        _;
    }

    modifier onlyInsurer() {
        require(
            gatekeeper.isAssigned(INSURER_ROLE, msg.sender),
            "Restricted to insurers."
        );
        _;
    }

    modifier onlyFarmer() {
        require(
            gatekeeper.isAssigned(FARMER_ROLE, msg.sender),
            "Restricted to farmers."
        );
        _;
    }

    modifier onlyOracle() {
        require(
            gatekeeper.isAssigned(ORACLE_ROLE, msg.sender),
            "Restricted to oracles."
        );
        _;
    }

    modifier onlyKeeper() {
        require(
            gatekeeper.isAssigned(KEEPER_ROLE, msg.sender),
            "Restricted to keepers."
        );
        _;
    }

    /**
     * @dev Stores the sent amount as credit to be withdrawn.
     * @param payee The destination address of the funds.
     *
     * @notice call nonReentrant to check against Reentrancy
     */
    function _deposit(address payee, uint256 amount) internal nonReentrant {
        escrow.deposit{value: amount}(payee);
    }

    /**
     * @param payee The payee address
     * @return escrow
     */
    function depositsOf(address payee) public view returns (uint256) {
        return escrow.depositsOf(payee);
    }

    /**
     * @dev retrieve balance of account
     *
     * @return balance
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getEscrow() public view returns (address) {
        return address(escrow);
    }

    function getGateKeeper() public view returns (address) {
        return address(gatekeeper);
    }

    function getGateKeeperSupportedInterface() public pure returns (bytes4) {
        return type(IGateKeeper).interfaceId;
    }

    /**
     * @dev Allow to change dynamically access control contract (GateKeeper)
     *
     * @param _gateKeeper gateKeeper address
     * Requirements:
     * - only owner can change the reference of GateKeeper
     * - ensure that it impelments the right interface
     *
     * @notice call nonReentrant to check against Reentrancy
     */
    function setGateKeeper(address _gateKeeper)
        public
        onlyOwner
        nonReentrant
        checkGateKeeperInterface(_gateKeeper)
    {
        emit NewGateKeeper(address(gatekeeper), _gateKeeper);
        gatekeeper = IGateKeeper(_gateKeeper);
    }

    /**
     * @dev Withdraw accumulated balance for a payee
     * Requirements:
     *
     * - msg.sender must have enough balance in the escrow
     *
     * @notice call nonReentrant to check against Reentrancy
     */
    function withdraw() public nonReentrant checkBalance {
        escrow.withdraw(payable(msg.sender));
    }
}
