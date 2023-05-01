// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity 0.8.14;

interface IFundInitializer {
  function initialize(
    address factory,
    address router,
    address oracle,
    address owner,
    string memory name,
    string memory symbol,
    address WETH
  ) external;
}
