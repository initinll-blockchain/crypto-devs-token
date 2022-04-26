// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { CRYPTODEVSNFT_CONTRACT_ADDRESS } from "../constants/constant"; 

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const cryptoDevTokenContractFactory = await ethers.getContractFactory("CryptoDevsToken");
  const cryptoDevTokenContract = await cryptoDevTokenContractFactory.deploy(
    CRYPTODEVSNFT_CONTRACT_ADDRESS
  );
  
  await cryptoDevTokenContract.deployed();

  console.log("CryptoDevToken deployed to: ", cryptoDevTokenContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
