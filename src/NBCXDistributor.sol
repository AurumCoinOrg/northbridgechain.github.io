// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

/// @notice Owner-funded distributor for NBCX.
/// Flow:
/// 1) Owner approves this contract to spend NBCX
/// 2) Owner calls distribute() to send to many recipients
contract NBCXDistributor is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;

    event Distributed(uint256 count, uint256 total);
    event Rescue(address indexed token, address indexed to, uint256 amount);

    constructor(address initialOwner, address token_) Ownable(initialOwner) {
        require(token_ != address(0), "token=0");
        token = IERC20(token_);
    }

    /// @notice Distribute token amounts to recipients.
    /// @dev Requires owner has approved total amount to this contract.
    function distribute(address[] calldata to, uint256[] calldata amounts) external onlyOwner {
        require(to.length == amounts.length, "len mismatch");
        uint256 total = 0;

        for (uint256 i = 0; i < amounts.length; i++) {
            require(to[i] != address(0), "to=0");
            uint256 amt = amounts[i];
            require(amt > 0, "amt=0");
            total += amt;
        }

        for (uint256 i = 0; i < amounts.length; i++) {
            token.safeTransferFrom(msg.sender, to[i], amounts[i]);
        }

        emit Distributed(to.length, total);
    }

    /// @notice Rescue any ERC20 accidentally sent here (NOT needed for normal use).
    function rescueERC20(address erc20, address to, uint256 amount) external onlyOwner {
        require(to != address(0), "to=0");
        IERC20(erc20).safeTransfer(to, amount);
        emit Rescue(erc20, to, amount);
    }
}
