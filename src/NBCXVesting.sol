// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract NBCXVesting {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    address public immutable beneficiary;
    uint64  public immutable start;
    uint64  public immutable duration;

    uint256 public released;

    constructor(address token_, address beneficiary_, uint64 start_, uint64 duration_) {
        require(token_ != address(0), "bad token");
        require(beneficiary_ != address(0), "bad beneficiary");
        require(duration_ > 0, "bad duration");
        token = IERC20(token_);
        beneficiary = beneficiary_;
        start = start_;
        duration = duration_;
    }

    function totalAllocation() public view returns (uint256) {
        return token.balanceOf(address(this)) + released;
    }

    function vestedAmount(uint64 ts) public view returns (uint256) {
        uint256 total = totalAllocation();
        if (ts <= start) return 0;
        uint64 end = start + duration;
        if (ts >= end) return total;
        uint256 elapsed = uint256(ts - start);
        return (total * elapsed) / uint256(duration);
    }

    function releasable() public view returns (uint256) {
        return vestedAmount(uint64(block.timestamp)) - released;
    }

    function release() external {
        uint256 amt = releasable();
        require(amt > 0, "nothing");
        released += amt;
        token.safeTransfer(beneficiary, amt);
    }
}
