// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;
import "../BeefyMultiFarm.sol";
import "../interfaces/IRebalancer.sol";

contract BeefyMultiFarmV2 is BeefyMultiFarm {
  function rebalance() external returns (bool) {
    _onlyOwner;
    return _rebalance();
  }

  function _rebalance() internal returns (bool) {
    (
      uint256[] memory overweightVaults,
      uint256[] memory overweightAmounts,
      uint256[] memory underweightVaults,
      uint256[] memory underweightAmounts
    ) = IRebalancer(IFactory(factory).rebalancer()).callRebalanceFarm(address(this));
    require(overweightVaults.length > 0, "NOTOVERW");
    require(underweightVaults.length > 0, "NOTUNDERW");
    for (uint256 i; i < overweightVaults.length; i++) {
      if (overweightAmounts[i] > 0) {
        _beefOutAndSwap(vaults[overweightVaults[i]], overweightAmounts[i], WETH, 1);
      }
    }
    require(address(this).balance > 0, "NOETH");
    IWETH(WETH).deposit{value: address(this).balance}();
    // Buy underweight Data
    for (uint256 i; i < underweightVaults.length; i++) {
      if (underweightAmounts[i] > 0) {
        _swapAndStake(address(vaults[underweightVaults[i]]), underweightAmounts[i], 1, WETH);
      }
    }
    return true;
  }
}
