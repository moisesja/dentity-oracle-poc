const dentityVerificationsOracleAbi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "ensName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "clientAccount",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "callerContract",
        type: "address",
      },
    ],
    name: "DentityVerificationRequested",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "oracleNodeAddress",
        type: "address",
      },
    ],
    name: "addTrustedOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getTrustedOracleNodes",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "isTrustedOracleNode",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address payable",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "ensName",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "errorCode",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "verifiablePresentation",
            type: "string",
          },
          {
            internalType: "address",
            name: "callerContract",
            type: "address",
          },
        ],
        internalType: "struct DentityVerificationsOracle.VerificationResponse",
        name: "response",
        type: "tuple",
      },
    ],
    name: "processOracleNodeResponse",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "ensName",
        type: "string",
      },
      {
        internalType: "address",
        name: "clientContract",
        type: "address",
      },
    ],
    name: "requestDentityVerification",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

export default dentityVerificationsOracleAbi;
