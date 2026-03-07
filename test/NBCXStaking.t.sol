// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/NBCToken.sol";
import "../src/NBCXStaking.sol";

contract NBCXStakingTest is Test {
    NBCToken token;
    NBCXStaking staking;

    address stakingPool = address(0x1111);
    address treasury   = address(0x2222);
    address ecosystem  = address(0x3333);
    address team       = address(0x4444);
    address liquidity  = address(0x5555);

    address alice = address(0xB0B);

    function setUp() public {
        // Deploy token (fixed allocations)
        token = new NBCToken(stakingPool, treasury, ecosystem, team, liquidity);

        // Deploy staking (deterministic halving)
        staking = new NBCXStaking(address(token));

        // Fund staking contract with some rewards (from the stakingPool allocation)
        vm.prank(stakingPool);
        token.transfer(address(staking), 200_000e18);

        // Give Alice stake tokens (from liquidity allocation)
        vm.prank(liquidity);
        token.transfer(alice, 10_000e18);

        vm.prank(alice);
        token.approve(address(staking), type(uint256).max);
    }

    function test_StakeEarnClaim() public {
        vm.prank(alice);
        staking.stake(100e18);

        vm.warp(block.timestamp + 10);

        uint256 e = staking.earned(alice);
        assertGt(e, 0);

        uint256 balBefore = token.balanceOf(alice);

        vm.prank(alice);
        staking.claim();

        uint256 balAfter = token.balanceOf(alice);
        assertGt(balAfter, balBefore);
    }

    function test_Unstake() public {
        vm.prank(alice);
        staking.stake(200e18);

        vm.prank(alice);
        staking.unstake(50e18);

        assertEq(staking.staked(alice), 150e18);
    }
}
