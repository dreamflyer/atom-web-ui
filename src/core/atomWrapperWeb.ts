import atomStuff = require('./atomWebStuff');

declare var require: any;
declare var global: any;

var path = require("path");

var css: any = require("../../src/static/styles.css");

var html: any = require("../../src/static/workspace.html");

var ace = require("../../src/static/ace");
var aceStuff: any = require("../../src/static/aceStuff");

var isMutationSupport: boolean;

export class Workspace {
    textEditor: TextEditor = null;

    rootPane: Pane = null;

    pane: Pane = null;

    container: HTMLDivElement = null;

    updateEverythingCallbacks: any[] = [];
    
    editorsCache: any = {};

    popup: HTMLElement = null;

    modalPanel: HTMLElement = null;

    editors: {};

    didDestroyPaneCallbacks: any[] = [];
    
    constructor(private containerId?: string, private modalId?: string) {
        this.initUI();
    }

    getDescriptors() {
        return global.projectDescriptors;
    }
    
    initUI() {
        var AtomTextEditor = this.registerElement('atom-text-editor', HTMLDivElement.prototype);

        AtomTextEditor.prototype.getModel = function() {
            return this.model ? this.model : new atomStuff.AtomTextEditorModel(this);
        };

        var oldSetAttribute = AtomTextEditor.prototype.setAttribute;
        var oldRemoveAttribute = AtomTextEditor.prototype.removeAttribute;

        AtomTextEditor.prototype.setAttribute = function(key: any, value: any) {
            oldSetAttribute.apply(this, [key, value]);

            if(key === 'mini') {
                this.getModel().mini = true;
            }

            this.getModel().updateInput();
        }

        AtomTextEditor.prototype.removeAttribute = function(key: any) {
            oldRemoveAttribute.apply(this, [key]);

            if(key === 'mini') {
                this.getModel().mini = false;
            }

            this.getModel().updateInput();
        }

        Object.defineProperty(AtomTextEditor.prototype, "textContent", {
            get: function() {
                return this.getModel().getText();
            },

            set: function(value) {
                this.getModel().setText(value);
            }
        });

        this.registerElement('atom-workspace', HTMLDivElement.prototype);
        this.registerElement('atom-workspace-axis', HTMLDivElement.prototype);
        this.registerElement('atom-panel-container', HTMLDivElement.prototype);
        this.registerElement('atom-panel', HTMLDivElement.prototype);
        this.registerElement('atom-pane-container', HTMLDivElement.prototype);
        this.registerElement('atom-pane-axis', HTMLDivElement.prototype);
        this.registerElement('atom-pane', HTMLDivElement.prototype);
        
        this.initHTML();

        isMutationSupport = areMutationEventsAvailable();
        
        this.container = <HTMLDivElement>document.getElementById('root-pane-container');
        
        this.modalPanel = document.getElementById(this.modalId || 'modal-panel');

        this.modalPanel.style.display = 'none';

        this.clear();
    }
    
    initHTML() {
        var body: HTMLElement = this.containerId ? document.getElementById(this.containerId) : <HTMLBodyElement>document.body;

        if(!body) {
            body = <HTMLBodyElement>document.createElement('body');

            document.childNodes[0].appendChild(body);
        }

        var style: HTMLStyleElement = <HTMLStyleElement>document.createElement('style');
        
        var styleTextNode = document.createTextNode(css[0][1]);
        
        style.appendChild(styleTextNode);

        document.head.appendChild(style);

        body.innerHTML = html;
    }

    clear() {
        if(this.rootPane) {
            this.rootPane.destroy();
        }

        (<any>this.container).innerHTML = '';

        this.rootPane = new Pane('main', this.container, this, null);

        this.pane = this.rootPane;
    }

    doUpdate() {
        this.updateEverythingCallbacks.forEach(callback => {
            callback();
        });
    }

    addModalPanel(itemHolder: any) {
        this.popup = itemHolder.item;
        
        this.modalPanel.appendChild(this.popup);

        this.modalPanel.style.display = 'block';
        this.modalPanel.parentElement.style.display = 'block';
        
        var didDestroys: any[] = [];

        return {
            destroy: () => {
                this.modalPanel.style.display = 'none';
                this.modalPanel.parentElement.style.display = 'none';

                if(this.popup.parentElement) {
                    this.modalPanel.innerHTML = "";
                }

                didDestroys.forEach(callback => callback());
            },
            
            onDidDestroy: (callback: any) => didDestroys.push(callback) 
        }
    }

