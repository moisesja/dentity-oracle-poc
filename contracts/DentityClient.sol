// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "hardhat/console.sol";
import "./IDentityClient.sol";

abstract contract DentityClient is IDentityClient {
    function processVerificationResult(
        uint256 errorCode,
        string memory credential,
        bool isGated
    ) external virtual override {}

    function supportsInterface(
        bytes4 interfaceId
    ) external pure virtual override returns (bool) {
        return interfaceId == type(IDentityClient).interfaceId;
    }
}
