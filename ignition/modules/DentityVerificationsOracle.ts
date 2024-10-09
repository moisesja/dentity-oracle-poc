// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const oracleModule = buildModule("OracleModule", (m) => {
  const oracle = m.contract("DentityVerificationsOracle");

  return { oracle };
});

export default oracleModule;