    bottomPanel: HTMLElement = document.getElementById('bottom-panel');
    bottomPane: HTMLElement = null;

    addBottomPanel(itemHolder: any) {
        this.bottomPane = itemHolder.item.element;

        this.bottomPane.setAttribute('is', 'space-pen-div');

        this.bottomPane.className = 'raml-console pane-item';

        this.bottomPane.style.overflow = 'scroll';

        document.getElementById('bottom-panel-container').style.flexBasis = '170px';
        (<any>document).getElementById('bottom-panel-container').style.webkitFlexBasis = '170px';

        this.bottomPanel.appendChild(this.bottomPane);

        return {
            destroy: () => {
                this.bottomPanel.removeChild(this.bottomPane);

                document.getElementById('bottom-panel-container').style.flexBasis = '0px';
                (<any>document).getElementById('bottom-panel-container').style.webkitFlexBasis = '0px';
            }
        }
    }
    
    private registerElement(name: string, prototype: any, ext?: string): any {
        var config: any = {prototype: Object.create(prototype)}

        if(ext) {
            config['extends'] = ext;
        }

        return (<any>document).registerElement(name, config);
    }

    getActiveTextEditor(): TextEditor {
        return this.textEditor;
    }

    getTextEditors() {
        return this.textEditor ? [this.textEditor] : [];
    }

    onDidChangeActivePaneItem(callback: (arg:any) => void) {
        this.updateEverythingCallbacks.push(callback);

        return {
            dispose: () => {
                this.updateEverythingCallbacks = this.updateEverythingCallbacks.filter(child => {
                    return child !== callback;
                });
            }
        }
    }

    onDidAddPaneItem(callback: any) {
        console.log("TODO: may be need to implement onDidAddPaneItem method.");
    }

    onDidDestroyPane(callback: any) {
        this.didDestroyPaneCallbacks[0] = callback;
    }

    getActivePane(): Pane {
        return this.pane;
    }

    setActivePane(pane:Pane):void {
        this.pane = pane;
    }

    doCache(key:string, content: string) {
        this.editorsCache[key] = content;
    }

    getFromCache(key:string): string {
        return this.editorsCache[key];
    }
    
    paneForItem(item: any) {
        return item.pane;
    }

    paneDestroyed(pane: Pane) {
        if(pane.destroyed) {
            return;
        }

        this.didDestroyPaneCallbacks.forEach(callback => {
            callback({pane: pane});
        });
    }

    getPaneItems(pane?: Pane): any[] {
        var actualPane = pane ? pane : this.rootPane;

        var result: any[] = [];

        if(actualPane) {
            Object.keys(actualPane.items).forEach(key=> {
                if(!actualPane.items[key]) {
                    return;
                }

                result.push(actualPane.items[key]);
            });

            actualPane.children.forEach(child => {
                result.push(this.getPaneItems(child));
            });
        }

        return result;
    }
    
    setActiveTextEditor(editor: TextEditor) {
        this.textEditor = editor;
    }

    getActivePaneItem(): any {
        return null;
    }

    paneForURI(uri: string): any {
        return null;
    }

    observeTextEditors(callback: any): any {
        return {
            dispose: () => {}
        }
    }
}

export class Pane {
    items:any =  [];

    id:string;
    workspace: Workspace;
    arg:any;

    container: HTMLDivElement;

    views: HTMLDivElement;
    tabs: HTMLUListElement;

    activeItem: any = null;

    children: Pane[] = [];

    destroyed = false;

    constructor(id: string, parentNode:HTMLDivElement, workspace:Workspace, arg:any) {
        this.id = id;
        var parent = parentNode;
        this.workspace = workspace;
        this.arg = arg;

        workspace.setActivePane(this);

        this.container = <HTMLDivElement>document.createElement('atom-pane');
        this.container.className = 'pane';
        this.container.id = id;

        this.tabs = document.createElement('ul');

        this.tabs.className = "list-inline tab-bar inset-panel";

        this.views = document.createElement('div');

        this.views.className = 'item-views';

        parent.appendChild(this.container);

        this.container.appendChild(this.tabs);
        this.container.appendChild(this.views);
    }

