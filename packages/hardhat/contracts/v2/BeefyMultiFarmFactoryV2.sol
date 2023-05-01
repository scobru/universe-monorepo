// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;
pragma experimental ABIEncoderV2;
import "../BeefyMultiFarmFactory.sol";

contract BeefyMultiFarmFactoryV2 is BeefyMultiFarmFactory {
  address public rebalancer;

  function initialize(
    address _rebalancer,
    address _oracle,
    address _proxyCallContract,
    address _WETH,
    address _treasury
  ) public initializer {
    MAX_FEE = 1000;
    fee = 100;
    WETH = _WETH;
    treasury = _treasury;
    oracle = _oracle;
    rebalancer = _rebalancer;
    _updateProxyCallContract(_proxyCallContract);
    __Ownable_init();
    __Ownable_init_unchained();
    allowedRouters[0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff] = true; // Quickswap Mainnet
    allowedRouters[0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607] = true; // ApeSwap MainnetMainnet
    allowedRouters[0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506] = true; // Sushiswap
    transferOwnership(msg.sender);
  }

  function setRebalancer(address _rebalancer) external onlyAdmin returns (bool) {
    rebalancer = _rebalancer;
    return true;
  }
}
