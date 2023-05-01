// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.14;
import "../interfaces/IBeefyMultiFarm.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "../interfaces/IBeefyVault.sol";
import "../interfaces/IUniswapV2Pair.sol";

contract Rebalancer is Initializable {
  function initialize() external initializer {}

  function callRebalanceFarm(address _vault)
    external
    view
    returns (
      uint256[] memory,
      uint256[] memory,
      uint256[] memory,
      uint256[] memory
    )
  {
    address[] memory vaults = IBeefyMultiFarm(_vault).getVaults();
    uint256[] memory weights = IBeefyMultiFarm(_vault).getWeights();
    uint256[] memory overweightVaults = new uint256[](vaults.length);
    uint256[] memory overweightAmounts = new uint256[](vaults.length);
    uint256[] memory underweightVaults = new uint256[](vaults.length);
    uint256[] memory underweightAmounts = new uint256[](vaults.length);
    uint256 overweightVaultsLength;
    uint256 underweightVaultsLength;
    uint256 totalVauluationInETH = IBeefyMultiFarm(_vault).getTotalValue();
    uint256 balanceETH = msg.sender.balance;
    totalVauluationInETH = totalVauluationInETH - balanceETH;
    (uint256 decimal0, uint256 decimal1) = _getTokenDecimalsOfVault(vaults[0]);
    for (uint256 i; i < vaults.length; i++) {
      uint256 vaultValuationInETH = IBeefyMultiFarm(_vault).getVaultValue(vaults[i], false);
      uint256 targetWeight = weights[i];
      // totalValueETH: totalETH =  x : 10000
      uint256 currentWeight = (vaultValuationInETH * (10000)) / (totalVauluationInETH);
      uint256 overweight = currentWeight > targetWeight ? currentWeight - (targetWeight) : 0;
      uint256 overweightAmount;
      if (overweight > 1) {
        // totalValuationETH : 10000 = x : overweight
        uint256 overweightAmountInETH = (overweight * (totalVauluationInETH)) / (10000);
        uint256 balance = IBeefyMultiFarm(_vault).getVaultBalance(vaults[i]);
        uint256 price = IBeefyMultiFarm(_vault).getVaultPrice(vaults[i]);
        overweightAmount = (overweightAmountInETH * 1e18) / price;
        if (decimal0 != uint8(18)) {
          overweightAmount = overweightAmount * (10**(18 - decimal0));
        }
        if (decimal1 != uint8(18)) {
          overweightAmount = overweightAmount * (10**(18 - decimal1));
        }
        require(overweightAmount < balance, "OVERBALANCE");
        overweightVaults[overweightVaultsLength] = i;
        overweightAmounts[overweightVaultsLength] = overweightAmount;
        overweightVaultsLength++;
      }
    }
    overweightVaults = _resize(overweightVaults, overweightVaultsLength);
    overweightAmounts = _resize(overweightAmounts, overweightVaultsLength);
    for (uint256 i = 0; i < vaults.length; i++) {
      uint256 vaultValuationInETH = IBeefyMultiFarm(_vault).getVaultValue(vaults[i], false);
      uint256 targetWeight = weights[i];
      uint256 currentWeight = (vaultValuationInETH * (10000)) / (totalVauluationInETH);
      uint256 underweight = targetWeight > currentWeight ? targetWeight - (currentWeight) : 0;
      uint256 underweightAmount;
      if (underweight > 1) {
        underweightAmount = (underweight * (totalVauluationInETH)) / (10000);
        underweightVaults[underweightVaultsLength] = i;
        underweightAmounts[underweightVaultsLength] = underweightAmount;
        underweightVaultsLength++;
      }
    }
    underweightVaults = _resize(underweightVaults, underweightVaultsLength);
    underweightAmounts = _resize(underweightAmounts, underweightVaultsLength);
    require(overweightVaults.length > 0, "NOTOVERWEIGHT");
    require(underweightVaults.length > 0, "NOTUNDERWEIGHT");
    return (overweightVaults, overweightAmounts, underweightVaults, underweightAmounts);
  }

  function _resize(uint256[] memory arr, uint256 size) internal pure returns (uint256[] memory) {
    uint256[] memory ret = new uint256[](size);
    for (uint256 i; i < size; i++) {
      ret[i] = arr[i];
    }
    return ret;
  }

  function _getTokenDecimalsOfVault(address _vault) internal view returns (uint8, uint8) {
    address pair = IBeefyVault(_vault).want();
    address token0 = IUniswapV2Pair(pair).token0();
    address token1 = IUniswapV2Pair(pair).token1();
    uint8 token0Decimals = IERC20Upgradeable(token0).decimals();
    uint8 token1Decimals = IERC20Upgradeable(token1).decimals();
    return (token0Decimals, token1Decimals);
  }
}
