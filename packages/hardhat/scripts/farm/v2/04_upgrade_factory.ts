import { parseEther } from '@ethersproject/units'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import * as dotenv from 'dotenv'
import { ethers, run, upgrades } from 'hardhat'

import { BeefyMultiFarmFactoryV2__factory } from '../../../typechain-types'

dotenv.config()

let ownerAddress: string

let signers: SignerWithAddress[]

async function main() {
  signers = await ethers.getSigners()

  ownerAddress = signers[0].address

  // upgrade openzeppelin proxy
  const ctx = new BeefyMultiFarmFactoryV2__factory(signers[0])

  await upgrades.prepareUpgrade('0xbb77efa4651f0458a7cf24a6a490d7aa46d7752b', ctx)
  const ctxProxy = await upgrades.upgradeProxy('0xbb77efa4651f0458a7cf24a6a490d7aa46d7752b', ctx)
  ctxProxy.deployed()

  console.log('BeefyMultiFarmSolo upgraded: ' + ctxProxy.address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
