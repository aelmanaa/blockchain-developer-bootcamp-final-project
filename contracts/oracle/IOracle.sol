// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "../core/Common.sol";

/**
 * @title Oracle interface
 * @dev Define what's important for a OracleCore contract to implement. In fact, there can be different versions of a OracleCore contract
 *
 */
interface IOracle {
    /// @dev Emitted when a `season` is closed by a `keeper`.
    event SeasonClosed(uint16 indexed season, address indexed keeper);

    /// @dev Emitted when a `season` is opened by a `keeper`.
    event SeasonOpen(uint16 indexed season, address indexed keeper);

    /// @dev Emitted when a `severity` is aggregated for a given `season` + `region`
    event SeverityAggregated(
        uint16 indexed season,
        bytes32 region,
        Common.Severity severity,
        address indexed keeper
    );

    /// @dev Emitted when a `severity` is submmited by a `oracle` for a given `season` + `region`
    event SeveritySubmitted(
        uint16 indexed season,
        bytes32 region,
        Common.Severity severity,
        address indexed oracle
    );

    /**
     * @dev struct to define a submission.
     *
     *`oracles` keeps track of oracles which have already submitted
     *`numberAnswers` keeps track of number of answers by severity
     */
    struct Submission {
        mapping(address => Common.Severity) oracles;
        mapping(Common.Severity => uint256) numberAnswers;
        uint256 totalAnswers;
    }

    /**
     * @dev Aggregate a `severity` from all submissions.
     *
     * Rule benefit insurees:
     * if 50% (roundup) of total submissions is >= totD2 + totD3 + totD4 then severity is severity which got the most number of submissions between D2,D3 & D4
     * Else severity which got most number of submissions between D0 & D1
     *
     * Emits a {SeverityAggregated} event.
     * Pays out the keeper for its job
     *
     * Requirements:
     *
     * - the caller must be keeper.
     * - the season must be in closed state
     * - contract must have enough balance to pay oracle
     * - the keeper cannot trigger aggregation twice for this `season` + `region`
     *
     * @param season year (e.g. 2021).
     * @param region region in bytes32
     *
     * @notice call nonReentrant to check against Reentrancy
     */
    function aggregate(uint16 season, bytes32 region) external;

    /**
     * @dev Close a `season`.
     *
     * Emits a {SeasonClosed} event.
     * Pays out the keeper for its job
     *
     * Requirements:
     *
     * - the caller must be keeper
     * - the season must be opened
     * - contract must have enough balance to pay keepers
     *
     * @param season year (e.g. 2021).
     *
     * @notice call nonReentrant to check against Reentrancy
     */
    function closeSeason(uint16 season) external;

    /**
     * @dev Retrieve  `severity` of a `region` + `season`.
     *
     * @param season year (e.g. 2021).
     * @param region region code in bytes32
     * @return Severity
     *
     * @notice caller must check Severity. In fact, final severity is calculated after aggregation. if aggregation not triggered yet then Severity will have the default value
     */
    function getRegionSeverity(uint16 season, bytes32 region)
        external
        view
        returns (Common.Severity);

    /**
     * @dev Retrieve a `season` state.
     *
     * @param season year (e.g. 2021).
     * @return SeasonState .
     */
    function getSeasonState(uint16 season)
        external
        view
        returns (Common.SeasonState);

    /**
     * @dev Retrieve a `severity` for a given `region` and `season` , provided by `oracle`.
     *
     * @param season year (e.g. 2021).
     * @param region region code in bytes32
     * @param oracle oracle address
     *
     * @return Severity .
     *
     * @notice If Severity is the default value then it means that the oracle didn't provide any submission for `region` and `season`
     */
    function getSubmission(
        uint16 season,
        bytes32 region,
        address oracle
    ) external view returns (Common.Severity);

    /**
     * @dev Retrieve number of submissions for a given `region` and `season` and `severity`.
     *
     * @param season year (e.g. 2021).
     * @param region region code in bytes32
     * @param severity Severity code
     *
     * @return number of submissions.
     *
     */
    function getSubmissionNumberForSeverity(
        uint16 season,
        bytes32 region,
        Common.Severity severity
    ) external view returns (uint256);

    /**
     * @dev Retrieve total submissions for a given `region` and `season`.
     *
     * @param season year (e.g. 2021).
     * @param region region code in bytes32
     *
     * @return number of submissions
     *
     */
    function getSubmissionTotal(uint16 season, bytes32  region)
        external
        view
        returns (uint256);

    /**
     * @dev Open a `season`.
     *
     * Emits a {SeasonOpen} event.
     * Pays out the keeper for its job
     *
     * Requirements:
     *
     * - the caller must be keeper.
     * - the season must be in default state
     * - contract must have enough balance to pay keepers
     *
     * @param season year (e.g. 2021).
     *
     * @notice call nonReentrant to check against Reentrancy
     */
    function openSeason(uint16 season) external;

    /**
     * @dev Submit a `severity` for a given `season` + `region`.
     *
     * Emits a {SeveritySubmitted} event.
     * Pays out the oracle for its job
     *
     * Requirements:
     *
     * - the caller must be oracle.
     * - the season must be in open state
     * - contract must have enough balance to pay oracle
     * - the oracle cannot submit twice for this `season` + `region`
     * - severity code must be valid
     *
     * @param season year (e.g. 2021).
     * @param region region in bytes32
     * @param severity must be valid (between 1 and 5)
     *
     * @notice call nonReentrant to check against Reentrancy
     */
    function submit(
        uint16 season,
        bytes32 region,
        Common.Severity severity
    ) external;
}
