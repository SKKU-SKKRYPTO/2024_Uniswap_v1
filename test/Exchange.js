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
            
            // console.log(exchange.target);
            
            // exchange컨트랙트가 이더리움 몇개 가지고 있는지 (에러남 -> 해결)
            // expect(await getBalance(exchange.target)).to.equal(toWei(1000));
            expect(await provider.getBalance(exchange.target)).to.equal(toWei(1000)); 
            
            // exchange컨트랙트가 가지는 gray token의 balance가 1000개인지 확인
            expect(await token.balanceOf(exchange.target)).to.equal(toWei(1000));
        });
    });

    describe("swap", async() => {
        it("swap", async() => {
            await token.approve(exchange.target, toWei(1000));
            await exchange.addLiquidity(toWei(1000), {value: toWei(1000)});
            
            await exchange.connect(user).ethToTokenSwap({value: toWei(1)});
            
            // exchange컨트랙트가 이더리움 몇개 가지고 있는지
            expect(await provider.getBalance(exchange.target)).to.equal(toWei(1001)); 
            // exchange컨트랙트가 가지는 gray token의 balance가 1000개인지 확인
            expect(await token.balanceOf(exchange.target)).to.equal(toWei(999));
            
            // user가 가지는 gray token의 balance가 1개인지 확인
            // 이때 user.target이 아닌 user.address를 사용하는 이유는
            // user.target은 contract이고, user.address는 address이기 때문에
            // user.target은 balanceOf함수가 없기 때문이다.
            expect(await token.balanceOf(user.address)).to.equal(toWei(1));
            // user가 가지는 이더리움은 10,000 - 1 = 9,999개이지만, 추가로 가스비까지 빠진다.
        });
    });
})