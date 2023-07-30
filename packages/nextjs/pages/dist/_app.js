"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var react_1 = require("react");
var rainbowkit_1 = require("@rainbow-me/rainbowkit");
require("@rainbow-me/rainbowkit/styles.css");
var nextjs_progressbar_1 = require("nextjs-progressbar");
var react_hot_toast_1 = require("react-hot-toast");
var usehooks_ts_1 = require("usehooks-ts");
var wagmi_1 = require("wagmi");
var Footer_1 = require("~~/components/Footer");
var Header_1 = require("~~/components/Header");
var scaffold_eth_1 = require("~~/components/scaffold-eth");
var scaffold_eth_2 = require("~~/hooks/scaffold-eth");
var store_1 = require("~~/services/store/store");
var wagmiClient_1 = require("~~/services/web3/wagmiClient");
var wagmiConnectors_1 = require("~~/services/web3/wagmiConnectors");
require("~~/styles/globals.css");
var ScaffoldEthApp = function (_a) {
    var Component = _a.Component, pageProps = _a.pageProps;
    var price = scaffold_eth_2.useEthPrice();
    var setEthPrice = store_1.useAppStore(function (state) { return state.setEthPrice; });
    // This variable is required for initial client side rendering of correct theme for RainbowKit
    var _b = react_1.useState(true), isDarkTheme = _b[0], setIsDarkTheme = _b[1];
    var isDarkMode = usehooks_ts_1.useDarkMode().isDarkMode;
    react_1.useEffect(function () {
        if (price > 0) {
            setEthPrice(price);
        }
    }, [setEthPrice, price]);
    react_1.useEffect(function () {
        setIsDarkTheme(isDarkMode);
    }, [isDarkMode]);
    return (React.createElement(wagmi_1.WagmiConfig, { client: wagmiClient_1.wagmiClient },
        React.createElement(nextjs_progressbar_1["default"], null),
        React.createElement(rainbowkit_1.RainbowKitProvider, { chains: wagmiConnectors_1.appChains.chains, avatar: scaffold_eth_1.BlockieAvatar, theme: isDarkTheme ? rainbowkit_1.darkTheme() : rainbowkit_1.lightTheme() },
            React.createElement("div", { className: "flex flex-col min-h-screen font-sans" },
                React.createElement(Header_1.Header, null),
                React.createElement("main", { className: "relative flex flex-col flex-1 bg-base-100" },
                    React.createElement(Component, __assign({}, pageProps))),
                React.createElement(Footer_1.Footer, null)),
            React.createElement(react_hot_toast_1.Toaster, null))));
};
exports["default"] = ScaffoldEthApp;
