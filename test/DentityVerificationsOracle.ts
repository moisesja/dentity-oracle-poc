import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("DentityVerificationsOracle", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOracle() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const contract = await hre.viem.deployContract(
      "DentityVerificationsOracle"
    );

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
      const { contract, owner } = await deployOracle();

      expect((await contract.read.owner()).toUpperCase()).to.equal(
        owner.account.address.toUpperCase()
      );
    });
  });

  describe("Events", function () {
    it("DentityVerificationRequested Event raised", async function () {
      const { contract } = await deployOracle();
      const ensName = "moisesj.eth";

      await contract.write.requestDentityVerification([
        ensName,
        contract.address,
      ]);

      // get the withdrawal events in the latest block
      const events = await contract.getEvents.DentityVerificationRequested();
      expect(events).to.have.lengthOf(1);
      expect(events[0].args.ensName).to.equal(ensName);
    });
  });
});
