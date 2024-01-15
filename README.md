# 2024_Uniswap_v1

npm init
npm install --save-dev hardhat
npx hardhat init
npm install @openzeppelin/contracts
npm install --save-dev @nomicfoundation/hardhat-toolbox

## 에러 수정

### test/Exchange.js
기존 await token.deployed(); -> await token.waitForDeployment();
기존 token.address -> token.target