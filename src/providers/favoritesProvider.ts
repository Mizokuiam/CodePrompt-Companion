import * as vscode from 'vscode';
import { PromptsManager } from '../data/promptsManager';

export class FavoritesProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(_element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        const promptsManager = PromptsManager.getInstance(this.context);
        const allPrompts = promptsManager.getPrompts();
        const favoritePrompts = allPrompts.filter(p => p.isFavorite);

        return favoritePrompts.map(prompt => {
            const treeItem = new vscode.TreeItem(prompt.label);
            treeItem.description = prompt.category;
            treeItem.tooltip = prompt.text;
            treeItem.command = {
                command: 'codeprompt-companion.copyPrompt',
                title: 'Copy Prompt',
                arguments: [prompt]
            };
            treeItem.contextValue = 'prompt';
            (treeItem as any).prompt = prompt;
            return treeItem;
        });
    }
}
