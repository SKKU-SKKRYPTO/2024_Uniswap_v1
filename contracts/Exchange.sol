// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20{

    IERC20 public token;

    // 이름과 토큰 이름 고정
    // 민팅이나 번 될때는 주소값으로 접근하므로 이름이나 토큰 이름 겹쳐도 상관없다
    constructor(address _token) ERC20("Gray Uniswap", "GUNI"){
        token = IERC20(_token);
    }

    // function addLiquidity(uint256 _tokenAmount) public payable{
    //     token.transferFrom(msg.sender, address(this), _tokenAmount);
    // }

    function addLiquidity(uint256 _maxTokens) public payable{
        uint256 totalLiquidity = totalSupply();
        if (totalLiquidity > 0) {
            // 유동성이 있는 경우에 추가 유동성 공급

            // 이미 있는 eth와 token의 양
            uint256 ethReserve = address(this).balance - msg.value;
            uint256 tokenReserve = token.balanceOf(address(this));
            // token 유동성 공급 (eth는 이미 msg.value로 들어옴)
            uint256 tokenAmount = msg.value * tokenReserve / ethReserve;
            require(_maxTokens >= tokenAmount, "Not enough tokens");
            // 토큰 전송
            token.transferFrom(msg.sender, address(this), tokenAmount);
            // LP토큰 발급 (totalLiquidity와 ethReserve는 같은값이 아닌가?)
            uint256 liquidityMinted = totalLiquidity * msg.value / ethReserve;
            _mint(msg.sender, liquidityMinted);
        } else {
            // 유동성이 없는 경우 (eth와 erc20의 비율 1:1)

            uint256 tokenAmount = _maxTokens;
            // 초기 유동성값은 컨트랜트가 가지고 있는 eth 양
            uint256 intialLiquidty = address(this).balance;
            // erc20에 LP토큰 발급후 유동성 공급자에게 전송
            _mint(msg.sender, intialLiquidty);
            // 내가 가진 토큰을 컨트랙트에 전송
            token.transferFrom(msg.sender, address(this), tokenAmount);
        }
    }

    function removeLiquidity(uint256 _lpTokenAmount) public {
        uint256 totalLiquidity = totalSupply();
        // LP토큰을 소각하고 얻는 eth와 token의 양
        uint256 ethAmount = _lpTokenAmount * address(this).balance / totalLiquidity;
        uint256 tokenAmount = _lpTokenAmount * token.balanceOf(address(this)) / totalLiquidity;

        // transfer하기 전에 burn을 먼저 하는 것이 보안적으로 안전함 (재진입 공격을 막는데 좋은 방법)
        _burn(msg.sender, _lpTokenAmount);

        payable(msg.sender).transfer(ethAmount);
        token.transfer(msg.sender, tokenAmount);
    }

    // ether를 받고 token을 전송하는 함수
    function ethToTokenSwapCSMM() public payable {
        uint256 tokenAmount = msg.value;

        IERC20(token).transfer(msg.sender, tokenAmount);
    }

    function getPrice(uint256 inputReserve, uint256 outputReserve) public pure returns(uint256){
        uint256 numerator = inputReserve;
        uint256 denominator = outputReserve;
        
        return numerator / denominator;
    }

    // inputAmount는 x의 변화량, inputReserve는 x의 초기값, outputReserve는 y의 초기값
    function getOutputAmount(uint256 inputAmount, uint256 inputReserve, uint256 outputReserve) public pure returns(uint256){
        uint256 numerator = outputReserve * inputAmount;
        uint256 denominator = inputReserve + inputAmount;

        return numerator / denominator;
    }

    // inputAmount는 x의 변화량, inputReserve는 x의 초기값, outputReserve는 y의 초기값
    function getOutputAmountWithFee(uint256 inputAmount, uint256 inputReserve, uint256 outputReserve) public pure returns(uint256){
        // 1%의 수수료를 부과
        uint256 inputAmountWithFee = inputAmount * 99;
        uint256 numerator = (outputReserve * inputAmountWithFee);
        uint256 denominator = (inputReserve * 100 + inputAmountWithFee);

        return numerator / denominator;
    }

    // ETH -> ERC20
    function ethToTokenSwap(uint256 _minTokens) public payable{
        // uint256 inputAmount = msg.value;

        // address(this).balance - msg.value를 하는 이유는
        // payable이므로 address(this).balance는 이미 ETH가 넘어온 상태. 즉, msg.value가 이미 더해져있다
        uint256 outputAmount = getOutputAmountWithFee(msg.value, address(this).balance - msg.value, token.balanceOf(address(this)));

        require(outputAmount >= _minTokens, "Inffucient output amount");

        IERC20(token).transfer(msg.sender, outputAmount);
    }

    // ERC20 -> ETH
    // 위에서는 _tokenSold가 없지만 해당 함수에는 있는 이유는, eth의 경우 msg.value에 담을 수 있기 때문이다.
    function tokenToEthSwap(uint256 _tokenSold, uint256 _minEth) public payable{

        uint256 outputAmount = getOutputAmountWithFee(_tokenSold, token.balanceOf(address(this)), address(this).balance);

        require(outputAmount >= _minEth, "Inffucient output amount");

        IERC20(token).transferFrom(msg.sender, address(this), _tokenSold);
        payable(msg.sender).transfer(outputAmount);
    }
}
