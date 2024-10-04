// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "hardhat/console.sol";
import "./IDentityClient.sol";

contract DentityVerificationsOracle {
    address payable public owner;

    // Event emitted to signal the Oracle Node to fetch the verification data
    event DentityVerificationRequested(string ensName, address clientContract);

    // Dictionary of verification requests keyed on the client contract address
    mapping(address => VerificationRequest) _verificationRequests;

    struct VerificationRequest {
        string ensName;
        address callerContract;
        bool isPending;
    }

    /*
    // Check if the contract implements the IDentityClient interface
    function isValidClient(
        address contractAddress
    ) private view returns (bool) {
        (bool success, bytes memory result) = contractAddress.staticcall(
            abi.encodeWithSignature(
                "supportsInterface(bytes4)",
                DENTITY_CLIENT_INTERFACE_ID
            )
        );
        if (success && result.length == 32) {
            return abi.decode(result, (bool));
        }
        return false;
    }*/

    constructor() payable {
        // Ensure the deployer is the same as the account that will collect the funds
        owner = payable(msg.sender);
    }

    function requestDentityVerification(
        string calldata ensName,
        address clientContract
    ) public payable {
        /*
        require(
            isValidClient(clientContract),
            "Contract must implement IDentityClient"
        );

        // TODO: Check that the fee is enough
        // TODO: Check that the contract implements the IDentityClient interface
        // TODO: Escrow fees
        */

        VerificationRequest memory request = VerificationRequest(
            ensName,
            clientContract,
            true
        );
        _verificationRequests[clientContract] = request;

        // Emit event to signal the Oracle Node to fetch the verification data
        emit DentityVerificationRequested(ensName, clientContract);
    }
}
