// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "openzeppelin-contracts/contracts/access/Ownable.sol";

/// @notice Simple native NBC (anbc) vault.
/// - Anyone can deposit (ETH-style native value)
/// - Only owner can withdraw
/// - Track totalDeposited for proof-of-use demos
contract NBCVault is Ownable {
    uint256 public totalDeposited;

    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {
    }

    function deposit() external payable {
        require(msg.value > 0, "no value");
        totalDeposited += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(address payable to, uint256 amount) external onlyOwner {
        require(to != address(0), "to=0");
        require(amount > 0, "amount=0");
        require(address(this).balance >= amount, "insufficient");
        (bool ok,) = to.call{value: amount}("");
        require(ok, "send fail");
        emit Withdrawn(to, amount);
    }

    receive() external payable {
        totalDeposited += msg.value;
        emit Deposited(msg.sender, msg.value);
    }
}
