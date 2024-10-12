const testDentityClientAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "oracleContractAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "ensName",
        "type": "string"
      }
    ],
    "name": "invokeOracle",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "errorCode",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "credential",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isGated",
        "type": "bool"
      }
    ],
    "name": "processVerificationResult",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  }
];
export default testDentityClientAbi;