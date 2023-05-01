// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "./libs/Babylonian.sol";
import "./interfaces/IUniswapV2Factory.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IUniswapV2Pair.sol";
import "./interfaces/IFactory.sol";
import "./interfaces/IWETH.sol";

interface I1InchAggregator {
  function getRate(
    IERC20Upgradeable srcToken,
    IERC20Upgradeable dstToken,
    bool useWrappers
  ) external view returns (uint256 weightedRate);
}

contract IndexFund is
  Initializable,
  ReentrancyGuardUpgradeable,
  OwnableUpgradeable,
  PausableUpgradeable,
  ERC1155Upgradeable,
  ERC1155BurnableUpgradeable,
  ERC1155SupplyUpgradeable
{
  using SafeERC20Upgradeable for IERC20Upgradeable;
  using SafeMathUpgradeable for uint256;
  using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

  I1InchAggregator public oracle;

  address public factory;
  address public router;
  address private WETH;

  address[] private vaults;

  string public name;
  string public symbol;

  uint256[] private weights;
  uint256 MAX_INT;
  uint256 private minimumAmount;

  mapping(address => uint256) private targetWeights;

  struct MultiFarmData {
    // create a struct called MultiFarmData
    address owner; // store the owner
    string name; // store the name
    string symbol; // store the symbol
    address[] vaults; // store the vaults
    uint256[] weights; // store the weights
    uint256 unitPrice; // store the unitPrice
    uint256 totalValue; // store the totalValue
    uint256 totalSupply; // store the totalSupply
  }

  function initialize(
    address _factory,
    address _router,
    address _oracle,
    address _owner,
    string memory _name,
    string memory _symbol,
    address _WETH
  ) public initializer {
    factory = _factory;
    router = _router;
    oracle = I1InchAggregator(_oracle);
    name = _name;
    symbol = _symbol;
    minimumAmount = 1000;
    MAX_INT = type(uint256).max;
    IWETH(_WETH).deposit{value: 0}();
    IWETH(_WETH).withdraw(0);
    WETH = _WETH;
    __Ownable_init();
    __Ownable_init_unchained();
    __Pausable_init();
    __ERC1155_init("");
    __ERC1155Burnable_init();
    __ERC1155Supply_init();
    transferOwnership(_owner);
  }

  receive() external payable {}

  function deposit() external payable nonReentrant {
    require(msg.value >= 2 ether, "MIN2ETH");

    (uint256 mintQty, uint256 fundValueB4) = _getMintQty(msg.value);

    _mint(msg.sender, 0, mintQty, "");
    _zapIn(_handleFees(msg.value));
  }

  function redeem(uint256 _amount) external {
    uint256 finalAmount = _zapOut(_amount);
    payable(msg.sender).transfer(finalAmount);
    _burn(msg.sender, 0, _amount);
  }

  function redeemERC20(uint256 _amount) external {
    _zapOutandTransfer(_amount, msg.sender);
    _burn(msg.sender, 0, _amount);
  }

  //-----Zaps------------------------//

  function restartDistribution() external nonReentrant onlyOwner {
    _zapIn(address(this).balance);
  }

  function zapOutAndDistribute() external nonReentrant onlyOwner {
    _zapAllOut();
    _zapIn(address(this).balance);
  }

  function zapOutAndChangeComposition(address[] calldata _tokens, uint256[] calldata weight) external returns (bool) {
    _zapAllOut();
    _setVaultsAndWeights(_tokens, weight);
    _zapIn(address(this).balance);

    return true;
  }

  //-----Rules Function------------------------//
  function setVaultsAndWeights(address[] calldata _vaults, uint256[] calldata _weights) public onlyOwner {
    _setVaultsAndWeights(_vaults, _weights);
  }

  function rebalance() external onlyOwner returns (bool) {
    uint256[] memory overweightVaults = new uint256[](vaults.length);
    uint256[] memory overweightAmounts = new uint256[](vaults.length);
    uint256[] memory underweightVaults = new uint256[](vaults.length);
    uint256[] memory underweightAmounts = new uint256[](vaults.length);
    uint256 overweightVaultsLength;
    uint256 underweightVaultsLength;
    bool overweight;
    uint256 overweightAmount;
    uint256 overweightPercent;
    uint256 targetWeight;
    uint256 currentWeight;
    uint256 tokensTotalValueInETH;
    uint256 totalActiveWeight;

    for (uint256 i; i < vaults.length; i++) {
      uint256 totalValue = _getTotalValue();
      tokensTotalValueInETH = _getTokenValues(vaults[i]);
      targetWeight = weights[i];
      currentWeight = tokensTotalValueInETH.mul(10000).div(totalValue);
      overweight = currentWeight > targetWeight;
      overweightPercent = overweight ? currentWeight.sub(targetWeight) : targetWeight.sub(currentWeight);
      uint256 price = _getAMMPrice(vaults[i], WETH);
      if (overweight) {
        overweightAmount = overweightPercent.mul(totalValue).div(10000);
        overweightAmount = overweightAmount.mul(1e18).div(price);
        overweightVaults[overweightVaultsLength] = i;
        overweightAmounts[overweightVaultsLength] = overweightAmount;
        overweightVaultsLength++;
      } else if (!overweight) {
        totalActiveWeight += overweightPercent;
        overweightAmount = overweightPercent;
        // overweightAmount = overweightPercent.mul(totalValue).div(10000);
        underweightVaults[underweightVaultsLength] = i;
        underweightAmounts[underweightVaultsLength] = overweightAmount;
        underweightVaultsLength++;
      }
    }

    // Resize overweightVaults and overweightAmounts to the actual overweighted vaults
    overweightVaults = _resize(overweightVaults, overweightVaultsLength);
    overweightAmounts = _resize(overweightAmounts, overweightVaultsLength);
    // Resize overweightVaults and overweightAmounts to the actual overweighted vaults
    underweightVaults = _resize(underweightVaults, underweightVaultsLength);
    underweightAmounts = _resize(underweightAmounts, underweightVaultsLength);

    for (uint256 i; i < overweightVaults.length; i++) {
      if (overweightAmounts[i] > 0) {
        _swapToETH(overweightAmounts[i], address(vaults[overweightVaults[i]]), false);
      }
    }
    IWETH(WETH).deposit{value: address(this).balance}();
    for (uint256 i; i < underweightVaults.length; i++) {
      if (underweightAmounts[i] > 0) {
        uint256 rebaseActiveWgt = underweightAmounts[i].mul(10000).div(totalActiveWeight);
        uint256 rebBuyQty = rebaseActiveWgt.mul(address(this).balance).div(10000);
        if (rebBuyQty > 0 && rebBuyQty <= address(this).balance) {
          _swapToERC20(underweightAmounts[i], WETH, address(vaults[underweightVaults[i]]), true);
        }
      }
    }
    return true;
  }

  //-----Getters------------------------//
  function getVaults() external view returns (address[] memory) {
    return vaults;
  }

  function getWeights() external view returns (uint256[] memory) {
    return weights;
  }

  function getAMMPrice(address _from, address _to) external view returns (uint256 amountOut) {
    return _getAMMPrice(_from, _to);
  }

  function getMultiFarmData() external view returns (MultiFarmData memory _d) {
    return _getMultiFarmData();
  }

  function getUnitPrice() external view returns (uint256) {
    return _getUnitPrice();
  }

  function getTotalValue() external view returns (uint256) {
    return _getTotalValue();
  }

  function getTargetVaultValue(address _vault) external view returns (uint256) {
    return _getTargetVaultValue(_vault);
  }

  //-----External Function------------------------//
  function withdrawETH(address _WETH, uint256 amount) internal {
    IWETH(_WETH).withdraw(amount);
  }

  //-----Internal Function------------------------//
  function _setVaultsAndWeights(address[] calldata _vaults, uint256[] calldata _weights) internal {
    require(_vaults.length == _weights.length, "NOTEQUAL");
    vaults = _vaults;
    weights = _weights;
    for (uint256 i; i < _vaults.length; i++) {
      targetWeights[_vaults[i]] = _weights[i];
    }
  }

  function _swapToETH(
    uint256 withdrawAmount,
    address from,
    bool returnAssets
  ) internal {
    IUniswapV2Router02 routerUni = IUniswapV2Router02(router);
    address[] memory path = new address[](2);
    path[0] = from;
    path[1] = WETH;
    _approveTokenIfNeeded(path[0], address(router));
    IUniswapV2Pair pair = IUniswapV2Pair(
      IUniswapV2Factory(IUniswapV2Router02(router).factory()).getPair(path[0], path[1])
    );
    pair.sync();
    // Estimate swap amount Out
    uint256[] memory amountsOut = new uint256[](path.length);
    amountsOut = routerUni.getAmountsOut(withdrawAmount, path);
    uint256 minOutAmount = amountsOut[path.length.sub(1)];
    // Estimate swap amount In
    uint256[] memory amountsIn = new uint256[](path.length);
    amountsIn = routerUni.getAmountsIn(amountsOut[path.length.sub(1)], path);
    uint256 maxInAmount = amountsIn[0];
    routerUni.swapExactTokensForETH(
      maxInAmount,
      minOutAmount.sub(minOutAmount.mul(100).div(10000)),
      path,
      address(this),
      block.timestamp + 1000
    );
    if (returnAssets) {
      _returnAssets(path);
    }
  }

  function _swapToERC20(
    uint256 amount,
    address tokenIn,
    address tokenOut,
    bool returnAssets
  ) private {
    IUniswapV2Router02 routerUni = IUniswapV2Router02(router);
    address[] memory path = new address[](2);
    path[0] = tokenIn;
    path[1] = tokenOut;
    _approveTokenIfNeeded(path[0], address(router));
    // Estimate swap amount Out
    uint256[] memory amountsOut = new uint256[](path.length);
    amountsOut = routerUni.getAmountsOut(amount, path);
    uint256 minOutAmount = amountsOut[path.length.sub(1)];
    // Estimate swap amount In
    uint256[] memory amountsIn = new uint256[](path.length);
    amountsIn = routerUni.getAmountsIn(amountsOut[path.length.sub(1)], path);
    uint256 maxInAmount = amountsIn[0];
    routerUni.swapExactTokensForTokens(
      maxInAmount,
      minOutAmount.sub(minOutAmount.mul(100).div(10000)),
      path,
      address(this),
      block.timestamp + 1000
    );
    if (returnAssets) {
      _returnAssets(path);
    }
  }

  function _returnAssets(address[] memory tokens) private {
    uint256 balance;
    for (uint256 i; i < tokens.length; i++) {
      balance = IERC20Upgradeable(tokens[i]).balanceOf(address(this));
      if (balance > 0) {
        if (tokens[i] == WETH) {
          withdrawETH(WETH, balance);
        }
      }
    }
  }

  function _approveTokenIfNeeded(address token, address spender) private {
    if (IERC20Upgradeable(token).allowance(address(this), spender) == 0) {
      IERC20Upgradeable(token).safeApprove(spender, MAX_INT);
    }
  }

  function _zapIn(uint256 _amount) internal {
    uint256 sum;

    for (uint256 i; i < weights.length; i++) {
      sum += weights[i];
    }

    require(sum == 10000, "Total weight must be 100%");

    for (uint256 i; i < vaults.length; i++) {
      uint256 amount_per_vault = 0;
      amount_per_vault = _amount.mul(weights[i]).div(10000);

      if (vaults[i] == WETH) {
        IWETH(WETH).deposit{value: amount_per_vault}();
      } else {
        IWETH(WETH).deposit{value: amount_per_vault}();
        _swapToERC20(amount_per_vault, WETH, vaults[i], true);
      }
    }
  }

  function _zapOut(uint256 amount) internal returns (uint256) {
    uint256 redeemRatio = amount.mul(1e18).div(totalSupply(0));

    for (uint256 i; i < vaults.length; i++) {
      uint256 amount_per_vault = IERC20Upgradeable(vaults[i]).balanceOf(address(this));
      require(redeemRatio.mul(amount_per_vault).div(1e18) > 0, "ISZERO");
      _swapToETH(redeemRatio.mul(amount_per_vault).div(1e18), address(vaults[i]), true);
    }

    uint256 balance = address(this).balance;

    uint256 finalAmount = _handleFees(balance);

    return finalAmount;
  }

  function _zapOutandTransfer(uint256 amount, address destAddress) internal {
    uint256 redeemRatio = amount.mul(1e18).div(totalSupply(0));
    for (uint256 i; i < vaults.length; i++) {
      // Calculate Amount per vault
      uint256 amount_per_vault = IERC20Upgradeable(vaults[i]).balanceOf(address(this));
      require(redeemRatio.mul(amount_per_vault).div(1e18) > 0, "ISZERO");
      _approveTokenIfNeeded(vaults[i], address(destAddress));
      uint256 amountToSend = _handleFeesERC20(redeemRatio.mul(amount_per_vault).div(1e18), vaults[i]);
      IERC20Upgradeable(vaults[i]).safeTransfer(destAddress, amountToSend);
    }
  }

  function _zapAllOut() internal {
    for (uint256 i; i < vaults.length; i++) {
      // Calculate Amount per vault
      uint256 amount_per_vault = IERC20Upgradeable(vaults[i]).balanceOf(address(this));
      _swapToETH(amount_per_vault, address(vaults[i]), true);
    }
  }

  function _getMultiFarmData() internal view returns (MultiFarmData memory _d) {
    _d.owner = owner();
    _d.name = name;
    _d.symbol = symbol;
    _d.vaults = vaults;
    _d.weights = weights;
    _d.unitPrice = _getUnitPrice();
    _d.totalValue = _getTotalValue();
    _d.totalSupply = totalSupply(0);
    return _d;
  }

  function _resize(uint256[] memory arr, uint256 size) internal pure returns (uint256[] memory) {
    uint256[] memory ret = new uint256[](size);
    for (uint256 i; i < size; i++) {
      ret[i] = arr[i];
    }
    return ret;
  }

  function _getTokenValues(address tokenaddress) internal view returns (uint256) {
    uint256 tokenBalance = IERC20Upgradeable(tokenaddress).balanceOf(address(this));
    if (tokenaddress == WETH) {
      return tokenBalance;
    } else {
      uint256 price = _getAMMPrice(tokenaddress, WETH);
      return tokenBalance.mul(uint256(price)).div(1e18);
    }
  }

  function _getTargetVaultValue(address _vault) internal view returns (uint256) {
    uint256 totalValue = _getTotalValue();
    uint256 targetValue = totalValue.mul(targetWeights[_vault]).div(10000);
    return targetValue;
  }

  function _getTargetVaultPercentage(address _vault) internal view returns (uint256) {
    uint256 totalValue = _getTotalValue();
    uint256 targetValue = _getTargetVaultValue(_vault);
    uint256 targetPercentage = targetValue.mul(10000).div(totalValue);
    return targetPercentage;
  }

  function _getTotalValue() internal view returns (uint256) {
    uint256 totalValue = 0;
    totalValue += address(this).balance;
    for (uint256 i; i < vaults.length; i++) {
      uint256 vaultPrice = _getAMMPrice(vaults[i], WETH);
      uint256 vaultBalance = IERC20Upgradeable(vaults[i]).balanceOf(address(this));
      if (vaults[i] == WETH) {
        totalValue += vaultBalance;
      } else {
        totalValue += vaultBalance.mul(vaultPrice).div(1e18);
      }
    }
    return totalValue;
  }

  function _getAMMPrice(address _from, address _to) internal view returns (uint256 amountOut) {
    return oracle.getRate(IERC20Upgradeable(_from), IERC20Upgradeable(_to), true);
  }

  function _getNewFundUnits(
    uint256 _totalFundB4,
    uint256 _totalValueAfter,
    uint256 _totalSupply
  ) internal pure returns (uint256) {
    if (_totalValueAfter == 0) return 0;
    if (_totalFundB4 == 0) return _totalValueAfter;
    uint256 totalUnitAfter = _totalValueAfter.mul(_totalSupply).div(_totalFundB4);
    uint256 mintUnit = totalUnitAfter.sub(_totalSupply);
    return mintUnit;
  }

  function _getUnitPrice() internal view returns (uint256) {
    uint256 totalValueB4 = _getTotalValue();
    if (totalValueB4 == 0) return 0;
    uint256 totalUnitB4 = totalSupply(0);
    if (totalUnitB4 == 0) return 0;
    return totalValueB4.mul(1e18).div(totalUnitB4);
  }

  function _getMintQty(uint256 _srcQty) internal view returns (uint256 mintQty, uint256 totalFundB4) {
    uint256 totalFundAfter = _getTotalValue();
    totalFundB4 = totalFundAfter.sub(_srcQty);
    mintQty = _getNewFundUnits(totalFundB4, totalFundAfter, totalSupply(0));
    return (mintQty, totalFundB4);
  }

  function _beforeTokenTransfer(
    address operator,
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) internal override(ERC1155Upgradeable, ERC1155SupplyUpgradeable) whenNotPaused {
    super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
  }

  function _handleFees(uint256 _amount) internal returns (uint256) {
    uint256 feeAmount = _amount.mul(IFactory(factory).getFee()).div(10000);
    address to = payable(address(IFactory(factory).treasury()));
    (bool success, bytes memory data) = to.call{value: feeAmount}(new bytes(0));
    require(success, "TransferHelper: BNB_TRANSFER_FAILED");
    return _amount.sub(feeAmount);
  }

  function _handleFeesERC20(uint256 _amount, address _token) internal returns (uint256) {
    uint256 feeAmount = _amount.mul(IFactory(factory).getFee()).div(10000);
    _approveTokenIfNeeded(_token, IFactory(factory).treasury());
    IERC20Upgradeable(_token).safeTransfer(IFactory(factory).treasury(), feeAmount);
    return _amount.sub(feeAmount);
  }
}
