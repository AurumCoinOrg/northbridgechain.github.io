// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

/**
 * NBCX V2 (Option A)
 * - Fixed supply minted ONCE in constructor
 * - NO owner
 * - NO mint function
 * - Burn is optional (not included)
 */
contract NBCXV2 is ERC20 {
    uint256 public immutable MAX_SUPPLY;

    constructor(string memory name_, string memory symbol_, uint256 maxSupply_, address receiver_) ERC20(name_, symbol_) {
        require(receiver_ != address(0), "receiver=0");
        MAX_SUPPLY = maxSupply_;
        _mint(receiver_, maxSupply_);
    }
}
