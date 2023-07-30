"use strict";
exports.__esModule = true;
exports.SwitchTheme = void 0;
var react_1 = require("react");
var usehooks_ts_1 = require("usehooks-ts");
var outline_1 = require("@heroicons/react/24/outline");
exports.SwitchTheme = function (_a) {
    var className = _a.className;
    var _b = usehooks_ts_1.useDarkMode(), isDarkMode = _b.isDarkMode, toggle = _b.toggle;
    var isMounted = usehooks_ts_1.useIsMounted();
    react_1.useEffect(function () {
        var body = document.body;
        body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);
    return (React.createElement("div", { className: "flex space-x-2 text-sm " + className },
        React.createElement("input", { id: "theme-toggle", type: "checkbox", className: "toggle toggle-primary bg-primary", onChange: toggle, checked: isDarkMode }),
        isMounted() && (React.createElement("label", { htmlFor: "theme-toggle", className: "swap swap-rotate " + (!isDarkMode ? "swap-active" : "") },
            React.createElement(outline_1.SunIcon, { className: "swap-on h-5 w-5" }),
            React.createElement(outline_1.MoonIcon, { className: "swap-off h-5 w-5" })))));
};
