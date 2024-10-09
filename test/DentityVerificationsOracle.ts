import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

const VERIFICATIONS_ORACLE = "DentityVerificationsOracle";
const CLIENT_CONTRACT = "TestDentityClient";

describe("DentityVerificationsOracle", function () {
  async function deployOracle() {
    const walletClients = await hre.viem.getWalletClients();

    const [
      defaultAccount,
      oracleNodeAccount,
      requesterAccount,
      unknownAccount,
    ] = walletClients;

    // Contract is deployed using the first signer/account by default
    const oracleContract = await hre.viem.deployContract(VERIFICATIONS_ORACLE);

    // It doesn't matter who deploys this contract
    const clientContract = await hre.viem.deployContract(CLIENT_CONTRACT, [
      oracleContract.address,
    ]);

    const publicClient = await hre.viem.getPublicClient();

    return {
      oracleContract,
      clientContract,
      defaultAccount,
      oracleNodeAccount,
      requesterAccount,
      unknownAccount,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Deployer must be the owner that will get compensated", async function () {
      const { oracleContract, defaultAccount } = await loadFixture(
        deployOracle
      );

      expect((await oracleContract.read.owner()).toUpperCase()).to.equal(
        defaultAccount.account.address.toUpperCase()
      );
    });
  });

  describe("Oracle Nodes", function () {
    it("Should not add trusted oracle", async function () {
      const { oracleContract, unknownAccount } = await loadFixture(
        deployOracle
      );

      // We retrieve the contract with a different account to send a transaction
      const otherAccountContract = await hre.viem.getContractAt(
        VERIFICATIONS_ORACLE,
        oracleContract.address,
        { client: { wallet: unknownAccount } }
      );

      await expect(
        otherAccountContract.write.addTrustedOracle([
          // Any address suffices
          oracleContract.address,
        ])
      ).to.be.rejectedWith("Only the owner can add trusted oracles");
    });

    it("Add trusted oracle", async function () {
      const { oracleContract, oracleNodeAccount } = await loadFixture(
        deployOracle
      );

      // No failures expected
      await oracleContract.write.addTrustedOracle([
        oracleNodeAccount.account.address,
      ]);

      // Check the oracle was added
      const trustedOracles = await oracleContract.read.getTrustedOracleNodes();

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
    it("Invalid Client Error Expected", async function () {
      const { oracleContract, requesterAccount, oracleNodeAccount } =
        await loadFixture(deployOracle);
      const ensName = "moisesj.eth";

      const requesterAccountContract = await hre.viem.getContractAt(
        VERIFICATIONS_ORACLE,
        oracleContract.address,
        { client: { wallet: requesterAccount } }
      );

      await expect(
        requesterAccountContract.write.requestDentityVerification([
          ensName,
          // A non-compliant contract address
          oracleContract.address,
        ])
      ).to.be.rejectedWith("Contract must implement IDentityClient");
    });

    it("DentityVerificationRequested Event raised", async function () {
      const { oracleContract, clientContract, requesterAccount } =
        await loadFixture(deployOracle);
      const ensName = "moisesj.eth";

      const requesterAccountContract = await hre.viem.getContractAt(
        VERIFICATIONS_ORACLE,
        oracleContract.address,
        { client: { wallet: requesterAccount } }
      );

      await requesterAccountContract.write.requestDentityVerification([
        ensName,
        // Compliant contract
        clientContract.address,
      ]);

      // Get the raised events in the latest block
      const events =
        await oracleContract.getEvents.DentityVerificationRequested();

      expect(events).to.have.lengthOf(1);
      expect(events[0].args.ensName).to.equal(ensName);
      expect(events[0].args.clientAccount?.toLowerCase()).to.equal(
        requesterAccount.account.address.toLowerCase()
      );
      expect(events[0].args.callerContract?.toLowerCase()).to.equal(
        clientContract.address.toLowerCase()
      );
    });
  });

  describe("Process Responses", function () {
    it("processOracleNodeResponse", async function () {
      const {
        oracleContract,
        clientContract,
        oracleNodeAccount,
        requesterAccount,
      } = await loadFixture(deployOracle);

      // No failures expected
      await oracleContract.write.addTrustedOracle([
        oracleNodeAccount.account.address,
      ]);

      const ensName = "moisesj.eth";

      const requesterAccountContract = await hre.viem.getContractAt(
        VERIFICATIONS_ORACLE,
        oracleContract.address,
        { client: { wallet: requesterAccount } }
      );

      await requesterAccountContract.write.requestDentityVerification([
        ensName,
        // Compliant contract address
        clientContract.address,
      ]);

      // Get the raised events in the latest block
      const events =
        await oracleContract.getEvents.DentityVerificationRequested();

      expect(events).to.have.lengthOf(1);
      expect(events[0].args.ensName).to.equal(ensName);
      expect(events[0].args.clientAccount?.toLowerCase()).to.equal(
        requesterAccount.account.address.toLowerCase()
      );
      expect(events[0].args.callerContract?.toLowerCase()).to.equal(
        clientContract.address.toLowerCase()
      );

      const oracleNodeAccountContract = await hre.viem.getContractAt(
        VERIFICATIONS_ORACLE,
        oracleContract.address,
        { client: { wallet: oracleNodeAccount } }
      );

      await oracleNodeAccountContract.write.processOracleNodeResponse([
        {
          ensName,
          errorCode: 0n,
          verifiablePresentation: "VP Token",
          callerContract: clientContract.address,
        },
      ]);
    });
  });
});
