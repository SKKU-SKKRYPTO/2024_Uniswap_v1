// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IFactory {
    // interface에 정의된 함수는 external로 되야한다.
    function getExchange(address _token) external view returns (address);
}