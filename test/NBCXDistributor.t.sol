// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/NBCToken.sol";
import "../src/NBCXDistributor.sol";

contract NBCXDistributorTest is Test {
    NBCToken token;
    NBCXDistributor dist;

    address owner = address(0xA11CE);
    address r1 = address(0xB0B);
    address r2 = address(0xC0C);

    function setUp() public {
        vm.prank(owner);
        token = new NBCToken(owner);

        vm.prank(owner);
        dist = new NBCXDistributor(owner, address(token));

        vm.prank(owner);
        token.mint(owner, 1000e18);

        vm.prank(owner);
        token.approve(address(dist), type(uint256).max);
    }

    function test_DistributeTwoRecipients() public {
        address[] memory recipients = new address[](2);
        uint256[] memory amounts = new uint256[](2);


        recipients[0] = r1;
        amounts[0] = 10e18;

        recipients[1] = r2;
        amounts[1] = 20e18;

        vm.prank(owner);
        dist.distribute(recipients, amounts);

        assertEq(token.balanceOf(r1), 10e18);
        assertEq(token.balanceOf(r2), 20e18);
    }
}
