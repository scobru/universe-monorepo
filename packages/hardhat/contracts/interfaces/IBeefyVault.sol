pragma solidity 0.8.14;
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "./IStrategy.sol";

interface IBeefyVault is IERC20Upgradeable {
  function deposit(uint256 amount) external;

  function depositAll() external;

  function withdraw(uint256 shares) external;

  function withdrawAll() external;

  function getPricePerFullShare() external view returns (uint256);

  function upgradeStrat() external;

  function balance() external view returns (uint256);

  function want() external pure returns (address);

  function token() external view returns (IERC20Upgradeable);

  function strategy() external view returns (IStrategy);
}
