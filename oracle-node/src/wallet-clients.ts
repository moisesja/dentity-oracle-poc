import dotenv from "dotenv";
import { publicActions, http, Hex, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { localhost } from "viem/chains";

dotenv.config();

const ownerKey = process.env.ORACLE_OWNER_PRIVATE_KEY;
const nodeKey = process.env.ORACLE_NODE_PRIVATE_KEY;
const callerKey = process.env.ORACLE_CLIENT_PRIVATE_KEY;

if (!ownerKey) {
  throw new Error("ORACLE_OWNER_PRIVATE_KEY is not defined in the .env file");
} else if (!nodeKey) {
  throw new Error("ORACLE_NODE_PRIVATE_KEY is not defined in the .env file");
} else if (!callerKey) {
  throw new Error("ORACLE_CLIENT_PRIVATE_KEY is not defined in the .env file");
}

const ownerAccount = privateKeyToAccount(ownerKey as Hex);
const nodeAccount = privateKeyToAccount(nodeKey as Hex);
const callerAccount = privateKeyToAccount(callerKey as Hex);

const oracleOwnerWalletClient = createWalletClient({
  account: ownerAccount,
  chain: localhost,
  transport: http(process.env.CHAIN_URL),
}).extend(publicActions);

const oracleNodeWalletClient = createWalletClient({
  account: nodeAccount,
  chain: localhost,
  transport: http(process.env.CHAIN_URL),
}).extend(publicActions);

const oracleCallerWalletClient = createWalletClient({
  account: callerAccount,
  chain: localhost,
  transport: http(process.env.CHAIN_URL),
}).extend(publicActions);

export {
  oracleOwnerWalletClient,
  oracleNodeWalletClient,
  oracleCallerWalletClient,
};
