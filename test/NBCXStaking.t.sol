// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/NBCToken.sol";
import "../src/NBCXStaking.sol";

contract NBCXStakingTest is Test {
    NBCToken token;
    NBCXStaking staking;

    address owner = address(0xA11CE);
    address alice = address(0xB0B);

    function setUp() public {
        vm.prank(owner);
        token = new NBCToken(owner);

        vm.prank(owner);
        staking = new NBCXStaking(owner, address(token));

        vm.prank(owner);
        token.mint(owner, 1_000_000e18);

        // fund staking rewards by sending tokens to staking contract
        vm.prank(owner);
        token.approve(address(staking), type(uint256).max);

        vm.prank(owner);
        staking.fund(100_000e18);

        // give alice tokens to stake
        vm.prank(owner);
        token.mint(alice, 10_000e18);

        vm.prank(alice);
        token.approve(address(staking), type(uint256).max);

        // set reward rate: 1 token/sec (1e18 wei per sec)
        vm.prank(owner);
        staking.setRewardRate(1e18);
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

        // should have 150 still staked
        assertEq(staking.staked(alice), 150e18);
    }
}
