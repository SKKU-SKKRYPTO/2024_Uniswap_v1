const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const Factory = await ethers.getContractFactory("Factory");
    const contract = await Factory.deploy();

    const GrayToken = await ethers.getContractFactory("Token");
    const grayTokenContract = await GrayToken.deploy("GrayToken", "GRAY", 1000)

    const Exchange = await ethers.getContractFactory("Exchange");
    const exchangeContract = await Exchange.deploy(grayTokenContract.target)
    
    console.log("Contract deployed at:", contract.target);
    console.log("Contract2 deployed at:", grayTokenContract.target);

    console.log(exchangeContract.target)
}

main().then(() => process.exit(0)).catch((error) => {
    console.error("Error during deployment: ", error);
    process.exit(1);
});