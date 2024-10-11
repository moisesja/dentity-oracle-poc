// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "hardhat/console.sol";
import "./IDentityClient.sol";

contract DentityVerificationsOracle {
    
    /// @dev Struct to hold the verification request data.
    struct VerificationRequest {
        string ensName;
        address clientAccount;
        address callerContract;
        bool isPending;
    }
    /// @dev Struct to hold the verification response data.
    struct VerificationResponse {
        string ensName;
        uint256 errorCode;
        string verifiablePresentation;
        address callerContract;
    }

    // Dictionary of verification requests keyed on the client contract address
    mapping(address => VerificationRequest) private _verificationRequests;

    // List of trusted Oracle Nodes
    address[] private _trustedOracleNodes;
    
    // Selector for the processVerificationResult function in the client contract
    bytes4 private constant PROCESS_VERIFICATION_SELECTOR = bytes4(keccak256(bytes('processVerificationResult(uint256,string,bool)')));
    bytes4 private constant DENTITY_CLIENT_INTERFACE_ID = type(IDentityClient).interfaceId;
    
    /**
     * @dev Event emitted to signal the Oracle Node to fetch the verification data.
     * @param ensName The ENS name for which the verification is requested.
     * @param clientAccount The address of the client account requesting the verification.
     * @param callerContract The address of the contract that called the verification request.
     */
    event DentityVerificationRequested(string ensName, address clientAccount, address callerContract);

    // The address that deploys and manages this contract.
    address payable public owner;

    /// @notice Checks if the given address is a trusted oracle node. This routine has a complexity of O(n) but we don't expect to have many trusted oracle nodes.
    /// @param caller The address to check.
    /// @return bool True if the address is a trusted oracle node, false otherwise.
    function isTrustedOracleNode(address caller) public view returns (bool) {
        
        for (uint index = 0; index < _trustedOracleNodes.length; index++) {
            if (_trustedOracleNodes[index] == caller) {
                return true;
            }
        }

        return false;
    }

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
    }

    // TODO: Add method to add trusted oracles. Only the owner can add trusted oracles

    constructor() {
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
    ) external payable {
        // TODO: Check for parameters
        
        // TODO: Check that the contract implements the IDentityClient interface
        require(
            isValidClient(clientContract),
            "Contract must implement IDentityClient"
        );

        console.log("requestDentityVerification called");

        // TODO: Check that the fee is enough

        // TODO: Only then escrow fees and create the request

        VerificationRequest memory request = VerificationRequest(
            ensName,
            msg.sender,
            clientContract,
            true
        );

        _verificationRequests[clientContract] = request;

        // Emit event to signal the Oracle Node to fetch the verification data
        emit DentityVerificationRequested(request.ensName, request.clientAccount, request.callerContract);
    }

    function processOracleNodeResponse(VerificationResponse memory response) public {
 
        require(isTrustedOracleNode(msg.sender), "Caller is not a trusted Oracle Node");

        // Does request exist
        if (bytes(_verificationRequests[response.callerContract].ensName).length != 0) {

            VerificationRequest storage request = _verificationRequests[response.callerContract];

            if (
                request.isPending 
                //&&
                //keccak256(abi.encodePacked(response.errorCode)) ==
                //keccak256(abi.encodePacked("0")
            ) {
                (bool success, ) = response.callerContract.call(
                    abi.encodeWithSelector(PROCESS_VERIFICATION_SELECTOR, response.errorCode, response.verifiablePresentation, false));

                require(success, "Low-level call failed");
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