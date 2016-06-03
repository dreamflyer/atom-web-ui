"use strict";
var atomWeb = require("./core/atomWrapperWeb");
var UILib = require("atom-ui-lib");
exports.workspace = atomWeb.getWorkspace();
exports.UI = UILib;
exports.atom = atomWeb;
window.atom = atomWeb;
//# sourceMappingURL=index.js.map