import dotenv from "dotenv";
import {
  createPublicClient,
  http,
  getContract,
  GetBlockNumberErrorType,
  Hex,
} from "viem";
import { localhost } from "viem/chains";
import { dentityVerificationsOracleAbi, testDentityClientAbi } from "./abi";
import {
  oracleOwnerWalletClient,
  oracleNodeWalletClient,
  oracleCallerWalletClient,
} from "./wallet-clients";

// Load environment variables from .env file
dotenv.config();

// Immediately Invoked Function Expression (IIFE)
(async () => {
  try {
    const client = createPublicClient({
      chain: localhost,
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

    /*
    const events =
      await oracleContractByNode.getEvents.DentityVerificationRequested();
    console.log("events", events);
*/

    const unwatch =
      oracleContractByNode.watchEvent.DentityVerificationRequested({
        onLogs: (logs) => {
          logs.forEach((log) => {
            console.log("log", log);

            oracleContractByNode.write.processOracleNodeResponse([
              {
                ensName: "caca",
                errorCode: 0,
                verifiablePresentation: "VP Token",
                callerContract: process.env.CLIENT_CONTRACT_ADDRESS,
              },
            ]);
          });
        },
      });

    const callerContract = getContract({
      address: process.env.CLIENT_CONTRACT_ADDRESS as Hex,

      abi: testDentityClientAbi,
      // 1a. Insert a single client
      client: oracleCallerWalletClient,
    });

    const result = await callerContract.write.invokeOracle(["moisesj.eth"]);

    // Your asynchronous code here
    console.log("IIFE block executed");
  } catch (e) {
    const error = e as GetBlockNumberErrorType;
    console.error("Error:", error);
  }
})();
