"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var react_2 = require("react");
var indexFund_abi_json_1 = require("../abis/indexFund_abi.json");
var ethers_1 = require("ethers");
var utils_1 = require("ethers/lib/utils");
var wagmi_1 = require("wagmi");
var scaffold_eth_1 = require("~~/hooks/scaffold-eth");
var Funds = function () {
    var signer = wagmi_1.useSigner().data;
    var account = wagmi_1.useAccount();
    var provider = wagmi_1.useProvider();
    var signerAddress = account === null || account === void 0 ? void 0 : account.address;
    var DEBUG = false;
    var _a = react_1.useState(""), owner = _a[0], setOwner = _a[1];
    var _b = react_1.useState(""), newOwner = _b[0], setNewOwner = _b[1];
    var _c = react_1.useState("0"), depositAmount = _c[0], setDepositAmount = _c[1];
    var _d = react_1.useState("0"), redeemAmount = _d[0], setRedeemAmount = _d[1];
    var _e = react_1.useState(0), maticPrice = _e[0], setMaticPrice = _e[1];
    var _f = react_1.useState([]), allocations = _f[0], setAllocations = _f[1];
    var _g = react_1.useState([]), multiFarmData = _g[0], setMultiFarmData = _g[1];
    var _h = react_1.useState(Array()), fundsData = _h[0], setFundsData = _h[1];
    var _j = react_1.useState([]), contracts = _j[0], setContracts = _j[1];
    var _k = react_1.useState(), factoryContract = _k[0], setFactoryContract = _k[1];
    // Contract Info
    var contractFund = scaffold_eth_1.useDeployedContractInfo("IndexFund").data;
    var contractFactory = scaffold_eth_1.useDeployedContractInfo("IndexFundFactory").data;
    var tokenNames = function tokenNames(addr) {
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
    var fetchFunds = function (fundAddress, index) { return __awaiter(void 0, void 0, void 0, function () {
        var _multiFarmData, _allocations, ctx, instance, getWeights, getMultiFarmData, balance, owner;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (DEBUG)
                        console.log("Fetch Fund Start", fundAddress, index);
                    _multiFarmData = [];
                    _allocations = [];
                    ctx = new ethers_1.Contract(fundAddress, indexFund_abi_json_1["default"], provider);
                    instance = ctx.connect(signer || provider);
                    return [4 /*yield*/, (instance === null || instance === void 0 ? void 0 : instance.getWeights())];
                case 1:
                    getWeights = _a.sent();
                    return [4 /*yield*/, (instance === null || instance === void 0 ? void 0 : instance.getMultiFarmData())];
                case 2:
                    getMultiFarmData = _a.sent();
                    return [4 /*yield*/, instance.balanceOf(signerAddress, 0)];
                case 3:
                    balance = _a.sent();
                    return [4 /*yield*/, instance.owner()];
                case 4:
                    owner = _a.sent();
                    setOwner(owner);
                    Promise.resolve(getMultiFarmData).then(function (data) {
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
                                yourBalance: balance
                            };
                        }
                        _multiFarmData = getMultiFarmData;
                        multiFarmData[index] = _multiFarmData;
                        _allocations = getWeights;
                        allocations[index] = _allocations;
                    });
                    setFundsData(fundsData);
                    return [2 /*return*/];
            }
        });
    }); };
    var updateFundsData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (DEBUG)
                        console.log("Updating funds data");
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < contracts.length)) return [3 /*break*/, 4];
                    if (DEBUG)
                        console.log("Fetching Contract", i);
                    return [4 /*yield*/, fetchFunds(contracts[i], i)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    if (DEBUG)
                        console.log("Contracts", contracts);
                    if (DEBUG)
                        console.log("Allocations", allocations);
                    if (DEBUG)
                        console.log("MultiFarmData", multiFarmData);
                    return [2 /*return*/];
            }
        });
    }); };
    var getActiveContract = function () { return __awaiter(void 0, void 0, void 0, function () {
        var contracts, _contracts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    factoryContract === null || factoryContract === void 0 ? void 0 : factoryContract.connect(signer || provider);
                    return [4 /*yield*/, (factoryContract === null || factoryContract === void 0 ? void 0 : factoryContract.getActiveContracts())];
                case 1:
                    contracts = _a.sent();
                    _contracts = contracts === null || contracts === void 0 ? void 0 : contracts.filter(function (el) {
                        return el != "0x0000000000000000000000000000000000000000";
                    });
                    setContracts(_contracts);
                    return [2 /*return*/];
            }
        });
    }); };
    react_1.useEffect(function () {
        var ws = new WebSocket("wss://stream.binance.com:9443/ws/maticusdt@ticker");
        if (DEBUG)
            console.log("Use Effect Interval");
        if (contractFactory && signer) {
            var _factoryContract = new ethers_1.ethers.Contract(contractFactory === null || contractFactory === void 0 ? void 0 : contractFactory.address, contractFactory === null || contractFactory === void 0 ? void 0 : contractFactory.abi, signer);
            setFactoryContract(_factoryContract);
        }
        var interval = setInterval(function () {
            ws.onmessage = function (event) {
                var data = JSON.parse(event.data);
                var price = data.c;
                setMaticPrice(price);
            };
        }, 10000);
        return function () { return clearInterval(interval); };
    }, [signer, contractFactory]);
    var block = wagmi_1.useBlockNumber({
        onBlock: function (block) {
            var _this = this;
            if (DEBUG)
                console.log("Block", block);
            var _getData = function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(factoryContract && contracts.length > 0 && signer)) return [3 /*break*/, 2];
                            return [4 /*yield*/, updateFundsData()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            }); };
            _getData();
        }
    });
    react_1.useEffect(function () {
        if (factoryContract) {
            getActiveContract();
        }
    }, [factoryContract]);
    react_1.useEffect(function () {
        if (contracts.length > 0 && signer) {
            updateFundsData();
        }
    }, [contracts, signer]);
    react_1.useEffect(function () {
        if (allocations.length > 0 && multiFarmData.length > 0)
            setAllocations(allocations);
        setMultiFarmData(multiFarmData);
    }, [allocations, multiFarmData]);
    function deposit(addrs) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new ethers_1.Contract(addrs, contractFund === null || contractFund === void 0 ? void 0 : contractFund.abi, signer || provider);
                        return [4 /*yield*/, contract.deposit({ value: utils_1.parseEther(depositAmount) })];
                    case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function redeem(addrs) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new ethers_1.Contract(addrs, contractFund === null || contractFund === void 0 ? void 0 : contractFund.abi, signer || provider);
                        return [4 /*yield*/, contract.redeem(utils_1.parseEther(redeemAmount))];
                    case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function redeemMax(addrs) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, yourBalance, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new ethers_1.Contract(addrs, contractFund === null || contractFund === void 0 ? void 0 : contractFund.abi, signer || provider);
                        return [4 /*yield*/, contract.balanceOf(signer === null || signer === void 0 ? void 0 : signer.getAddress(), 0)];
                    case 1:
                        yourBalance = _a.sent();
                        return [4 /*yield*/, contract.redeem(yourBalance)];
                    case 2:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function zapOutAndDistribute(addrs) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new ethers_1.Contract(addrs, contractFund === null || contractFund === void 0 ? void 0 : contractFund.abi, signer || provider);
                        return [4 /*yield*/, contract.zapOutAndDistribute()];
                    case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function restartDistribution(addrs) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new ethers_1.Contract(addrs, contractFund === null || contractFund === void 0 ? void 0 : contractFund.abi, signer || provider);
                        return [4 /*yield*/, contract.restartDistribution()];
                    case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function rebalance(addrs) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new ethers_1.Contract(addrs, contractFund === null || contractFund === void 0 ? void 0 : contractFund.abi, signer || provider);
                        return [4 /*yield*/, contract.rebalance()];
                    case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function transferOwnership(addrs) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new ethers_1.Contract(addrs, contractFund === null || contractFund === void 0 ? void 0 : contractFund.abi, signer || provider);
                        return [4 /*yield*/, contract.transferOwnership(newOwner)];
                    case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    return (
    // main div
    react_2["default"].createElement("div", { className: "flex  items-center flex-col flex-grow pt-10 mx-auto text-center" },
        react_2["default"].createElement("h1", { className: "text-7xl text-justify font-bold mx-auto my-5" }, "FUNDS"),
        fundsData.length > 0 ? (react_2["default"].createElement("div", { className: "grid  gap-5 sm:grid-cols-1 lg:grid-cols-2 items-center mx-auto " }, fundsData.length > 0 //check if vaults data is available
            ? fundsData.map(function (value, i) { return (react_2["default"].createElement("div", { key: i, className: "bg-base-100 flex flex-col px-10 text-center mt-5  shadow-base-300 shadow-lg rounded-xl  py-10 my-5" },
                react_2["default"].createElement("ul", { className: "my-2" },
                    react_2["default"].createElement("div", { className: "text-6xl text- font-bold my-2" }, value.symbol),
                    react_2["default"].createElement("div", { className: "text-2xl text-netural" }, value.name)),
                react_2["default"].createElement("div", { className: "flex flex-row justify-center text-left my-5" },
                    react_2["default"].createElement("div", { className: "dropdown  flex-row" },
                        react_2["default"].createElement("label", { tabIndex: 0, className: "btn btn-md m-1" }, "Analitycs"),
                        react_2["default"].createElement("div", { tabIndex: 0, className: "dropdown-content card card-compact w-64 p-2 shadow bg-primary text-primary-content" },
                            react_2["default"].createElement("div", { className: "card-body" },
                                react_2["default"].createElement("div", { className: "flex flex-col  px-5 rounded-2xl bordered border-solid border-black text-lg " },
                                    react_2["default"].createElement("a", { className: "link link-base-100 text-xl text-bold text-strong ", href: "https://portfolio.nansen.ai/dashboard/" + value.address + "?chain=POLYGON", target: "_blank", rel: "noreferrer" },
                                        react_2["default"].createElement("strong", null, "Nansen Dashboard")),
                                    react_2["default"].createElement("a", { className: "link link-base-100 text-xl text-bold text-strong ", href: "https://debank.com/profile/" + value.address + "?chain=matic", target: "_blank", rel: "noreferrer" },
                                        react_2["default"].createElement("strong", null, "Debank")),
                                    react_2["default"].createElement("a", { className: "link link-base-100 text-xl text-bold text-strong ", href: "https://polygonscan.com/address/" + value.address, target: "_blank", rel: "noreferrer" },
                                        react_2["default"].createElement("strong", null, "PolygonScan")),
                                    react_2["default"].createElement("a", { className: "link link-accent text-xl text-bold text-strong", href: "https://beefy.finance", target: "_blank", rel: "noreferrer" })))))),
                react_2["default"].createElement("div", { className: "collapse" },
                    react_2["default"].createElement("input", { type: "checkbox" }),
                    react_2["default"].createElement("div", { className: "collapse-title text-xl font-medium" },
                        react_2["default"].createElement("div", { className: "hover:bg-accent my-8" },
                            react_2["default"].createElement("label", { className: "label" }, "\u2139\uFE0F Info"))),
                    react_2["default"].createElement("div", { className: "collapse-content card-compact rounded-lg" },
                        react_2["default"].createElement("div", { className: "card card-normal w-96 bg-base-200 shadow-xl my-5" },
                            react_2["default"].createElement("div", { className: "card-body" },
                                react_2["default"].createElement("h2", { className: "card-title text-3xl" }, "Compositions"),
                                react_2["default"].createElement("div", { className: "flex flex-row text-left " }, value.vaults && allocations[i] ? (value.vaults.map(function (contract, k) { return (react_2["default"].createElement("div", { key: k },
                                    react_2["default"].createElement("p", { className: "text-lg font-bold" },
                                        tokenNames(contract.toString()),
                                        " ",
                                        react_2["default"].createElement("span", { className: "text-md font-normal mx-2" },
                                            Number(allocations[i][k] / 100).toFixed(2),
                                            " %")))); })) : (react_2["default"].createElement("progress", { className: "progress w-56" }))))),
                        react_2["default"].createElement("div", { className: "card card-normal w-96 bg-base-100 shadow-xl" },
                            react_2["default"].createElement("div", { className: "card-body text-left" },
                                react_2["default"].createElement("h1", { className: "card-title text-3xl" }, "Statistics"),
                                react_2["default"].createElement("h1", { className: "text-xl  align-baseline " },
                                    react_2["default"].createElement("p", { className: "text-lg font-semibold align-baseline" }, "Unit Price"),
                                    " ",
                                    Number(utils_1.formatEther(value.unitPrice)).toFixed(9),
                                    " MATIC",
                                    " ",
                                    react_2["default"].createElement("p", { className: "text-lg  font-semibold" }, " Total Value: "),
                                    Number(Number(utils_1.formatEther(value.totalValue))).toFixed(3),
                                    " MATIC ",
                                    react_2["default"].createElement("br", null),
                                    react_2["default"].createElement("p", { className: "text-lg font-semibold" }, "Total Supply:"),
                                    " ",
                                    Number(utils_1.formatEther(value.totalSupply)).toFixed(3),
                                    " ",
                                    value.symbol,
                                    " ",
                                    react_2["default"].createElement("p", { className: "text-lg font-semibold" }, "Your Balance:"),
                                    Number(utils_1.formatEther(value.yourBalance)).toFixed(3),
                                    " ",
                                    value.symbol,
                                    react_2["default"].createElement("br", null),
                                    Number(((value.yourBalance / 1e18) * value.unitPrice) / 1e18).toFixed(3),
                                    " MATIC",
                                    react_2["default"].createElement("br", null),
                                    Number((value.yourBalance / 1e18) * (value.unitPrice / 1e18) * maticPrice).toFixed(2),
                                    " ",
                                    "USD"))))),
                react_2["default"].createElement("div", { className: "collapse text-center" },
                    react_2["default"].createElement("input", { type: "checkbox" }),
                    react_2["default"].createElement("div", { className: "collapse-title text-xl font-medium" },
                        react_2["default"].createElement("label", { className: "label" }, "\uD83D\uDCB8 Deposit"),
                        " "),
                    react_2["default"].createElement("div", { className: "collapse-content card-compact rounded-lg bg-secondary" },
                        react_2["default"].createElement("div", { className: "flex flex-col mx-auto my-auto p-2 " },
                            react_2["default"].createElement("input", { className: "input input-bordered w-auto my-5", type: "text", onChange: function (e) { return setDepositAmount(e.target.value); } }),
                            react_2["default"].createElement("button", { className: "w-auto btn btn-primary", onClick: function () { return deposit(value.address); } }, "Deposit")))),
                react_2["default"].createElement("div", { className: "collapse text-center" },
                    react_2["default"].createElement("input", { type: "checkbox" }),
                    react_2["default"].createElement("div", { className: "collapse-title text-xl font-medium" },
                        react_2["default"].createElement("label", { className: "label hover:bg-primary" }, "\uD83D\uDC5B Redeem")),
                    react_2["default"].createElement("div", { className: "collapse-content card-compact rounded-lg bg-secondary" },
                        react_2["default"].createElement("div", { className: "flex flex-col mx-auto my-auto p-2 " },
                            react_2["default"].createElement("input", { className: "input input-bordered w-auto my-5", type: "text", onChange: function (e) { return setRedeemAmount(e.target.value); } }),
                            react_2["default"].createElement("button", { className: "btn btn-primary w-auto my-2", onClick: function () { return redeem(value.address); } }, "Redeem"),
                            react_2["default"].createElement("button", { className: "btn btn-primary", onClick: function () { return redeemMax(value.address); } }, "Redeem All")))),
                account.address === owner ? (react_2["default"].createElement("div", { className: " flex flex-col my-5  px-5 rounded-2xl bordered border-solid border-black text-2xl" },
                    react_2["default"].createElement("div", { className: "divider mx-5 my-5" }, "\uD83D\uDD12 Admin Section"),
                    react_2["default"].createElement("button", { className: " rounded-sm px-4 py-2 border-solid border-2 row-span-1 my-5", onClick: function () {
                            zapOutAndDistribute(value.address);
                        } }, "Zap Out and Distribute"),
                    react_2["default"].createElement("button", { className: "  rounded-sm px-4 py-2 border-solid border-2 row-span-1 my-5", onClick: function () {
                            restartDistribution(value.address);
                        } }, "Restart Distribution"),
                    react_2["default"].createElement("button", { className: "  rounded-sm px-4 py-2 border-solid border-2 row-span-1 my-5", onClick: function () {
                            rebalance(value.address);
                        } }, "Rebalance"),
                    react_2["default"].createElement("input", { className: "input input-bordered w-auto my-5", type: "text", onChange: function (e) { return setNewOwner(e.target.value); } }),
                    react_2["default"].createElement("button", { className: "  rounded-sm px-4 py-2 border-solid border-2 row-span-1 my-5", onClick: function () {
                            transferOwnership(value.address);
                        } }, "Transfer Ownership"))) : null)); })
            : null)) : (react_2["default"].createElement("progress", { className: "progress w-96 mx-auto items-center my-10" }))));
};
exports["default"] = Funds;
