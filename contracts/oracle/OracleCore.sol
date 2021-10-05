// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "../core/Common.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract OracleCore is Common {
    using Math for uint256;

    /// @dev Emitted when a `season` is closed by a `keeper`.
    event SeasonClosed(uint16 indexed season, address indexed keeper);

    /// @dev Emitted when a `season` is opened by a `keeper`.
    event SeasonOpen(uint16 indexed season, address indexed keeper);

    /// @dev Emitted when a `severity` is aggregated for a given `season` + `region`
    event SeverityAggregated(
        uint16 indexed season,
        bytes region,
        Severity severity,
        address indexed keeper
    );

    /// @dev Emitted when a `severity` is submmited by a `oracle` for a given `season` + `region`
    event SeveritySubmitted(
        uint16 indexed season,
        bytes region,
        Severity severity,
        address indexed oracle
    );

    /**
     * @dev used to check if a season is in the right state
     *
     * a season must be in init state (DEFAULT) before being opened
     * a season lust be opened (OPEN) in order to get closed
     */
    enum SeasonState {
        DEFAULT,
        OPEN,
        CLOSED
    }

    /**
     * @dev struct to define a submission.
     *
     *`oracles` keeps track of oracles which have already submitted
     *`numberAnswers` keeps track of number of answers by severity
     */
    struct Submission {
        mapping(address => Severity) oracles;
        mapping(Severity => uint256) numberAnswers;
        uint256 totalAnswers;
    }

    /// @dev keep track of every region and its history
    /// `region` in bytes => season => severity
    mapping(bytes => mapping(uint16 => Severity)) regions;

    /// @dev keep track of submissions
    /// `region` in bytes => year(season) => Submission (struct defined above)
    mapping(bytes => mapping(uint16 => Submission)) submissions;

    /// @dev keep track of seasons
    // season must be in OPEN state in order to accept submissions
    mapping(uint16 => SeasonState) seasons;

    uint256 public constant KEEPER_FEE = 0.1 ether;
    uint256 public constant ORACLE_FEE = 0.5 ether;

    constructor(address _gatekeeper) Common(_gatekeeper) {}

    /// @dev called when to check that a season is in initial state
    modifier seasonDefault(uint16 season) {
        require(
            seasons[season] == SeasonState.DEFAULT,
            "Season must be in initial state."
        );
        _;
    }

    /// @dev called when to check that a season is in open state
    modifier seasonOpen(uint16 season) {
        require(seasons[season] == SeasonState.OPEN, "Season must be open.");
        _;
    }

    /// @dev called when to check that a season is in closed state
    modifier seasonClosed(uint16 season) {
        require(
            seasons[season] == SeasonState.CLOSED,
            "Season must be closed."
        );
        _;
    }

    /**
     * @dev Aggregate a `severity` from all submissions.
     *
     * Rule benefit insurees:
     * if 60% (roundup) of total submissions is >= totD2 + totD3 + totD4 then severity is severity which got the most number of submissions between D2,D3 & D4
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
     * @param region region in bytes
     */
    function aggregate(uint16 season, bytes calldata region)
        external
        onlyKeeper
        seasonClosed(season)
        checkContractBalance(KEEPER_FEE)
    {
        require(
            regions[region][season] == Severity.D,
            "Severity already aggregated"
        );
        uint256 totalAnswers = submissions[region][season].totalAnswers;
        if (totalAnswers > 0) {
            uint256 totalD0 = submissions[region][season].numberAnswers[
                Severity.D0
            ];
            uint256 totalD1 = submissions[region][season].numberAnswers[
                Severity.D1
            ];
            uint256 totalD2 = submissions[region][season].numberAnswers[
                Severity.D2
            ];
            uint256 totalD3 = submissions[region][season].numberAnswers[
                Severity.D3
            ];
            uint256 totalD4 = submissions[region][season].numberAnswers[
                Severity.D4
            ];
            require(
                (totalD0 + totalD1 + totalD2 + totalD3 + totalD4) ==
                    totalAnswers,
                "Data corrupted"
            );
            Severity severity;
            if (
                (totalD2 + totalD3 + totalD4) >=
                (60 * totalAnswers).ceilDiv(100)
            ) {
                if (totalD4.max(totalD3) == totalD4) {
                    severity = Severity.D4;
                } else if (totalD3.max(totalD2) == totalD3) {
                    severity = Severity.D3;
                } else {
                    severity = Severity.D2;
                }
            } else {
                if (totalD2.max(totalD1) == totalD2) {
                    severity = Severity.D2;
                } else {
                    severity = Severity.D1;
                }
            }

            regions[region][season] = severity;
            emit SeverityAggregated(season, region, severity, msg.sender);
        }
    }

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
     */
    function closeSeason(uint16 season)
        public
        onlyKeeper
        seasonOpen(season)
        checkContractBalance(KEEPER_FEE)
    {
        seasons[season] = SeasonState.CLOSED;
        _deposit(msg.sender, KEEPER_FEE);
        emit SeasonClosed(season, msg.sender);
    }

    /**
     * @dev Rertieve  `severity` of a `region` + `season`.
     *
     * @param season year (e.g. 2021).
     * @param region region code in bytes
     * @return Severity
     *
     * @notice caller must check Severity. In fact, final severity is calculated after aggregation. if aggregation not triggered yet then Severity will have the default value
     */
    function getRegionSeverity(uint16 season, bytes calldata region)
        public
        view
        returns (Severity)
    {
        return regions[region][season];
    }

    /**
     * @dev Rertieve a `season` state.
     *
     * @param season year (e.g. 2021).
     * @return SeasonState .
     */
    function getSeasonState(uint16 season) public view returns (SeasonState) {
        return seasons[season];
    }

    /**
     * @dev Rertieve a `severity` for a given `region` and `season` , provided by `oracle`.
     *
     * @param season year (e.g. 2021).
     * @param region region code in bytes
     * @param oracle oracle address
     *
     * @return Severity .
     *
     * @notice If Severity is the default value then it means that the oracle didn't provide any submission for `region` and `season`
     */
    function getSubmission(
        uint16 season,
        bytes calldata region,
        address oracle
    ) public view returns (Severity) {
        return submissions[region][season].oracles[oracle];
    }

    /**
     * @dev Retrieve number of submissions for a given `region` and `season` and `severity`.
     *
     * @param season year (e.g. 2021).
     * @param region region code in bytes
     * @param severity Severity code
     *
     * @return number of submissions.
     *
     */
    function getSubmissionNumberForSeverity(
        uint16 season,
        bytes calldata region,
        Severity severity
    ) public view returns (uint256) {
        return submissions[region][season].numberAnswers[severity];
    }

    /**
     * @dev Retrieve total submissions for a given `region` and `season`.
     *
     * @param season year (e.g. 2021).
     * @param region region code in bytes
     *
     * @return number of submissions
     *
     */
    function getSubmissionTotal(uint16 season, bytes calldata region)
        public
        view
        returns (uint256)
    {
        return submissions[region][season].totalAnswers;
    }

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
     */
    function openSeason(uint16 season)
        public
        onlyKeeper
        seasonDefault(season)
        checkContractBalance(KEEPER_FEE)
    {
        seasons[season] = SeasonState.OPEN;
        _deposit(msg.sender, KEEPER_FEE);
        emit SeasonOpen(season, msg.sender);
    }

    /**
     * @dev function to receive ETH in order to pay keepers and oracles
     *
     * Emits a {ReceivedETH} event.
     *
     * Requirements:
     *
     * - the caller must be insurer
     */
    receive() external payable onlyInsurer {
        emit ReceivedETH(msg.value, address(this).balance, msg.sender);
    }

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
     * @param region region in bytes
     * @param severity must be valid (between 1 and 5)
     */
    function submit(
        uint16 season,
        bytes calldata region,
        Severity severity
    ) external onlyOracle seasonOpen(season) checkContractBalance(ORACLE_FEE) {
        require(
            submissions[region][season].oracles[msg.sender] == Severity.D,
            "Oracle has already submitted for this season and region"
        );
        require(
            (severity == Severity.D0 ||
                severity == Severity.D1 ||
                severity == Severity.D2 ||
                severity == Severity.D3 ||
                severity == Severity.D4),
            "Severity not valid"
        );

        submissions[region][season].oracles[msg.sender] = severity;
        submissions[region][season].numberAnswers[severity] += 1;
        submissions[region][season].totalAnswers += 1;
        _deposit(msg.sender, ORACLE_FEE);
        emit SeveritySubmitted(season, region, severity, msg.sender);
    }
}
