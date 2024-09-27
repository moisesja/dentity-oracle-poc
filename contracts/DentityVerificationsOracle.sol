// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "hardhat/console.sol";

contract DentityVerificationsOracle {
    address payable public owner;

    event DentityVerificationRequested(address clientContract, string ensName);

    constructor() payable {
        // Ensure the deployer is the same as the account that will collect the funds
        owner = payable(msg.sender);
    }

    function requestDentityVerification(string memory ensName) public payable {
        // TODO: Check that the fee is enough
        // TODO: Check that the contract implements the IDentityClient interface

        emit DentityVerificationRequested(address(this), ensName);

        //owner.transfer(address(this).balance);
    }
}
