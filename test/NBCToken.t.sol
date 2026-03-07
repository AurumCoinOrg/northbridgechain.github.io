// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/NBCToken.sol";

contract NBCTokenTest is Test {
    NBCToken token;

    address stakingPool = address(0x1111);
    address treasury   = address(0x2222);
    address ecosystem  = address(0x3333);
    address team       = address(0x4444);
    address liquidity  = address(0x5555);

    function setUp() public {
        token = new NBCToken(stakingPool, treasury, ecosystem, team, liquidity);
    }

    function test_TotalSupplyIsMaxSupply() public view {
        assertEq(token.totalSupply(), token.MAX_SUPPLY());
    }

    function test_Allocations() public view {
        assertEq(token.balanceOf(stakingPool), 35_000_000e18);
        assertEq(token.balanceOf(treasury),    30_000_000e18);
        assertEq(token.balanceOf(ecosystem),   20_000_000e18);
        assertEq(token.balanceOf(team),        10_000_000e18);
        assertEq(token.balanceOf(liquidity),    5_000_000e18);
    }

    function test_BurnReducesSupply() public {
        vm.prank(liquidity);
        token.burn(1_000e18);
        assertEq(token.totalSupply(), token.MAX_SUPPLY() - 1_000e18);
        assertEq(token.balanceOf(liquidity), 5_000_000e18 - 1_000e18);
    }
}
