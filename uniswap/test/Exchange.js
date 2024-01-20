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
        // [owner, user] = await ethers.getSigners();
        // const TokenFactory = await ethers.getContractFactory("Token");
        // token = await TokenFactory.deploy("GrayToken", "GRAY", toWei(1000000));
        // await token.waitForDeployment();

        // const ExchangeFactory = await ethers.getContractFactory("Exchange");
        // exchange = await ExchangeFactory.deploy(token.target);
        // await exchange.waitForDeployment();

        // const FactoryFactory = await ethers.getContractFactory("Factory");
        // const factory = await FactoryFactory.deploy();
        // await factory.waitForDeployment();
    });

    // describe("addLiquidity", async() => {
    //     it("add Liquiity", async() => {
    //         await token.approve(exchange.target, toWei(1000));
    //         await exchange.addLiquidity(toWei(1000), {value: toWei(1000)});
            
    //         // console.log(exchange.target);
            
    //         // exchange컨트랙트가 이더리움 몇개 가지고 있는지 (에러남 -> 해결)
    //         // expect(await getBalance(exchange.target)).to.equal(toWei(1000));
    //         expect(await provider.getBalance(exchange.target)).to.equal(toWei(1000)); 
            
    //         // exchange컨트랙트가 가지는 gray token의 balance가 1000개인지 확인
    //         expect(await token.balanceOf(exchange.target)).to.equal(toWei(1000));
    //     });
    // });

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

    // 수수료 부과하지 않으면 테스트 통과
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

    // 수수료 부과하지 않으면 테스트 통과
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

    describe("addLiquidity", async() => {
        it("add Liquiity", async() => {
            // 토큰 500개, 이더 1000개 유동성 공급
            await token.approve(exchange.target, toWei(500));
            await exchange.addLiquidity(toWei(500), {value: toWei(1000)});

            expect(await provider.getBalance(exchange.target)).to.equal(toWei(1000)); 
            expect(await token.balanceOf(exchange.target)).to.equal(toWei(500));

            // 토큰 100개, 이더 200개 추가 유동성 공급
            await token.approve(exchange.target, toWei(100));
            await exchange.addLiquidity(toWei(100), {value: toWei(200)});

            expect(await provider.getBalance(exchange.target)).to.equal(toWei(1200)); 
            expect(await token.balanceOf(exchange.target)).to.equal(toWei(600));

            // 아래는 안되는 코드임 (유저가 유동성 공급시 받는 LP토큰 개수 확인하려고 만든 코드)

            // 유저의 유동성 공급
            // await token.transfer(user.address, toWei(100));

            // 유저 계좌 확인
            // console.log(await provider.getBalance(user.address));
            // console.log(await token.balanceOf(user.address));

            // await token.connect(user).approve(exchange.target, toWei(100));
            // await exchange.connect(user).addLiquidity(toWei(100), {value: toWei(200)});
        });
    });

    describe("removeLiquiity", async() => {
        it("removeLiquiity", async() => {
            // 토큰 500개, 이더 1000개 유동성 공급
            await token.approve(exchange.target, toWei(500));
            await exchange.addLiquidity(toWei(500), {value: toWei(1000)});

            expect(await provider.getBalance(exchange.target)).to.equal(toWei(1000)); 
            expect(await token.balanceOf(exchange.target)).to.equal(toWei(500));

            // 토큰 100개, 이더 200개 추가 유동성 공급
            await token.approve(exchange.target, toWei(100));
            await exchange.addLiquidity(toWei(100), {value: toWei(200)});

            expect(await provider.getBalance(exchange.target)).to.equal(toWei(1200)); 
            expect(await token.balanceOf(exchange.target)).to.equal(toWei(600));

            // 유동성 제거
            await exchange.removeLiquidity(toWei(300));
            expect(await provider.getBalance(exchange.target)).to.equal(toWei(900)); 
            expect(await token.balanceOf(exchange.target)).to.equal(toWei(450));

            // 유동성 공급이나 제거시 xy=k에서 k값이 바뀌게 된다.
            // CPMM은 스왑과 같이 토큰 비율이 변하는 경우에도 곱의 값이 일정한 것이다.
            // 유동성 공급으로 인한 x,y변화는 비율이 일정하기 떄문에 k값이 증가한다.
        });
    });

    describe("swapWithFee", async() => {
        it("swapWithFee", async() => {
            await token.approve(exchange.target, toWei(50));
            // 유동성 공급 eth 50, gray 50
            await exchange.addLiquidity(toWei(50), {value: toWei(50)});
            
            // 유저 eth 30, gray 18.632371392722710163 스왑
            await exchange.connect(user).ethToTokenSwap(toWei(18), {value: toWei(30)});

            // 스왑 후 유저의 gray 잔액 18.632371392722710163
            console.log(await token.balanceOf(user.address));
            console.log(await token.balanceOf(exchange.target));

            // 만약 수수료가 없다면 gray 18.75를 받아야 한다
        });
    });

    describe("tokenToTokenSwap", async() => {
        it.only("tokenToTokenSwap", async() => {
            [owner, user] = await ethers.getSigners();

            const FactoryFactory = await ethers.getContractFactory("Factory");
            const factory = await FactoryFactory.deploy();
            await factory.waitForDeployment();

            // GRAY 토큰 생성
            const TokenFactory = await ethers.getContractFactory("Token");
            const token = await TokenFactory.deploy("GrayToken", "GRAY", toWei(1010));
            await token.waitForDeployment();

            // FAST 토큰 생성
            const TokenFactory2 = await ethers.getContractFactory("Token");
            const token2 = await TokenFactory2.deploy("FastToken", "FAST", toWei(1000));
            await token2.waitForDeployment();

            const ExchangeFactory = await ethers.getContractFactory("Exchange");
            exchange = await ExchangeFactory.deploy(token.target);
            await exchange.waitForDeployment();


            // GRAY/eth 페어 생성
            await factory.createExchange(token.target);
            const exchangeAddress = await factory.getExchange(token.target);
            // FAST/eth 페어 생성
            await factory.createExchange(token2.target);
            const exchange2Address = await factory.getExchange(token2.target);

            await token.approve(exchangeAddress, toWei(1000));
            await token2.approve(exchange2Address, toWei(1000));

            // GRAY/eth 페어에 GRAY 1000개, eth 1000개 유동성 공급
            await ExchangeFactory.attach(exchangeAddress).addLiquidity(toWei(1000), {value: toWei(1000)});
            // FAST/eth 페어에 FAST 1000개, eth 1000개 유동성 공급
            await ExchangeFactory.attach(exchange2Address).addLiquidity(toWei(1000), {value: toWei(1000)});
            
            await token.approve(exchangeAddress, toWei(10));
            await ExchangeFactory.attach(exchangeAddress).tokenToTokenSwap(toWei(10), toWei(9), toWei(9), token2.target)

            console.log(await token2.balanceOf(owner.address))
            console.log(await token2.balanceOf(exchangeAddress))
        });
    });
        
})