import '@openzeppelin/hardhat-upgrades'

import { parseEther } from '@ethersproject/units'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import * as dotenv from 'dotenv'
import { ethers, run, upgrades } from 'hardhat'

import {
  ETHHandler__factory,
  ExternalProxyCall__factory,
  IndexFund__factory,
  IndexFundFactory__factory
} from '../../typechain-types'

const AGGREAGATOR = '0x7f069df72b7a39bce9806e3afaf579e54d8cf2b9'
const WETH = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' // MATIC
const TREASURY = '0xb542E27732a390f509fD1FF6844a8386fe320f7f'
const ROUTER = '0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff'

dotenv.config()

let ownerAddress: string
let signers: SignerWithAddress[]

async function main() {
  signers = await ethers.getSigners()

  ownerAddress = signers[0].address

  const ExternalProxyCall = new ExternalProxyCall__factory(signers[0])
  const externalProxyCall = await ExternalProxyCall.deploy()

  await externalProxyCall.deployed()

  console.log('ExternalProxyCall Deployed: ' + externalProxyCall.address)

  const Factory = new IndexFundFactory__factory(signers[0])
  const factory = await upgrades.deployProxy(
    Factory,
    [ROUTER, AGGREAGATOR, externalProxyCall.address, WETH, TREASURY],
    {
      initializer: 'initialize'
    }
  )

  console.log('Factory Deployed: ' + factory.address)

  const fund = await new IndexFund__factory(signers[0]).deploy()
  await fund.deployed()

  console.log('Fund Deployed: ' + fund.address)

  await factory.adminUpdateImplementation(fund.address)

  console.log('Factory Updated: ' + factory.address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
