const hre = require("hardhat");

async function main() {
  const PayBox = await hre.ethers.getContractFactory("PayBox");
  const paybox = await PayBox.deploy();

  const address = await paybox.getAddress();

  console.log("PayBox deployed to:", address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
