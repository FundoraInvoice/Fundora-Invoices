import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const Invoice1155 = await ethers.getContractFactory("Invoice1155");

  // Deploy the contract
  const contract = await Invoice1155.deploy();

  // Wait for deployment
  await contract.waitForDeployment(); // Use this instead of deployed()

  console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
