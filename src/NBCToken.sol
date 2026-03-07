// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

/// @title NBCX v2 — Fixed Supply Constitutional Token
/// @notice Hard capped at 100,000,000 NBCX. Minted once at deployment.
contract NBCToken is ERC20 {

    uint256 public constant MAX_SUPPLY = 100_000_000e18;

    constructor(
        address stakingPool,
        address treasury,
        address ecosystem,
        address team,
        address liquidity
    )
        ERC20("Northbridge Token", "NBCX")
    {
        require(
            stakingPool != address(0) &&
            treasury != address(0) &&
            ecosystem != address(0) &&
            team != address(0) &&
            liquidity != address(0),
            "zero address"
        );

        // Distribution
        _mint(stakingPool, 35_000_000e18);
        _mint(treasury,     30_000_000e18);
        _mint(ecosystem,    20_000_000e18);
        _mint(team,         10_000_000e18);
        _mint(liquidity,     5_000_000e18);

        require(totalSupply() == MAX_SUPPLY, "cap mismatch");
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
