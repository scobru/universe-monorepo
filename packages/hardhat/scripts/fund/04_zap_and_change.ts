import { parseEther } from '@ethersproject/units'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import * as dotenv from 'dotenv'
import { ethers, run, upgrades } from 'hardhat'

import { IndexFund__factory } from '../../typechain-types'

dotenv.config()

const MATICX = '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6'
const aMATICc = '0x0e9b89007eee9c958c0eda24ef70723c2c93dd58'
const stMATIC = '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4'
const pMATIC = '0xa0df47432d9d88bcc040e9ee66ddc7e17a882715'
const CVOL = '0x9cd552551ec130b50c1421649c8d11e76ac821e1'
const WMATIC = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' // MATIC
const WBTC = '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6'
const DAI = '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063'
const WETH = '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'
const USDC = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'

const vaultsData = [
  {
    name: 'Expo MATIC',
    symbol: 'expMATIC',
    vaults: [MATICX, USDC],
    weights: [9500, 500]
  },
]

let ownerAddress: string
let signers: SignerWithAddress[]

async function main() {
  signers = await ethers.getSigners()

  ownerAddress = signers[0].address

  // fund instance
  const fund = IndexFund__factory.connect(
    '0x3b7CA113e5f7CD2c53C0203D5996Ad6BdCb7bC57',
    signers[0]
  )

  const tx = await fund.zapOutAndChangeComposition(
    vaultsData[0].vaults, vaultsData[0].weights
  )

  console.log('tx', tx.hash)

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
