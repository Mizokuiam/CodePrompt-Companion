import * as vscode from 'vscode';
import { PromptsManager } from '../data/promptsManager';

export class PromptProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
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

    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        const promptsManager = PromptsManager.getInstance(this.context);
        const allPrompts = promptsManager.getPrompts();

        // If no element is provided, show categories
        if (!element) {
            const categories = new Set(allPrompts.map(p => p.category));
            return Array.from(categories).map(category => {
                const treeItem = new vscode.TreeItem(category, vscode.TreeItemCollapsibleState.Collapsed);
                treeItem.contextValue = 'category';
                return treeItem;
            });
        }

        // If category is provided, show prompts in that category
        const categoryPrompts = allPrompts.filter(p => 
            p.category === element.label && !p.isFavorite
        );

        return categoryPrompts.map(prompt => {
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
