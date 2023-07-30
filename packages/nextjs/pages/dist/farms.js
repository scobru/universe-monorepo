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
var ethers_1 = require("ethers");
var utils_1 = require("ethers/lib/utils");
var wagmi_1 = require("wagmi");
var scaffold_eth_1 = require("~~/hooks/scaffold-eth");
var Vaults = function () {
    var signer = wagmi_1.useSigner().data;
    var account = wagmi_1.useAccount();
    var provider = wagmi_1.useProvider();
    var singerAddress = account.address;
    var _a = react_1.useState(""), newOwner = _a[0], setNewOwner = _a[1];
    var _b = react_1.useState(""), owner = _b[0], setOwner = _b[1];
    var DEBUG = false;
    var _c = react_1.useState(Array < {
        address: string,
        name: "",
        symbol: "",
        vaults: [],
        vaultsCount: 0,
        unitPrice: 0,
        totalValue: 0,
        totalSupply: 0,
        yourBalance: 0
    } > ), fundsData = _c[0], setFundsData = _c[1];
    var _d = react_1.useState(Array()), beefyVaultNames = _d[0], setBeefyVaultNames = _d[1];
    var _e = react_1.useState(Array()), beefyVaultApys = _e[0], setBeefyVaultApys = _e[1];
    var _f = react_1.useState(Array()), allocations = _f[0], setAllocations = _f[1];
    var _g = react_1.useState(Array()), totalApys = _g[0], setTotalApys = _g[1];
    var _h = react_1.useState(""), depositAmount = _h[0], setDepositAmount = _h[1];
    var _j = react_1.useState(""), redeemAmount = _j[0], setRedeemAmount = _j[1];
    var _k = react_1.useState(0), maticPrice = _k[0], setMaticPrice = _k[1];
    var _l = react_1.useState(), factoryContract = _l[0], setFactoryContract = _l[1];
    var _m = react_1.useState([]), contracts = _m[0], setContracts = _m[1];
    var contractABIFarm = [];
    var deployedContractDataFactory = scaffold_eth_1.useDeployedContractInfo("BeefyMultiFarmFactory").data;
    var deployedContractDataFarm = scaffold_eth_1.useDeployedContractInfo("BeefyMultiFarm").data;
    if (deployedContractDataFactory && deployedContractDataFarm) {
        (contractABIFarm = deployedContractDataFarm.abi);
    }
    var calculateTotalApy = function () { return __awaiter(void 0, void 0, void 0, function () {
        var tempSumApys, i, j, sum;
        return __generator(this, function (_a) {
            if (DEBUG)
                console.log("calculateTotalApy: start");
            tempSumApys = [];
            sum = 0;
            for (i = 0; i < fundsData.length; i++) {
                for (j = 0; j < fundsData[i].vaults.length; j++) {
                    sum += beefyVaultApys[i][j] * allocations[i][j];
                    if (DEBUG)
                        console.log("i: " + i + ", j: " + j + ", vault: " + fundsData[i].vaults[j] + ", apy: " + beefyVaultApys[i][j] + ", allocation: " + allocations[i][j] + ", sum: " + sum);
                }
                tempSumApys.push(sum);
            }
            setTotalApys(tempSumApys);
            if (DEBUG)
                console.log(tempSumApys);
            if (DEBUG)
                console.log("Total APYs", tempSumApys);
            return [2 /*return*/];
        });
    }); };
    var updateFundsData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var i, _tempCtx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (DEBUG)
                        console.log("updateFundsData: start");
                    if (DEBUG)
                        console.log(contracts === null || contracts === void 0 ? void 0 : contracts.length);
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < (contracts === null || contracts === void 0 ? void 0 : contracts.length))) return [3 /*break*/, 5];
                    _tempCtx = new ethers_1.Contract(contracts[i], contractABIFarm, signer || provider);
                    return [4 /*yield*/, fetchFunds(_tempCtx, i)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fetchBeefy(fundsData)];
                case 3:
                    _a.sent();
                    if (DEBUG)
                        console.log("Farm Address", _tempCtx.address);
                    if (DEBUG)
                        console.log("Contracts", contracts);
                    if (DEBUG)
                        console.log("Fund Data", fundsData);
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getActiveContract = function getActiveContracts() {
        return __awaiter(this, void 0, void 0, function () {
            var _contracts, _contractsFilter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        factoryContract === null || factoryContract === void 0 ? void 0 : factoryContract.connect(signer || provider);
                        return [4 /*yield*/, (factoryContract === null || factoryContract === void 0 ? void 0 : factoryContract.getActiveContracts())];
                    case 1:
                        _contracts = _a.sent();
                        _contractsFilter = _contracts === null || _contracts === void 0 ? void 0 : _contracts.filter(function (el) {
                            return el != "0x0000000000000000000000000000000000000000";
                        });
                        setContracts(_contractsFilter);
                        return [2 /*return*/];
                }
            });
        });
    };
    react_1.useEffect(function () {
        console.log("UseEffect: start");
        if (deployedContractDataFactory && signer) {
            var factoryContract_1 = new ethers_1.ethers.Contract(deployedContractDataFactory === null || deployedContractDataFactory === void 0 ? void 0 : deployedContractDataFactory.address, deployedContractDataFactory === null || deployedContractDataFactory === void 0 ? void 0 : deployedContractDataFactory.abi, signer);
            console.log("Factory Contract", factoryContract_1);
            setFactoryContract(factoryContract_1);
        }
        var ws = new WebSocket("wss://stream.binance.com:9443/ws/maticusdt@ticker");
        var interval = setInterval(function () {
            ws.onmessage = function (event) {
                var data = JSON.parse(event.data);
                var price = data.c;
                setMaticPrice(price);
            };
        }, 10000);
        return function () { return clearInterval(interval); };
    }, [signer, deployedContractDataFactory]);
    var block = wagmi_1.useBlockNumber({
        onBlock: function (block) {
            var _this = this;
            if (DEBUG)
                console.log("Block", block);
            var _getData = function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(factoryContract && contracts.length > 0 && signer && provider)) return [3 /*break*/, 3];
                            return [4 /*yield*/, updateFundsData()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, calculateTotalApy()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            }); };
            _getData();
        }
    });
    react_1.useEffect(function () {
        if (DEBUG)
            console.log("UseEffect 2: start");
        if (factoryContract) {
            getActiveContract();
        }
    }, [factoryContract]);
    react_1.useEffect(function () {
        if (DEBUG)
            console.log("UseEffect Update Funds: start");
        if (contracts.length > 0 && signer) {
            updateFundsData();
        }
    }, [contracts, signer]);
    react_1.useEffect(function () {
        if (DEBUG)
            console.log("UseEffect Calculate: start");
        if (beefyVaultApys && allocations && fundsData.length > 0) {
            calculateTotalApy();
        }
    }, [fundsData, beefyVaultApys, allocations]);
    var fetchFunds = function (addr, i) { return __awaiter(void 0, void 0, void 0, function () {
        var data, owner_1, _a, _b, _c, _allocations, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (DEBUG)
                        console.log("fetchFunds: start");
                    data = {};
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, (addr === null || addr === void 0 ? void 0 : addr.getMultiFarmData())];
                case 2:
                    data = _d.sent();
                    return [4 /*yield*/, (addr === null || addr === void 0 ? void 0 : addr.owner())];
                case 3:
                    owner_1 = _d.sent();
                    setOwner(owner_1);
                    if (!(data.length > 0)) return [3 /*break*/, 5];
                    _a = fundsData;
                    _b = i;
                    _c = {
                        address: addr === null || addr === void 0 ? void 0 : addr.address,
                        name: data[1],
                        symbol: data[2],
                        vaults: data[3],
                        vaultsCount: data[4],
                        unitPrice: data[5],
                        totalValue: data[6],
                        totalSupply: data[7]
                    };
                    return [4 /*yield*/, (addr === null || addr === void 0 ? void 0 : addr.balanceOf(singerAddress, 0))];
                case 4:
                    _a[_b] = (_c.yourBalance = _d.sent(),
                        _c);
                    _d.label = 5;
                case 5:
                    _allocations = [];
                    return [4 /*yield*/, (addr === null || addr === void 0 ? void 0 : addr.getWeights())];
                case 6:
                    _allocations = _d.sent();
                    allocations[i] = _allocations;
                    setFundsData(fundsData);
                    setAllocations(allocations);
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _d.sent();
                    console.error(error_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var fetchBeefy = function (fundsData) { return __awaiter(void 0, void 0, Promise, function () {
        var response, vaultsApi, response2, apysApi, tempData, tempVaultsNames, i, j, k, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (DEBUG)
                        console.log("fetchBeefy: start");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, fetch("https://api.beefy.finance/vaults/")];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 6];
                    if (DEBUG)
                        console.log("fetchBeefy: api.beefy.finance/vaults response ok");
                    return [4 /*yield*/, response.json()];
                case 3:
                    vaultsApi = _a.sent();
                    return [4 /*yield*/, fetch("https://api.beefy.finance/apy/")];
                case 4:
                    response2 = _a.sent();
                    if (!response2.ok) return [3 /*break*/, 6];
                    if (DEBUG)
                        console.log("fetchBeefy: api.beefy.finance/apy response ok");
                    return [4 /*yield*/, response2.json()];
                case 5:
                    apysApi = _a.sent();
                    tempData = [];
                    tempVaultsNames = [];
                    for (i = 0; i < vaultsApi.length; i++) {
                        for (j = 0; j < fundsData.length; j++) {
                            if (fundsData[j].vaults.length > 0) {
                                for (k = 0; k < fundsData[j].vaults.length; k++) {
                                    if (fundsData[j].vaults[k] == vaultsApi[i].earnContractAddress) {
                                        if (DEBUG)
                                            console.log("fetchBeefy: fund " + fundsData[j].name + " vault " + vaultsApi[i].name);
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
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_2 = _a.sent();
                    console.error(error_2);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/, Promise.resolve()];
            }
        });
    }); };
    function deposit(addrs) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new ethers_1.Contract(addrs, contractABIFarm, signer || provider);
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
                        contract = new ethers_1.Contract(addrs, contractABIFarm, signer || provider);
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
                        contract = new ethers_1.Contract(addrs, contractABIFarm, signer || provider);
                        return [4 /*yield*/, (contract === null || contract === void 0 ? void 0 : contract.balanceOf(signer === null || signer === void 0 ? void 0 : signer.getAddress(), 0))];
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
                        contract = new ethers_1.Contract(addrs, contractABIFarm, signer || provider);
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
                        contract = new ethers_1.Contract(addrs, contractABIFarm, signer || provider);
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
    function transferOwnership(addrs) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = new ethers_1.Contract(addrs, contractABIFarm, signer || provider);
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
    return (react_2["default"].createElement("div", { className: "flex  items-center flex-col flex-grow pt-10 mx-auto text-center" },
        react_2["default"].createElement("h1", { className: "text-7xl text-justify font-bold mx-auto my-5" }, "FARMS"),
        react_2["default"].createElement("p", { className: "text-2xl text-justify font-bold mx-auto my-5" }, "Beefy Finance"),
        (fundsData === null || fundsData === void 0 ? void 0 : fundsData.length) > 0 ? (react_2["default"].createElement("div", { className: "grid gap-5 sm:grid-cols-1 lg:grid-cols-2 items-center mx-auto " }, fundsData.length > 0 //check if vaults data is available
            ? fundsData.map(function (value, i) { return (react_2["default"].createElement("div", { key: i, className: "bg-base-100 flex flex-col px-10 text-center mt-5  shadow-base-300 shadow-lg rounded-xl  py-10 my-5" },
                react_2["default"].createElement("ul", { className: "my-2" },
                    react_2["default"].createElement("div", { className: "text-6xl text- font-bold my-2" }, value.symbol),
                    react_2["default"].createElement("div", { className: "text-2xl text-netural" }, value.name)),
                react_2["default"].createElement("div", { className: "dropdown  flex-row " },
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
                                react_2["default"].createElement("a", { className: "link link-accent text-xl text-bold text-strong", href: "https://beefy.finance", target: "_blank", rel: "noreferrer" }))))),
                react_2["default"].createElement("div", { className: "collapse" },
                    react_2["default"].createElement("input", { type: "checkbox" }),
                    react_2["default"].createElement("div", { className: "collapse-title text-xl font-medium" },
                        react_2["default"].createElement("label", { className: "label hover:bg-primary" }, "\u2139\uFE0F Info")),
                    react_2["default"].createElement("div", { className: "collapse-content card-compact rounded-lg " },
                        react_2["default"].createElement("div", { className: "flex flex-row justify-center text-left my-8" },
                            react_2["default"].createElement("div", { className: "card card-normal w-96 bg-base-200 shadow-xl my-5" },
                                react_2["default"].createElement("div", { className: "card-body" },
                                    react_2["default"].createElement("h2", { className: "card-title text-3xl" }, "Compositions"),
                                    react_2["default"].createElement("div", { className: "flex flex-row text-left " },
                                        beefyVaultNames.length == fundsData.length &&
                                            allocations[i] &&
                                            beefyVaultNames[i].length == fundsData[i].vaults.length ? (beefyVaultNames[i].map(function (contract, k) { return (react_2["default"].createElement("div", { key: k },
                                            react_2["default"].createElement("h1", { className: "text-lg font-bold" }, contract),
                                            react_2["default"].createElement("span", { className: "text-md font-medium" },
                                                "APY: ",
                                                "",
                                                Number(beefyVaultApys[i][k].toFixed(2)),
                                                "% ",
                                                react_2["default"].createElement("br", null),
                                                Number(allocations[i][k] / 100).toFixed(2),
                                                "%"),
                                            react_2["default"].createElement("div", null,
                                                " ",
                                                react_2["default"].createElement("br", null),
                                                " "))); })) : (react_2["default"].createElement("progress", { className: "progress w-56" })),
                                        react_2["default"].createElement("h1", { className: "text-2xl font-bold" },
                                            "APY total: ",
                                            Number(totalApys[i] / 10000).toFixed(2),
                                            " %"))))),
                        react_2["default"].createElement("div", { className: "card card-normal w-96 bg-base-100 shadow-xl" },
                            react_2["default"].createElement("div", { className: "card-body text-left" },
                                react_2["default"].createElement("h2", { className: "card-title text-3xl" }, "Statistics"),
                                react_2["default"].createElement("h1", { className: "text-xl strong bold align-baseline " },
                                    react_2["default"].createElement("p", { className: "text-md align-baseline font-semibold" }, "Unit Price"),
                                    " ",
                                    Number(utils_1.formatEther(value.unitPrice)).toFixed(4),
                                    " MATIC",
                                    " "),
                                react_2["default"].createElement("h1", { className: "text-xl strong bold align-baseline " },
                                    react_2["default"].createElement("p", { className: "text-md font-semibold" }, " Total Value: "),
                                    Number(utils_1.formatEther(value.totalValue)).toFixed(4),
                                    " MATIC ",
                                    react_2["default"].createElement("br", null)),
                                react_2["default"].createElement("h1", { className: "text-xl strong bold align-baseline " },
                                    react_2["default"].createElement("p", { className: "text-md font-semibold" }, "Your Balance:"),
                                    Number(utils_1.formatEther(value.yourBalance)).toFixed(3),
                                    " ",
                                    value.symbol,
                                    react_2["default"].createElement("br", null),
                                    (((value.yourBalance / 1e18) * value.unitPrice) / 1e18).toFixed(4),
                                    " MATIC",
                                    react_2["default"].createElement("br", null),
                                    ((((value.yourBalance / 1e18) * value.unitPrice) / 1e18) * maticPrice).toFixed(5),
                                    " USD"))))),
                react_2["default"].createElement("div", { className: "collapse text-left" },
                    react_2["default"].createElement("input", { type: "checkbox" }),
                    react_2["default"].createElement("div", { className: "collapse-title text-xl font-medium" },
                        react_2["default"].createElement("label", { className: "label" }, "\uD83D\uDCB8 Deposit"),
                        " "),
                    react_2["default"].createElement("div", { className: "collapse-content card-compact rounded-lg bg-secondary" },
                        react_2["default"].createElement("div", { className: "flex flex-col mx-auto my-auto p-2 " },
                            react_2["default"].createElement("input", { className: "input input-bordered w-auto my-5", type: "text", onChange: function (e) { return setDepositAmount(e.target.value); } }),
                            react_2["default"].createElement("button", { className: "w-auto btn btn-primary my-2", onClick: function () { return deposit(value.address); } }, "Deposit")))),
                react_2["default"].createElement("div", { className: "collapse text-center" },
                    react_2["default"].createElement("input", { type: "checkbox" }),
                    react_2["default"].createElement("div", { className: "collapse-title text-xl font-medium" },
                        " ",
                        react_2["default"].createElement("label", { className: "label hover:bg-accent" }, "\uD83D\uDC5B Redeem")),
                    react_2["default"].createElement("div", { className: "collapse-content card-compact rounded-lg bg-secondary" },
                        react_2["default"].createElement("div", { className: "flex flex-col mx-auto my-auto p-2 " },
                            react_2["default"].createElement("input", { className: "input input-bordered w-auto my-5", type: "text", onChange: function (e) { return setRedeemAmount(e.target.value); } }),
                            react_2["default"].createElement("button", { className: "btn btn-primary w-auto my-2", onClick: function () { return redeem(value.address); } }, "Redeem"),
                            react_2["default"].createElement("button", { className: "btn btn-primary", onClick: function () { return redeemMax(value.address); } }, "Redeem All")))),
                account.address === owner ? (react_2["default"].createElement("div", { className: " flex flex-col my-5  px-5 rounded-2xl bordered border-solid border-black text-2xl" },
                    react_2["default"].createElement("div", { className: "divider mx-5 my-5" }, "\uD83D\uDD12 Admin Section"),
                    react_2["default"].createElement("button", { className: "  rounded-sm px-4 py-2 border-solid border-2 row-span-1 my-5", onClick: function () {
                            zapOutAndDistribute(value.address);
                        } }, "Zap Out and Distribute"),
                    react_2["default"].createElement("button", { className: "  rounded-sm px-4 py-2 border-solid border-2 row-span-1 my-5", onClick: function () {
                            restartDistribution(value.address);
                        } }, "Restart Distribution"),
                    react_2["default"].createElement("input", { className: "input input-bordered w-auto my-5", type: "text", onChange: function (e) { return setNewOwner(e.target.value); } }),
                    react_2["default"].createElement("button", { className: "  rounded-sm px-4 py-2 border-solid border-2 row-span-1 my-5", onClick: function () {
                            transferOwnership(value.address);
                        } }, "Transfer Ownership"))) : null)); })
            : "")) : (react_2["default"].createElement("progress", { className: " progress w-96 mx-auto items-center my-10" }))));
};
exports["default"] = Vaults;
