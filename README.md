# 2024_Uniswap_v1

npm init
npm install --save-dev hardhat
npx hardhat init
npm install @openzeppelin/contracts
npm install --save-dev @nomicfoundation/

## React app 만들기
### React 앱 생성
npx create-react-app my-app
cd my-app
npm start
### 의존성 설치
npm install ethers
npm install @web3-react/core
npm install @web3-react/injected-connector
npm install --save-dev @babel/plugin-proposal-private-property-in-object


## 에러 수정

### test/Exchange.js
기존 await token.deployed(); -> await token.waitForDeployment();
기존 token.address -> token.target