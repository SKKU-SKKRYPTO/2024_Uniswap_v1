// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Exchange Contract의 주소를 관리한다. 사용자는 스왑할 토큰의 Exchange Contract 주소를 읽어와 스왑을 진행한다.
// 새로운 Exchange Contract를 배포하고, 이를 활용하여 사용자가 만든 토큰을 유니스왑 거래소에 상장시킬 수 있다.

// new 키워드를 통해 새로운 Exchange Contract를 배포한다/
// 내부적으로 create라는 OpCode가 사용된다.
// 유니스왑 v2는 create2를 사용하는데 contract address를 결정론적으로 알 수 있게한다.

import "./Exchange.sol";

contract Factory {
    // 배포하고 나서 얻은 컨트랙트 주소를 저장해야한다
    // 토큰 주소를 넣으면 해당 토큰의 Exchange Contract 주소를 반환한다.
    mapping(address => address) public tokenToExchange;
    function createExchange(address _token) public returns (address) {
        Exchange exchange = new Exchange(_token);
        tokenToExchange[_token] = address(exchange);

        return address(exchange);
    }

    function getExchange(address _token) public view returns (address) {
        return tokenToExchange[_token];
    }
}