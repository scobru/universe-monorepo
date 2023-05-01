import '@openzeppelin/hardhat-upgrades'

import { parseEther } from '@ethersproject/units'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import * as dotenv from 'dotenv'
import { ethers, run, upgrades } from 'hardhat'

import {
  BeefyMultiFarmFactoryV2__factory,
  BeefyMultiFarmV2__factory,
  ExternalProxyCall__factory,
  Rebalancer__factory
} from '../../../typechain-types'
const AGGREAGATOR = '0x7f069df72b7a39bce9806e3afaf579e54d8cf2b9'
const WETH = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' // MATIC
const TREASURY = '0xb542E27732a390f509fD1FF6844a8386fe320f7f'
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
  const Rebalancer = new Rebalancer__factory(signers[0])
  const rebalancer = await upgrades.deployProxy(Rebalancer, [], {
    initializer: 'initialize'
  })
  await rebalancer.deployed()
  console.log('Rebalancer Deployed: ' + rebalancer.address)
  const BeefyMultiFarmFactory = new BeefyMultiFarmFactoryV2__factory(signers[0])
  const beefyMultiFarmFactory = await upgrades.deployProxy(
    BeefyMultiFarmFactory,
    [rebalancer.address, AGGREAGATOR, externalProxyCall.address, WETH, TREASURY],
    {
      initializer: 'initialize'
    }
  )
  console.log('BeefyMultiFarmFactory Deployed: ' + beefyMultiFarmFactory.address)
  const beefyMultiFarm = await new BeefyMultiFarmV2__factory(signers[0]).deploy()
  await beefyMultiFarm.deployed()
  console.log('BeefyMultiFarm Deployed: ' + beefyMultiFarm.address)
  await beefyMultiFarmFactory.adminUpdateImplementation(beefyMultiFarm.address)
  console.log('BeefyMultiFarmFactory Updated: ' + beefyMultiFarmFactory.address)
}
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