    destroyItem(item: any): boolean {
        var destroyed = false;

        var index = -1;
        
        var activeFound = false;

        this.items.forEach((itemToDestroy: any, indexToDestroy: any) => {
            if(itemToDestroy === item) {
                item.destroy && item.destroy();

                item.element && this.views.removeChild(item.element);

                index = indexToDestroy;

                destroyed = true;
            } else {
                if(this.activeItem === itemToDestroy) {
                    activeFound === true;
                }
            }
        });
        
        if(!activeFound) {
            this.activeItem = null;
        }

        index > -1 && delete this.items[index];

        var lastItem: any = null;

        this.items.forEach((item: any) => lastItem = item);

        lastItem = lastItem ? (this.activeItem || lastItem) : null;
        
        this.refreshTabs(lastItem);

        return destroyed;
    }

    destroy() {
        this.children = [];


        var items = this.items;

        Object.keys(items).forEach(key => {
            var item = items[key];

            item.pane = null;

            if(item && item.destroy) {
                item.destroy();
            }
        });

        this.items = [];

        this.destroyed = true;

        if(this.container.parentElement) {
            var parentElement = this.container.parentElement;

            parentElement.removeChild(this.container);
            
            if(parentElement.tagName && parentElement.tagName.toLowerCase() === "atom-pane-axis") {
                var parentAxis = parentElement;

                if(parentAxis.children.length === 0 && parentAxis.parentElement) {
                    parentAxis.parentElement.removeChild(parentAxis);
                } else if(parentAxis.children.length === 1 && parentAxis.parentElement) {
                    var child = parentAxis.children.item(0);

                    parentAxis.removeChild(child);

                    var parentAxisParent = parentAxis.parentElement;
                    parentAxisParent.replaceChild(child, parentAxis);
                }
            }
        }

        workspace.paneDestroyed(this);
    }

    splitUp(arg: any): Pane {
        return this.newPane('up', arg);
    }

    splitDown(arg: any): Pane {
        return this.newPane('down', arg);
    }

    splitLeft(arg: any): Pane {
        return this.newPane('left', arg);
    }

    splitRight(arg: any): Pane {
        return this.newPane('right', arg);
    }

    newPane(id: string, arg:any):Pane {
        var axis = <HTMLDivElement>document.createElement('atom-pane-axis');

        axis.className = id === 'left' || id === 'right' ? 'horizontal pane-row' : 'vertical pane-column';

        if(this.id === 'main-right') {
            axis.id = 'editor-tools-axis';
        }

        var parent = this.container.parentNode

        if(!parent) {
            return null;
        }

        parent.replaceChild(axis, this.container);

        axis.appendChild(this.container);

        var result: Pane = new Pane(this.id + '-' + id, axis, this.workspace, arg);

        this.children.push(result);

        return result;
    }

    private refreshTabs(activeItem: any) {
        this.tabs.innerHTML = "";

        this.items.forEach((item: any) => {
            var tab = this.tab(item);
            
            this.tabs.appendChild(tab);

            var isActive = item === activeItem;

            item.element && (item.element.style.display = (isActive ? null : 'none'));

            isActive && tab.setActive();
            
            if(item === activeItem) {
                tab.setActive();

                if(item.element) {
                    item.element.style.display = null;
                }

                console.log("Active: " + item.getTitle());
            } else {
                if(item.element) {
                    item.element.style.display = 'none';
                }

                console.log("Inactive: " + item.getTitle());
            }
        });

        this.activeItem = activeItem;
    }

    private tab(item: any): any {
        var tab = document.createElement('li');

        tab.className = "tab sortable";

        tab.setActive = () => {
            tab.className = "tab sortable active";
        }
        
        tab.addEventListener('click', event => event.srcElement === tab ? this.refreshTabs(item) : null);   

        var label = document.createElement('div');

        label.className = "title";
        label.innerText = item && item.getTitle ? item.getTitle() : "unknown";

        var closeIcon = document.createElement('div');

        closeIcon.className = "close-icon";

        closeIcon.addEventListener('click', event => {
            if(event.srcElement !== closeIcon) {
                event.preventDefault();
                
                return;
            }

            this.destroyItem(item);

            if(this.itemsCount() === 0) {
                this.destroy();
            }

            event.preventDefault();
        });

        tab.appendChild(label);
        tab.appendChild(closeIcon);

        return tab;
    }

