"use strict";
exports.__esModule = true;
exports.Header = void 0;
var react_1 = require("react");
var link_1 = require("next/link");
var router_1 = require("next/router");
var outline_1 = require("@heroicons/react/24/outline");
var scaffold_eth_1 = require("~~/components/scaffold-eth");
var scaffold_eth_2 = require("~~/hooks/scaffold-eth");
var NavLink = function (_a) {
    var href = _a.href, children = _a.children;
    var router = router_1.useRouter();
    var isActive = router.pathname === href;
    return (react_1["default"].createElement(link_1["default"], { href: href, passHref: true, className: (isActive ? "bg-secondary shadow-md" : "") + " hover:bg-secondary focus:bg-secondary py-2 px-4 text-sm font-bold rounded-full  gap-2" }, children));
};
/**
 * Site header
 */
exports.Header = function () {
    var _a = react_1.useState(false), isDrawerOpen = _a[0], setIsDrawerOpen = _a[1];
    var burgerMenuRef = react_1.useRef(null);
    scaffold_eth_2.useOutsideClick(burgerMenuRef, react_1.useCallback(function () { return setIsDrawerOpen(false); }, []));
    var navLinks = (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("li", null,
            react_1["default"].createElement(NavLink, { href: "/" },
                " ",
                react_1["default"].createElement(outline_1.HomeIcon, { className: "h-4 w-4" }))),
        react_1["default"].createElement("li", null,
            react_1["default"].createElement(NavLink, { href: "/funds" },
                react_1["default"].createElement(outline_1.Bars3Icon, { className: "h-4 w-4" }),
                react_1["default"].createElement("h1", { className: "text-base font-semibold my-0" }, "Funds"))),
        react_1["default"].createElement("li", null,
            react_1["default"].createElement(NavLink, { href: "/farms" },
                react_1["default"].createElement(outline_1.SparklesIcon, { className: "h-4 w-4" }),
                react_1["default"].createElement("h1", { className: "text-base font-semibold my-0" }, "Farm")))));
    return (react_1["default"].createElement("div", { className: "sticky lg:static top-0 navbar bg-base-100 min-h-1 flex-shrink-0 justify-between z-20 shadow-sm shadow-secondary" },
        react_1["default"].createElement("div", { className: "navbar-start w-auto lg:w-1/2" },
            react_1["default"].createElement("div", { className: "lg:hidden dropdown", ref: burgerMenuRef },
                react_1["default"].createElement("button", { className: "ml-1 btn btn-ghost " + (isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"), onClick: function () {
                        setIsDrawerOpen(function (prevIsOpenState) { return !prevIsOpenState; });
                    } },
                    react_1["default"].createElement(outline_1.Bars3Icon, { className: "h-1/2" })),
                isDrawerOpen && (react_1["default"].createElement("ul", { tabIndex: 0, className: "menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52", onClick: function () {
                        setIsDrawerOpen(false);
                    } }, navLinks))),
            react_1["default"].createElement(link_1["default"], { href: "/", passHref: true, className: "hidden lg:flex items-center gap-2 ml-4 mr-6" },
                react_1["default"].createElement("div", { className: "flex flex-col py-2" },
                    react_1["default"].createElement("span", { className: "font-bold text-xl" }, "\u25EF Universe"),
                    "          ")),
            react_1["default"].createElement("ul", { className: "hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2" }, navLinks)),
        react_1["default"].createElement("div", { className: "navbar-end flex-grow mr-4" },
            react_1["default"].createElement(scaffold_eth_1.RainbowKitCustomConnectButton, null),
            react_1["default"].createElement(scaffold_eth_1.FaucetButton, null))));
};
