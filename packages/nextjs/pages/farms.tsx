import { useEffect, useState } from "react";
import React from "react";
import { Contract, ContractInterface, ethers } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import type { NextPage } from "next";
import { useAccount, useBlockNumber, useProvider, useSigner } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const Vaults: NextPage = () => {
  const { data: signer } = useSigner();
  const account = useAccount();
  const provider = useProvider();
  const singerAddress = account.address;
  const [newOwner, setNewOwner] = useState("");
  const [owner, setOwner] = useState("");

  const DEBUG = false;

  const [fundsData, setFundsData] = useState(
    Array<{
      address: string;
      name: "";
      symbol: "";
      vaults: [];
      vaultsCount: 0;
      unitPrice: 0;
      totalValue: 0;
      totalSupply: 0;
      yourBalance: 0;
    }>,
  );

  const [beefyVaultNames, setBeefyVaultNames] = useState(Array<Array<string>>);
  const [beefyVaultApys, setBeefyVaultApys] = useState(Array<Array<number>>);
  const [allocations, setAllocations] = useState(Array<Array<number>>);
  const [totalApys, setTotalApys] = useState(Array<number>);
  const [depositAmount, setDepositAmount] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [maticPrice, setMaticPrice] = useState(0);

  const [factoryContract, setFactoryContract] = useState<ethers.Contract>();
  const [contracts, setContracts] = useState([]);

  let contractABIFarm: ContractInterface = [];

  const { data: deployedContractDataFactory } = useDeployedContractInfo("BeefyMultiFarmFactory");
  const { data: deployedContractDataFarm } = useDeployedContractInfo("BeefyMultiFarm");

  if (deployedContractDataFactory && deployedContractDataFarm) {
    ({ abi: contractABIFarm } = deployedContractDataFarm);
  }

  const calculateTotalApy = async () => {
    if (DEBUG) console.log("calculateTotalApy: start");
    const tempSumApys: number[] = [];

    let i;
    let j;
    let sum = 0;

    for (i = 0; i < fundsData.length; i++) {
      for (j = 0; j < fundsData[i].vaults.length; j++) {
        sum += beefyVaultApys[i][j] * allocations[i][j];
        if (DEBUG)
          console.log(
            `i: ${i}, j: ${j}, vault: ${fundsData[i].vaults[j]}, apy: ${beefyVaultApys[i][j]}, allocation: ${allocations[i][j]}, sum: ${sum}`,
          );
      }
      tempSumApys.push(sum);
    }
    setTotalApys(tempSumApys);

    if (DEBUG) console.log(tempSumApys);
    if (DEBUG) console.log("Total APYs", tempSumApys);
  };

  const updateFundsData = async () => {
    if (DEBUG) console.log("updateFundsData: start");

    if (DEBUG) console.log(contracts?.length);

    for (let i = 0; i < contracts?.length; i++) {
      const _tempCtx = new Contract(contracts[i], contractABIFarm, signer || provider);

      await fetchFunds(_tempCtx, i);
      await fetchBeefy(fundsData);

      if (DEBUG) console.log("Farm Address", _tempCtx.address);
      if (DEBUG) console.log("Contracts", contracts);
      if (DEBUG) console.log("Fund Data", fundsData);
    }
  };

  const getActiveContract = async function getActiveContracts() {
    factoryContract?.connect(signer || provider);
    const _contracts = await factoryContract?.getActiveContracts();
    const _contractsFilter = _contracts?.filter(function (el: string) {
      return el != "0x0000000000000000000000000000000000000000";
    });
    setContracts(_contractsFilter);
  };

  useEffect(() => {
    console.log("UseEffect: start");

    if (deployedContractDataFactory && signer) {
      const factoryContract = new ethers.Contract(
        deployedContractDataFactory?.address,
        deployedContractDataFactory?.abi,
        signer,
      );
      console.log("Factory Contract", factoryContract);
      setFactoryContract(factoryContract);
    }

    const ws = new WebSocket("wss://stream.binance.com:9443/ws/maticusdt@ticker");

    const interval = setInterval(() => {
      ws.onmessage = event => {
        const data = JSON.parse(event.data);
        const price = data.c;
        setMaticPrice(price);
      };
    }, 10000);

    return () => clearInterval(interval);
  }, [signer, deployedContractDataFactory]);

  const block = useBlockNumber({
    onBlock(block) {
      if (DEBUG) console.log("Block", block);
      const _getData = async () => {
        if (factoryContract && contracts.length > 0 && signer && provider) {
          await updateFundsData();
          await calculateTotalApy();
        }
      };
      _getData();
    },
  });

  useEffect(() => {
    if (DEBUG) console.log("UseEffect 2: start");
    if (factoryContract) {
      getActiveContract();
    }
  }, [factoryContract]);

  useEffect(() => {
    if (DEBUG) console.log("UseEffect Update Funds: start");
    if (contracts.length > 0 && signer) {
      updateFundsData();
    }
  }, [contracts, signer]);

  useEffect(() => {
    if (DEBUG) console.log("UseEffect Calculate: start");
    if (beefyVaultApys && allocations && fundsData.length > 0) {
      calculateTotalApy();
    }
  }, [fundsData, beefyVaultApys, allocations]);

  const fetchFunds = async (addr: Contract, i: number) => {
    if (DEBUG) console.log("fetchFunds: start");
    let data: any = {};
    try {
      data = await addr?.getMultiFarmData();
      const owner = await addr?.owner();
      setOwner(owner);

      if (data.length > 0) {
        fundsData[i] = {
          address: addr?.address,
          name: data[1],
          symbol: data[2],
          vaults: data[3],
          vaultsCount: data[4],
          unitPrice: data[5],
          totalValue: data[6],
          totalSupply: data[7],
          yourBalance: await addr?.balanceOf(singerAddress, 0),
        };
      }

      let _allocations: number[] = [];
      _allocations = await addr?.getWeights();
      allocations[i] = _allocations;

      setFundsData(fundsData);
      setAllocations(allocations);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBeefy = async (fundsData: any[]): Promise<void> => {
    if (DEBUG) console.log("fetchBeefy: start");
    try {
      const response = await fetch("https://api.beefy.finance/vaults/");
      if (response.ok) {
        if (DEBUG) console.log("fetchBeefy: api.beefy.finance/vaults response ok");
        const vaultsApi = await response.json();
        const response2 = await fetch("https://api.beefy.finance/apy/");
        if (response2.ok) {
          if (DEBUG) console.log("fetchBeefy: api.beefy.finance/apy response ok");
          const apysApi = await response2.json();
          const tempData: number[][] = [];
          const tempVaultsNames: string[][] = [];
          for (let i = 0; i < vaultsApi.length; i++) {
            for (let j = 0; j < fundsData.length; j++) {
              if (fundsData[j].vaults.length > 0) {
                for (let k = 0; k < fundsData[j].vaults.length; k++) {
                  if (fundsData[j].vaults[k] == vaultsApi[i].earnContractAddress) {
                    if (DEBUG) console.log("fetchBeefy: fund " + fundsData[j].name + " vault " + vaultsApi[i].name);
                    if (tempVaultsNames[j] === undefined) {
                      tempVaultsNames[j] = [];
                    }
                    if (tempData[j] === undefined) {
                      tempData[j] = [];
                    }
                    tempVaultsNames[j][k] = vaultsApi[i].name;
                    tempData[j][k] = Number(apysApi[vaultsApi[i].id] * 100);
                  }
                }
              }
            }
          }
          setBeefyVaultNames(tempVaultsNames);
          setBeefyVaultApys(tempData);
        }
      }
    } catch (error) {
      console.error(error);
    }
    return Promise.resolve();
  };

  async function rebalance(addrs: string) {
    const contract = new Contract(addrs, contractABIFarm as ContractInterface, signer || provider);
    const tx = await contract.rebalance();
    await tx.wait();
  }

  async function deposit(addrs: string) {
    const contract = new Contract(addrs, contractABIFarm, signer || provider);
    const tx = await contract.deposit({ value: parseEther(depositAmount) });
    await tx.wait();
  }

  async function redeem(addrs: string) {
    const contract = new Contract(addrs, contractABIFarm, signer || provider);
    const tx = await contract.redeem(parseEther(redeemAmount));
    await tx.wait();
  }

  async function redeemMax(addrs: string) {
    const contract = new Contract(addrs, contractABIFarm, signer || provider);
    const yourBalance = await contract?.balanceOf(signer?.getAddress(), 0);
    const tx = await contract.redeem(yourBalance);
    await tx.wait();
  }

  async function zapOutAndDistribute(addrs: string) {
    const contract = new Contract(addrs, contractABIFarm, signer || provider);
    const tx = await contract.zapOutAndDistribute();
    await tx.wait();
  }

  async function restartDistribution(addrs: string) {
    const contract = new Contract(addrs, contractABIFarm, signer || provider);
    const tx = await contract.restartDistribution();
    await tx.wait();
  }

  async function transferOwnership(addrs: string) {
    const contract = new Contract(addrs, contractABIFarm, signer || provider);
    const tx = await contract.transferOwnership(newOwner);
    await tx.wait();
  }

  return (
    <div className="flex  items-center flex-col flex-grow pt-10 mx-auto text-center">
      <h1 className="text-5xl text-justify font-bold mx-auto my-5">FARMS</h1>
      <p className="text-2xl text-justify font-bold mx-auto my-5">Beefy Finance</p>

      {fundsData?.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2 items-center mx-auto ">
          {fundsData.length > 0 //check if vaults data is available
            ? fundsData.map(
              (
                value,
                i: number, //map through the vaults data
              ) => (
                <div
                  key={i}
                  className="bg-primary flex flex-col px-10 text-center mt-5  shadow-base-300 shadow-lg rounded-xl  py-10 my-5"
                >
                  <ul className="my-2">
                    <div className="text-6xl text- font-bold my-2">{value.symbol}</div>
                    <div className="text-2xl text-netural">{value.name}</div>
                  </ul>
                  <div className="dropdown  flex-row ">
                    <label tabIndex={0} className="btn btn-md m-1">
                      Analitycs
                    </label>
                    <div
                      tabIndex={0}
                      className="dropdown-content card card-compact w-64 p-2 shadow bg-primary text-primary-content"
                    >
                      <div className="card-body">
                        <div className="flex flex-col  px-5 rounded-2xl bordered border-solid border-black text-lg ">
                          <a
                            className="link link-base-100 text-xl text-bold text-strong "
                            href={`https://portfolio.nansen.ai/dashboard/${value.address}?chain=POLYGON`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <strong>Nansen Dashboard</strong>
                          </a>
                          <a
                            className="link link-base-100 text-xl text-bold text-strong "
                            href={`https://debank.com/profile/${value.address}?chain=matic`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <strong>Debank</strong>
                          </a>
                          <a
                            className="link link-base-100 text-xl text-bold text-strong "
                            href={`https://polygonscan.com/address/${value.address}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <strong>PolygonScan</strong>
                          </a>
                          <a
                            className="link link-accent text-xl text-bold text-strong"
                            href="https://beefy.finance"
                            target="_blank"
                            rel="noreferrer"
                          ></a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="collapse">
                    <input type="checkbox" />
                    <div className="collapse-title text-xl font-medium">
                      <label className="label hover:bg-primary">ℹ️ Info</label>
                    </div>
                    <div className="collapse-content card-compact rounded-lg ">
                      <div className="flex flex-row justify-center text-left my-8">
                        <div className="card card-normal w-96 bg-base-200 shadow-xl my-5">
                          <div className="card-body">
                            <h2 className="card-title text-3xl">Compositions</h2>
                            <div className="flex flex-row text-left ">
                              {beefyVaultNames.length == fundsData.length &&
                                allocations[i] &&
                                beefyVaultNames[i].length == fundsData[i].vaults.length ? (
                                beefyVaultNames[i].map((contract: string, k: number) => (
                                  <div key={k}>
                                    <h1 className="text-lg font-bold">{contract}</h1>
                                    <span className="text-md font-medium">
                                      APY: {""}
                                      {Number(beefyVaultApys[i][k].toFixed(2))}% <br />
                                      {Number(allocations[i][k] / 100).toFixed(2)}%
                                    </span>
                                    <div>
                                      {" "}
                                      <br></br>{" "}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <progress className="progress w-56"></progress>
                              )}
                              <h1 className="text-2xl font-bold">
                                APY total: {Number(totalApys[i] / 10000).toFixed(2)} %
                              </h1>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card card-normal w-96 bg-base-100 shadow-xl">
                        <div className="card-body text-left">
                          <h2 className="card-title text-3xl">Statistics</h2>
                          <h1 className="text-xl strong bold align-baseline ">
                            <p className="text-md align-baseline font-semibold">Unit Price</p>{" "}
                            {Number(formatEther(value.unitPrice)).toFixed(4)} MATIC{" "}
                          </h1>
                          <h1 className="text-xl strong bold align-baseline ">
                            <p className="text-md font-semibold"> Total Value: </p>
                            {Number(formatEther(value.totalValue)).toFixed(4)} MATIC <br />
                          </h1>
                          {/* <div className="flex flex-row">
                                <h2 className="text-xl strong bold align-baseline ">
                                  <h1 className="text-md strong">Total Supply:</h1>{" "}
                                  {Number(formatEther(value.totalSupply)).toFixed(3)} {value.symbol}{" "}
                                </h2>
                              </div> */}
                          <h1 className="text-xl strong bold align-baseline ">
                            <p className="text-md font-semibold">Your Balance:</p>
                            {Number(formatEther(value.yourBalance)).toFixed(3)} {value.symbol}
                            <br />
                            {(((value.yourBalance / 1e18) * value.unitPrice) / 1e18).toFixed(4)} MATIC
                            <br />
                            {((((value.yourBalance / 1e18) * value.unitPrice) / 1e18) * maticPrice).toFixed(5)} USD
                          </h1>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="collapse text-left">
                    <input type="checkbox" />
                    <div className="collapse-title text-xl font-medium">
                      <label className="label">💸 Deposit</label>{" "}
                    </div>
                    <div className="collapse-content card-compact rounded-lg bg-secondary">
                      <div className="flex flex-col mx-auto my-auto p-2 ">
                        <input
                          className="input input-bordered w-auto my-5"
                          type="text"
                          onChange={e => setDepositAmount(e.target.value)}
                        />
                        <button className="w-auto btn btn-primary my-2" onClick={() => deposit(value.address)}>
                          Deposit
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="collapse text-center">
                    <input type="checkbox" />
                    <div className="collapse-title text-xl font-medium">
                      {" "}
                      <label className="label hover:bg-accent">👛 Redeem</label>
                    </div>
                    <div className="collapse-content card-compact rounded-lg bg-secondary">
                      <div className="flex flex-col mx-auto my-auto p-2 ">
                        <input
                          className="input input-bordered w-auto my-5"
                          type="text"
                          onChange={e => setRedeemAmount(e.target.value)}
                        />
                        <button className="btn btn-primary w-auto my-2" onClick={() => redeem(value.address)}>
                          Redeem
                        </button>
                        <button className="btn btn-primary" onClick={() => redeemMax(value.address)}>
                          Redeem All
                        </button>
                      </div>
                    </div>
                  </div>
                  {account.address === owner ? (
                    <div className=" flex flex-col my-5  px-5 rounded-2xl bordered border-solid border-black text-2xl">
                      <div className="divider mx-5 my-5">🔒 Admin Section</div>
                      <button
                        className="  rounded-sm px-4 py-2 border-solid border-2 row-span-1 my-5"
                        onClick={() => {
                          zapOutAndDistribute(value.address);
                        }}
                      >
                        Zap Out and Distribute
                      </button>
                      <button
                        className="  rounded-sm px-4 py-2 border-solid border-2 row-span-1 my-5"
                        onClick={() => {
                          restartDistribution(value.address);
                        }}
                      >
                        Restart Distribution
                      </button>
                      <button
                        className="  rounded-sm px-4 py-2 border-solid border-2 row-span-1 my-5"
                        onClick={() => {
                          rebalance(value.address);
                        }}
                      >
                        Rebalance
                      </button>
                      <input
                        className="input input-bordered w-auto my-5"
                        type="text"
                        onChange={e => setNewOwner(e.target.value)}
                      />
                      <button
                        className="  rounded-sm px-4 py-2 border-solid border-2 row-span-1 my-5"
                        onClick={() => {
                          transferOwnership(value.address);
                        }}
                      >
                        Transfer Ownership
                      </button>
                    </div>
                  ) : null}
                </div>
              ),
            )
            : ""}
        </div>
      ) : (
        <progress className=" progress w-96 mx-auto items-center my-10" />
      )}
    </div>
  );
};

export default Vaults;
