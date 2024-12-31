import * as vscode from 'vscode';

export class CustomPromptItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly prompt: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = prompt;
        this.command = {
            command: 'codeprompt-companion.copyPrompt',
            title: 'Copy Prompt',
            arguments: [prompt]
        };
    }
}

export class CustomPromptsProvider implements vscode.TreeDataProvider<CustomPromptItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CustomPromptItem | undefined | null | void> = new vscode.EventEmitter<CustomPromptItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<CustomPromptItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private customPrompts: string[] = [];

    constructor(private context: vscode.ExtensionContext) {
        this.loadCustomPrompts();
    }

    getTreeItem(element: CustomPromptItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: CustomPromptItem): Thenable<CustomPromptItem[]> {
        if (element) {
            return Promise.resolve([]);
        }

        return Promise.resolve(
            this.customPrompts.map(prompt => 
                new CustomPromptItem(prompt.substring(0, 30) + '...', prompt)
            )
        );
    }

    addPrompt(prompt: string): void {
        this.customPrompts.push(prompt);
        this.saveCustomPrompts();
        this._onDidChangeTreeData.fire();
    }

    private loadCustomPrompts(): void {
        this.customPrompts = this.context.globalState.get('customPrompts', []);
    }

    private saveCustomPrompts(): void {
        this.context.globalState.update('customPrompts', this.customPrompts);
    }
}