    private itemsCount(): number {
        var count = 0;

        this.items.forEach((item: any) => {
            count ++;
        });

        return count;
    }

    addItem(item:any, index?: number) {
        var actualIndex: number = index || 0;

        this.destroyItem(this.items[actualIndex]);

        this.items[actualIndex] = item;

        item.pane = this;

        this.views.appendChild(item.element);
        
        if(item.attached) {
            item.attached();
        }
        
        this.refreshTabs(item);

        if(!isMutationSupport) {
            item.element.dispatchEvent(new global.Event("DOMNodeInserted"));
        }
    }

    activate() {

    }
}

export interface Point {
    row:number;
    column:number;
}

export interface Range {
    start:Point;
    end:Point;
}

interface IChangeCommand{
    newText:string;
    oldText:string;

    oldRange:Range;
    newRange:Range;
}

export class TextBuffer {
    text:string = '';

    didChangecallbacks: any[] = [];

    stopChangingCallbacks: any[] = [];

    constructor(text:string) {
        this.text = text;
    }

    onDidChange(callback: any) {
        this.didChangecallbacks.push(callback);
    }

    getText(): string {
        return this.text;
    }

    doChange(arg: any) {
        this.didChangecallbacks.forEach((callback: any) => {
            var text: string = null;

            var lines: any[] = arg.lines;

            lines.forEach(line=> {
                text = text === null ? line : (text + '\n' + line);
            });

            var cmd: IChangeCommand = {
                newText: arg.action === 'insert' ? text : '',
                oldText: arg.action === 'remove' ? text : '',
                newRange: null,
                oldRange: <Range>{start: (arg.start), end: arg.end}
            };

            callback(cmd);
        })

        this.doStopChanging(arg);
    }

    doStopChanging(arg: any) {
        this.stopChangingCallbacks.forEach(callback=>{
            callback(null);
        })
    }

    onDidStopChanging(callback: any) {
        this.stopChangingCallbacks.push(callback);

        return {
            dispose: () => {
                this.stopChangingCallbacks = this.stopChangingCallbacks.filter(child => {
                    return child !== callback;
                });
            }
        }
    }

    characterIndexForPosition: any;

    positionForCharacterIndex: any;

    setTextInRange: any;
}

export class TextEditorCursor {
    editor: TextEditor;

    changePositionCallbacks: any[] = [];

    constructor(editor: TextEditor) {
        this.editor = editor;
    }

    onDidChangePosition(callback: any) {
        this.changePositionCallbacks.push(callback);

        return {
            dispose: () => {
                this.changePositionCallbacks = this.changePositionCallbacks.filter(child => {
                    return child !== callback;
                });
            }
        }
    }

    getBufferPosition(): Point {
        return this.editor.getCursorBufferPosition();
    }

    doChangePosition() {
       this.changePositionCallbacks.forEach(callback => {
           callback();
       });
    }
}

function getRange(row1: number, col1: number, row2: number, col2: number): Range {
    var point1: Point = {row: row1, column: col1};
    var point2: Point = {row: row2, column: col2};

    return <Range>(isCorrectOrder(point1, point2) ? {start: point1, end: point2} : {start: point2, end: point1});
}

function isCorrectOrder(point1: Point, point2: Point): boolean {
    if(point1.row < point2.row) {
        return true;
    }

    if(point1.row > point2.row) {
        return false;
    }

    return point1.column < point2.column;
}

export class TextEditor {
    textBuffer: TextBuffer;

    editorPath: string;

    extension: string;

    dirtyState: boolean = false;

    element: HTMLElement = document.createElement('div');

    textElement: HTMLElement =  document.createElement('div');

    ace: any;

    aceEditor: any;

    cursor: TextEditorCursor;

    id: string;

    contextMenu: any = null;

    destroyCallbacks: any[] = [];

    grammar: any = {
        scopeName: 'no-grammar'
    }


