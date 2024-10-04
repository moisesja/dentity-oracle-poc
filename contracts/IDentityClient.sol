// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

/// @title IDentityClient Interface
/// @notice Any Dentity Oracle client contract must implement this interface.
/// @dev This interface includes a struct for verification results and a function to process these results.
interface IDentityClient {
    function processVerificationResult(
        uint256 errorCode,
        string memory credential,
        bool isGated
    ) external;

    function supportsInterface(bytes4 interfaceId) external pure returns (bool);
}
