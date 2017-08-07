export declare class Workspace {
    textEditor: TextEditor;
    rootPane: Pane;
    pane: Pane;
    container: HTMLDivElement;
    updateEverythingCallbacks: any[];
    editorsCache: any;
    popup: HTMLElement;
    modalPanel: HTMLElement;
    editors: {};
    didDestroyPaneCallbacks: any[];
    constructor();
    getDescriptors(): any;
    initUI(): void;
    initHTML(): void;
    clear(): void;
    doUpdate(): void;
    addModalPanel(itemHolder: any): {
        destroy: () => void;
    };
    bottomPanel: HTMLElement;
    bottomPane: HTMLElement;
    addBottomPanel(itemHolder: any): {
        destroy: () => void;
    };
    private registerElement(name, prototype, ext?);
    getActiveTextEditor(): TextEditor;
    getTextEditors(): TextEditor[];
    onDidChangeActivePaneItem(callback: (arg: any) => void): {
        dispose: () => void;
    };
    onDidAddPaneItem(callback: any): void;
    onDidDestroyPane(callback: any): void;
    getActivePane(): Pane;
    setActivePane(pane: Pane): void;
    doCache(key: string, content: string): void;
    getFromCache(key: string): string;
    paneForItem(item: any): any;
    paneDestroyed(pane: Pane): void;
    getPaneItems(pane?: Pane): any[];
    getActivePaneItem(): any;
    paneForURI(uri: string): any;
    observeTextEditors(callback: any): any;
}
export declare class Pane {
    items: any;
    id: string;
    workspace: Workspace;
    arg: any;
    container: HTMLDivElement;
    views: HTMLDivElement;
    tabs: HTMLUListElement;
    activeItem: any;
    children: Pane[];
    destroyed: boolean;
    constructor(id: string, parentNode: HTMLDivElement, workspace: Workspace, arg: any);
    destroyItem(item: any): boolean;
    destroy(): void;
    splitUp(arg: any): Pane;
    splitDown(arg: any): Pane;
    splitLeft(arg: any): Pane;
    splitRight(arg: any): Pane;
    newPane(id: string, arg: any): Pane;
    private refreshTabs(activeItem);
    private tab(item);
    private itemsCount();
    addItem(item: any, index: number): void;
    activate(): void;
}
export interface Point {
    row: number;
    column: number;
}
export interface Range {
    start: Point;
    end: Point;
}
export declare class TextBuffer {
    text: string;
    didChangecallbacks: any[];
    stopChangingCallbacks: any[];
    constructor(text: string);
    onDidChange(callback: any): void;
    getText(): string;
    doChange(arg: any): void;
    doStopChanging(arg: any): void;
    onDidStopChanging(callback: any): {
        dispose: () => void;
    };
    characterIndexForPosition: any;
    positionForCharacterIndex: any;
    setTextInRange: any;
}
export declare class TextEditorCursor {
    editor: TextEditor;
    changePositionCallbacks: any[];
    constructor(editor: TextEditor);
    onDidChangePosition(callback: any): {
        dispose: () => void;
    };
    getBufferPosition(): Point;
    doChangePosition(): void;
}
export declare class TextEditor {
    private getSuggestions;
    textBuffer: TextBuffer;
    editorPath: string;
    extension: string;
    dirtyState: boolean;
    element: HTMLElement;
    textElement: HTMLElement;
    ace: any;
    aceEditor: any;
    cursor: TextEditorCursor;
    id: string;
    contextMenu: any;
    destroyCallbacks: any[];
    grammar: any;
    constructor(editorPath: string, id?: string, resolver?: any, getSuggestions?: any);
    restore(resolver: any): void;
    doAceSetup(ace: any): void;
    getMode(): any;
    setAceEditor(aceEditor: any): void;
    getTitle(): string;
    onDidChangeCursorPosition(callback: any): {
        dispose: () => void;
    };
    doSave(): void;
    getPath(): string;
    getBuffer(): any;
    getLastCursor(): TextEditorCursor;
    getCursorBufferPosition(): Point;
    setCursorBufferPosition(position: Point): void;
    setSelectedBufferRange(range: Range, arg: any): void;
    getText(): string;
    setText(text: string): void;
    insertText(text: string): void;
    getGrammar(): any;
    onDidStopChanging(callback: any): {
        dispose: () => void;
    };
    onDidDestroy(callback: any): {
        dispose: () => void;
    };
    onDidChangePath(callback: any): {
        dispose: () => void;
    };
    destroy(): void;
}
export declare var config: any;
export declare var views: any;
export declare var grammars: any;
export declare var commands: {
    add: () => void;
};
export declare var styles: any;
export declare var workspace: Workspace;
export declare function getWorkspace(): Workspace;
