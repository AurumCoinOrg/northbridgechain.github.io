// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

/// @notice Simple ERC20 staking:
/// - stake NBCX, earn rewards funded by owner
/// - rewardRate = rewards per second (in token wei)
/// - users accrue pro-rata by stake share
contract NBCXStaking is Ownable {
    IERC20 public immutable token;

    uint256 public rewardRate;            // token wei per second
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;  // scaled by 1e18

    uint256 public totalStaked;

    mapping(address => uint256) public staked;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 rewardRate);

    constructor(address initialOwner, address token_) Ownable(initialOwner) {
        require(token_ != address(0), "token=0");
        token = IERC20(token_);
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

    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) return rewardPerTokenStored;
        uint256 dt = block.timestamp - lastUpdateTime;
        return rewardPerTokenStored + ((dt * rewardRate * 1e18) / totalStaked);
    }

    function earned(address account) public view returns (uint256) {
        return
            ((staked[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) +
            rewards[account];
    }

    /// @notice Owner sets emission rate (token wei per second).
    function setRewardRate(uint256 newRate) external onlyOwner updateReward(address(0)) {
        rewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }

    /// @notice Fund contract with rewards (owner must approve first).
    function fund(uint256 amount) external onlyOwner {
        require(amount > 0, "amount=0");
        require(token.transferFrom(msg.sender, address(this), amount), "transferFrom fail");
    }

    function stake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "amount=0");
        totalStaked += amount;
        staked[msg.sender] += amount;
        require(token.transferFrom(msg.sender, address(this), amount), "transferFrom fail");
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "amount=0");
        require(staked[msg.sender] >= amount, "insufficient");
        totalStaked -= amount;
        staked[msg.sender] -= amount;
        require(token.transfer(msg.sender, amount), "transfer fail");
        emit Unstaked(msg.sender, amount);
    }

    function claim() external updateReward(msg.sender) {
        uint256 r = rewards[msg.sender];
        require(r > 0, "no rewards");
        rewards[msg.sender] = 0;
        require(token.transfer(msg.sender, r), "transfer fail");
        emit RewardPaid(msg.sender, r);
    }
}
