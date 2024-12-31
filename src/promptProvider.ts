import * as vscode from 'vscode';
import * as path from 'path';
import { Prompt, PromptsManager } from './data/promptsManager';
import { ConfigManager } from './config/configManager';

export class PromptTreeItem extends vscode.TreeItem {
    constructor(
        public readonly prompt: Prompt,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(prompt.label, collapsibleState);
        this.tooltip = prompt.text;
        this.description = this.getDescription();
        this.contextValue = 'prompt';
        this.command = {
            command: 'codeprompt-companion.copyPrompt',
            title: 'Copy Prompt',
            arguments: [prompt.text]
        };
        this.iconPath = this.getIcon();
    }

    private getDescription(): string {
        return Array.isArray(this.prompt.tags) ? this.prompt.tags.join(', ') : '';
    }

    private getIcon(): { light: vscode.Uri; dark: vscode.Uri } {
        const iconName = this.getIconName();
        return {
            light: vscode.Uri.file(path.join(__dirname, '..', 'resources', 'light', `${iconName}.svg`)),
            dark: vscode.Uri.file(path.join(__dirname, '..', 'resources', 'dark', `${iconName}.svg`))
        };
    }

    private getIconName(): string {
        switch (this.prompt.category) {
            case 'html': return 'html';
            case 'css': return 'css';
            case 'javascript': return 'javascript';
            case 'react': return 'react';
            case 'performance': return 'performance';
            case 'accessibility': return 'accessibility';
            case 'seo': return 'seo';
            default: return 'default';
        }
    }
}

export class CategoryTreeItem extends vscode.TreeItem {
    constructor(
        public readonly category: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(category, collapsibleState);
        this.contextValue = 'category';
        this.iconPath = {
            light: vscode.Uri.file(path.join(__dirname, '..', 'resources', 'light', `${category}.svg`)),
            dark: vscode.Uri.file(path.join(__dirname, '..', 'resources', 'dark', `${category}.svg`))
        };
    }
}

export class PromptProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
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

        const config = ConfigManager.getInstance();
        const promptsManager = PromptsManager.getInstance(this.context);
        const prompts = promptsManager.getPrompts();
        
        // Group prompts by category
        const groupedPrompts = prompts.reduce((acc, prompt) => {
            if (!acc[prompt.category]) {
                acc[prompt.category] = [];
            }
            acc[prompt.category].push(prompt);
            return acc;
        }, {} as { [key: string]: Prompt[] });

        // Sort categories
        const sortedCategories = Object.keys(groupedPrompts).sort();

        // Create tree items
        const items: vscode.TreeItem[] = [];

        // Add favorites section if enabled
        if (config.getFeatures().favorites) {
            const favoritePrompts = prompts.filter(p => p.isFavorite);
            if (favoritePrompts.length > 0) {
                const favoritesItem = new vscode.TreeItem('⭐ Favorites', vscode.TreeItemCollapsibleState.Expanded);
                favoritesItem.contextValue = 'category';
                items.push(favoritesItem);
                items.push(...this.createPromptItems(favoritePrompts));
            }
        }

        // Add categories and their prompts
        for (const category of sortedCategories) {
            const categoryItem = new vscode.TreeItem(
                this.formatCategoryLabel(category),
                vscode.TreeItemCollapsibleState.Collapsed
            );
            categoryItem.contextValue = 'category';
            items.push(categoryItem);
            items.push(...this.createPromptItems(groupedPrompts[category]));
        }

        return items;
    }

    private formatCategoryLabel(category: string): string {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    private createPromptItems(prompts: Prompt[]): vscode.TreeItem[] {
        const sortOrder = ConfigManager.getInstance().getSortOrder();
        
        // Sort prompts based on configuration
        const sortedPrompts = [...prompts].sort((a, b) => {
            switch (sortOrder) {
                case 'mostUsed':
                    return (b.useCount || 0) - (a.useCount || 0);
                case 'recentlyUsed':
                    return (b.lastUsed || 0) - (a.lastUsed || 0);
                default:
                    // Add null check for labels
                    const labelA = a.label || '';
                    const labelB = b.label || '';
                    return labelA.localeCompare(labelB);
            }
        });

        return sortedPrompts.map(prompt => {
            const treeItem = new vscode.TreeItem(prompt.label || 'Unnamed Prompt');
            treeItem.command = {
                command: 'codeprompt-companion.copyPrompt',
                title: 'Copy Prompt',
                arguments: [prompt.text || '']
            };
            treeItem.tooltip = new vscode.MarkdownString(prompt.text || '');
            treeItem.contextValue = 'prompt';
            treeItem.description = prompt.isFavorite ? '⭐' : '';

            // Store the prompt data for use in commands
            (treeItem as any).prompt = prompt;

            return treeItem;
        });
    }
}
