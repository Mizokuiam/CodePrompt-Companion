import * as vscode from 'vscode';
import { AnalyticsService } from '../services/analyticsService';
import { PromptsManager } from '../data/promptsManager';

export class HistoryProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        if (element) {
            return [];
        }

        const analyticsService = AnalyticsService.getInstance(this.context);
        const promptsManager = PromptsManager.getInstance(this.context);
        const analytics = analyticsService.getAnalytics() as any;
        const prompts = promptsManager.getPrompts();

        // Get recently used prompts with timestamps
        const recentlyUsedWithTimestamps = prompts
            .map(prompt => ({
                prompt,
                lastUsed: analytics?.usageCount?.[prompt.id] ? Date.now() - (analytics.usageCount[prompt.id] * 1000) : 0
            }))
            .sort((a, b) => b.lastUsed - a.lastUsed)
            .slice(0, 10);

        return recentlyUsedWithTimestamps.map(({ prompt, lastUsed }) => {
            const treeItem = new vscode.TreeItem(prompt.label || 'Unnamed Prompt');
            treeItem.command = {
                command: 'codeprompt-companion.copyPrompt',
                title: 'Copy Prompt',
                arguments: [prompt.text || '']
            };
            treeItem.tooltip = new vscode.MarkdownString(prompt.text || '');
            treeItem.description = `Last used: ${new Date(lastUsed).toLocaleDateString()}`;
            treeItem.contextValue = 'prompt';
            treeItem.iconPath = new vscode.ThemeIcon('history');
            return treeItem;
        });
    }
}
