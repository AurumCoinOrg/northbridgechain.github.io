// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @notice Lock native NBC (anbc) by sending value() to this contract.
///         Users can lock for a chosen duration, then withdraw after unlock.
///         Includes optional early-exit penalty sent to a treasury address.
contract NBCLock {
    struct Lock {
        uint256 amount;
        uint64  unlockTime;
    }

    // user => lockId => Lock
    mapping(address => mapping(uint256 => Lock)) public locks;
    mapping(address => uint256) public lockCount;

    address public treasury;          // receives early-exit penalties
    uint16  public penaltyBps;        // e.g. 500 = 5%
    bool    public paused;

    event Locked(address indexed user, uint256 indexed lockId, uint256 amount, uint64 unlockTime);
    event Withdrawn(address indexed user, uint256 indexed lockId, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed lockId, uint256 amount, uint256 penalty);
    event TreasuryUpdated(address indexed treasury);
    event PenaltyUpdated(uint16 bps);
    event Paused(bool paused);

    modifier notPaused() {
        require(!paused, "paused");
        _;
    }

    constructor(address _treasury, uint16 _penaltyBps) {
        require(_treasury != address(0), "treasury=0");
        require(_penaltyBps <= 2000, "penalty too high"); // max 20%
        treasury = _treasury;
        penaltyBps = _penaltyBps;
    }

    /// @notice Lock NBC by sending msg.value. durationSeconds must be >= 1 hour.
    function lock(uint64 durationSeconds) external payable notPaused returns (uint256 lockId) {
        require(msg.value > 0, "no value");
        require(durationSeconds >= 3600, "min 1h");

        lockId = ++lockCount[msg.sender];
        uint64 unlockTime = uint64(block.timestamp) + durationSeconds;

        locks[msg.sender][lockId] = Lock({
            amount: msg.value,
            unlockTime: unlockTime
        });

        emit Locked(msg.sender, lockId, msg.value, unlockTime);
    }

    /// @notice Withdraw after unlock time.
    function withdraw(uint256 lockId) external notPaused {
        Lock memory l = locks[msg.sender][lockId];
        require(l.amount > 0, "no lock");
        require(block.timestamp >= l.unlockTime, "locked");

        delete locks[msg.sender][lockId];

        (bool ok, ) = payable(msg.sender).call{value: l.amount}("");
        require(ok, "send fail");

        emit Withdrawn(msg.sender, lockId, l.amount);
    }

    /// @notice Emergency withdraw before unlock, paying penalty to treasury.
    function emergencyWithdraw(uint256 lockId) external notPaused {
        Lock memory l = locks[msg.sender][lockId];
        require(l.amount > 0, "no lock");
        require(block.timestamp < l.unlockTime, "already unlocked");

        delete locks[msg.sender][lockId];

        uint256 penalty = (l.amount * penaltyBps) / 10000;
        uint256 payout  = l.amount - penalty;

        if (penalty > 0) {
            (bool okT, ) = payable(treasury).call{value: penalty}("");
            require(okT, "treasury send fail");
        }

        (bool okU, ) = payable(msg.sender).call{value: payout}("");
        require(okU, "user send fail");

        emit EmergencyWithdraw(msg.sender, lockId, payout, penalty);
    }

    // --- Admin (simple owner = deployer) ---
    address public owner = msg.sender;

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "treasury=0");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function setPenaltyBps(uint16 _bps) external onlyOwner {
        require(_bps <= 2000, "penalty too high");
        penaltyBps = _bps;
        emit PenaltyUpdated(_bps);
    }

    function setPaused(bool _p) external onlyOwner {
        paused = _p;
        emit Paused(_p);
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "owner=0");
        owner = _newOwner;
    }

    receive() external payable {
        revert("use lock()");
    }
}
