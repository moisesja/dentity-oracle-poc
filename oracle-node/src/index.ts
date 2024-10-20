import dotenv from "dotenv";
import {
  createPublicClient,
  http,
  getContract,
  GetBlockNumberErrorType,
  Hex,
} from "viem";
import { arbitrumSepolia } from "viem/chains";
import { dentityVerificationsOracleAbi, testDentityClientAbi } from "./abi";
import {
  oracleOwnerWalletClient,
  oracleNodeWalletClient,
  oracleCallerWalletClient,
} from "./wallet-clients";
import Verifications from "./verifications";

// Load environment variables from .env file
dotenv.config();

async function main(ensName: string) {
  try {
    //console.log("Invoking Client for: ", ensName);
    console.log("Oracle Node started");

    const client = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(process.env.CHAIN_URL),
    });

    const oracleContractByOwner = getContract({
      address: process.env.ORACLE_CONTRACT_ADDRESS as Hex,

      abi: dentityVerificationsOracleAbi,
      // 1a. Insert a single client
      client: oracleOwnerWalletClient,
    });

    const oracleContractByNode = getContract({
      address: process.env.ORACLE_CONTRACT_ADDRESS as Hex,

      abi: dentityVerificationsOracleAbi,
      // 1a. Insert a single client
      client: oracleNodeWalletClient,
    });

    const oracleNodes =
      await oracleContractByOwner.read.getTrustedOracleNodes();

    console.log("oracleNodes", oracleNodes);

    if (!oracleNodes || (oracleNodes as []).length === 0) {
      await oracleContractByOwner.write.addTrustedOracle([
        oracleNodeWalletClient.account.address,
      ]);

      console.log("Trusted Oracle Node added");
    }

    const dentityVerificationsService = Verifications.getInstance();

    const unwatch =
      oracleContractByNode.watchEvent.DentityVerificationRequested({
        onLogs: (logs) => {
          logs.forEach((log) => {
            const message = (log as any).args;
            console.log("log", message);

            const verifications =
              dentityVerificationsService.getDentityVerifications(
                message.ensName
              );

            console.log("verifications", verifications);
            /*
            oracleContractByNode.write.processOracleNodeResponse([
              {
                ensName: "moisesj.eth",
                errorCode: 0,
                verifiablePresentation: "VP Token",
                callerContract: process.env.CLIENT_CONTRACT_ADDRESS,
              },
            ]);*/
          });
        },
      });

    const callerContract = getContract({
      address: process.env.CLIENT_CONTRACT_ADDRESS as Hex,

      abi: testDentityClientAbi,
      // 1a. Insert a single client
      client: oracleCallerWalletClient,
    });

    //const result = await callerContract.write.invokeOracle([ensName]);

    // Your asynchronous code here
    console.log("IIFE block executed");
  } catch (e) {
    const error = e as GetBlockNumberErrorType;
    console.error("Error:", error);
  }
}

(async function () {
  const args = process.argv.slice(2);
  await main(args[0]);
})();
