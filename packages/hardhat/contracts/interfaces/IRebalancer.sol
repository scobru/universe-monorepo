pragma solidity 0.8.14;

interface IRebalancer {
  function callRebalanceFarm(address _vault)
    external
    returns (
      uint256[] memory,
      uint256[] memory,
      uint256[] memory,
      uint256[] memory
    );
}
