// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

/// @title NBCX Deterministic Halving Staking
/// @notice Rewards are emitted from prefunded pool. No minting. No admin control.
contract NBCXStaking {

    IERC20 public immutable token;

    uint256 public constant HALVING_INTERVAL = 4 * 365 days;
    uint256 public immutable startTimestamp;
    uint256 public immutable initialRewardRate; // tokens per second

    uint256 public totalStaked;
    mapping(address => uint256) public staked;

    uint256 public rewardPerTokenStored;
    uint256 public lastUpdateTime;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    constructor(address token_) {
        require(token_ != address(0), "zero");
        token = IERC20(token_);
        startTimestamp = block.timestamp;

        // 8,750,000 tokens over first 4 years
        initialRewardRate = 8_750_000e18 / HALVING_INTERVAL;

        lastUpdateTime = block.timestamp;
    }

    function currentEra() public view returns (uint256) {
        return (block.timestamp - startTimestamp) / HALVING_INTERVAL;
    }

    function rewardRate() public view returns (uint256) {
        uint256 era = currentEra();
        return initialRewardRate >> era; // halving via bit shift
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) return rewardPerTokenStored;
        uint256 dt = block.timestamp - lastUpdateTime;
        return rewardPerTokenStored + (dt * rewardRate() * 1e18) / totalStaked;
    }

    function earned(address account) public view returns (uint256) {
        return
            (staked[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18
            + rewards[account];
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;

        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function stake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "amount");
        totalStaked += amount;
        staked[msg.sender] += amount;
        require(token.transferFrom(msg.sender, address(this), amount), "transferFrom");
    }

    function unstake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "amount");
        require(staked[msg.sender] >= amount, "balance");

        staked[msg.sender] -= amount;
        totalStaked -= amount;

        require(token.transfer(msg.sender, amount), "transfer");
    }

    function claim() external updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "zero");

        rewards[msg.sender] = 0;
        require(token.transfer(msg.sender, reward), "reward transfer");
    }
}
