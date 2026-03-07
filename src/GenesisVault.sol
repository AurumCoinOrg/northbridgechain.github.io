// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @notice Minimal 3-of-5 multisig with 72h timelock.
/// Designed for treasury custody only.
contract GenesisVault {

    uint256 public constant TIMELOCK = 72 hours;
    uint256 public constant REQUIRED_APPROVALS = 3;

    mapping(address => bool) public isSigner;
    address[] public signers;

    struct Tx {
        address to;
        uint256 value;
        bytes data;
        uint256 executeAfter;
        uint256 approvals;
        bool executed;
    }

    Tx[] public transactions;
    mapping(uint256 => mapping(address => bool)) public approved;

    modifier onlySigner() {
        require(isSigner[msg.sender], "not signer");
        _;
    }

    constructor(address[] memory _signers) {
        require(_signers.length == 5, "need 5 signers");
        for (uint256 i = 0; i < 5; i++) {
            require(_signers[i] != address(0), "zero addr");
            require(!isSigner[_signers[i]], "duplicate");
            isSigner[_signers[i]] = true;
            signers.push(_signers[i]);
        }
    }

    function submit(
        address to,
        uint256 value,
        bytes calldata data
    ) external onlySigner returns (uint256 txId) {
        txId = transactions.length;
        transactions.push(
            Tx({
                to: to,
                value: value,
                data: data,
                executeAfter: block.timestamp + TIMELOCK,
                approvals: 0,
                executed: false
            })
        );
    }

    function approve(uint256 txId) external onlySigner {
        Tx storage txn = transactions[txId];
        require(!txn.executed, "executed");
        require(!approved[txId][msg.sender], "already approved");

        approved[txId][msg.sender] = true;
        txn.approvals += 1;
    }

    function execute(uint256 txId) external onlySigner {
        Tx storage txn = transactions[txId];

        require(!txn.executed, "executed");
        require(txn.approvals >= REQUIRED_APPROVALS, "not enough approvals");
        require(block.timestamp >= txn.executeAfter, "timelocked");

        txn.executed = true;

        (bool ok, ) = txn.to.call{value: txn.value}(txn.data);
        require(ok, "tx failed");
    }

    receive() external payable {}
}
