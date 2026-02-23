// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HelloNBC {
    string public message;

    constructor(string memory _msg) {
        message = _msg;
    }

    function setMessage(string calldata _msg) external {
        message = _msg;
    }
}
