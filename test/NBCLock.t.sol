// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/NBCLock.sol";

contract NBCLockTest is Test {
    NBCLock lockc;

    address treasury = address(0xA11CE);
    address alice = address(0xB0B);

    function setUp() public {
        lockc = new NBCLock(treasury, 500); // 5%
        vm.deal(alice, 10 ether);
    }

    function test_LockThenWithdrawAfterTime() public {
        vm.prank(alice);
        uint256 id = lockc.lock{value: 1 ether}(3600);

        (uint256 amt, uint64 unlock) = lockc.locks(alice, id);
        assertEq(amt, 1 ether);
        assertGt(unlock, block.timestamp);

        vm.warp(block.timestamp + 3600);

        uint256 balBefore = alice.balance;
        vm.prank(alice);
        lockc.withdraw(id);
        uint256 balAfter = alice.balance;

        assertGt(balAfter, balBefore);
    }

    function test_EmergencyWithdrawPaysPenalty() public {
        vm.prank(alice);
        uint256 id = lockc.lock{value: 1 ether}(3600);

        uint256 tBefore = treasury.balance;

        vm.prank(alice);
        lockc.emergencyWithdraw(id);

        uint256 tAfter = treasury.balance;
        assertGt(tAfter, tBefore); // treasury got penalty
    }
}
