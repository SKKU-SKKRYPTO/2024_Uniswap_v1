const { ethers } = require("hardhat");
const { expect } = require('chai');

const toWei = (value) => ethers.parseEther(value.toString());
const toEther = (value) => ethers.utils.formatEther(value);
const provider = ethers.provider;
const getBalance = provider.getBalance;

describe("Exchange", () => {
    let owner;
    let user;
    let exchange;
    let token;
    let factory;

    beforeEach(async () => {
        //기본적으로 10,000개의 Ether를 가지고 있음.
        [owner, user] = await ethers.getSigners();

        const TokenFactory = await ethers.getContractFactory("Token");
        token = await TokenFactory.deploy("GrayToken", "GRAY", toWei(50));
        await token.waitForDeployment();

        const FactoryFactory = await ethers.getContractFactory("Factory");
        factory = await FactoryFactory.deploy();
        await factory.waitForDeployment();
    });

    describe("deploy Factory Contrace", async() => {
        it("correct Factory Contrace", async() => {

            const exchangeAddress = await factory.createExchange(token.target);
            console.log(exchangeAddress);
            console.log(await factory.getExchange(token.target));
            console.log(await factory.createExchange(token.target));
            // expect(await factory.getExchange(token.target)).to.equal(exchangeAddress);
        });
    });
});