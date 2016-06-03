"use strict";
/// <reference path="../../typings/main.d.ts" />
var path = require("path");
var atomStuff = require('./atomWebStuff');
var css = require("../../src/static/styles.css");
var html = require("../../src/static/workspace.html");
var ace = require("../../src/static/ace");
var aceStuff = require("../../src/static/aceStuff");
var isMutationSupport;
var Workspace = (function () {
    function Workspace() {
        this.textEditor = null;
        this.rootPane = null;
        this.pane = null;
        this.container = null;
        this.updateEverythingCallbacks = [];
        this.editorsCache = {};
        this.popup = null;
        this.modalPanel = null;
        this.didDestroyPaneCallbacks = [];
        this.bottomPanel = document.getElementById('bottom-panel');
        this.bottomPane = null;
        this.initUI();
    }
    Workspace.prototype.getDescriptors = function () {
        return global.projectDescriptors;
    };
    Workspace.prototype.initUI = function () {
        var AtomTextEditor = this.registerElement('atom-text-editor', HTMLDivElement.prototype);
        AtomTextEditor.prototype.getModel = function () {
            return this.model ? this.model : new atomStuff.AtomTextEditorModel(this);
        };
        var oldSetAttribute = AtomTextEditor.prototype.setAttribute;
        var oldRemoveAttribute = AtomTextEditor.prototype.removeAttribute;
        AtomTextEditor.prototype.setAttribute = function (key, value) {
            oldSetAttribute.apply(this, [key, value]);
            if (key === 'mini') {
                this.getModel().mini = true;
            }
            this.getModel().updateInput();
        };
        AtomTextEditor.prototype.removeAttribute = function (key) {
            oldRemoveAttribute.apply(this, [key]);
            if (key === 'mini') {
                this.getModel().mini = false;
            }
            this.getModel().updateInput();
        };
        Object.defineProperty(AtomTextEditor.prototype, "textContent", {
            get: function () {
                return this.getModel().getText();
            },
            set: function (value) {
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
        this.container = document.getElementById('root-pane-container');
        this.modalPanel = document.getElementById('modal-panel');
        this.modalPanel.style.display = 'none';
        this.clear();
    };
    Workspace.prototype.initHTML = function () {
        var body = document.body;
        if (!body) {
            body = document.createElement('body');
            document.childNodes[0].appendChild(body);
        }
        var style = document.createElement('style');
        style.innerText = css[0][1];
        document.head.appendChild(style);
        document.body.innerHTML = html;
    };
    Workspace.prototype.clear = function () {
        if (this.rootPane) {
            this.rootPane.destroy();
        }
        this.container.innerHTML = '';
        this.rootPane = new Pane('main', this.container, this, null);
        this.pane = this.rootPane;
    };
    Workspace.prototype.doUpdate = function () {
        this.updateEverythingCallbacks.forEach(function (callback) {
            callback();
        });
    };
    Workspace.prototype.addModalPanel = function (itemHolder) {
        var _this = this;
        this.popup = itemHolder.item;
        this.modalPanel.appendChild(this.popup);
        this.modalPanel.style.display = null;
        return {
            destroy: function () {
                _this.modalPanel.style.display = 'none';
                if (_this.popup.parentElement) {
                    _this.modalPanel.removeChild(_this.popup);
                }
            }
        };
    };
    Workspace.prototype.addBottomPanel = function (itemHolder) {
        var _this = this;
        this.bottomPane = itemHolder.item.element;
        this.bottomPane.setAttribute('is', 'space-pen-div');
        this.bottomPane.className = 'raml-console pane-item';
        this.bottomPane.style.overflow = 'scroll';
        document.getElementById('bottom-panel-container').style.flexBasis = '170px';
        document.getElementById('bottom-panel-container').style.webkitFlexBasis = '170px';
        this.bottomPanel.appendChild(this.bottomPane);
        return {
            destroy: function () {
                _this.bottomPanel.removeChild(_this.bottomPane);
                document.getElementById('bottom-panel-container').style.flexBasis = '0px';
                document.getElementById('bottom-panel-container').style.webkitFlexBasis = '0px';
            }
        };
    };
    Workspace.prototype.registerElement = function (name, prototype, ext) {
        var config = { prototype: Object.create(prototype) };
        if (ext) {
            config['extends'] = ext;
        }
        return document.registerElement(name, config);
    };
    Workspace.prototype.getActiveTextEditor = function () {
        return this.textEditor;
    };
    Workspace.prototype.getTextEditors = function () {
        return this.textEditor ? [this.textEditor] : [];
    };
    Workspace.prototype.onDidChangeActivePaneItem = function (callback) {
        var _this = this;
        this.updateEverythingCallbacks.push(callback);
        return {
            dispose: function () {
                _this.updateEverythingCallbacks = _this.updateEverythingCallbacks.filter(function (child) {
                    return child !== callback;
                });
            }
        };
    };
    Workspace.prototype.onDidAddPaneItem = function (callback) {
        console.log("TODO: may be need to implement onDidAddPaneItem method.");
    };
    Workspace.prototype.onDidDestroyPane = function (callback) {
        this.didDestroyPaneCallbacks[0] = callback;
    };
    Workspace.prototype.getActivePane = function () {
        return this.pane;
    };
    Workspace.prototype.setActivePane = function (pane) {
        this.pane = pane;
    };
    Workspace.prototype.doCache = function (key, content) {
        this.editorsCache[key] = content;
    };
    Workspace.prototype.getFromCache = function (key) {
        return this.editorsCache[key];
    };
    Workspace.prototype.paneForItem = function (item) {
        return item.pane;
    };
    Workspace.prototype.paneDestroyed = function (pane) {
        if (pane.destroyed) {
            return;
        }
        this.didDestroyPaneCallbacks.forEach(function (callback) {
            callback({ pane: pane });
        });
    };
    Workspace.prototype.getPaneItems = function (pane) {
        var _this = this;
        var actualPane = pane ? pane : this.rootPane;
        var result = [];
        if (actualPane) {
            Object.keys(actualPane.items).forEach(function (key) {
                if (!actualPane.items[key]) {
                    return;
                }
                result.push(actualPane.items[key]);
            });
            actualPane.children.forEach(function (child) {
                result.push(_this.getPaneItems(child));
            });
        }
        return result;
    };
    Workspace.prototype.getActivePaneItem = function () {
        return null;
    };
    Workspace.prototype.paneForURI = function (uri) {
        return null;
    };
    Workspace.prototype.observeTextEditors = function (callback) {
        return {
            dispose: function () { }
        };
    };
    return Workspace;
}());
exports.Workspace = Workspace;
var Pane = (function () {
    function Pane(id, parentNode, workspace, arg) {
        this.items = [];
        this.activeItem = null;
        this.children = [];
        this.destroyed = false;
        this.id = id;
        var parent = parentNode;
        this.workspace = workspace;
        this.arg = arg;
        workspace.setActivePane(this);
        this.container = document.createElement('atom-pane');
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
    Pane.prototype.destroyItem = function (item) {
        var _this = this;
        var destroyed = false;
        var index = -1;
        var activeFound = false;
        this.items.forEach(function (itemToDestroy, indexToDestroy) {
            if (itemToDestroy === item) {
                item.destroy && item.destroy();
                item.element && _this.views.removeChild(item.element);
                index = indexToDestroy;
                destroyed = true;
            }
            else {
                if (_this.activeItem === itemToDestroy) {
                    activeFound === true;
                }
            }
        });
        if (!activeFound) {
            this.activeItem = null;
        }
        index > -1 && delete this.items[index];
        var lastItem = null;
        this.items.forEach(function (item) { return lastItem = item; });
        lastItem = lastItem ? (this.activeItem || lastItem) : null;
        this.refreshTabs(lastItem);
        return destroyed;
    };
    Pane.prototype.destroy = function () {
        this.children = [];
        var items = this.items;
        Object.keys(items).forEach(function (key) {
            var item = items[key];
            item.pane = null;
            if (item && item.destroy) {
                item.destroy();
            }
        });
        this.items = [];
        this.destroyed = true;
        if (this.container.parentElement) {
            var parentElement = this.container.parentElement;
            parentElement.removeChild(this.container);
            if (parentElement.tagName && parentElement.tagName.toLowerCase() === "atom-pane-axis") {
                var parentAxis = parentElement;
                if (parentAxis.children.length === 0 && parentAxis.parentElement) {
                    parentAxis.parentElement.removeChild(parentAxis);
                }
                else if (parentAxis.children.length === 1 && parentAxis.parentElement) {
                    var child = parentAxis.children.item(0);
                    parentAxis.removeChild(child);
                    var parentAxisParent = parentAxis.parentElement;
                    parentAxisParent.replaceChild(child, parentAxis);
                }
            }
        }
        exports.workspace.paneDestroyed(this);
    };
    Pane.prototype.splitUp = function (arg) {
        return this.newPane('up', arg);
    };
    Pane.prototype.splitDown = function (arg) {
        return this.newPane('down', arg);
    };
    Pane.prototype.splitLeft = function (arg) {
        return this.newPane('left', arg);
    };
    Pane.prototype.splitRight = function (arg) {
        return this.newPane('right', arg);
    };
    Pane.prototype.newPane = function (id, arg) {
        var axis = document.createElement('atom-pane-axis');
        axis.className = id === 'left' || id === 'right' ? 'horizontal pane-row' : 'vertical pane-column';
        if (this.id === 'main-right') {
            axis.id = 'editor-tools-axis';
        }
        var parent = this.container.parentNode;
        if (!parent) {
            return null;
        }
        parent.replaceChild(axis, this.container);
        axis.appendChild(this.container);
        var result = new Pane(this.id + '-' + id, axis, this.workspace, arg);
        this.children.push(result);
        return result;
    };
    Pane.prototype.refreshTabs = function (activeItem) {
        var _this = this;
        this.tabs.innerHTML = "";
        this.items.forEach(function (item) {
            var tab = _this.tab(item);
            _this.tabs.appendChild(tab);
            var isActive = item === activeItem;
            item.element && (item.element.style.display = (isActive ? null : 'none'));
            isActive && tab.setActive();
            if (item === activeItem) {
                tab.setActive();
                if (item.element) {
                    item.element.style.display = null;
                }
                console.log("Active: " + item.getTitle());
            }
            else {
                if (item.element) {
                    item.element.style.display = 'none';
                }
                console.log("Inactive: " + item.getTitle());
            }
        });
        this.activeItem = activeItem;
    };
    Pane.prototype.tab = function (item) {
        var _this = this;
        var tab = document.createElement('li');
        tab.className = "tab sortable";
        tab.setActive = function () {
            tab.className = "tab sortable active";
        };
        tab.addEventListener('click', function (event) { return event.srcElement === tab ? _this.refreshTabs(item) : null; });
        var label = document.createElement('div');
        label.className = "title";
        label.innerText = item && item.getTitle ? item.getTitle() : "unknown";
        var closeIcon = document.createElement('div');
        closeIcon.className = "close-icon";
        closeIcon.addEventListener('click', function (event) {
            if (event.srcElement !== closeIcon) {
                event.preventDefault();
                return;
            }
            _this.destroyItem(item);
            if (_this.itemsCount() === 0) {
                _this.destroy();
            }
            event.preventDefault();
        });
        tab.appendChild(label);
        tab.appendChild(closeIcon);
        return tab;
    };
    Pane.prototype.itemsCount = function () {
        var count = 0;
        this.items.forEach(function (item) {
            count++;
        });
        return count;
    };
    Pane.prototype.addItem = function (item, index) {
        this.destroyItem(this.items[index]);
        this.items[index] = item;
        item.pane = this;
        this.views.appendChild(item.element);
        this.refreshTabs(item);
        if (!isMutationSupport) {
            item.element.dispatchEvent(new global.Event("DOMNodeInserted"));
        }
    };
    Pane.prototype.activate = function () {
    };
    return Pane;
}());
exports.Pane = Pane;
var TextBuffer = (function () {
    function TextBuffer(text) {
        this.text = '';
        this.didChangecallbacks = [];
        this.stopChangingCallbacks = [];
        this.text = text;
    }
    TextBuffer.prototype.onDidChange = function (callback) {
        this.didChangecallbacks.push(callback);
    };
    TextBuffer.prototype.getText = function () {
        return this.text;
    };
    TextBuffer.prototype.doChange = function (arg) {
        this.didChangecallbacks.forEach(function (callback) {
            var text = null;
            var lines = arg.lines;
            lines.forEach(function (line) {
                text = text === null ? line : (text + '\n' + line);
            });
            var cmd = {
                newText: arg.action === 'insert' ? text : '',
                oldText: arg.action === 'remove' ? text : '',
                newRange: null,
                oldRange: { start: (arg.start), end: arg.end }
            };
            callback(cmd);
        });
        this.doStopChanging(arg);
    };
    TextBuffer.prototype.doStopChanging = function (arg) {
        this.stopChangingCallbacks.forEach(function (callback) {
            callback(null);
        });
    };
    TextBuffer.prototype.onDidStopChanging = function (callback) {
        var _this = this;
        this.stopChangingCallbacks.push(callback);
        return {
            dispose: function () {
                _this.stopChangingCallbacks = _this.stopChangingCallbacks.filter(function (child) {
                    return child !== callback;
                });
            }
        };
    };
    return TextBuffer;
}());
exports.TextBuffer = TextBuffer;
var TextEditorCursor = (function () {
    function TextEditorCursor(editor) {
        this.changePositionCallbacks = [];
        this.editor = editor;
    }
    TextEditorCursor.prototype.onDidChangePosition = function (callback) {
        var _this = this;
        this.changePositionCallbacks.push(callback);
        return {
            dispose: function () {
                _this.changePositionCallbacks = _this.changePositionCallbacks.filter(function (child) {
                    return child !== callback;
                });
            }
        };
    };
    TextEditorCursor.prototype.getBufferPosition = function () {
        return this.editor.getCursorBufferPosition();
    };
    TextEditorCursor.prototype.doChangePosition = function () {
        this.changePositionCallbacks.forEach(function (callback) {
            callback();
        });
    };
    return TextEditorCursor;
}());
exports.TextEditorCursor = TextEditorCursor;
function getRange(row1, col1, row2, col2) {
    var point1 = { row: row1, column: col1 };
    var point2 = { row: row2, column: col2 };
    return (isCorrectOrder(point1, point2) ? { start: point1, end: point2 } : { start: point2, end: point1 });
}
function isCorrectOrder(point1, point2) {
    if (point1.row < point2.row) {
        return true;
    }
    if (point1.row > point2.row) {
        return false;
    }
    return point1.column < point2.column;
}
var TextEditor = (function () {
    function TextEditor(editorPath, id, resolver, getSuggestions) {
        if (id === void 0) { id = 'ace_editor'; }
        this.getSuggestions = getSuggestions;
        this.dirtyState = false;
        this.element = document.createElement('div');
        this.textElement = document.createElement('div');
        this.contextMenu = null;
        this.destroyCallbacks = [];
        this.grammar = {
            scopeName: 'no-grammar'
        };
        this.editorPath = editorPath;
        this.id = editorPath;
        var self = this;
        self['soft-tabs'] = {};
        this.restore(resolver);
        this.textElement.className = 'editor';
        this.textElement.style.position = 'relative';
        this.textElement.style.width = '100%';
        this.textElement.style.flex = '1';
        this.textElement.style.webkitFlex = '1';
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
        this.element.addEventListener('DOMNodeInserted', function (event) {
            if (textEditor.ace) {
                return;
            }
            textEditor.doAceSetup(ace);
        });
    }
    TextEditor.prototype.restore = function (resolver) {
        var text = resolver.content(this.editorPath);
        this.textBuffer = new TextBuffer(text);
    };
    TextEditor.prototype.doAceSetup = function (ace) {
        var _this = this;
        this.ace = ace;
        if (!ace) {
            return;
        }
        var aceEditor = ace.edit(this.textElement.id);
        var langTools = ace.require('ace/ext/language_tools');
        aceEditor.setTheme('ace/theme/tomorrow_night');
        langTools.setCompleters([]);
        aceEditor.getSession().setMode(this.getMode());
        aceEditor.setOptions({
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true
        });
        this.setAceEditor(aceEditor);
        if (this.extension === '.raml') {
            var AceCompleter = aceStuff.AceCompleter;
            langTools.addCompleter(new AceCompleter(this, {
                getSuggestions: function (request) {
                    return _this.getSuggestions ? _this.getSuggestions(request) : [];
                }
            }));
        }
    };
    TextEditor.prototype.getMode = function () {
        var AceMode = this.ace.require('ace/mode/text').Mode;
        var result = new AceMode();
        return result;
    };
    TextEditor.prototype.setAceEditor = function (aceEditor) {
        var _this = this;
        this.aceEditor = aceEditor;
        var textBuffer = this.getBuffer();
        textBuffer.characterIndexForPosition = function (position) {
            var result = aceEditor.getSession().getDocument().positionToIndex({ row: position.row, column: position.column }, 0);
            return result;
        };
        textBuffer.positionForCharacterIndex = function (index) {
            var result = aceEditor.getSession().getDocument().indexToPosition(index, 0);
            return result;
        };
        textBuffer.setTextInRange = function (range, value) {
            var AceRange = _this.ace.require("ace/range").Range;
            var preparedRange = getRange(range.start.row, range.start.column, range.end.row, range.end.column);
            var aceRange = new AceRange(preparedRange.start.row, preparedRange.start.column, preparedRange.end.row, preparedRange.end.column);
            aceEditor.getSession().replace(aceRange, value);
        };
        textBuffer.setText = function (text) {
            var top = _this.aceEditor.session.getScrollTop();
            _this.aceEditor.setValue(text, 100);
            _this.aceEditor.resize(true);
            _this.aceEditor.session.setScrollTop(top);
        };
        this.aceEditor.session.setValue(textBuffer.getText());
        var textEditor = this;
        var extension = this.extension;
        this.aceEditor.session.selection.on("changeCursor", function (event) {
            textEditor.getLastCursor().doChangePosition();
        });
        this.aceEditor.on('change', function (arg) {
            textBuffer.text = aceEditor.getValue();
            textBuffer.doChange(arg);
        });
    };
    TextEditor.prototype.getTitle = function () {
        return path.basename(this.editorPath);
    };
    TextEditor.prototype.onDidChangeCursorPosition = function (callback) {
        return this.getLastCursor().onDidChangePosition(callback);
    };
    TextEditor.prototype.doSave = function () {
    };
    TextEditor.prototype.getPath = function () {
        return this.editorPath;
    };
    TextEditor.prototype.getBuffer = function () {
        return this.textBuffer;
    };
    TextEditor.prototype.getLastCursor = function () {
        if (!this.cursor) {
            this.cursor = new TextEditorCursor(this);
        }
        return this.cursor;
    };
    TextEditor.prototype.getCursorBufferPosition = function () {
        var acePosition = this.aceEditor.getCursorPosition();
        return { column: acePosition.column, row: acePosition.row };
    };
    TextEditor.prototype.setCursorBufferPosition = function (position) {
        this.setSelectedBufferRange({ start: position, end: position }, null);
    };
    TextEditor.prototype.setSelectedBufferRange = function (range, arg) {
        var AceRange = this.ace.require("ace/range").Range;
        var preparedRange = getRange(range.start.row + 1, range.start.column, range.end.row + 1, range.end.column);
        var aceRange = new AceRange(preparedRange.start.row, preparedRange.start.column, preparedRange.end.row, preparedRange.end.column);
        this.aceEditor.resize(true);
        this.aceEditor.selection.setRange(aceRange);
        this.aceEditor.gotoLine(preparedRange.start.row, preparedRange.start.column, true);
    };
    TextEditor.prototype.getText = function () {
        return this.getBuffer().getText();
    };
    TextEditor.prototype.setText = function (text) {
        this.getBuffer().setText(text);
    };
    TextEditor.prototype.insertText = function (text) {
        this.aceEditor.insert(text);
    };
    TextEditor.prototype.getGrammar = function () {
        return this.grammar;
    };
    TextEditor.prototype.onDidStopChanging = function (callback) {
        return this.textBuffer.onDidStopChanging(callback);
    };
    TextEditor.prototype.onDidDestroy = function (callback) {
        var _this = this;
        this.destroyCallbacks.push(callback);
        return {
            dispose: function () {
                _this.destroyCallbacks = _this.destroyCallbacks.filter(function (child) {
                    return child !== callback;
                });
            }
        };
    };
    TextEditor.prototype.onDidChangePath = function (callback) {
        return {
            dispose: function () { }
        };
    };
    TextEditor.prototype.destroy = function () {
        this.destroyCallbacks.forEach(function (callback) { return callback(); });
    };
    return TextEditor;
}());
exports.TextEditor = TextEditor;
function getActionsTree(actions) {
    var actionsTree = {
        children: [],
        categories: {}
    };
    actions.forEach(function (action) {
        if (action.category && action.category.length > 0) {
            var current = actionsTree;
            for (var i = 0; i < action.category.length; i++) {
                var name = action.category[i];
                if (!current.categories[name]) {
                    var newCategory = { title: name, children: [], categories: {} };
                    current.categories[name] = newCategory;
                    current.children.push(newCategory);
                }
                current = current.categories[action.category[i]];
            }
            current.children.push(actionToItem(action));
        }
        else {
            actionsTree.children.push(actionToItem(action));
        }
    });
    return actionsTree.children;
}
function actionToItem(action) {
    return {
        title: action.name,
        action: action.onClick ? action.onClick : function () { },
        uiIcon: null
    };
}
function areMutationEventsAvailable() {
    var result = false;
    var testElement = document.createElement('div');
    testElement.addEventListener('DOMNodeInserted', function () {
        result = true;
    });
    document.body.appendChild(testElement);
    document.body.removeChild(testElement);
    return result;
}
function isSimpleMode() {
    try {
        return global.atomMode === 'spec' || global.atomMode === 'newSpec';
    }
    catch (exception) {
        return false;
    }
}
exports.config = {
    grammars: {
        'api-workbench.grammars': ['source.raml']
    },
    get: function (key) {
        return this.grammars[key];
    }
};
exports.views = {
    documentPollers: []
};
exports.grammars = {
    grammarsByScopeName: {
        'text.xml': { scopeName: 'text.xml', fileTypes: ['xml'] },
        'source.json': { scopeName: 'source.json', fileTypes: ['json'] },
        'text.plain.null-grammar': { scopeName: 'text.plain.null-grammar', fileTypes: [] }
    },
    getGrammars: function () {
        var _this = this;
        var result = [];
        Object.keys(this.grammarsByScopeName).forEach(function (key) {
            result.push(_this.grammarsByScopeName[key]);
        });
        return result;
    }
};
exports.commands = { add: function () { } };
exports.styles = {
    emitter: {
        handlersByEventName: {
            'did-add-style-element': function () {
            },
            'did-remove-style-element': function () {
            },
            'did-update-style-element': function () {
            }
        }
    }
};
function getGlobal() {
    var globalGetter = function () {
        return this;
    };
    return globalGetter.apply(null);
}
function getWorkspace() {
    if (exports.workspace) {
        return exports.workspace;
    }
    exports.workspace = new Workspace();
    return exports.workspace;
}
exports.getWorkspace = getWorkspace;
window.remote = { require: function () { return new Object(); } };
//# sourceMappingURL=atomWrapperWeb.js.map