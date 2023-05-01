import '@openzeppelin/hardhat-upgrades'

import { parseEther } from '@ethersproject/units'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import * as dotenv from 'dotenv'
import { ethers, run, upgrades } from 'hardhat'

import { BeefyMultiFarm__factory, BeefyMultiFarmFactory__factory } from '../../typechain-types'

dotenv.config()

let ownerAddress: string
let signers: SignerWithAddress[]

const FACTORY = '0x4a28b3b42a48dfb6d3797c8abb8ba530cf7b93e6'

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)

async function main() {
  signers = await ethers.getSigners()
  ownerAddress = signers[0].address

  const fundID = 2
  const factory = BeefyMultiFarmFactory__factory.connect(FACTORY, signers[0])
  const vaultsData = [
    {
      name: 'MARS DAI/USDT-MATIC',
      symbol: 'MRS',
      vaults: ['0x584611da226b4d4c0c4d880e6f1e0c0e8522f3ae', '0x1be356364a1e849af2f7a513fc46dab6063db485'],
      weights: [5000, 5000]
    },
    {
      name: ' JUPYTER ETH/BNB/BTC-MATIC',
      symbol: 'JPY',
      vaults: [
        '0xc24cf5fa29e619f2d5ccbec46f2295876c3722ff',
        '0xc8e809a9180d637cc23daf60b41b70ca1ad5fc08',
        '0x76f0e4a08c1e85d020dfd7c66b991ecd4a7551af',
        '0x6888f67662d1f442c4428129e0bdb27a275e0a65'
      ],
      weights: [2500, 2500, 4000, 1000]
    },
    {
      name: 'VENUS LCD/PMATIC-MATIC',
      symbol: 'VNS',
      vaults: ['0x8c9de3b735a154d8fc1e94183ea9b021913ac88b', '0xdb15f201529778b5e2dfa52d41615cd1ab24c765'],
      weights: [7000, 3000]
    }
  ]

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
    const contract = BeefyMultiFarm__factory.connect(contracts[fundID], signers[0])
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
    const contract = BeefyMultiFarm__factory.connect(contracts[fundID], signers[0])

    try {
      // Set Vaults and weights
      const setVaultsAndWeights = await contract.setVaultsAndWeights(
        vaultsData[fundID].vaults,
        vaultsData[fundID].weights
      )

      /* let getVault = await contract.getVaults()
      console.log('getVault', getVault)

      while (getVault.length === 0) {
        console.log('Waiting for vaults to be set')
        getVault = await contract.getVaults()
        await new Promise(r => setTimeout(r, 6000))
      }
      console.log('- Vaults and weights set') */

      // Deposit

      const deposit = await contract.deposit({ value: parseEther('5'), gasPrice: 100 * 1e9, gasLimit: 28000000 })
      let balance = await contract.balanceOf(ownerAddress, 0)

      while (deposit.hash === undefined) {
        await deposit.wait()
        console.log('Waiting for deposit to be done')
      }

      console.log('Balance: ' + balance.toString())
      while (balance.toString() === '0') {
        console.log('Waiting for balance to be updated')
        balance = await contract.balanceOf(ownerAddress, 0)
        await new Promise(r => setTimeout(r, 6000))
      }

      console.log('Deposit done')
    } catch (e) {
      console.log('Error', e)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
