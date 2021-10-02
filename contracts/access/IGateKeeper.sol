// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @title Access Control Interface.
 * @dev Make surt to support ERC165 detection when implementing this interface.
 */
interface IGateKeeper {
    /**
     * @dev Emitted when `roleId`'s admin rol is assigned to `newAdmin` by `admin`.
     */
    event NewAdmin(
        bytes32 indexed roleId,
        address indexed newAdmin,
        address indexed admin
    );

    /**
     * @dev Emitted when `roleId` is assigned to `account` by `admin`.
     */
    event NewAssignment(
        bytes32 indexed roleId,
        address indexed account,
        address indexed admin
    );

    /**
     * @dev Emitted when a new `roleId` is created with `adminRoleId` as admin role by `admin`.
     */
    event NewRole(
        bytes32 indexed roleId,
        bytes32 indexed adminRoleId,
        address indexed admin
    );

    /**
     * @dev Emitted when a `roleId` is revoked from `account` by `admin`.
     */
    event RemoveAssignment(
        bytes32 indexed roleId,
        address indexed account,
        address indexed admin
    );

    /**
     * @dev Emitted when `admin` renounces being admin of  `roleId`.
     */
    event RenounceAdministration(bytes32 indexed roleId, address indexed admin);

    /**
     * @dev Assign `roleId`'s admin role to `account`.
     *
     * Emits a {NewAdmin} event.
     *
     * Requirements:
     *
     * - the caller must have `roleId`'s admin role.
     *
     * @param roleId unique 32-byte word representation of a role
     * @param account additional administrator of roleId
     */
    function addAdmin(bytes32 roleId, address account) external;

    /**
     * @dev Assign `roleId` to `account`.
     *
     * Emits a {NewAssignment} event.
     *
     * Requirements:
     *
     * - the caller must have `roleId`'s admin role.
     *
     * @param roleId unique 32-byte word representation of a role.
     * @param account new members of roleId.
     */
    function addAssignment(bytes32 roleId, address account) external;

    /**
     * @dev Create new `roleId` with `adminRoleId` as admin role.
     *
     * Emits a {NewRole} event.
     *
     * Requirements:
     *
     * - the caller must be assigned `adminRoleId`.
     *
     * @param roleId unique 32-byte word representation of a role.
     * @param adminRoleId roleId's administrator role.
     */
    function addRole(bytes32 roleId, bytes32 adminRoleId) external;

    /**
     * @dev Get the account assigned the `roleId` at `index`.
     *
     * @param roleId unique 32-byte word representation of a role.
     * @param index since role is assgned to an array of assignees, index is the position in the assignees array.
     * @return address address of the roleId's assignee at index.
     */
    function getAssigneeAt(bytes32 roleId, uint256 index)
        external
        view
        returns (address);

    /**
     * @dev Get number of accounts assigned the `roleId`.
     *
     * @param roleId unique 32-byte word representation of a role.
     * @return number of roleId's assignees.
     */
    function getAssigneesCount(bytes32 roleId) external view returns (uint256);

    /**
     * @dev Returns `true` if `account` is admin of `roleId`.
     *
     * @param roleId unique 32-byte word representation of a role.
     * @param account roleId's administrator account.
     * @return bool `true` if `account` is admin of `roleId`.
     */
    function isAdmin(bytes32 roleId, address account)
        external
        view
        returns (bool);

    /**
     * @dev Returns `true` if `account` is granted `roleId`.
     *
     * @param roleId unique 32-byte word representation of a role.
     * @param account roleId's assignee.
     * @return bool `true` if `account` is granted `roleId`.
     */
    function isAssigned(bytes32 roleId, address account)
        external
        view
        returns (bool);

    /**
     * @dev Revokes `roleId` from `account`.
     *
     * If `account` had been granted `roleId`, emits a {RemoveAssignment} event.
     *
     * Requirements:
     *
     * - the caller must have `roleId`'s admin role.
     *
     * @param roleId unique 32-byte word representation of a role.
     * @param account roleId's assignee.
     */
    function removeAssignment(bytes32 roleId, address account) external;

    /**
     * @dev Renounce administration of `roleId`.
     *
     * If the caller is administator of `roleId`, emits a {RenounceAdministration} event.
     *
     * Requirements:
     *
     * - the caller must have `roleId`'s admin role.
     *
     * @param roleId unique 32-byte word representation of a role.
     */
    function renounceAdmin(bytes32 roleId) external;
}
