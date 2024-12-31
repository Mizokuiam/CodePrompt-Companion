import * as vscode from 'vscode';
import { PromptProvider } from './promptProvider';
import { PromptsManager } from './data/promptsManager';
import { TemplateService } from './services/templateService';
import { SearchService } from './services/searchService';
import { AnalyticsService } from './services/analyticsService';
import { Prompt } from './types';
import { FavoritesProvider } from './providers/favoritesProvider';
import { HistoryProvider } from './providers/historyProvider';
import { AIService } from './services/aiService';

export function activate(context: vscode.ExtensionContext) {
    const promptsManager = PromptsManager.getInstance(context);
    const promptProvider = new PromptProvider(context);
    const favoritesProvider = new FavoritesProvider(context);
    const historyProvider = new HistoryProvider(context);
    const templateService = TemplateService.getInstance(context);
    const searchService = SearchService.getInstance();
    const analyticsService = AnalyticsService.getInstance(context);
    const aiService = AIService.getInstance();

    // Register the TreeDataProviders
    vscode.window.registerTreeDataProvider('promptSuggestions', promptProvider);
    vscode.window.registerTreeDataProvider('promptFavorites', favoritesProvider);
    vscode.window.registerTreeDataProvider('promptHistory', historyProvider);

    // Register commands
    let refreshCommand = vscode.commands.registerCommand('codeprompt-companion.refreshSuggestions', () => {
        promptProvider.refresh();
    });

    let addCustomPromptCommand = vscode.commands.registerCommand('codeprompt-companion.addCustomPrompt', async () => {
        const label = await vscode.window.showInputBox({
            placeHolder: 'Enter prompt title',
            prompt: 'Enter prompt title'
        });

        if (label) {
            const text = await vscode.window.showInputBox({
                placeHolder: 'Enter prompt text',
                prompt: 'Enter prompt text'
            });

            if (text) {
                const categories = ['html', 'css', 'javascript', 'react', 'performance', 'accessibility', 'seo'];
                const category = await vscode.window.showQuickPick(categories, {
                    placeHolder: 'Select a category'
                });

                if (category) {
                    const prompt: Omit<Prompt, 'id'> = {
                        label,
                        text,
                        category,
                        tags: [],
                        language: vscode.window.activeTextEditor?.document.languageId || 'plaintext',
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    };
                    promptsManager.addPrompt(prompt);
                    promptProvider.refresh();
                }
            }
        }
    });

    let copyPromptCommand = vscode.commands.registerCommand('codeprompt-companion.copyPrompt', async (text: string) => {
        if (!text) {
            vscode.window.showErrorMessage('No prompt text to copy');
            return;
        }
        
        try {
            await vscode.env.clipboard.writeText(text);
            vscode.window.showInformationMessage('Prompt copied to clipboard');
            
            // Track usage
            const promptsManager = PromptsManager.getInstance(context);
            const analyticsService = AnalyticsService.getInstance(context);
            const prompt = promptsManager.getPrompts().find(p => p.text === text);
            
            if (prompt) {
                analyticsService.trackPromptUsage(prompt.id, prompt.category);
            }
        } catch (error) {
            vscode.window.showErrorMessage('Failed to copy prompt to clipboard');
        }
    });

    let toggleFavoriteCommand = vscode.commands.registerCommand('codeprompt-companion.toggleFavorite', async (item: vscode.TreeItem) => {
        if (!item || !(item as any).prompt) {
            vscode.window.showErrorMessage('No prompt selected');
            return;
        }

        const prompt = (item as any).prompt;
        const promptsManager = PromptsManager.getInstance(context);
        
        // Toggle favorite status
        promptsManager.toggleFavorite(prompt.id);

        // Refresh all views
        promptProvider.refresh();
        favoritesProvider.refresh();
        
        // Show feedback
        const message = prompt.isFavorite ? 'Removed from favorites' : 'Added to favorites';
        vscode.window.showInformationMessage(message);
    });

    let createTemplateCommand = vscode.commands.registerCommand('codeprompt-companion.createTemplate', async () => {
        const name = await vscode.window.showInputBox({
            placeHolder: 'Enter template name',
            prompt: 'Enter template name'
        });

        if (name) {
            const content = await vscode.window.showInputBox({
                placeHolder: 'Enter template content with variables like ${variable}',
                prompt: 'Enter template content'
            });

            if (content) {
                const description = await vscode.window.showInputBox({
                    placeHolder: 'Enter template description',
                    prompt: 'Enter template description'
                });

                if (description) {
                    const variables = templateService.extractVariables(content);
                    const template = {
                        name,
                        description,
                        content,
                        variables,
                        createdAt: Date.now()
                    };

                    templateService.addTemplate(template);
                    vscode.window.showInformationMessage('Template created successfully');
                    promptProvider.refresh();
                }
            }
        }
    });

    let searchPromptsCommand = vscode.commands.registerCommand('codeprompt-companion.searchPrompts', async () => {
        const searchTerm = await vscode.window.showInputBox({
            placeHolder: 'Search prompts...',
            prompt: 'Enter search term'
        });

        if (searchTerm) {
            const prompts = promptsManager.getPrompts();
            const results = searchService.searchPrompts(prompts, searchTerm);
            if (results.length > 0) {
                const selected = await vscode.window.showQuickPick(
                    results.map(prompt => ({
                        label: prompt.label || 'Unnamed Prompt',
                        description: prompt.category,
                        detail: prompt.text,
                        prompt
                    })),
                    {
                        placeHolder: 'Select a prompt'
                    }
                );

                if (selected) {
                    await vscode.env.clipboard.writeText(selected.prompt.text || '');
                    vscode.window.showInformationMessage('Prompt copied to clipboard');
                    analyticsService.trackPromptUsage(selected.prompt.id, selected.prompt.category);
                }
            } else {
                vscode.window.showInformationMessage('No prompts found');
            }
        }
    });

    let showAnalyticsCommand = vscode.commands.registerCommand('codeprompt-companion.showAnalytics', () => {
        const panel = vscode.window.createWebviewPanel(
            'promptAnalytics',
            'Prompt Analytics',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        const analytics = analyticsService.getAnalytics();
        panel.webview.html = getAnalyticsWebviewContent(analytics);
    });

    let editPromptCommand = vscode.commands.registerCommand('codeprompt-companion.editPrompt', async (prompt: Prompt) => {
        const label = await vscode.window.showInputBox({
            value: prompt.label,
            placeHolder: 'Enter prompt title',
            prompt: 'Enter prompt title'
        });

        if (label) {
            const text = await vscode.window.showInputBox({
                value: prompt.text,
                placeHolder: 'Enter prompt text',
                prompt: 'Enter prompt text'
            });

            if (text) {
                const categories = ['html', 'css', 'javascript', 'react', 'performance', 'accessibility', 'seo'];
                const category = await vscode.window.showQuickPick(categories, {
                    placeHolder: 'Select a category'
                });

                if (category) {
                    promptsManager.editPrompt(prompt.id, {
                        label,
                        text,
                        category,
                        updatedAt: Date.now()
                    });
                    promptProvider.refresh();
                    analyticsService.trackPromptUsage(prompt.id, category);
                }
            }
        }
    });

    let deletePromptCommand = vscode.commands.registerCommand('codeprompt-companion.deletePrompt', async (treeItem: any) => {
        if (!treeItem || !treeItem.prompt) {
            vscode.window.showErrorMessage('No prompt selected for deletion');
            return;
        }

        const result = await vscode.window.showWarningMessage(
            'Are you sure you want to delete this prompt?',
            { modal: true },
            'Yes',
            'No'
        );

        if (result === 'Yes') {
            promptsManager.deletePrompt(treeItem.prompt.id);
            promptProvider.refresh();
            vscode.window.showInformationMessage('Prompt deleted successfully');
        }
    });

    let exportPromptsCommand = vscode.commands.registerCommand('codeprompt-companion.exportPrompts', async () => {
        const uri = await vscode.window.showSaveDialog({
            filters: {
                'JSON files': ['json']
            },
            saveLabel: 'Export Prompts'
        });

        if (uri) {
            const success = await promptsManager.exportPrompts(uri.fsPath);
            if (success) {
                vscode.window.showInformationMessage('Prompts exported successfully');
            }
        }
    });

    let generateAIPromptCommand = vscode.commands.registerCommand('codeprompt-companion.generateAIPrompt', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        try {
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            const language = editor.document.languageId;

            const generatedPrompt = await aiService.generatePrompt({
                fileType: language,
                selection: text
            });
            
            if (generatedPrompt) {
                await vscode.env.clipboard.writeText(generatedPrompt);
                vscode.window.showInformationMessage('AI prompt generated and copied to clipboard');
                analyticsService.trackPromptUsage('ai-generated', 'ai');
            }
        } catch (error) {
            vscode.window.showErrorMessage('Failed to generate AI prompt');
        }
    });

    // Add commands to subscriptions
    context.subscriptions.push(
        refreshCommand,
        addCustomPromptCommand,
        copyPromptCommand,
        toggleFavoriteCommand,
        showAnalyticsCommand,
        createTemplateCommand,
        searchPromptsCommand,
        editPromptCommand,
        deletePromptCommand,
        exportPromptsCommand,
        generateAIPromptCommand
    );
}

