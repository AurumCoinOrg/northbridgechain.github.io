// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

/// @notice ERC20 vault for NBCX
/// - Users deposit NBCX (transferFrom)
/// - Owner can withdraw NBCX
contract NBCXVault is Ownable {
    using SafeERC20 for IERC20;

    IERC20  public immutable token;        // NBCX token
    uint256 public totalDeposited;

    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(address initialOwner, address tokenAddress) Ownable(initialOwner) {
        require(tokenAddress != address(0), "token=0");
        token = IERC20(tokenAddress);
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "amount=0");
        totalDeposited += amount;
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, amount);
    }

    function withdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "to=0");
        require(amount > 0, "amount=0");
        token.safeTransfer(to, amount);
        emit Withdrawn(to, amount);
    }
}
