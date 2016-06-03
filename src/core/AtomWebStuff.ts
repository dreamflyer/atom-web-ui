export class AtomTextEditorModel {
    owner: HTMLDivElement;

    input: HTMLDivElement | HTMLInputElement | HTMLTextAreaElement;

    emitter: any = {
        handlersByEventName: {

        }
    }

    grammarId: string = 'no-grammar';

    mini: boolean;
    
    constructor(owner: HTMLDivElement) {
        this.owner = owner;

        this.emitter.handlersByEventName['did-change'] = [function(event: any) {
            console.log('"did-change" event handled by atom-text-editor');
        }];

        (<any>owner).model = this;
    }

    setSoftWrapped(arg: boolean) {

    }

    setPlaceholderText(text: string) {
        if(this.input) {
            (<any>this).input.placeholder = text;
        }
    }

    setGrammar(grammar: any) {
        (<any>this).owner.grammar = grammar;

        this.grammarId = grammar ? (grammar.scopeName ? grammar.scopeName : 'no-grammar') : 'no-grammar';

        this.updateInput();
    }

    setText(text: string) {
        this.updateInput();

        (<any>this).input.value = text;
    }

    getText(): string {
        this.updateInput();

        return (<any>this).input.value;
    }

    updateInput() {
        var inputElementChanged = false;

        if(!this.input ) {
            inputElementChanged = true;
        } else if((<any>this).input.grammarId !== this.grammarId) {
            inputElementChanged = true;
        } else if(this.isMini() !== (<any>this).input.mini) {
            inputElementChanged = true;
        }

        if(inputElementChanged) {
            this.createInputElement();
        }
    }

    createInputElement(): void {
        var oldInput = (<any>this).input;

        if(this.isXml() || this.isJson()) {
            var input = document.createElement('div');

            var aceEditor: any = this.getAceEditor(input);

            this.input = input;

            aceEditor.on('change', (event: any) => {
                input.oninput(event);
            });

            Object.defineProperty(input, 'value', {
                set: value => aceEditor.setValue(value),

                get: () => aceEditor.getValue()
            });
        } else {
            (<any>this).input = document.createElement(this.isMini() ? 'input' : 'textarea');
        }

        (<any>this).input.style.width = '100%';
        (<any>this).input.style.height = this.isMini() ? 'auto' : '100%';
        (<any>this).input.style.backgroundColor = '#1b1d23';
        (<any>this).input.style.border = "0px";

        if(oldInput) {
            (<any>this).input.value = oldInput.value;
        }

        this.owner.innerHTML = '';

        this.owner.appendChild(this.input);

        (<any>this).input.grammarId = this.grammarId;
        (<any>this).input.mini = this.isMini();

        var timeoutId: any;

        (<any>this).input.oninput = (event: any) => {
            if(timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                if(this.emitter.handlersByEventName['did-change']) {
                    this.emitter.handlersByEventName['did-change'].forEach((handler: any) => {
                        handler(event);
                    });
                }
            }, 100);
        }
    }

    getAceEditor(element: any): any {
        var ace = this.getAce();

        var aceEditor: any = ace.edit(element);

        var langTools: any = ace.require('ace/ext/language_tools');

        aceEditor.setTheme('ace/theme/tomorrow_night');

        langTools.setCompleters([]);

        aceEditor.getSession().setMode(this.getMode());

        aceEditor.getSession().off("change", aceEditor.renderer.$gutterLayer.$updateAnnotations);

        aceEditor.setOptions({
            enableBasicAutocompletion: false,

            enableLiveAutocompletion: false
        });

        aceEditor.getSession().setUseWorker(false);

        return aceEditor;
    }

    getAce(): any {
        return eval('ace');
    }

    getMode(): any {
        var ace = this.getAce();

        var modeName: string = this.isXml() ? 'ace/mode/xml' : 'ace/mode/json';

        var AceMode = ace.require(modeName).Mode;

        var result = new AceMode();

        return result;
    }

    getCursorBufferPosition(): any {
        return {row: 0, column: this.input ? (<any>this).input.value.length : 0};
    }

    isXml() {
        return this.grammarId === 'text.xml' ? true : false;
    }

    isJson(): boolean {
        return this.grammarId === 'source.json' ? true : false;
    }

    isNoGrammar(): boolean {
        return this.grammarId === 'no-grammar' ? true : false;
    }

    isMini(): boolean {
        return this.mini ? true : false;
    }
}