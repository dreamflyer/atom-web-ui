export declare class AtomTextEditorModel {
    owner: HTMLDivElement;
    input: HTMLDivElement | HTMLInputElement | HTMLTextAreaElement;
    emitter: any;
    grammarId: string;
    mini: boolean;
    constructor(owner: HTMLDivElement);
    setSoftWrapped(arg: boolean): void;
    setPlaceholderText(text: string): void;
    setGrammar(grammar: any): void;
    setText(text: string): void;
    getText(): string;
    updateInput(): void;
    createInputElement(): void;
    getAceEditor(element: any): any;
    getAce(): any;
    getMode(): any;
    getCursorBufferPosition(): any;
    isXml(): boolean;
    isJson(): boolean;
    isNoGrammar(): boolean;
    isMini(): boolean;
}
