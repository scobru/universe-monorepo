import { parseEther } from '@ethersproject/units'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import * as dotenv from 'dotenv'
import { ethers, run, upgrades } from 'hardhat'

import { Rebalancer__factory } from '../../../typechain-types'

dotenv.config()

let ownerAddress: string

let signers: SignerWithAddress[]

async function main() {
  signers = await ethers.getSigners()

  ownerAddress = signers[0].address

  // upgrade openzeppelin proxy
  const ctx = new Rebalancer__factory(signers[0])

  const ctxProxy = await upgrades.upgradeProxy('0xe84cb4b60f8af4c0c29abbdaab39213fc4ed599c', ctx)
  ctxProxy.deployed()

  console.log('Rebalancer upgraded: ' + ctxProxy.address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
