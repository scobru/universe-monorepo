// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./interfaces/IProxyCall.sol";
import "./interfaces/IFundInitializer.sol";

contract IndexFundFactory is Initializable, OwnableUpgradeable {
  using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
  using AddressUpgradeable for address;
  using AddressUpgradeable for address payable;
  using ClonesUpgradeable for address;
  using StringsUpgradeable for uint256;

  IProxyCall public proxyCallContract;

  address public implementation;
  address public defaultOperator;

  address public router;
  address public oracle;
  address public treasury;
  address public rolesContract;
  address public WETH;
  uint256 public version;
  uint256 public fee;
  uint256 public MAX_FEE;

  EnumerableSetUpgradeable.AddressSet private contractsList;

  EnumerableSetUpgradeable.AddressSet private vaultsList;

  event Created(address indexed addr);

  event ImplementationUpdated(address indexed implementation, uint256 indexed version);

  event ProxyCallContractUpdated(address indexed _proxyCallContract);

  mapping(address => bool) public activeContracts;

  function initialize(
    address _router,
    address _oracle,
    address _proxyCallContract,
    address _WETH,
    address _treasury
  ) public initializer {
    router = _router;
    MAX_FEE = 1000;
    fee = 100;
    WETH = _WETH;
    treasury = _treasury;
    oracle = _oracle;

    _updateProxyCallContract(_proxyCallContract);

    __Ownable_init();
    __Ownable_init_unchained();

    transferOwnership(msg.sender);
  }

  modifier onlyAdmin() {
    require(owner() == msg.sender, "Not Admin");
    _;
  }

  function setOracle(address _oracle) external onlyAdmin returns (bool) {
    oracle = _oracle;
    return true;
  }

  function setFee(uint256 _fee) external onlyAdmin returns (bool) {
    fee = _fee;
    return true;
  }

  function setTreasury(uint256 _fee) external onlyAdmin returns (bool) {
    fee = _fee;
    return true;
  }

  function setRouterForInitialization(address _router) external onlyAdmin returns (bool) {
    router = _router;
    return true;
  }

  function setWETH(address _WETH) external onlyAdmin returns (bool) {
    WETH = _WETH;
    return true;
  }

  function getFee() external view returns (uint256) {
    return fee;
  }

  function adminUpdateImplementation(address _implementation) external onlyOwner {
    _updateImplementation(_implementation);
  }

  function adminUpdateProxyCallContract(address _proxyCallContract) external onlyOwner {
    _updateProxyCallContract(_proxyCallContract);
  }

  function create(
    address _owner,
    string memory _name,
    string memory _symbol
  ) external onlyOwner returns (address ctx) {
    uint256 nonce = uint256(keccak256(abi.encodePacked(msg.sender, block.timestamp)));

    ctx = implementation.cloneDeterministic(_getSalt(msg.sender, nonce + 1));

    IFundInitializer(ctx).initialize(address(this), router, oracle, _owner, _name, _symbol, WETH);

    require(contractsList.add(address(ctx)));

    activeContracts[ctx] = true;

    emit Created(address(ctx));
  }

  /*----VIEW FUNCTIONS---------------------------------*/

  function contractAt(uint256 _i) external view returns (address) {
    return contractsList.at(_i);
  }

  function containsContract(address _c) external view returns (bool) {
    return contractsList.contains(_c);
  }

  function numberOfContract() external view returns (uint256) {
    return contractsList.length();
  }

  function getContracts() external view returns (address[] memory) {
    uint256 contractLength = contractsList.length();

    if (contractLength == 0) {
      return new address[](0);
    } else {
      address[] memory contractsArray = new address[](contractLength);

      for (uint256 i; i < contractLength; i++) {
        contractsArray[i] = contractsList.at(i);
      }

      return contractsArray;
    }
  }

  function getActiveContract(address _contract) external view returns (bool) {
    return activeContracts[_contract];
  }

  function getActiveContracts() external view returns (address[] memory) {
    uint256 contractLength = contractsList.length();

    if (contractLength == 0) {
      return new address[](0);
    } else {
      address[] memory contractsArray = new address[](contractLength);
      uint256 index = 0;

      for (uint256 i; i < contractLength; i++) {
        if (activeContracts[contractsList.at(i)]) {
          contractsArray[index] = contractsList.at(i);
          index++;
        }
      }

      return contractsArray;
    }
  }

  function deactivateContract(address _contract) external onlyAdmin returns (bool) {
    activeContracts[_contract] = false;
    return true;
  }

  function _updateProxyCallContract(address _proxyCallContract) private {
    require(_proxyCallContract.isContract(), "FNDCollectionFactory: Proxy call address is not a contract");
    proxyCallContract = IProxyCall(_proxyCallContract);

    emit ProxyCallContractUpdated(_proxyCallContract);
  }

  function _updateImplementation(address _implementation) private {
    require(_implementation.isContract(), "nali: implementation is not a contract");

    implementation = _implementation;

    unchecked {
      // Version cannot overflow 256 bits.
      version++;
    }

    IFundInitializer(implementation).initialize(
      address(this),
      router,
      oracle,
      owner(),
      string(abi.encodePacked("MULTIFARM", version.toString())),
      string(abi.encodePacked("MF", version.toString())),
      WETH
    );

    emit ImplementationUpdated(_implementation, version);
  }

  function _getSalt(address creator, uint256 nonce) private pure returns (bytes32) {
    return keccak256(abi.encodePacked(creator, nonce));
  }

  receive() external payable {}
}
