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
            
            await exchange.connect(user).ethToTokenSwapCSMM({value: toWei(1)});
            
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

    describe("getOutputAmount", async() => {
        it("getOutputAmount", async() => {
            await token.approve(exchange.target, toWei(4000));
            // 토큰4:이더1 비율
            await exchange.addLiquidity(toWei(4000), {value: toWei(1000)});


            // 새로들어온 이더 1, ETH 초기값은 컨트랙트의 balance, 토큰의 초기값은 컨트랙트의 토큰 balance
            // console.log(await provider.getBalance(exchange.target))
            // console.log(await token.balanceOf(exchange.target))
            // console.log(toWei(1))
            console.log(await exchange.getOutputAmount(toWei(1), provider.getBalance(exchange.target), token.balanceOf(exchange.target)));
        });
    });

    describe("ethToTokenSwap", async() => {
        it("ethToTokenSwap", async() => {
            await token.approve(exchange.target, toWei(4000));
            // GRAY:ETH 4:1
            await exchange.addLiquidity(toWei(4000), {value: toWei(1000)});
            
            console.log(await token.balanceOf(user.address));
            // 여기서 {value: toWei(1)}는 1eth를 msg.value에 담는다는 뜻
            await exchange.connect(user).ethToTokenSwap(toWei(3.99), {value: toWei(1)});
            // 여기서 4가 나오지 않는다. 4와 현재 token.balance간의 차이가 슬리피지이다.
            console.log(await token.balanceOf(user.address));
        });
    });

    describe("tokenToEthSwap", async() => {
        it("tokenToEthSwap", async() => {
            await token.approve(exchange.target, toWei(4010));
            // GRAY:ETH 4:1
            await exchange.addLiquidity(toWei(4010), {value: toWei(1000)});
            // 컨트랙트에서 유저에게 토큰 전송
            await token.transfer(user.address, toWei(10));

            console.log(await provider.getBalance(user.address));
            console.log(await token.balanceOf(user.address));
            // approve를 해줘야한다. (이더리움을 전송하는 것이 아니라 토큰을 전송하는 것이기 때문)
            // approve를 하지 않으면 tokenToEthSwap에서 에러가 난다.
            await token.connect(user).approve(exchange.target, toWei(10));
            // 여기 아래에 tokenToEthSwap에 token 1개를 전송하는 코드이다
            await exchange.connect(user).tokenToEthSwap(toWei(1), toWei(0.24931));
            console.log(await provider.getBalance(user.address));
            console.log(await token.balanceOf(user.address));
        });
    });

    
})