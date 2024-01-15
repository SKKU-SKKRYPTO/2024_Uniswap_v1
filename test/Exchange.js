const { ethers } = require("hardhat");
const { expect } = require('chai');

const toWei = (value) => ethers.parseEther(value.toString());
const toEther = (value) => ethers.utils.formatEther(value);
const getBalance = ethers.provider.getBalance;

describe("Exchange", () => {
    let owner;
    let user;
    let exchange;
    let token;

    beforeEach(async () => {
        //기본적으로 10,000개의 Ether를 가지고 있음.
        [owner, user] = await ethers.getSigners();
        const TokenFactory = await ethers.getContractFactory("Token");
        token = await TokenFactory.deploy("GrayToken", "GRAY", toWei(1000000));
        await token.waitForDeployment();

        const ExchangeFactory = await ethers.getContractFactory("Exchange");
        exchange = await ExchangeFactory.deploy(token.target);
        await exchange.waitForDeployment();
    });

    describe("addLiquidity", async() => {
        it("add Liquiity", async() => {
            await token.approve(exchange.target, toWei(1000));
            await exchange.addLiquidity(toWei(1000), {value: toWei(1000)});
        });
    });
})