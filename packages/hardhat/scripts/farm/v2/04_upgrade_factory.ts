import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers, upgrades } from 'hardhat';
import { BeefyMultiFarmFactoryV2__factory } from '../../../typechain-types';
import * as dotenv from 'dotenv';

dotenv.config();

let ownerAddress: string;
let signers: SignerWithAddress[];

async function main() {
  signers = await ethers.getSigners();

  if (!signers.length) {
    throw new Error("No signers available");
  }

  ownerAddress = signers[0].address;

  // upgrade openzeppelin proxy
  const ctx = new BeefyMultiFarmFactoryV2__factory(signers[0]);
  console.log('Upgrading BeefyMultiFarmSolo...');

  const contractAddress = '0x4A28B3B42A48DFb6d3797c8aBB8Ba530cF7B93e6';
  const forceImport = await upgrades.forceImport(contractAddress, ctx);
  const prepare = await upgrades.prepareUpgrade(contractAddress, ctx);
  const ctxProxy = await upgrades.upgradeProxy(contractAddress, ctx);

  await ctxProxy.deployed();
  console.log(`BeefyMultiFarmSolo upgraded at address: ${ctxProxy.address}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
