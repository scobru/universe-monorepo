# ◯ Universe

## Index Fund ERC20 📈💰🤑

### What is this?

Universe is a decentralized application (dapp) that enables devs to create an Index Fund using ERC20 tokens (such as TokenSets). In addition to this, Universe also allows to create a Index Farm Fund, which is essentially an index fund that uses the farming vault from Beefy Finance as collateral instead of using tokens directly.

### Description

**The Index Fund ERC2**0 smart contract on Ethereum represents an index fund that distributes its shares in ERC20 format and allocates the funds according to the percentages chosen in the fund, using Uni-v2 routers to swap the assets. The contract allows users to purchase the ERC20 shares of the fund, select the allocation percentages for their assets in the fund, and deposit the assets into the fund. The owner of the fund can also call the `rebalance` function to rebalance the fund.

**The Beefy Multi Farm** has the same operating principle as the previous one, but instead of using Uni-v2 routers to swap assets, it uses Beefy Finance vaults to generate interest. Beefy Finance vaults are a series of smart contracts that allow you to deposit tokens into a fund and generate interest through various investment strategies."

## Contracts

**IndexFund.sol:** This is the core logic of the index fund.

**IndexFundFactory.sol:** This contract is used to create a new index.

**BeefyMultiFarm.sol** : This is the core logic of the Index farm.

**BeefyMultiFarmFactory.sol**: This contract is used to create a new farm.

## 🚀Deployments

### Polygon

* expMATIC: **0x3b7CA113e5f7CD2c53C0203D5996Ad6BdCb7bC57**
* volVOL: **0x81708b751018559CD33a3123c3f14C0D27139Bb8**
* IndexFundFactory: **0x6f623036404abde49a1d6495f6b0e8bf0d8f8dcc**
* IndexFund (implementation) : **0x7e050146F08447e6c95F59B7Ab73A6479B644809**
* MARS: **0x154d049C0F5cCf74905d80845a38727999f5014A**
* JUPYTER: **0xAa51a5bF883b2A65C20671f2e27A7D73c1Ec97B6**
* BeefyMultiFarmFactory.sol: **0x4A28B3B42A48DFb6d3797c8aBB8Ba530cF7B93e6**
* BeefyMultiFarm.sol (implementation): **0x5392E90b77E966c162fE2D8B632fD7f9b1c824C3**

### Functionality of the Contract 🛠️🧰

The Index Fund ERC20 contract uses the following functionalities:

* Creation and management of ERC20 tokens: The contract creates and manages the tokens of the fund, which represent the shares of the fund.
* Uni-v2 routers: The contract uses Uni-v2 routers to swap the assets of the fund based on the allocation percentages chosen by the investors.
* Asset allocation: The contract allocates the assets of the fund based on the allocation percentages chosen by the investors.
* Rebalance: The owner of the fund can call the `rebalance` function to rebalance the fund.

⚠️ The cost of gas fees is directly proportional to the number of swaps and deposits that the contract performs, which depends on the number of assets that each index contains.

## Running this project

1. Clone the repository
2. Run the following command from the root of the project

```bash
yarn install
```

```bash
yarn start
```

> If you don't wish to interact with the polygon mainnet follow the steps below:

1. Clone the repository
2. In the [scaffold.config.ts](https://github.com/scobru/tiers-monorepo/blob/main/packages/nextjs/scaffold.config.ts) file change the `targetNetwork` property to `chains.hardhat`
3. Create .env file based on the .env.example file in [hardhat folder](https://github.com/scobru/tiers-monorepo/blob/main/packages/hardhat/README.md)
4. Run the following command from the root of the project

```bash
yarn install
```

```bash
yarn fork
```

```bash
yarn start
```

Scaffold-eth also provides a series of pre-configured tools and templates for creating user interfaces (UIs) and connecting to external services such as Infura and IPFS, greatly simplifying the development and testing of the contract. 🤖👨‍💻

## Create an Index Fund

The scripts necessary for deploying a new index can be found in the "script" folder of Hardhat.

Check these steps before creating the contract:

1. Try not to select tokens with auto-liquidity functions.
2. Ensure that there is liquidity in the corresponding token's liquidity pool that you will be adding to the vault.
3. Ensure that the token address of the exchange that uses uni-v2 is correct.

## Create an Index Farm

1. Check Beefy Finance and select only vault that use Uni-v2 as Dex for farm.
2. Check if the vault that you have selected on beefy use the contract "**BeefyVaultV6.sol**"
3. Check on Beefy Finance most solid and long term project.



Once u have pull your script
