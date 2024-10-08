import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

const CONTRACT_NAME = "DentityVerificationsOracle";

describe("DentityVerificationsOracle", function () {
  async function deployOracle() {
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    // Contracts are deployed using the first signer/account by default
    const contract = await hre.viem.deployContract(CONTRACT_NAME);

    const publicClient = await hre.viem.getPublicClient();

    return {
      contract,
      owner,
      otherAccount,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Deployer must be the owner that will get compensated", async function () {
      const { contract, owner } = await loadFixture(deployOracle);

      expect((await contract.read.owner()).toUpperCase()).to.equal(
        owner.account.address.toUpperCase()
      );
    });
  });

  describe("Oracle Nodes", function () {
    it("Should not add trusted oracle", async function () {
      const { contract, otherAccount } = await loadFixture(deployOracle);

      // We retrieve the contract with a different account to send a transaction
      const otherAccountContract = await hre.viem.getContractAt(
        CONTRACT_NAME,
        contract.address,
        { client: { wallet: otherAccount } }
      );

      await expect(
        otherAccountContract.write.addTrustedOracle([
          otherAccount.account.address,
        ])
      ).to.be.rejectedWith("Only the owner can add trusted oracles");
    });

    it("Add trusted oracle", async function () {
      const { contract, owner, otherAccount } = await loadFixture(deployOracle);

      // No failures expected
      await contract.write.addTrustedOracle([otherAccount.account.address]);

      // Check the oracle was added
      const trustedOracles = await contract.read.getTrustedOracleNodes();

      expect(
        trustedOracles.filter(
          (address) =>
            address.toLowerCase() === otherAccount.account.address.toLowerCase()
        )
      ).to.have.lengthOf(1);
    });
  });

  describe("Process Requests", function () {
    it("DentityVerificationRequested Event raised", async function () {
      const { contract } = await loadFixture(deployOracle);
      const ensName = "moisesj.eth";

      await contract.write.requestDentityVerification([
        ensName,
        contract.address,
      ]);

      // Get the raised events in the latest block
      const events = await contract.getEvents.DentityVerificationRequested();

      expect(events).to.have.lengthOf(1);
      expect(events[0].args.ensName).to.equal(ensName);
    });
  });

  describe("Process Responses", function () {
    it("processOracleNodeResponse", async function () {
      const { contract } = await loadFixture(deployOracle);
      const ensName = "moisesj.eth";

      await contract.write.requestDentityVerification([
        ensName,
        contract.address,
      ]);

      const events = await contract.getEvents.DentityVerificationRequested();
      expect(events).to.have.lengthOf(1);
      expect(events[0].args.ensName).to.equal(ensName);
    });
  });
});
