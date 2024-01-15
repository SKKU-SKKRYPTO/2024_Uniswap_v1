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
}
