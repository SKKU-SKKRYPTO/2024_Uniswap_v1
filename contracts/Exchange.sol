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
    function ethToTokenSwap() public payable {
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
        uint256 denominator = inputReserve * inputAmount;

        return numerator / denominator;
    }
}
