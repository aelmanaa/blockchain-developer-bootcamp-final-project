// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./IGateKeeper.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

/**
 * @title Access Control contract
 * @dev Contract module that implements Openzeppelin access control contract
 * {AccessControlEnumerable}. It also implement {IGateKeeper} interface to provide
 * generic functionalities
 *
 * ERC165 `supportsInterface` method is implemented in order to allow the callers to verify
 * that GateKeeper implements {IGateKeeper} interface
 * Roles are referred to by their `bytes32` identifier. The roles are unique. It is expected
 * from callers to hash their roles using keccak256 before calling functions of the contract.
 */
contract GateKeeper is IGateKeeper, AccessControlEnumerable {
    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE` to `msg.sender`.
     *
     * When deploying the contract, the deployer `msg.sender` is granted  the default admin role
     * by calling OpenZeppelin {AccessControl} `_setupRole` method. This method is only called once
     * during the creation of the contract
     */
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @dev Restricted to members of the admin role.
    modifier onlyAdmin(bytes32 roleId) {
        require(isAdmin(roleId, msg.sender), "Restricted to admins.");
        _;
    }
    /// @dev Restricted to members of the role passed as a parameter.
    modifier onlyMember(bytes32 roleId) {
        require(isAssigned(roleId, msg.sender), "Restricted to members.");
        _;
    }

    /**
     * @inheritdoc IGateKeeper
     */
    function addAdmin(bytes32 roleId, address account)
        external
    {
        bytes32 adminRoleId = getRoleAdmin(roleId);
        grantRole(adminRoleId, account);
        emit NewAdmin(roleId, account, msg.sender);
    }

    /**
     * @inheritdoc IGateKeeper
     */
    function addAssignment(bytes32 roleId, address account)
        external
        onlyAdmin(roleId)
    {
        grantRole(roleId, account);
        emit NewAssignment(roleId, account, msg.sender);
    }

    /**
     * @inheritdoc IGateKeeper
     */
    function addRole(bytes32 roleId, bytes32 adminRoleId)
        external
        onlyMember(adminRoleId)
    {
        _setRoleAdmin(roleId, adminRoleId);
        emit NewRole(roleId, adminRoleId, msg.sender);
    }

    /**
     * @inheritdoc IGateKeeper
     */
    function getAssigneeAt(bytes32 roleId, uint256 index)
        external
        view
        returns (address)
    {
        return getRoleMember(roleId, index);
    }

    /**
     * @inheritdoc IGateKeeper
     */
    function getAssigneesCount(bytes32 roleId) external view returns (uint256) {
        return getRoleMemberCount(roleId);
    }

    /**
     * @inheritdoc IGateKeeper
     *
     * @notice retrieve first the `roleId`'s admin role by calling `getRoleAdmin` of {AccessControl}
     */
    function isAdmin(bytes32 roleId, address account)
        public
        view
        returns (bool)
    {
        bytes32 adminRoleId = getRoleAdmin(roleId);
        return hasRole(adminRoleId, account);
    }

    /**
     * @inheritdoc IGateKeeper
     */
    function isAssigned(bytes32 roleId, address account)
        public
        view
        returns (bool)
    {
        return hasRole(roleId, account);
    }

    /**
     * @inheritdoc IGateKeeper
     */
    function removeAssignment(bytes32 roleId, address account)
        external
        onlyAdmin(roleId)
    {
        revokeRole(roleId, account);
        emit RemoveAssignment(roleId, account, msg.sender);
    }

    /**
     * @inheritdoc IGateKeeper
     */
    function renounceAdmin(bytes32 roleId) external onlyAdmin(roleId) {
        bytes32 adminRoleId = getRoleAdmin(roleId);
        renounceRole(adminRoleId, msg.sender);
        emit RenounceAdministration(roleId, msg.sender);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        pure
        override
        returns (bool)
    {
        return interfaceId == type(IGateKeeper).interfaceId;
    }
}
