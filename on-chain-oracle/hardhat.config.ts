const fs = require("fs");
const path = require("path");
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-viem");

// NEVER record important private keys in your code - this is for demo purposes
const SEPOLIA_TESTNET_PRIVATE_KEY = "";
const ARBITRUM_MAINNET_TEMPORARY_PRIVATE_KEY = "";

function camelToKebab(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function pascalToCamel(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

task("abicopy", "Copies the lates ABI code to the oracle-node Viem scripts")
  .addParam("contractname", "The name of the smartcontract without extension")
  .setAction(async (taskArgs) => {
    const contractName = taskArgs.contractname;

    const abiFile = camelToKebab(contractName);
    const variableName = pascalToCamel(contractName);

    const artifactsPath = path.join(
      __dirname,
      "artifacts",
      "contracts",
      `${contractName}.sol`,
      `${contractName}.json`
    );

    if (fs.existsSync(artifactsPath)) {
      const contractArtifact = JSON.parse(
        fs.readFileSync(artifactsPath, "utf8")
      );

      const outputPath = path.join(
        "..",
        "oracle-node",
        "src",
        "abi",
        `${abiFile}-abi.ts`
      );

      const abiContent = `const ${variableName}Abi = ${JSON.stringify(
        contractArtifact.abi,
        null,
        2
      )};\nexport default ${variableName}Abi;`;

      fs.writeFileSync(outputPath, abiContent, "utf8");
      console.log(`ABI has been written to ${outputPath}`);
    } else {
      console.error(
        `Artifact for contract ${contractName} not found at ${artifactsPath}`
      );
    }
  });
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.26",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614,
      accounts: [SEPOLIA_TESTNET_PRIVATE_KEY],
    },
    arbitrumOne: {
      url: "https://arb1.arbitrum.io/rpc",
      //accounts: [ARBITRUM_MAINNET_TEMPORARY_PRIVATE_KEY]
    },
  },
};
