import '@openzeppelin/hardhat-upgrades'

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

  const MATICX = '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6'
  const aMATICc = '0x0e9b89007eee9c958c0eda24ef70723c2c93dd58'
  const stMATIC = '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4'
  const pMATIC = '0xa0df47432d9d88bcc040e9ee66ddc7e17a882715'
  const CVOL = '0x9cd552551ec130b50c1421649c8d11e76ac821e1'
  const WMATIC = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' // MATIC
  const WBTC = '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6'
  const DAI = '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063'
  const WETH = '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'
  const FACTORY = '0x6f623036404abde49a1d6495f6b0e8bf0d8f8dcc'
  const IMPLEMENTATION = '0x7e050146f08447e6c95f59b7ab73a6479b644809'

  const fundID = 1

  const vaultsData = [
    {
      name: 'Expo MATIC',
      symbol: 'expMATIC',
      vaults: [MATICX, aMATICc, stMATIC, pMATIC],
      weights: [2500, 2500, 2500, 2500]
    },
    {
      name: 'Vol MATIC',
      symbol: 'volVOL',
      vaults: [MATICX, WBTC, WETH],
      weights: [1000, 6000, 3000]
    }
  ]

  const factory = BeefyMultiFundFactory__factory.connect(FACTORY, signers[0])

  let contracts = await factory.getContracts()
  console.log('contracts', contracts)

  if (!contracts[fundID]) {
    const tx = await factory.create(ownerAddress, vaultsData[fundID].name, vaultsData[fundID].symbol)
    await tx.wait()
    console.log('Fund created')
    while (!contracts[fundID]) {
      console.log('Waiting for fund to be created on chain')
      contracts = await factory.getContracts()
      await new Promise(r => setTimeout(r, 6000))
    }

    // connect to new contract
    const contract = BeefyMultiFund__factory.connect(contracts[fundID], signers[0])
    // Set Vaults and weights
    const setVaultsAndWeights = await contract.setVaultsAndWeights(
      vaultsData[fundID].vaults,
      vaultsData[fundID].weights
    )

    while (setVaultsAndWeights.hash === undefined) {
      setVaultsAndWeights.wait()
      console.log('Waiting for vaults to be set')
    }

    const getVault = await contract.getVaults()

    console.log('getVault', getVault)

    console.log('- Vaults and weights set')

    // Deposit
    try {
      const deposit = await contract.deposit({ value: parseEther('5') })
      let balance = await contract.balanceOf(ownerAddress, 0)
      while (deposit.hash === undefined) {
        await deposit.wait()
        console.log('Waiting for deposit to be done')
      }
      console.log('Deposit done')
      balance = await contract.balanceOf(ownerAddress, 0)

      console.log('Balance: ' + balance.toString())
    } catch (e) {
      console.log('Error depositing', e)
    }
  } else {
    console.log('- Fund already created')

    // connect to new contract
    const contract = BeefyMultiFund__factory.connect(contracts[fundID], signers[0])

    // Set Vaults and weights
    const setVaultsAndWeights = await contract.setVaultsAndWeights(
      vaultsData[fundID].vaults,
      vaultsData[fundID].weights,
      { gasPrice: 100 * 1e9, gasLimit: 28000000 }
    )
    await setVaultsAndWeights.wait()

    /*  const deposit = await contract.deposit({ value: parseEther('5'), gasPrice: 100 * 1e9, gasLimit: 28000000 })
    await deposit.wait()

    console.log('Deposit done') */
  }

  console.log('Done')
}
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
