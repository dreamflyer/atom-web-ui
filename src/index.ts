import atomWeb = require("./core/atomWrapperWeb");

import UILib = require("atom-ui-lib");

export var workspace = atomWeb.getWorkspace();

export var UI = UILib;

export var atom = atomWeb;

(<any>window).atom = atomWeb;