    constructor(editorPath: string, id: string = 'ace_editor', resolver?: any, private getSuggestions?: any) {
        this.editorPath = editorPath;

        this.id = editorPath;
        
        var self: any = <any>this;

        self['soft-tabs'] = {};
        
        this.restore(resolver);

        this.textElement.className = 'editor';

        this.textElement.style.position = 'relative';
        this.textElement.style.width = '100%';
        this.textElement.style.flex = '1';

        (<any>this).textElement.style.webkitFlex = '1';

        this.textElement.id = id;

        this.extension = path.extname(editorPath);

        this.grammar.scopeName = 'source' + this.extension;

        this.element.style.position = 'relative';
        this.element.style.width = '100%';

        this.element.className = 'text-editor-wrapper';
        this.element.style.display = 'flex';
        this.element.style.display = '-webkit-flex';

        this.element.appendChild(this.textElement);

        var textEditor = this;

        this.element.addEventListener('DOMNodeInserted', event => {
            if(textEditor.ace) {
                return;
            }

            textEditor.doAceSetup(ace);
        })
    }

    restore(resolver: any) {
        var text: string = resolver.content(this.editorPath);

        this.textBuffer = new TextBuffer(text);
    }

    doAceSetup(ace: any) {
        this.ace = ace;

        if(!ace) {
            return;
        }

        var aceEditor: any = ace.edit(this.textElement.id);

        var langTools: any = ace.require('ace/ext/language_tools');

        aceEditor.setTheme('ace/theme/tomorrow_night');

        langTools.setCompleters([]);

        aceEditor.getSession().setMode(this.getMode());

        aceEditor.setOptions({
            enableBasicAutocompletion: true,

            enableLiveAutocompletion: true
        });


        this.setAceEditor(aceEditor);

        if(this.extension === '.raml') {
            var AceCompleter = aceStuff.AceCompleter;
            
            langTools.addCompleter(new AceCompleter(this, {
                getSuggestions: (request: any) => {
                    return this.getSuggestions ? this.getSuggestions(request) : [];
                }
            }));
        }
    }

    getMode() {
        var AceMode = this.ace.require('ace/mode/text').Mode;

        var result = new AceMode();

        return result;
    }

    setAceEditor(aceEditor: any) {
        this.aceEditor = aceEditor;

        var textBuffer = this.getBuffer();

        textBuffer.characterIndexForPosition = function (position:Point) {
            var result = aceEditor.getSession().getDocument().positionToIndex({row: position.row, column: position.column}, 0);

            return result;
        }

        textBuffer.positionForCharacterIndex = function (index:number) {
            var result = aceEditor.getSession().getDocument().indexToPosition(index, 0);

            return result;
        }

        textBuffer.setTextInRange = (range:Range, value:string) => {
            var AceRange = this.ace.require("ace/range").Range;

            var preparedRange: Range = getRange(range.start.row, range.start.column, range.end.row, range.end.column);

            var aceRange = new AceRange(preparedRange.start.row, preparedRange.start.column, preparedRange.end.row, preparedRange.end.column);

            aceEditor.getSession().replace(aceRange, value);
        }

        textBuffer.setText = (text: string) => {
            var top = this.aceEditor.session.getScrollTop();

            this.aceEditor.setValue(text, 100);

            this.aceEditor.resize(true);

            this.aceEditor.session.setScrollTop(top);
        }

        this.aceEditor.session.setValue(textBuffer.getText());

        var textEditor = this;
        
        var extension = this.extension;

        this.aceEditor.session.selection.on("changeCursor", function (event: any) {
            textEditor.getLastCursor().doChangePosition();
        })

        this.aceEditor.on('change', (arg: any) => {
            textBuffer.text = aceEditor.getValue();

            textBuffer.doChange(arg);
        });
    }
    
    getTitle(): string {
        return path.basename(this.editorPath);
    }

    onDidChangeCursorPosition(callback: any) {
        return this.getLastCursor().onDidChangePosition(callback);
    }
    
    doSave() {
        
    }

    getPath():string {
        return this.editorPath;
    }

    getBuffer(): any {
        return this.textBuffer;
    }

    getLastCursor(): TextEditorCursor {
        if(!this.cursor) {
            this.cursor = new TextEditorCursor(this);
        }

        return this.cursor;
    }

    getCursorBufferPosition(): Point {
        var acePosition: Point = <Point>this.aceEditor.getCursorPosition();

        return {column: acePosition.column, row: acePosition.row};
    }

    setCursorBufferPosition(position: Point) {
        this.setSelectedBufferRange(<Range>{start: position, end: position}, null);
    }

