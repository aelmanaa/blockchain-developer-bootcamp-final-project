// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "../core/Common.sol";
import "../oracle/OracleFacade.sol";

/**
 * @title Main insurance contract
 * @dev Implement main contract for Insurance. contract between insurance and farmers is materialized in here
 *
 * @notice inhertit  {Common} contract
 */
contract Insurance is Common {
    /// @dev Emitted when a `contract` is activated by an `insurer` for a given `season` + `region` + `farmID`
    event InsuranceActivated(
        uint16 indexed season,
        bytes32 region,
        bytes32 farmID,
        address indexed insurer,
        bytes32 key
    );

    /// @dev Emitted when a `contract` is submitted by an `farmer` for a given `season` + `region` + `farmID`
    event InsuranceRequested(
        uint16 indexed season,
        bytes32 region,
        bytes32 farmID,
        uint256 size,
        uint256 fee,
        address indexed farmer,
        bytes32 key
    );

    /// @dev Emitted when a `contract` is validated by a `government` for a given `season` + `region` + `farmID`
    event InsuranceValidated(
        uint16 indexed season,
        bytes32 region,
        bytes32 farmID,
        uint256 totalStaked,
        address indexed government,
        bytes32 key
    );

    /// @dev Emitted when an `insurer` withdraws `amount` from the contract. remaining contract balance is `balance`
    event WithdrawInsurer(
        address indexed insurer,
        uint256 amount,
        uint256 balance
    );
    /**
     * @dev transition state of a contract
     *
     * a contract must be in init state (DEFAULT)
     * a contract transition to (REGISTERED) once a farmer registers himself
     * a contract transition to (VALIDATED) once a government employee validates the demand
     * a contract transition to (INSURED) once an insurer approves the contract
     * a contract transition to (CLOSED) once a season is closed without any drought, hence there are no compensations
     * a contract transition to (COMPENSATED) once a season is closed and there were  drought, hence there are  compensations
     */
    enum ContractState {
        DEFAULT,
        REGISTERED,
        VALIDATED,
        INSURED,
        CLOSED,
        COMPENSATED
    }

    struct Contract {
        bytes32 key;
        bytes32 farmID;
        ContractState state;
        address farmer;
        address government;
        address insurer;
        uint256 size;
        bytes32 region;
        uint16 season;
        uint256 totalStaked;
        uint256 compensation;
    }

    /// @dev OracleFacade used to get the status of a season(open/closed) and Severity for a given season + region
    OracleFacade private oracleFacade;

    /// @dev a contract is a unique combination between season,region,farmID
    mapping(bytes32 => Contract) contracts;

    /// @dev contracts that must be treated by season,region
    mapping(bytes32 => bytes32[]) openContracts;

    /// @dev contracts that have already been closed by season,region
    mapping(bytes32 => bytes32[]) closedContracts;

    /// @dev amount locked for every insurer
    mapping(address => uint256) locked;

    uint256 public constant KEEPER_FEE = 0.01 ether;

    /// @dev needed to track worst case scenario -> must have at anytime money to pay for severity/D4 : 2.5*PERMIUM_PER_HA*totalsize
    uint256 public totalOpenSize;

    /// @dev needed to track amount to be paid for keepers
    uint256 public totalOpenContracts;

    /**
     * @dev rules to calculate the compensation
     *
     * D2 gives 1.5 times the premium
     * D3 gives 2 times the premium
     * D4 gives 3 times the premium
     */
    mapping(Severity => uint8) rules;

    /// @dev premium is  0.15ETH/HA
    uint256 public constant PERMIUM_PER_HA = 150000000 gwei;

    /// @dev used for calculation (farmer must stake half of premium. Same for government)
    uint256 public constant HALF_PERMIUM_PER_HA = 75000000 gwei;

    constructor(address _gatekeeper, address _oracleFacade)
        Common(_gatekeeper)
    {
        rules[Severity.D0] = 0;
        rules[Severity.D1] = 0;
        rules[Severity.D2] = 15;
        rules[Severity.D3] = 20;
        rules[Severity.D4] = 25;
        oracleFacade = OracleFacade(_oracleFacade);
    }

    /// @dev modifier to check that at any time there will be enough balance in the contract
    modifier minimumCovered() {
        _;
        require(
            address(this).balance >= minimumAmount(),
            "Not enough balance staked in the contract"
        );
    }

    /// @dev season must be open in order to receive insurance requests
    modifier seasonOpen(uint16 season) {
        require(
            oracleFacade.getSeasonState(season) == SeasonState.OPEN,
            "Season must be open."
        );
        _;
    }

    /**
     * @dev retrieve contract data
     * @param key keecak combination of season, region & farmID
     *
     * @return key unique id of the contract
     * @return farmID unique ID of a farm
     * @return state of the contract
     * @return farmer address
     * @return government address
     * @return insurer address
     * @return size number of HA of a farmer (minimum: 1 HA)
     * @return region ID of a region
     * @return season (year)
     * @return totalStaked eth that were taked in this contract
     * @return compensation for this contract
     */
    function getContract(bytes32 _key)
        public
        view
        returns (
            bytes32 key,
            bytes32 farmID,
            ContractState state,
            address farmer,
            address government,
            address insurer,
            uint256 size,
            bytes32 region,
            uint16 season,
            uint256 totalStaked,
            uint256 compensation
        )
    {
        Contract memory _contract = contracts[_key];
        key = _contract.key;
        farmID = _contract.farmID;
        state = _contract.state;
        farmer = _contract.farmer;
        government = _contract.government;
        insurer = _contract.insurer;
        size = _contract.size;
        region = _contract.region;
        season = _contract.season;
        totalStaked = _contract.totalStaked;
        compensation = _contract.compensation;
    }

    /**
     * @dev retrieve contract data
     * @param season farming season(year)
     * @param region region ID
     * @param farmID unique ID of a farm
     *
     * @return key unique ID of the contract
     * @return farmID unique ID of a farm
     * @return state of the contract
     * @return farmer address
     * @return government address
     * @return insurer address
     * @return size number of HA of a farmer (minimum: 1 HA)
     * @return region ID of a region
     * @return season (year)
     * @return totalStaked eth that were taked in this contract
     * @return compensation for this contract
     */
    function getContract(
        uint16 season,
        bytes32 region,
        bytes32 farmID
    )
        public
        view
        returns (
            bytes32,
            bytes32,
            ContractState,
            address,
            address,
            address,
            uint256,
            bytes32,
            uint16,
            uint256,
            uint256
        )
    {
        return getContract(getContractKey(season, region, farmID));
    }

    /**
     * @dev get number of closed contracts for a given key
     *
     * @param key keccak256 of season + region
     * @return number of closed contracts
     *
     */
    function getNumberClosedContracts(bytes32 key)
        public
        view
        returns (uint256)
    {
        return closedContracts[key].length;
    }

    /**
     * @dev get number of closed contracts for a given season and region
     *
     * @param season id of a season (year)
     * @param region id of region
     * @return number of closed contracts
     *
     */
    function getNumberClosedContracts(uint16 season, bytes32 region)
        public
        view
        returns (uint256)
    {
        return
            getNumberClosedContracts(
                keccak256(abi.encodePacked(season, region))
            );
    }

    /**
     * @dev get a specific closed contract
     *
     * @param key  key keccak256 of season + region
     * @param index position in the array
     * @return key of a contract
     *
     */
    function getClosedContractsAt(bytes32 key, uint256 index)
        public
        view
        returns (bytes32)
    {
        return closedContracts[key][index];
    }

    /**
     * @dev get a specific closed contract
     *
     * @param season id of a season (year)
     * @param region id of region
     * @param index position in the array
     * @return key of a contract
     *
     */
    function getClosedContractsAt(
        uint16 season,
        bytes32 region,
        uint256 index
    ) public view returns (bytes32) {
        return
            getClosedContractsAt(
                keccak256(abi.encodePacked(season, region)),
                index
            );
    }

    /**
     * @dev calculate contract key
     *
     * @param season season (year)
     * @param region region id
     * @param farmID farm id
     * @return key (hash value of the 3 parameters)
     *
     */
    function getContractKey(
        uint16 season,
        bytes32 region,
        bytes32 farmID
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(season, region, farmID));
    }

    /**
     * @dev get number of open contracts for a given key
     *
     * @param key keccak256 of season + region
     * @return number of open contracts
     *
     */
    function getNumberOpenContracts(bytes32 key) public view returns (uint256) {
        return openContracts[key].length;
    }

    /**
     * @dev get number of open contracts for a given season and region
     *
     * @param season id of a season (year)
     * @param region id of region
     * @return number of open contracts
     *
     */
    function getNumberOpenContracts(uint16 season, bytes32 region)
        public
        view
        returns (uint256)
    {
        return
            getNumberOpenContracts(keccak256(abi.encodePacked(season, region)));
    }

    /**
     * @dev get a specific open contract
     *
     * @param key  key keccak256 of season + region
     * @param index position in the array
     * @return key of a contract
     *
     */
    function getOpenContractsAt(bytes32 key, uint256 index)
        public
        view
        returns (bytes32)
    {
        return openContracts[key][index];
    }

    /**
     * @dev get a specific open contract
     *
     * @param season id of a season (year)
     * @param region id of region
     * @param index position in the array
     * @return key of a contract
     *
     */
    function getOpenContractsAt(
        uint16 season,
        bytes32 region,
        uint256 index
    ) public view returns (bytes32) {
        return
            getOpenContractsAt(
                keccak256(abi.encodePacked(season, region)),
                index
            );
    }

    /**
     * @dev insure a request
     * @param season farming season(year)
     * @param region region ID
     * @param farmID unique ID of a farm
     *
     *  Emits a {InsuranceActivated} event.
     *
     * Requirements:
     * - Contract is active (circuit-breaker)
     * - Can only be called by insurer
     * - Check must exist
     * - Season must be open
     * - contract must be in VALIDATED state
     * - Must be enough eth staked within the contract after the operation
     * @notice call nonReentrant to check against Reentrancy
     */
    function activate(
        uint16 season,
        bytes32 region,
        bytes32 farmID
    )
        external
        onlyActive
        onlyInsurer
        seasonOpen(season)
        nonReentrant
        minimumCovered
    {
        // Generate a unique key for storing the request
        bytes32 key = getContractKey(season, region, farmID);
        Contract memory _contract = contracts[key];
        require(_contract.farmID == farmID, "Contract do not exist");
        require(
            _contract.state == ContractState.VALIDATED,
            "Contract must be in validated state"
        );

        _contract.state = ContractState.INSURED;
        _contract.insurer = msg.sender;
        contracts[key] = _contract;

        emit InsuranceActivated(season, region, farmID, msg.sender, key);
    }

    /**
     * @dev calculate at anytime the minimum liquidity that must be locked within the contract
     *
     * @return ammount
     *
     * Basically , always enough money to pay keepers and compensation in worst case scenarios
     */
    function minimumAmount() public view returns (uint256) {
        return
            (KEEPER_FEE * totalOpenContracts) +
            (PERMIUM_PER_HA * totalOpenSize * rules[Severity.D4]) /
            10;
    }

    /**
     * @dev submission of an insurance request by a farmer
     * @param season farming season(year)
     * @param region region ID
     * @param farmID unique ID of a farm
     * @param size number of HA of a farmer (minimum: 1 HA)
     *
     * @return key key of the contract
     *  Emits a {InsuranceRequested} event.
     *
     * Requirements:
     * - contract is Active (circuit-breaker)
     * - Can only be called by farmer
     * - Check non duplicate
     * - Seasonmust be open
     * - Sender must pay for premium
     * - Must be enough eth staked within the contract
     * @notice call nonReentrant to check against Reentrancy
     */
    function register(
        uint16 season,
        bytes32 region,
        bytes32 farmID,
        uint256 size
    )
        external
        payable
        onlyActive
        onlyFarmer
        seasonOpen(season)
        nonReentrant
        minimumCovered
        returns (bytes32)
    {
        // Generate a unique key for storing the request
        bytes32 key = getContractKey(season, region, farmID);
        require(contracts[key].key == 0x0 , "Duplicate");
        uint256 fee = HALF_PERMIUM_PER_HA * size;
        require(msg.value >= fee, "Not enough money to pay for premium");
        Contract memory _contract;
        _contract.key = key;
        _contract.farmID = farmID;
        _contract.state = ContractState.REGISTERED;
        _contract.farmer = msg.sender;
        _contract.size = size;
        _contract.region = region;
        _contract.season = season;
        _contract.totalStaked = fee;

        contracts[key] = _contract;

        openContracts[keccak256(abi.encodePacked(season, region))].push(key);
        totalOpenSize += size;
        totalOpenContracts++;
        // return change
        if (msg.value > fee) {
            (bool success, ) = msg.sender.call{value: msg.value - fee}("");
            require(success, "Transfer failed.");
        }

        emit InsuranceRequested(
            season,
            region,
            farmID,
            size,
            fee,
            msg.sender,
            key
        );

        return key;
    }

    /**
     * @dev validate a request done by a farmer
     * @param season farming season(year)
     * @param region region ID
     * @param farmID unique ID of a farm
     *
     *  Emits a {InsuranceValidated} event.
     *
     * Requirements:
     * - Contract is active (circuit-breaker)
     * - Can only be called by government
     * - Check contract must exist
     * - Season must be open
     * - Sender must pay for premium
     * - Must be enough eth staked within the contract
     * @notice call nonReentrant to check against Reentrancy
     */
    function validate(
        uint16 season,
        bytes32 region,
        bytes32 farmID
    )
        external
        payable
        onlyActive
        onlyGovernment
        seasonOpen(season)
        nonReentrant
        minimumCovered
    {
        // Generate a unique key for storing the request
        bytes32 key = getContractKey(season, region, farmID);
        Contract memory _contract = contracts[key];
        require(_contract.farmID == farmID, "Contract do not exist");
        require(
            _contract.state == ContractState.REGISTERED,
            "Contract must be in registered state"
        );
        uint256 fee = HALF_PERMIUM_PER_HA * _contract.size;
        require(msg.value >= fee, "Not enough money to pay for premium");

        _contract.state = ContractState.VALIDATED;
        _contract.government = msg.sender;
        _contract.totalStaked += fee;

        contracts[key] = _contract;
        // return change
        if (msg.value > fee) {
            (bool success, ) = msg.sender.call{value: msg.value - fee}("");
            require(success, "Transfer failed.");
        }

        emit InsuranceValidated(
            season,
            region,
            farmID,
            _contract.totalStaked,
            msg.sender,
            key
        );
    }

    /**
     * @dev an insurer can withdraw any excess of liquidity
     * @param amount to be withdrawed
     *
     *  Emits a {WithdrawInsurer} event.
     *
     * Requirements:
     * - Can only be called by insurer
     * - Check non duplicate
     * - Must be enough eth staked within the contract after operation
     * @notice call nonReentrant to check against Reentrancy
     */
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

    /**
     * @dev check anytime amount that can be withdrawed by insurer
     * @return amount to be withdrawed
     *
     * @notice call nonReentrant to check against Reentrancy
     */
    function withdrawableInsurer() external view returns (uint256) {
        uint256 minimum = minimumAmount();
        if (address(this).balance >= minimum) {
            return address(this).balance - minimum;
        } else {
            return 0;
        }
    }

    /**
     * @dev function to receive ETH in order to pay keepers and oracles
     *
     * Emits a {ReceivedETH} event.
     *
     * Requirements:
     * - Contract mus be active (circuit-breaker)
     * - the caller must be insurer
     */
    receive() external payable onlyActive onlyInsurer {
        emit ReceivedETH(msg.value, address(this).balance, msg.sender);
    }
}
