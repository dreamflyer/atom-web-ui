export import atom = require("./core/atomWrapperWeb");

export import atomUiLib = require("atom-ui-lib");

if(window) {
    (<any>window).atom = atom;
}