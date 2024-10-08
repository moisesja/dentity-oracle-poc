import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

const CONTRACT_NAME = "DentityVerificationsOracle";

describe("DentityVerificationsOracle", function () {
  async function deployOracle() {
    const walletClients = await hre.viem.getWalletClients();

    const [
      defaultAccount,
      oracleNodeAccount,
      requesterAccount,
      unknownAccount,
    ] = walletClients;

    // Contracts are deployed using the first signer/account by default
    const contract = await hre.viem.deployContract(CONTRACT_NAME);

    const publicClient = await hre.viem.getPublicClient();

    return {
      contract,
      defaultAccount,
      oracleNodeAccount,
      requesterAccount,
      unknownAccount,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Deployer must be the owner that will get compensated", async function () {
      const { contract, defaultAccount } = await loadFixture(deployOracle);

      expect((await contract.read.owner()).toUpperCase()).to.equal(
        defaultAccount.account.address.toUpperCase()
      );
    });
  });

  describe("Oracle Nodes", function () {
    it("Should not add trusted oracle", async function () {
      const { contract, unknownAccount } = await loadFixture(deployOracle);

      // We retrieve the contract with a different account to send a transaction
      const otherAccountContract = await hre.viem.getContractAt(
        CONTRACT_NAME,
        contract.address,
        { client: { wallet: unknownAccount } }
      );

      await expect(
        otherAccountContract.write.addTrustedOracle([
          // Any address suffices
          contract.address,
        ])
      ).to.be.rejectedWith("Only the owner can add trusted oracles");
    });

    it("Add trusted oracle", async function () {
      const { contract, defaultAccount, oracleNodeAccount } = await loadFixture(
        deployOracle
      );

      // No failures expected
      await contract.write.addTrustedOracle([
        oracleNodeAccount.account.address,
      ]);

      // Check the oracle was added
      const trustedOracles = await contract.read.getTrustedOracleNodes();

      expect(
        trustedOracles.filter(
          (address) =>
            address.toLowerCase() ===
            oracleNodeAccount.account.address.toLowerCase()
        )
      ).to.have.lengthOf(1);
    });
  });

  describe("Process Requests", function () {
    it("DentityVerificationRequested Event raised", async function () {
      const { contract, requesterAccount, oracleNodeAccount } =
        await loadFixture(deployOracle);
      const ensName = "moisesj.eth";

      const requesterAccountContract = await hre.viem.getContractAt(
        CONTRACT_NAME,
        contract.address,
        { client: { wallet: requesterAccount } }
      );

      await requesterAccountContract.write.requestDentityVerification([
        ensName,
        contract.address,
      ]);

      // Get the raised events in the latest block
      const events = await contract.getEvents.DentityVerificationRequested();

      expect(events).to.have.lengthOf(1);
      expect(events[0].args.ensName).to.equal(ensName);
      expect(events[0].args.clientAccount?.toLowerCase()).to.equal(
        requesterAccount.account.address.toLowerCase()
      );
      expect(events[0].args.callerContract?.toLowerCase()).to.equal(
        contract.address.toLowerCase()
      );
    });
  });

  describe("Process Responses", function () {
    it("processOracleNodeResponse", async function () {
      const { contract, oracleNodeAccount, requesterAccount } =
        await loadFixture(deployOracle);

      // No failures expected
      await contract.write.addTrustedOracle([
        oracleNodeAccount.account.address,
      ]);

      const ensName = "moisesj.eth";

      const requesterAccountContract = await hre.viem.getContractAt(
        CONTRACT_NAME,
        contract.address,
        { client: { wallet: requesterAccount } }
      );

      await requesterAccountContract.write.requestDentityVerification([
        ensName,
        contract.address,
      ]);

      // Get the raised events in the latest block
      const events = await contract.getEvents.DentityVerificationRequested();

      expect(events).to.have.lengthOf(1);
      expect(events[0].args.ensName).to.equal(ensName);
      expect(events[0].args.clientAccount?.toLowerCase()).to.equal(
        requesterAccount.account.address.toLowerCase()
      );
      expect(events[0].args.callerContract?.toLowerCase()).to.equal(
        contract.address.toLowerCase()
      );

      const oracleNodeAccountContract = await hre.viem.getContractAt(
        CONTRACT_NAME,
        contract.address,
        { client: { wallet: oracleNodeAccount } }
      );

      await oracleNodeAccountContract.write.processOracleNodeResponse([
        {
          ensName,
          errorCode: 0n,
          verifiablePresentation: "VP Token",
          callerContract: contract.address,
        },
      ]);
    });
  });
});
