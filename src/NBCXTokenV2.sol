// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

/// @notice Fixed-supply token. No owner. No mint. No upgrade hooks.
contract NBCXTokenV2 is ERC20 {
    constructor(
        string memory name_,
        string memory symbol_,
        address initialHolder,
        uint256 totalSupply_
    ) ERC20(name_, symbol_) {
        require(initialHolder != address(0), "bad holder");
        _mint(initialHolder, totalSupply_);
    }
}
