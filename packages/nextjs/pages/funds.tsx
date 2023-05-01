import { useEffect, useState } from "react";
import React from "react";
import indexFundAbi from "../abis/indexFund_abi.json";
import { Contract, ContractInterface, ethers } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import type { NextPage } from "next";
import { useAccount, useBlockNumber, useProvider, useSigner } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const Funds: NextPage = () => {
  const { data: signer } = useSigner();
  const account = useAccount();
  const provider = useProvider();
  const signerAddress = account?.address;

  const DEBUG = false;

  const [depositAmount, setDepositAmount] = useState("0");
  const [redeemAmount, setRedeemAmount] = useState("0");
  const [maticPrice, setMaticPrice] = useState(0);
  const [allocations, setAllocations] = useState<number[][]>([]);
  const [multiFarmData, setMultiFarmData] = useState<any>([]);
  const [fundsData, setFundsData] = useState(
    Array<{
      address: string;
      name: string;
      symbol: string;
      vaults: [];
      weights: [];
      unitPrice: number;
      totalValue: number;
      totalSupply: number;
      yourBalance: number;
    }>(),
  );
  const [contracts, setContracts] = useState<string[]>([]);
  const [factoryContract, setFactoryContract] = useState<ethers.Contract>();

  // Contract Info
  const { data: contractFund } = useDeployedContractInfo("IndexFund");
  const { data: contractFactory } = useDeployedContractInfo("IndexFundFactory");

  const tokenNames = function tokenNames(addr: string) {
    switch (addr) {
      case "0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6":
        return "MATICX";
      case "0x0E9b89007eEE9c958c0EDA24eF70723C2C93dD58":
        return "aMATICc";
      case "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4":
        return "stMATIC";
      case "0xA0dF47432d9d88bcc040E9ee66dDC7E17A882715":
        return "pMATIC";
      case "0x9cD552551EC130B50c1421649c8D11E76AC821E1":
        return "CVOL";
      case "0x9CD552551EC130b50c1421649C8d11E76aC821e1":
        return "WMATIC";
      case "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6":
        return "WBTC";
      case "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063":
        return "DAI";
      case "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619":
        return "WETH";
      default:
        return "Unknown";
    }
  };

  const fetchFunds = async (fundAddress: string, index: number) => {
    if (DEBUG) console.log("Fetch Fund Start", fundAddress, index);

    let _multiFarmData: any = [];
    let _allocations: number[] = [];

    const ctx = new Contract(fundAddress, indexFundAbi, provider);
    const instance = ctx.connect(signer || provider);

    const getWeights = await instance?.getWeights();
    const getMultiFarmData = await instance?.getMultiFarmData();
    const balance = await instance.balanceOf(signerAddress, 0);

    Promise.resolve(getMultiFarmData).then(data => {
      if (data) {
        fundsData[index] = {
          address: fundAddress,
          name: data[1],
          symbol: data[2],
          vaults: data[3],
          weights: data[4],
          unitPrice: data[5],
          totalValue: data[6],
          totalSupply: data[7],
          yourBalance: balance,
        };
      }
      _multiFarmData = getMultiFarmData;
      multiFarmData[index] = _multiFarmData;

      _allocations = getWeights;
      allocations[index] = _allocations;
    });

    setFundsData(fundsData);
  };

  const updateFundsData = async () => {
    if (DEBUG) console.log("Updating funds data");

    for (let i = 0; i < contracts.length; i++) {
      if (DEBUG) console.log("Fetching Contract", i);
      await fetchFunds(contracts[i], i);
    }

    if (DEBUG) console.log("Contracts", contracts);
    if (DEBUG) console.log("Allocations", allocations);
    if (DEBUG) console.log("MultiFarmData", multiFarmData);
  };

  const getActiveContract = async () => {
    factoryContract?.connect(signer || provider);
    const contracts = await factoryContract?.getActiveContracts();
    const _contracts = contracts?.filter(function (el: string) {
      return el != "0x0000000000000000000000000000000000000000";
    });
    setContracts(_contracts);
  };

  useEffect(() => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/maticusdt@ticker");

    if (DEBUG) console.log("Use Effect Interval");
    if (contractFactory && signer) {
      const _factoryContract = new ethers.Contract(contractFactory?.address, contractFactory?.abi, signer);
      setFactoryContract(_factoryContract);
    }
    const interval = setInterval(() => {
      ws.onmessage = event => {
        const data = JSON.parse(event.data);
        const price = data.c;
        setMaticPrice(price);
      };
    }, 10000);

    return () => clearInterval(interval);
  }, [signer, contractFactory]);

  const block = useBlockNumber({
    onBlock(block) {
      if (DEBUG) console.log("Block", block);
      const _getData = async () => {
        if (factoryContract && contracts.length > 0 && signer) {
          await updateFundsData();
        }
      };
      _getData();
    },
  });

  useEffect(() => {
    if (factoryContract) {
      getActiveContract();
    }
  }, [factoryContract]);

  useEffect(() => {
    if (contracts.length > 0 && signer) {
      updateFundsData();
    }
  }, [contracts, signer]);

  useEffect(() => {
    if (allocations.length > 0 && multiFarmData.length > 0) setAllocations(allocations);
    setMultiFarmData(multiFarmData);
  }, [allocations, multiFarmData]);

  async function deposit(addrs: string) {
    const contract = new Contract(addrs, contractFund?.abi as ContractInterface, signer || provider);
    const tx = await contract.deposit({ value: parseEther(depositAmount) });
    await tx.wait();
  }

  async function redeem(addrs: string) {
    const contract = new Contract(addrs, contractFund?.abi as ContractInterface, signer || provider);
    const tx = await contract.redeem(parseEther(redeemAmount));
    await tx.wait();
  }

  async function redeemMax(addrs: string) {
    const contract = new Contract(addrs, contractFund?.abi as ContractInterface, signer || provider);
    const yourBalance = await contract.balanceOf(signer?.getAddress(), 0);
    const tx = await contract.redeem(yourBalance);
    await tx.wait();
  }

  async function zapOutAndDistribute(addrs: string) {
    const contract = new Contract(addrs, contractFund?.abi as ContractInterface, signer || provider);
    const tx = await contract.zapOutAndDistribute();
    await tx.wait();
  }

  async function restartDistribution(addrs: string) {
    const contract = new Contract(addrs, contractFund?.abi as ContractInterface, signer || provider);
    const tx = await contract.restartDistribution();
    await tx.wait();
  }

  async function rebalance(addrs: string) {
    const contract = new Contract(addrs, contractFund?.abi as ContractInterface, signer || provider);
    const tx = await contract.rebalance();
    await tx.wait();
  }

  return (
    // main div
    <div className="flex  items-center flex-col flex-grow pt-10 mx-auto text-center">
      <h1 className="text-7xl text-justify font-bold mx-auto my-5">FUNDS</h1>
      {fundsData.length > 0 ? (
        <div className="grid  gap-5 sm:grid-cols-1 lg:grid-cols-2 items-center mx-auto ">
          {fundsData.length > 0 //check if vaults data is available
            ? fundsData.map(
                (
                  value,
                  i: number, //map through the vaults data
                ) => (
                  <div
                    key={i}
                    className="bg-base-100 flex flex-col px-10 text-center mt-5  shadow-base-300 shadow-lg rounded-xl  py-10 my-5"
                  >
                    <ul className="my-2">
                      <div className="text-6xl text- font-bold my-2">{value.symbol}</div>
                      <div className="text-2xl text-netural">{value.name}</div>
                    </ul>
                    <div className="flex flex-row justify-center text-left my-5">
                      <div className="dropdown  flex-row">
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
                    </div>
                    <div className="collapse">
                      <input type="checkbox" />
                      <div className="collapse-title text-xl font-medium">
                        <div className="hover:bg-accent my-8">
                          <label className="label">ℹ️ Info</label>
                        </div>
                      </div>
                      <div className="collapse-content card-compact rounded-lg">
                        <div className="card card-normal w-96 bg-base-200 shadow-xl my-5">
                          <div className="card-body">
                            <h2 className="card-title text-3xl">Compositions</h2>
                            <div className="flex flex-row text-left ">
                              {value.vaults && allocations[i] ? (
                                value.vaults.map((contract: string, k: number) => (
                                  <div key={k}>
                                    <p className="text-lg font-bold">
                                      {tokenNames(contract.toString())}{" "}
                                      <span className="text-md font-normal mx-2">
                                        {Number(allocations[i][k] / 100).toFixed(2)} %
                                      </span>
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <progress className="progress w-56"></progress>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="card card-normal w-96 bg-base-100 shadow-xl">
                          <div className="card-body text-left">
                            <h1 className="card-title text-3xl">Statistics</h1>
                            <h1 className="text-xl  align-baseline ">
                              <p className="text-lg font-semibold align-baseline">Unit Price</p>{" "}
                              {Number(formatEther(value.unitPrice)).toFixed(9)} MATIC{" "}
                              <p className="text-lg  font-semibold"> Total Value: </p>
                              {Number(Number(formatEther(value.totalValue))).toFixed(3)} MATIC <br />
                              <p className="text-lg font-semibold">Total Supply:</p>{" "}
                              {Number(formatEther(value.totalSupply)).toFixed(3)} {value.symbol}{" "}
                              <p className="text-lg font-semibold">Your Balance:</p>
                              {Number(formatEther(value.yourBalance)).toFixed(3)} {value.symbol}
                              <br />
                              {Number(((value.yourBalance / 1e18) * value.unitPrice) / 1e18).toFixed(3)} MATIC
                              <br />
                              {Number((value.yourBalance / 1e18) * (value.unitPrice / 1e18) * maticPrice).toFixed(
                                2,
                              )}{" "}
                              USD
                            </h1>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="collapse text-center">
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
                          <button className="w-auto btn btn-primary" onClick={() => deposit(value.address)}>
                            Deposit
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="collapse text-center">
                      <input type="checkbox" />
                      <div className="collapse-title text-xl font-medium">
                        <label className="label hover:bg-primary">👛 Redeem</label>
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

                    {account.address === "0x3db5E84e0eBBEa945a0a82E879DcB7E1D1a587B4" ? (
                      <div className=" flex flex-col my-5  px-5 rounded-2xl bordered border-solid border-black text-2xl">
                        <div className="divider mx-5 my-5">🔒 Admin Section</div>

                        <button
                          className=" rounded-sm px-4 py-2 border-solid border-2 row-span-1 my-5"
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
                      </div>
                    ) : null}
                  </div>
                ),
              )
            : null}
        </div>
      ) : (
        <progress className="progress w-96 mx-auto items-center my-10" />
      )}
    </div>
  );
};

export default Funds;
