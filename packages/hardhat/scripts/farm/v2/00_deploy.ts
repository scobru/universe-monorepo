import * as dotenv from 'dotenv'
import { ethers, network, run, upgrades } from 'hardhat'
import {
  BeefyMultiFarmFactoryV2__factory,
  BeefyMultiFarmV2__factory,
  ExternalProxyCall__factory,
  Rebalancer__factory
} from '../../../typechain-types'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'

const AGGREAGATOR = '0x7f069df72b7a39bce9806e3afaf579e54d8cf2b9'
const WETH = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' // MATIC
const TREASURY = '0xb542E27732a390f509fD1FF6844a8386fe320f7f'
dotenv.config()

async function main() {
  const [signer] = await ethers.getSigners()
  const owner: SignerWithAddress = signer
  const ExternalProxyCall = new ExternalProxyCall__factory(owner)
  const externalProxyCall = await ExternalProxyCall.deploy({ gasLimit: 10000000 })
  await externalProxyCall.waitForDeployment()
  console.log('ExternalProxyCall Deployed: ' + await externalProxyCall.getAddress())

  const Rebalancer = new Rebalancer__factory(owner)
  const rebalancer = await upgrades.deployProxy(Rebalancer, [], {
    initializer: 'initialize'
  })

  await rebalancer.waitForDeployment()
  console.log('Rebalancer Deployed: ' + await rebalancer.getAddress())

  const BeefyMultiFarmFactory = new BeefyMultiFarmFactoryV2__factory(owner)
  const beefyMultiFarmFactory = await upgrades.deployProxy(
    BeefyMultiFarmFactory,
    [await rebalancer.getAddress(), AGGREAGATOR, await externalProxyCall.getAddress(), WETH, TREASURY],
    {
      initializer: 'initializeV2'
    }
  )
  console.log('BeefyMultiFarmFactory Deployed: ' + await beefyMultiFarmFactory.getAddress())

  const beefyMultiFarm = await new BeefyMultiFarmV2__factory(owner).deploy()

  await beefyMultiFarm.waitForDeployment()
  console.log('BeefyMultiFarm Deployed: ' + await beefyMultiFarm.getAddress())

  await beefyMultiFarmFactory.adminUpdateImplementation(await beefyMultiFarm.getAddress())
  console.log('BeefyMultiFarmFactory Updated: ' + await beefyMultiFarmFactory.getAddress())
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
