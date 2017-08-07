import atomWeb = require("./core/atomWrapperWeb");

import UILib = require("atom-ui-lib");

export var workspace = atomWeb.getWorkspace();

// export var UI = UILib;
//
// export var atom = atomWeb;
//
// (<any>window).atom = atomWeb;

(<any>window).sampleCode = require("../example.json");

export function evalUi(code: string) {
    innerEvalUi(UILib, atomWeb, code);
}

function innerEvalUi(UI: any, atom: any, code: string) {
    eval(code);
}

// function button(name: string, callback?: any) {
//     return new UI.ToggleButton(name ,UI.ButtonSizes.LARGE, UI.ButtonHighlights.INFO, UI.Icon.ALERT, event => callback ? callback() : null)
// }
//
// function divWithButton(name: string, callback?: any) {
//     return {element: document.createElement('div').appendChild(button(name, callback).renderUI()), getTitle: () => name};
// }
//
//
// var pane0 = workspace.getActivePane();
//
// var pane1 = workspace.getActivePane().splitRight({});
//
// pane1.addItem(divWithButton('Right0'), 0);
// pane1.addItem(divWithButton('Right1'), 1);
// pane1.addItem(divWithButton('Right2'), 2);
//
// workspace.getActivePane().splitDown({}).addItem(divWithButton('Right-Down'), 0);
// workspace.getActivePane().splitDown({}).addItem(divWithButton('Right-Down-Down'), 0);
//
//
// var pane: any;
//
// pane0.addItem(divWithButton('Push Me, Baby!', () => {
//     var modPane: any;
//
//     var vc=UI.section("Vertical Section",UI.Icon.GIST_NEW,false,false);
//
//     var hc1 = UI.hc()
//     hc1.setPercentWidth(100);
//     hc1.addChild(UI.label("Some Label 1"));
//     vc.addChild(hc1);
//
//     hc1 = UI.hc()
//     hc1.setPercentWidth(100);
//     hc1.addChild(UI.label("Some Label 2"));
//     vc.addChild(hc1);
//
//     hc1 = UI.hc()
//     hc1.setPercentWidth(100);
//     hc1.addChild(UI.label("Some Label 3"));
//     vc.addChild(hc1);
//
//     hc1 = UI.hc()
//     hc1.setPercentWidth(100);
//     hc1.addChild(UI.label("Some Label 4"));
//     vc.addChild(hc1);
//
//     var el=UI.hc();
//     vc.setPercentWidth(100);
//     el.setPercentWidth(100);
//
//     vc.addChild(el);
//     var zz: any;
//     var buttonBar=UI.hc().setPercentWidth(100).setStyle("display","flex");
//     buttonBar.addChild(UI.label("",null,null,null).setStyle("flex","1"))
//     buttonBar.addChild(UI.button("Cancel",UI.ButtonSizes.NORMAL,UI.ButtonHighlights.NO_HIGHLIGHT,UI.Icon.NONE,x=>{zz.destroy()}).margin(10,10))
//     var okButton=UI.button("OK",UI.ButtonSizes.NORMAL,UI.ButtonHighlights.SUCCESS,UI.Icon.NONE,x=>{
//
//         zz.destroy();
//     });
//     okButton.setDisabled(true)
//     buttonBar.addChild(okButton);
//     vc.addChild(buttonBar)
//     var html=vc.renderUI();
//     zz=(<any>atom).workspace.addModalPanel( { item: html});
// }), 0);

//pane = workspace.addModalPanel({item: button('asdadasdasd', () => pane.destroy()).renderUI()});