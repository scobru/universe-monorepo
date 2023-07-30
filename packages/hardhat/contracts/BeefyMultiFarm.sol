// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "./libs/Babylonian.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IFactory.sol";
import "./interfaces/IWETH.sol";
import "./interfaces/IBeefyVault.sol";
import "./interfaces/IUniswapV2Pair.sol";

interface I1InchAggregator {
  function getRate(
    IERC20Upgradeable srcToken,
    IERC20Upgradeable dstToken,
    bool useWrappers
  ) external view returns (uint256 weightedRate);
}

contract BeefyMultiFarm is
  Initializable,
  ReentrancyGuardUpgradeable,
  OwnableUpgradeable,
  PausableUpgradeable,
  ERC1155Upgradeable,
  ERC1155BurnableUpgradeable,
  ERC1155SupplyUpgradeable
{
  using SafeERC20Upgradeable for IERC20Upgradeable;
  using SafeERC20Upgradeable for IBeefyVault;

  address public factory;
  string public name;
  string public symbol;

  I1InchAggregator internal oracle;
  address[] internal vaults;
  uint256[] internal weights;
  address internal WETH;
  uint256 internal MAX_INT;
  uint256 internal minimumAmount;

  mapping(address => uint256) private targetWeights;

  struct MultiFarmData {
    address owner;
    string name;
    string symbol;
    address[] vaults;
    uint256[] weights;
    uint256 unitPrice;
    uint256 totalValue;
    uint256 totalSupply;
  }

  function initialize(
    address _factory,
    address _oracle,
    address _owner,
    string memory _name,
    string memory _symbol,
    address _WETH
  ) public initializer {
    factory = _factory;
    oracle = I1InchAggregator(_oracle);
    name = _name;
    symbol = _symbol;
    minimumAmount = 1;
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

  function deposit() external payable {
    require(msg.value >= 1 ether, "MIN2ETH");
    uint256 amount = _handleFees(msg.value);
    (uint256 mintQty, uint256 fundValueB4) = _getMintQty(amount);
    require(mintQty >= 0, "MINTQTY");
    _mint(msg.sender, 0, mintQty, "");
    bool result = _zapIn(amount);
    require(result, "ZAPIN");
  }

  function redeem(uint256 _amount) external {
    _zapOut(_amount, msg.sender);
  }

  //-----Zaps------------------------//
  // This function is called to restart the distribution.
  function restartDistribution() external nonReentrant {
    _onlyOwner;
    // Zap in the balance of the contract
    _zapIn(address(this).balance);
  }

  function zapOutAndDistribute() external nonReentrant {
    _onlyOwner;
    // Zap out of the pool
    _zapOutAll();
    // Zap into the pool
    _zapIn(address(this).balance);
  }

  //-----Rules Function------------------//

  function setVaultsAndWeights(address[] calldata _vaults, uint256[] calldata _weights) external {
    _onlyOwner;
    _setVaultsAndWeights(_vaults, _weights);
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

  function getVaultValue(address _vault, bool unit) external view returns (uint256) {
    return _getVaultValue(_vault, unit);
  }

  function getVaultPrice(address _vault) external view returns (uint256) {
    return _getVaultPrice(_vault);
  }

  function getTotalValue() external view returns (uint256) {
    return _getTotalValue();
  }

  function getVaultBalance(address _vault) external view returns (uint256) {
    return _getVaultBalance(_vault);
  }

  //-----External Function------------------------//
  function withdrawETH(address _WETH, uint256 amount) internal {
    // IWETH(_WETH).approve(address(handler), amount);
    // IWETH(_WETH).transfer(address(handler), amount);
    IWETH(_WETH).withdraw(amount);
    //IEthHandler(handler).withdraw(_WETH, amount);
  }

  //-----Internal Function------------------------//

  function _onlyOwner() internal view returns (bool) {
    return msg.sender == owner();
  }

  function _setVaultsAndWeights(address[] calldata _vaults, uint256[] calldata _weights) internal {
    // Make sure number of vaults is equal to number of weights
    require(_vaults.length == _weights.length, "NOTEQUAL");
    // Set vaults and weights
    vaults = _vaults;
    weights = _weights;
    // Set weights for each vault
    for (uint256 i; i < _vaults.length; i++) {
      // Make sure vault is in factory
      targetWeights[_vaults[i]] = _weights[i];
    }
  }

  function _beefOutAndSwap(
    address beefyVault,
    uint256 withdrawAmount,
    address desiredToken,
    uint256 desiredTokenOutMin
  ) internal {
    IUniswapV2Router02 router = IUniswapV2Router02(_getExactRouterForVault(beefyVault));
    (IBeefyVault vault, IUniswapV2Pair pair) = _getVaultPair(beefyVault);
    address token0 = pair.token0();
    address token1 = pair.token1();
    require(token0 == desiredToken || token1 == desiredToken, "NOTPRESENT");
    vault.withdraw(withdrawAmount);
    _removeLiquidity(address(pair), address(this));
    address swapToken = token1 == desiredToken ? token0 : token1;
    address[] memory path = new address[](2);
    path[0] = swapToken;
    path[1] = desiredToken;
    _approveTokenIfNeeded(path[0], address(router));
    router.swapExactTokensForTokens(
      IERC20Upgradeable(swapToken).balanceOf(address(this)),
      desiredTokenOutMin,
      path,
      address(this),
      block.timestamp + 1000
    );
    _returnAssets(path);
  }

  function _removeLiquidity(address pair, address to) private {
    IERC20Upgradeable(pair).safeTransfer(pair, IERC20Upgradeable(pair).balanceOf(address(this)));
    (uint256 amount0, uint256 amount1) = IUniswapV2Pair(pair).burn(to);
    require(amount0 >= minimumAmount, "INSUF_A_AMOUNT");
    require(amount1 >= minimumAmount, "INSUF_B_AMOUNT");
  }

  function _swapAndStake(address beefyVault, uint256 amount, uint256 tokenAmountOutMin, address tokenIn) internal {
    IUniswapV2Router02 router = IUniswapV2Router02(_getExactRouterForVault(beefyVault));
    (IBeefyVault vault, IUniswapV2Pair pair) = _getVaultPair(beefyVault);
    (uint256 reserveA, uint256 reserveB, ) = pair.getReserves();
    require(reserveA > minimumAmount && reserveB > minimumAmount, "TOOLOW");
    bool isInputA = pair.token0() == tokenIn;
    require(isInputA || pair.token1() == tokenIn, "NOTPRESENT");
    address[] memory path = new address[](2);
    path[0] = tokenIn;
    path[1] = isInputA ? pair.token1() : pair.token0();
    uint256 fullInvestment;
    if (amount != 0) {
      fullInvestment = amount;
    } else {
      fullInvestment = IERC20Upgradeable(tokenIn).balanceOf(address(this));
    }
    uint256 swapAmountIn;
    if (isInputA) {
      swapAmountIn = _getSwapAmount(fullInvestment, reserveA, reserveB, beefyVault);
    } else {
      swapAmountIn = _getSwapAmount(fullInvestment, reserveB, reserveA, beefyVault);
    }
    _approveTokenIfNeeded(path[0], address(router));
    uint256[] memory swapedAmounts = router.swapExactTokensForTokens(
      swapAmountIn,
      tokenAmountOutMin,
      path,
      address(this),
      block.timestamp + 1000
    );
    _approveTokenIfNeeded(path[1], address(router));
    (, , uint256 amountLiquidity) = router.addLiquidity(
      path[0],
      path[1],
      fullInvestment - (swapedAmounts[0]),
      swapedAmounts[1],
      1,
      1,
      address(this),
      block.timestamp + 1000
    );
    _approveTokenIfNeeded(address(pair), address(vault));
    vault.deposit(amountLiquidity);
    _returnAssets(path);
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

  function _zapOutAll() internal {
    for (uint256 i; i < vaults.length; i++) {
      // Calculate Amount per vault
      uint256 amount_per_vault = IERC20Upgradeable(vaults[i]).balanceOf(address(this));
      _beefOutAndSwap(address(vaults[i]), amount_per_vault, address(WETH), 1);
    }
  }

  function _zapOut(uint256 amount, address destAddress) internal {
    uint256 redeemRatio = (amount * (1e18)) / (totalSupply(0));
    for (uint256 i; i < vaults.length; i++) {
      // Calculate Amount per vault
      uint256 amount_per_vault = IERC20Upgradeable(vaults[i]).balanceOf(address(this));
      require((redeemRatio * (amount_per_vault)) / (1e18) > 0, "ISZERO");
      _beefOutAndSwap(address(vaults[i]), (redeemRatio * (amount_per_vault)) / (1e18), address(WETH), 1);
    }
    uint256 balance = address(this).balance;
    uint256 finalAmount = _handleFees(balance);
    payable(destAddress).transfer(finalAmount);
    _burn(destAddress, 0, amount);
  }

  function _zapOutAllAndTransfer(uint256 amount, address destAddress) internal {
    uint256 redeemRatio = (amount * (1e18)) / (totalSupply(0));
    for (uint256 i; i < vaults.length; i++) {
      // Calculate Amount per vault
      uint256 amount_per_vault = IERC20Upgradeable(vaults[i]).balanceOf(address(this));
      require((redeemRatio * (amount_per_vault)) / (1e18) > 0, "ISZERO");
      _approveTokenIfNeeded(vaults[i], address(destAddress));
      uint256 amountToSend = _handleFeesERC20((redeemRatio * (amount_per_vault)) / (1e18), vaults[i]);
      IERC20Upgradeable(vaults[i]).safeTransfer(destAddress, amountToSend);
    }
    _burn(destAddress, 0, amount);
  }

  function _zapIn(uint256 _amount) internal returns (bool) {
    uint256 sum;
    for (uint256 i; i < weights.length; i++) {
      sum += weights[i];
    }
    require(sum == 10000, "NOT100%");
    for (uint256 i; i < vaults.length; i++) {
      uint256 amount_per_vault = 0;
      // Calculate Amount per vault
      amount_per_vault = (_amount * (weights[i])) / (10000);
      IWETH(WETH).deposit{value: amount_per_vault}();
      _swapAndStake(vaults[i], 0, 1, WETH);
    }
    return true;
  }

  function _getVaultBalance(address _vault) internal view returns (uint256) {
    return IERC20Upgradeable(_vault).balanceOf(address(this));
  }

  function _getVaultPrice(address _vault) internal view returns (uint256) {
    address _pair;
    try IBeefyVault(_vault).want() returns (address pairAddress) {
      _pair = address(address(pairAddress)); // Vault V6
    } catch {
      _pair = address(IStrategy(IBeefyVault(_vault).strategy()).want()); // Vault V5
    }
    address _token0 = IUniswapV2Pair(_pair).token0();
    address _token1 = IUniswapV2Pair(_pair).token1();
    uint256 price;
    uint256 b0 = IERC20Upgradeable(_token0).balanceOf(_pair);
    uint256 b1 = IERC20Upgradeable(_token1).balanceOf(_pair);
    uint256 totalSupply = IUniswapV2Pair(_pair).totalSupply();
    uint256 lpTokenPrice;

    uint256 px0;
    uint256 px1;

    uint256 px;

    if (_token1 == WETH) {
      price = _getAMMPrice(_token0, _token1);
      uint8 _decimals = IERC20Upgradeable(_token0).decimals();
      if (_decimals != uint8(18)) {
        price = price / (10 ** uint256(18 - _decimals));
        b0 = b0 * (10 ** uint256(18 - _decimals));
        px0 = (b0 * (price)) / (10 ** 18);
      } else {
        px0 = (b0 * (price)) / (10 ** 18);
      }
      px = px0 + (b1);
      lpTokenPrice = (px * (10 ** IERC20Upgradeable(_pair).decimals())) / (totalSupply);
    } else if (_token0 == WETH) {
      price = _getAMMPrice(_token1, _token0);
      uint8 _decimals = IERC20Upgradeable(_token1).decimals();
      if (_decimals != uint8(18)) {
        price = price / (10 ** uint256(18 - _decimals));
        b1 = b1 * (10 ** uint256(18 - _decimals));
        px1 = (b1 * (price)) / (10 ** 18);
      } else {
        px1 = (b1 * (price)) / (10 ** 18);
      }
      px = px1 + (b0);
      lpTokenPrice = (px * (10 ** IERC20Upgradeable(_pair).decimals())) / (totalSupply);
    } else {
      uint256 price0 = _getAMMPrice(_token0, WETH);
      uint256 price1 = _getAMMPrice(_token1, WETH);
      uint8 _decimals0 = IERC20Upgradeable(_token0).decimals();
      uint8 _decimals1 = IERC20Upgradeable(_token1).decimals();
      if (_decimals0 != uint8(18)) {
        price = price / (10 ** uint256(18 - _decimals0));
        b0 = b0 * (10 ** uint256(18 - _decimals0));
      }
      if (_decimals1 != uint8(18)) {
        price = price / (10 ** uint256(18 - _decimals1));
        b1 = b1 * (10 ** uint256(18 - _decimals1));
      }
      px0 = (b0 * (price0)) / (10 ** 18);
      px1 = (b1 * (price1)) / (10 ** 18);
      px = px0 + (px1);
      lpTokenPrice = (px * (10 ** IERC20Upgradeable(_pair).decimals())) / (totalSupply);
    }

    return lpTokenPrice;
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

  function _getVaultValue(address _vault, bool unit) internal view returns (uint256) {
    uint256 value;
    uint256 vaultPrice = _getVaultPrice(_vault);
    uint256 vaultUnitPrice = IBeefyVault(_vault).getPricePerFullShare();
    if (unit != true) {
      uint256 vaultBalance = IERC20Upgradeable(_vault).balanceOf(address(this));
      uint256 vaultTotalValue = (vaultBalance * (vaultUnitPrice)) / (1e18);
      value = (vaultTotalValue * (uint256(vaultPrice))) / (1e18);
    } else {
      value = (vaultUnitPrice * (uint256(vaultPrice))) / (1e18);
      return value;
    }
    return value;
  }

  function _getVaultPair(address beefyVault) private view returns (IBeefyVault vault, IUniswapV2Pair pair) {
    IUniswapV2Router02 router = IUniswapV2Router02(_getExactRouterForVault(address(beefyVault)));
    vault = IBeefyVault(beefyVault);
    try vault.want() returns (address pairAddress) {
      pair = IUniswapV2Pair(address(pairAddress)); // Vault V6
    } catch {
      pair = IUniswapV2Pair(address(vault.token())); // Vault V5
    }
    require(pair.factory() == router.factory(), "WRONGPAIR");
    return (vault, pair);
  }

  function _getTotalValue() internal view returns (uint256) {
    uint256 totalValue = 0;
    totalValue += address(this).balance;
    for (uint256 i; i < vaults.length; i++) {
      uint256 valuation = _getVaultValue(vaults[i], false);
      totalValue += valuation;
    }
    return totalValue;
  }

  function _getExactRouterForVault(address vault) internal view returns (address) {
    address router = IStrategy(IBeefyVault(vault).strategy()).unirouter();
    if (address(router) != address(0)) {
      return address(router);
    } else {
      return address(0);
    }
  }

  function _getAMMPrice(address _from, address _to) internal view returns (uint256 amountOut) {
    return oracle.getRate(IERC20Upgradeable(_from), IERC20Upgradeable(_to), true);
  }

  function _getSwapAmount(
    uint256 investmentA,
    uint256 reserveA,
    uint256 reserveB,
    address vault
  ) private view returns (uint256 swapAmount) {
    IUniswapV2Router02 router = IUniswapV2Router02(_getExactRouterForVault(vault));
    uint256 halfInvestment = investmentA / 2;
    uint256 nominator = router.getAmountOut(halfInvestment, reserveA, reserveB);
    uint256 denominator = router.quote(halfInvestment, reserveA + (halfInvestment), reserveB - (nominator));
    swapAmount = investmentA - (Babylonian.sqrt((halfInvestment * halfInvestment * nominator) / denominator));
  }

  function _getNewFundUnits(
    uint256 _totalFundB4,
    uint256 _totalValueAfter,
    uint256 _totalSupply
  ) internal pure returns (uint256) {
    if (_totalValueAfter == 0) return 0;
    if (_totalFundB4 == 0) return _totalValueAfter;
    uint256 totalUnitAfter = (_totalValueAfter * (_totalSupply)) / (_totalFundB4);
    uint256 mintUnit = totalUnitAfter - (_totalSupply);
    return mintUnit;
  }

  function _getUnitPrice() internal view returns (uint256) {
    uint256 totalValueB4 = _getTotalValue();
    if (totalValueB4 == 0) return 0;
    uint256 totalUnitB4 = totalSupply(0);
    if (totalUnitB4 == 0) return 0;
    return (totalValueB4 * (1e18)) / (totalUnitB4);
  }

  function _getMintQty(uint256 _srcQty) internal view returns (uint256 mintQty, uint256 totalFundB4) {
    uint256 totalFundAfter = _getTotalValue();
    totalFundB4 = totalFundAfter - (_srcQty);
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
    uint256 feeAmount = (_amount * (IFactory(factory).getFee())) / (10000);
    address to = payable(address(IFactory(factory).treasury()));
    (bool success, bytes memory data) = to.call{value: feeAmount}(new bytes(0));
    require(success, "TRANSFER_FAILED");
    return _amount - (feeAmount);
  }

  function _handleFeesERC20(uint256 _amount, address _token) internal returns (uint256) {
    uint256 feeAmount = (_amount * (IFactory(factory).getFee())) / (10000);
    _approveTokenIfNeeded(_token, IFactory(factory).treasury());
    IERC20Upgradeable(_token).safeTransfer(IFactory(factory).treasury(), feeAmount);
    return _amount - (feeAmount);
  }
}
