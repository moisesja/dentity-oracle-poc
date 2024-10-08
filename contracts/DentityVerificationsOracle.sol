// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "hardhat/console.sol";
import "./IDentityClient.sol";

contract DentityVerificationsOracle {
    address payable public owner;

    address[] private _trustedOracleNodes;

    // Event emitted to signal the Oracle Node to fetch the verification data
    event DentityVerificationRequested(string ensName, address clientContract);

    // Dictionary of verification requests keyed on the client contract address
    mapping(address => VerificationRequest) private _verificationRequests;

    struct VerificationRequest {
        string ensName;
        address callerContract;
        bool isPending;
    }

    struct VerificationResponse {
        string ensName;
        string errorCode;
        string verifiablePresent;
        address callerContract;
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

    // TODO: Add method to add trusted oracles. Only the owner can add trusted oracles

    constructor() payable {
        // Ensure the deployer is the same as the account that will collect the funds
        owner = payable(msg.sender);
    }

    function addTrustedOracle(address oracleNodeAddress) public {
        require(msg.sender == owner, "Only the owner can add trusted oracles");

        require(oracleNodeAddress != address(0),
            "Oracle Node cannot have a zero address"
        );

        _trustedOracleNodes.push(oracleNodeAddress);
    }

    function requestDentityVerification(
        string calldata ensName,
        address clientContract
    ) public payable {
        // TODO: Check for parameters
        /*
        // TODO: Check that the contract implements the IDentityClient interface
        require(
            isValidClient(clientContract),
            "Contract must implement IDentityClient"
        );*/

        // TODO: Check that the fee is enough

        // TODO: Only then escrow fees and create the request

        VerificationRequest memory request = VerificationRequest(
            ensName,
            clientContract,
            true
        );
        _verificationRequests[clientContract] = request;

        // Emit event to signal the Oracle Node to fetch the verification data
        emit DentityVerificationRequested(ensName, clientContract);
    }

    function processOracleNodeResponse(VerificationResponse memory response) public view {

        // TODO: Add checks on the caller and make sure we trust it

        // Does request exist
        if (bytes(_verificationRequests[response.callerContract].ensName).length != 0) {
            VerificationRequest storage request = _verificationRequests[response.callerContract];

            if (
                request.isPending &&
                keccak256(abi.encodePacked(response.errorCode)) ==
                keccak256(abi.encodePacked("0"))
            ) {
                // Store the verification data in the client contract
            } else {
                // TODO: Refund the client
                // Raise an event to signal the client contract
            }
        }
    }

    function getTrustedOracleNodes() external view returns (address[] memory) {
        return _trustedOracleNodes;
    }
}