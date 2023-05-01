import '@openzeppelin/hardhat-upgrades'

import { parseEther } from '@ethersproject/units'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import * as dotenv from 'dotenv'
import { formatEther } from 'ethers/lib/utils'
import { ethers, run, upgrades } from 'hardhat'

import { BeefyMultiFarmFactoryV2__factory, BeefyMultiFarmV2__factory } from '../../../typechain-types'

dotenv.config()

let ownerAddress: string
let signers: SignerWithAddress[]

const FACTORY = '0x8f4e4904363858dc65e1ab3e05474f7216dced69'

async function main() {
  signers = await ethers.getSigners()
  ownerAddress = signers[0].address

  const fundID = 2
  const factory = BeefyMultiFarmFactoryV2__factory.connect(FACTORY, signers[0])

  const ctxAddress = await factory.getContracts()
  console.log(ctxAddress)

  if (ctxAddress.length === 0) {
    throw new Error('No contract created')
  } else {
    // connect to new contract
    const contract = BeefyMultiFarmV2__factory.connect(ctxAddress[fundID], signers[0])
    // Set Vaults and weights

    // get unitPriceff
    const unitPrice = await contract.getUnitPrice()
    console.log('unitPrice', formatEther(unitPrice))
    const yourBalance = await contract.balanceOf(signers[0].address, 0)
    console.log('yourBalance', formatEther(yourBalance))
    const totalSupply = await contract.totalSupply(0)
    console.log('totalSupply', formatEther(totalSupply))
    const totalValue = await contract.getTotalValue()
    console.log('totalValue', formatEther(totalValue))
    const totalValuation = yourBalance.mul(unitPrice).div(parseEther('1'))
    console.log('totalValuation', totalValuation.toString())

    /* try {
      if (yourBalance.gt(0)) {
        const redeem = await contract.redeem(yourBalance, { gasLimit: 10000000 })
        await redeem.wait()
        let yourBalanceAfter = await contract.balanceOf(signers[0].address, 0)
        while (Number(yourBalanceAfter) != 0) {
          console.log('Waiting for redeem to complete')
          yourBalanceAfter = await contract.balanceOf(signers[0].address, 0)
          await new Promise(r => setTimeout(r, 6000))
        }
        console.log('Redeem complete')
        console.log('yourBalanceAfter', formatEther(yourBalanceAfter))
      }
    } catch (error) {
      console.log(error)
    } */

    /* try {
      const rebalance = await contract.rebalance()
      await rebalance.wait()
      console.log('Rebalance complete')
    } catch (error) {
      console.log(error)
    } */
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