function getAnalyticsWebviewContent(analytics: any): string {
    const totalUsage = Object.values(analytics.usageCount || {})
        .reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);

    const uniquePrompts = Object.keys(analytics.usageCount || {}).length;
    const categoriesUsed = Object.keys(analytics.categoryUsage || {}).length;
        
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CodePrompt Companion Analytics</title>
        <style>
            body {
                padding: 20px;
                color: var(--vscode-foreground);
                font-family: var(--vscode-font-family);
            }
            .card {
                background: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 6px;
                padding: 16px;
                margin-bottom: 16px;
            }
            h2 {
                margin-top: 0;
                color: var(--vscode-editor-foreground);
            }
            ul {
                list-style: none;
                padding: 0;
            }
            li {
                padding: 8px 0;
                display: flex;
                justify-content: space-between;
            }
            .stat {
                font-size: 24px;
                font-weight: bold;
                color: var(--vscode-textLink-foreground);
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>📊 Usage Statistics</h2>
            <ul>
                <li>
                    <span>Total Prompts Used</span>
                    <span class="stat">${totalUsage}</span>
                </li>
                <li>
                    <span>Unique Prompts Used</span>
                    <span class="stat">${uniquePrompts}</span>
                </li>
                <li>
                    <span>Categories Used</span>
                    <span class="stat">${categoriesUsed}</span>
                </li>
            </ul>
        </div>
    </body>
    </html>`;
}

export function deactivate() {}
