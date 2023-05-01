import { parseEther } from '@ethersproject/units'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import * as dotenv from 'dotenv'
import { ethers, run, upgrades } from 'hardhat'

import { BeefyMultiFarmFactoryV2__factory, BeefyMultiFarmV2__factory } from '../../../typechain-types'

dotenv.config()

let ownerAddress: string
let signers: SignerWithAddress[]

async function main() {
  signers = await ethers.getSigners()

  ownerAddress = signers[0].address

  const factory = BeefyMultiFarmFactoryV2__factory.connect('0x64f2a6f94c2642ad5fa04a67fa783efbe5486f3f', signers[0])

  const fund = await new BeefyMultiFarmV2__factory(signers[0]).deploy()

  console.log('Template: ' + fund.address)

  await factory.adminUpdateImplementation(fund.address, { gasLimit: 7000000 })

  console.log('Implementation Fund: ' + (await factory.implementation()))
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
