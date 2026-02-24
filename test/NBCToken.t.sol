// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/NBCToken.sol";

contract NBCTokenTest is Test {
    NBCToken token;
    address owner = address(0xA11CE);
    address alice = address(0xB0B);

    function setUp() public {
        vm.prank(owner);
        token = new NBCToken(owner);
    }

    function test_MintOnlyOwner() public {
        vm.prank(owner);
        token.mint(alice, 100e18);
        assertEq(token.balanceOf(alice), 100e18);

        vm.prank(alice);
        vm.expectRevert();
        token.mint(alice, 1e18);
    }

    function test_Burn() public {
        vm.prank(owner);
        token.mint(alice, 50e18);

        vm.prank(alice);
        token.burn(20e18);

        assertEq(token.balanceOf(alice), 30e18);
    }
}
