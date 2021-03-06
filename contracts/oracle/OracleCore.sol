// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "../core/Common.sol";
import "./IOracle.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";

/**
 * @title Oracle contract
 * @dev Implement functionalities of Oracle. Other functionalities (e.g.: open/close seaosn) are implemented by keepers
 *
 * @notice inhertit  {Common} contract, implement {IOracle} interface & {IERC165} interface. the latter is important to make sure that an OracleCore implements the right interface
 */
contract OracleCore is Common, IOracle, IERC165 {
    using Math for uint256;

    /// @dev keep track of every region and its history
    /// `region` in bytes32 => season => severity
    mapping(bytes32 => mapping(uint16 => Severity)) private regions;

    /// @dev keep track of submissions
    /// `region` in bytes32 => year(season) => Submission (struct defined above)
    mapping(bytes32 => mapping(uint16 => Submission)) private submissions;

    /// @dev keep track of seasons
    // season must be in OPEN state in order to accept submissions
    mapping(uint16 => SeasonState) private seasons;

    /// @dev placeholder to retrieve seasons
    uint16[] private seasonsArray;

    uint256 public constant KEEPER_FEE = 0.1 ether;
    uint256 public constant ORACLE_FEE = 0.5 ether;

    /**
     * @dev Setup `gatekeeer` by calling constructor of parent contract `Common`
     *
     */
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
     * @inheritdoc IOracle
     */
    function aggregate(uint16 season, bytes32 region)
        external
        override
        onlyKeeper
        seasonClosed(season)
        checkContractBalance(KEEPER_FEE)
        nonReentrant
    {
        require(
            regions[region][season] == Severity.D,
            "Severity already aggregated"
        );
        uint256 totalAnswers = submissions[region][season].submitters.length;
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
                (50 * totalAnswers).ceilDiv(100)
            ) {
                if (totalD4.max(totalD3.max(totalD2)) == totalD4) {
                    severity = Severity.D4;
                } else if (totalD3.max(totalD2) == totalD3) {
                    severity = Severity.D3;
                } else {
                    severity = Severity.D2;
                }
            } else {
                if (totalD1.max(totalD0) == totalD1) {
                    severity = Severity.D1;
                } else {
                    severity = Severity.D0;
                }
            }

            regions[region][season] = severity;
            _deposit(msg.sender, KEEPER_FEE);
            emit SeverityAggregated(season, region, severity, msg.sender);
        }
    }

    /**
     * @inheritdoc IOracle
     */
    function closeSeason(uint16 season)
        public
        override
        onlyKeeper
        seasonOpen(season)
        checkContractBalance(KEEPER_FEE)
        nonReentrant
    {
        seasons[season] = SeasonState.CLOSED;
        _deposit(msg.sender, KEEPER_FEE);
        emit SeasonClosed(season, msg.sender);
    }

    /**
     * @inheritdoc IOracle
     */
    function getRegionSeverity(uint16 season, bytes32 region)
        public
        view
        override
        returns (Severity)
    {
        return regions[region][season];
    }

    /**
     * @inheritdoc IOracle
     */
    function getSeasonsNumber() public view override returns (uint256) {
        return seasonsArray.length;
    }

    /**
     * @inheritdoc IOracle
     */
    function getSeasonAt(uint256 index) public view returns (uint16) {
        require(seasonsArray.length > index, "Out of bounds access.");
        return seasonsArray[index];
    }

    /**
     * @inheritdoc IOracle
     */
    function getSeasonState(uint16 season)
        public
        view
        override
        returns (SeasonState)
    {
        return seasons[season];
    }

    /**
     * @inheritdoc IOracle
     */
    function getSubmission(
        uint16 season,
        bytes32 region,
        address oracle
    ) public view override returns (Severity) {
        return submissions[region][season].oracles[oracle];
    }

    /**
     * @inheritdoc IOracle
     */
    function getSubmissionNumberForSeverity(
        uint16 season,
        bytes32 region,
        Severity severity
    ) public view override returns (uint256) {
        return submissions[region][season].numberAnswers[severity];
    }

    /**
     * @inheritdoc IOracle
     */
    function getSubmissionTotal(uint16 season, bytes32 region)
        public
        view
        override
        returns (uint256)
    {
        return submissions[region][season].submitters.length;
    }

    /**
     * @inheritdoc IOracle
     */
    function getSubmitterAt(
        uint16 season,
        bytes32 region,
        uint256 index
    ) public view override returns (address) {
        require(submissions[region][season].submitters.length > index, "Out of bounds access.");
        return submissions[region][season].submitters[index];
    }

    /**
     * @inheritdoc IOracle
     */
    function openSeason(uint16 season)
        public
        override
        onlyKeeper
        seasonDefault(season)
        checkContractBalance(KEEPER_FEE)
        nonReentrant
    {
        seasons[season] = SeasonState.OPEN;
        seasonsArray.push(season);
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
     * @inheritdoc IOracle
     */
    function submit(
        uint16 season,
        bytes32 region,
        Severity severity
    )
        external
        override
        onlyOracle
        seasonOpen(season)
        checkContractBalance(ORACLE_FEE)
        nonReentrant
    {
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
        submissions[region][season].submitters.push(msg.sender);
        _deposit(msg.sender, ORACLE_FEE);
        emit SeveritySubmitted(season, region, severity, msg.sender);
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
        return interfaceId == type(IOracle).interfaceId;
    }
}