    setSelectedBufferRange(range: Range, arg: any) {
        var AceRange = this.ace.require("ace/range").Range;

        var preparedRange: Range = getRange(range.start.row + 1, range.start.column, range.end.row + 1, range.end.column);

        var aceRange = new AceRange(preparedRange.start.row, preparedRange.start.column, preparedRange.end.row, preparedRange.end.column);

        this.aceEditor.resize(true);

        this.aceEditor.selection.setRange(aceRange);

        this.aceEditor.gotoLine(preparedRange.start.row, preparedRange.start.column, true);
    }
    
    getText(): string {
        return this.getBuffer().getText();
    }

    setText(text: string) {
        this.getBuffer().setText(text);
    }

    insertText(text:string) {
        this.aceEditor.insert(text);
    }

    getGrammar(): any {
        return this.grammar;
    }

    onDidStopChanging(callback: any) {
        return this.textBuffer.onDidStopChanging(callback);
    }

    onDidDestroy(callback: any) {
        this.destroyCallbacks.push(callback);

        return {
            dispose: () => {
                this.destroyCallbacks = this.destroyCallbacks.filter(child => {
                    return child !== callback;
                });
            }
        }
    }

    onDidChangePath(callback: any) {
        return {
            dispose: function() {}
        }
    }

    destroy() {
        this.destroyCallbacks.forEach((callback: any) => callback());
    }
}

function getActionsTree(actions: any): any {
    var actionsTree: any = {
        children: [],
        categories: {}
    };

    actions.forEach((action: any) => {
        if(action.category && action.category.length > 0) {
            var current = actionsTree;

            for(var i = 0; i < action.category.length; i++) {
                var name = action.category[i];

                if(!current.categories[name]) {
                    var newCategory: any = {title: name, children: [], categories: {}};

                    current.categories[name] = newCategory;

                    current.children.push(newCategory);
                }

                current = current.categories[action.category[i]];
            }

            current.children.push(actionToItem(action));
        } else {
            actionsTree.children.push(actionToItem(action));
        }
    });

    return actionsTree.children;
}

function actionToItem(action: any): any {
    return {
        title: action.name,
        action: action.onClick ? action.onClick : () => {},
        uiIcon: null
    }
}

function areMutationEventsAvailable() {
    var result = false;

    var testElement = document.createElement('div');

    testElement.addEventListener('DOMNodeInserted', function() {
        result = true;
    });

    document.body.appendChild(testElement);
    document.body.removeChild(testElement);

    return result;
}

function isSimpleMode() {
    try {
        return global.atomMode === 'spec' || global.atomMode === 'newSpec';
    } catch(exception) {
        return false;
    }
}

export var config: any = {
    grammars: {
        'api-workbench.grammars': ['source.raml'],
    },

    get: function(key: string) {
        return this.grammars[key];
    },

    emitter: {
        handlersByEventName: {
            'did-change': []
        }
    }
}

export var views: any = {
    documentPollers: []
}

export var grammars: any = {
    grammarsByScopeName: {
        'text.xml': {scopeName: 'text.xml', fileTypes: ['xml']},
        'source.json': {scopeName: 'source.json', fileTypes: ['json']},
        'text.plain.null-grammar': {scopeName: 'text.plain.null-grammar', fileTypes: []}
    },

    getGrammars: function() {
        var result: any[] = [];

        Object.keys(this.grammarsByScopeName).forEach(key => {
            result.push(this.grammarsByScopeName[key]);
        });

        return result;
    },

    emitter: {
        handlersByEventName: {
            'did-change': [],
            'did-add-grammar': [],
            'did-update-grammar': []
        }
    },
    
    nullGrammar: {
        emitter: {
            handlersByEventName: {
                "did-update": []
            }
        }
    }
}

export var commands = {add: () => {}};

export var styles: any = {
    emitter: {
        handlersByEventName: {
            'did-add-style-element': (): any => {
                
            },

            'did-remove-style-element': (): any => {
                
            },

            'did-update-style-element': (): any => {
                
            }
        }
    }
}

function getGlobal() {
    var globalGetter = function() {
        return this;
    }

    return globalGetter.apply(null);
}

export var workspace: Workspace;

export function getWorkspace(containerId?: string, modalId?: string) {
    if(workspace) {
        return workspace;
    }
   
    workspace = new Workspace(containerId, modalId);
   
    return workspace;
}

export var textEditors: any = {
    build: function(options: any) {
        return {
            element: (<any>document).createElement("atom-text-editor")
        };
    }
};

(<any>window).remote = {require: () => new Object()};

