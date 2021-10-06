// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "../core/Common.sol";
import "./IOracle.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Oracle interface
 * @dev Define what's important for a OracleCore contract to implement. In fact, there can be different versions of a OracleCore contract
 *
 */
contract OracleFacade is Ownable, ReentrancyGuard {
    /**
     * @dev Emitted when new oracleCore setup by `owner`.
     */
    event NewOracleCore(
        address indexed oldOracleCore,
        address indexed newOracleCore
    );

    /// @dev reference to oracle contract
    IOracle private oracleCore;

    constructor(address _oracleCore) {
        setOracle(_oracleCore);
    }

    /// @dev check interface compliancy. (IERC165)
    modifier checkOracleInterface(address _oracleCore) {
        require(
            IERC165(_oracleCore).supportsInterface(type(IOracle).interfaceId),
            string(
                abi.encodePacked(
                    "Provided oraclecore address ",
                    Strings.toHexString(uint160(_oracleCore), 20),
                    " does not implement IOracle interface which interfaceID is ",
                    Strings.toHexString(uint32(type(IOracle).interfaceId), 4)
                )
            )
        );
        _;
    }

    /// @dev return the current OracleCore address
    function getOracleCore() public view returns (address) {
        return address(oracleCore);
    }

    /// @dev return the current OracleCore address
    function getOracleCoreSupportedInterface() public pure returns (bytes4) {
        return type(IOracle).interfaceId;
    }

    /**
     * @dev Retrieve  `severity` of a `region` + `season`.
     *
     * @param season year (e.g. 2021).
     * @param region region code in bytes
     * @return Common.Severity
     *
     * @notice caller must check Severity. In fact, final severity is calculated after aggregation. if aggregation not triggered yet then Severity will have the default value
     */
    function getRegionSeverity(uint16 season, bytes calldata region)
        public
        view
        returns (Common.Severity)
    {
        return oracleCore.getRegionSeverity(season, region);
    }

    /**
     * @dev Retrieve a `season` state.
     *
     * @param season year (e.g. 2021).
     * @return Common.SeasonState .
     */
    function getSeasonState(uint16 season)
        public
        view
        returns (Common.SeasonState)
    {
        return oracleCore.getSeasonState(season);
    }

    /**
     * @dev Allow to change dynamically oracle
     *
     * @param _oracleCore oracleCore address
     * Requirements:
     * - only owner can change the reference of OracleCore
     * - ensure that it impelments the right interface
     *
     * @notice call nonReentrant to check against Reentrancy
     */
    function setOracle(address _oracleCore)
        public
        onlyOwner
        nonReentrant
        checkOracleInterface(_oracleCore)
    {
        emit NewOracleCore(address(oracleCore), _oracleCore);
        oracleCore = IOracle(_oracleCore);
    }
}
