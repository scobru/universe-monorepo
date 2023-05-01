pragma solidity 0.8.14;

interface IFactory {
  function getFee() external view returns (uint256);

  function treasury() external view returns (address);

  function rebalancer() external view returns (address);
}
