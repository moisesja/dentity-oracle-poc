// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const testDentityClientModule = buildModule("TestDentityClientModule", (m) => {
  const client = m.contract("TestDentityClient", [
    "0x6288d5904c631EE60d59E050a3ec2eD2fF9E64a9",
  ]);

  return { client };
});

export default testDentityClientModule;
