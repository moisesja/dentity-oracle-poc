// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "hardhat/console.sol";
import "./DentityClient.sol";
import "./DentityVerificationsOracle.sol";

contract TestDentityClient is DentityClient {

    // The address of the Dentity Oracle contract. Set after Oracle has been deployed.
    address private ORACLE_ADDRESS;

    constructor(address oracleContractAddress) {
        ORACLE_ADDRESS = oracleContractAddress;
    }

    /// Inherited from IDentityClient
    /// @notice This function is called by the Dentity Oracle to provide the verification result to the client contract.    
    /// @param errorCode Error code for the verification result.
    /// @param credential If the verification was successful, the credential is provided here.
    /// @param isGated Flag indicating if the verification is gated.
    function processVerificationResult(
        uint256 errorCode,
        string memory credential,
        bool isGated
    ) external override {

        DentityVerificationsOracle(ORACLE_ADDRESS).requestDentityVerification("test.ens", address(this));
        console.log("TestDentityClient.processVerificationResult called");
    }

    function invokeOracle() public {
        console.log("TestDentityClient.invokeOracle called");
    }
}