// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/NBCToken.sol";
import "../src/NBCXVault.sol";

contract NBCXVaultTest is Test {
    NBCToken token;
    NBCXVault vault;

    address owner = address(0xA11CE);
    address alice = address(0xB0B);

    function setUp() public {
        vm.prank(owner);
        token = new NBCToken(owner);

        vm.prank(owner);
        vault = new NBCXVault(owner, address(token));

        vm.prank(owner);
        token.mint(alice, 1000e18);

        vm.prank(alice);
        token.approve(address(vault), type(uint256).max);
    }

    function test_DepositAndWithdraw() public {
        vm.prank(alice);
        vault.deposit(100e18);

        assertEq(token.balanceOf(address(vault)), 100e18);

        vm.prank(owner);
        vault.withdraw(payable(owner), 40e18);

        assertEq(token.balanceOf(address(vault)), 60e18);
    }

    function test_OnlyOwnerWithdraw() public {
        vm.prank(alice);
        vault.deposit(10e18);

        vm.prank(alice);
        vm.expectRevert();
        vault.withdraw(payable(alice), 1e18);
    }
}
