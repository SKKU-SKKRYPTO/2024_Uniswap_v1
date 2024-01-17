// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Exchange{

    IERC20 public token;

    constructor(address _token){
        token = IERC20(_token);
    }

    function addLiquidity(uint256 _tokenAmount) public payable{
        token.transferFrom(msg.sender, address(this), _tokenAmount);
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

    // ETH -> ERC20
    function ethToTokenSwap(uint256 _minTokens) public payable{
        // uint256 inputAmount = msg.value;

        // address(this).balance - msg.value를 하는 이유는
        // payable이므로 address(this).balance는 이미 ETH가 넘어온 상태. 즉, msg.value가 이미 더해져있다
        uint256 outputAmount = getOutputAmount(msg.value, address(this).balance - msg.value, token.balanceOf(address(this)));

        require(outputAmount >= _minTokens, "Inffucient output amount");

        IERC20(token).transfer(msg.sender, outputAmount);
    }

    // ERC20 -> ETH
    // 위에서는 _tokenSold가 없지만 해당 함수에는 있는 이유는, eth의 경우 msg.value에 담을 수 있기 때문이다.
    function tokenToEthSwap(uint256 _tokenSold, uint256 _minEth) public payable{

        uint256 outputAmount = getOutputAmount(_tokenSold, token.balanceOf(address(this)), address(this).balance);

        require(outputAmount >= _minEth, "Inffucient output amount");

        IERC20(token).transferFrom(msg.sender, address(this), _tokenSold);
        payable(msg.sender).transfer(outputAmount);
    }
}
