// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract NBCXMultiSig {

    event Deposit(address indexed sender, uint amount);
    event Submit(uint indexed txId);
    event Confirm(address indexed owner, uint indexed txId);
    event Execute(uint indexed txId);

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public required;

    struct Transaction {
        address to;
        uint value;
        bytes data;
        bool executed;
        uint confirmations;
    }

    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public confirmed;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    constructor(address[] memory _owners, uint _required) {
        require(_owners.length >= _required, "bad threshold");
        require(_required > 0, "zero required");

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "zero owner");
            require(!isOwner[owner], "duplicate");
            isOwner[owner] = true;
            owners.push(owner);
        }

        required = _required;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function submit(address to, uint value, bytes memory data)
        public
        onlyOwner
        returns (uint txId)
    {
        txId = transactions.length;

        transactions.push(
            Transaction({
                to: to,
                value: value,
                data: data,
                executed: false,
                confirmations: 0
            })
        );

        emit Submit(txId);
    }

    function confirm(uint txId) public onlyOwner {
        Transaction storage txn = transactions[txId];
        require(!txn.executed, "executed");
        require(!confirmed[txId][msg.sender], "confirmed");

        confirmed[txId][msg.sender] = true;
        txn.confirmations++;

        emit Confirm(msg.sender, txId);
    }

    function execute(uint txId) public onlyOwner {
        Transaction storage txn = transactions[txId];
        require(!txn.executed, "executed");
        require(txn.confirmations >= required, "not enough confirmations");

        txn.executed = true;

        (bool ok, ) = txn.to.call{value: txn.value}(txn.data);
        require(ok, "tx failed");

        emit Execute(txId);
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }
}
