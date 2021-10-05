// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "../core/Common.sol";

contract OracleCore is Common {
    /// @dev Emitted when a `season` is closed by a `keeper`.
    event SeasonClosed(uint16 indexed season, address indexed keeper);

    /// @dev Emitted when a `season` is opened by a `keeper`.
    event SeasonOpen(uint16 indexed season, address indexed keeper);

    /// @dev Emitted when a `severity` is submmited by a `oracle` for a given `season` + `region`
    event SeveritySubmitted(
        uint16 indexed season,
        bytes indexed region,
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
     * @dev struct to define a region. For flexibility, a region is defined by a `code` which is bytes
     *
     *`history` keeps track of severity for every season. A year is a season (that's why we choe uint16)
     *`seasons` keeps track of reported years
     */
    struct Region {
        bytes code;
        mapping(uint16 => Severity) history;
        uint16[] seasons;
    }

    /**
     * @dev struct to define a submission.
     *
     *`oracles` keeps track of oracles which have already submitted
     *`numberAnswers` keeps track of number of answers by severity
     */
    struct Submission {
        mapping(address => bool) oracles;
        mapping(Severity => uint256) numberAnswers;
        uint256 totalAnswers;
    }

    /// @dev keep track of every region
    /// `region` in bytes => Region (struct defined above)
    mapping(bytes => Region) regions;

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
     * @dev Rertieve a `season` state.
     *
     * @param season year (e.g. 2021).
     * @return SeasonState .
     */
    function getSeasonState(uint16 season) public view returns (SeasonState) {
        return seasons[season];
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
            !submissions[region][season].oracles[msg.sender],
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

        submissions[region][season].oracles[msg.sender] = true;
        submissions[region][season].numberAnswers[severity] += 1;
        submissions[region][season].totalAnswers += 1;
        _deposit(msg.sender, ORACLE_FEE);
        emit SeveritySubmitted(season, region, severity, msg.sender);
    }
}
