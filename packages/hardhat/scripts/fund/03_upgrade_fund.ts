import { parseEther } from '@ethersproject/units'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import * as dotenv from 'dotenv'
import { ethers, run, upgrades } from 'hardhat'

import { BeefyMultiFund__factory, BeefyMultiFundFactory__factory } from '../../typechain-types'

dotenv.config()

let ownerAddress: string
let signers: SignerWithAddress[]

async function main() {
  signers = await ethers.getSigners()

  ownerAddress = signers[0].address

  const factory = BeefyMultiFundFactory__factory.connect('0x5ae727649bf647d7336191e7ac78646a694f0dcf', signers[0])

  const fund = await new BeefyMultiFund__factory(signers[0]).deploy()

  console.log('Template: ' + fund.address)

  await factory.adminUpdateImplementation(fund.address, { gasLimit: 500000000 })

  console.log('Implementation Fund: ' + (await factory.implementation()))
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
