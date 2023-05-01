pragma solidity 0.8.14;

interface IBeefyMultiFarm {
  function getTotalValue() external view returns (uint256);

  function getAMMPrice(address _vault, address _token) external view returns (uint256);

  function getVaults() external view returns (address[] memory);

  function getWeights() external view returns (uint256[] memory);

  function WETH() external view returns (address);

  function getVaultValue(address _vault, bool unit) external view returns (uint256);

  function getVaultPrice(address _vault) external view returns (uint256);

  function getVaultBalance(address _vault) external view returns (uint256);
}
