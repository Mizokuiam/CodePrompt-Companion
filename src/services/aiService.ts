import * as vscode from 'vscode';
import fetch from 'node-fetch';

interface CompletionResponse {
    choices: {
        text?: string;
        message?: {
            content: string;
        };
    }[];
}

export class AIService {
    private static instance: AIService;

    private constructor() {}

    public static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    private async validateConfig(): Promise<boolean> {
        const apiKey = vscode.workspace.getConfiguration('codeprompt-companion').get<string>('ai.apiKey');
        if (!apiKey) {
            vscode.window.showErrorMessage('OpenAI API key not configured. Please set it in the extension settings.');
            return false;
        }
        return true;
    }

    private async makeOpenAIRequest(prompt: string, type: 'completion' | 'chat'): Promise<string> {
        if (!await this.validateConfig()) {
            return '';
        }

        const apiKey = vscode.workspace.getConfiguration('codeprompt-companion').get<string>('ai.apiKey');
        const model = vscode.workspace.getConfiguration('codeprompt-companion').get<string>('ai.model', 'gpt-3.5-turbo');
        const temperature = vscode.workspace.getConfiguration('codeprompt-companion').get<number>('ai.temperature', 0.7);
        const maxTokens = vscode.workspace.getConfiguration('codeprompt-companion').get<number>('ai.maxTokens', 150);

        const endpoint = type === 'chat' 
            ? 'https://api.openai.com/v1/chat/completions'
            : 'https://api.openai.com/v1/completions';

        const body = type === 'chat' ? {
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens: maxTokens
        } : {
            model,
            prompt,
            temperature,
            max_tokens: maxTokens
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.statusText}`);
            }

            const data = await response.json() as CompletionResponse;
            return type === 'chat' 
                ? data.choices[0]?.message?.content || ''
                : data.choices[0]?.text || '';

        } catch (error) {
            vscode.window.showErrorMessage(`Error calling OpenAI API: ${error}`);
            return '';
        }
    }

    public async generatePrompt(context: { 
        fileType: string; 
        selection?: string; 
        description?: string;
    }): Promise<string | null> {
        if (!await this.validateConfig()) {
            vscode.window.showErrorMessage('AI features are not enabled or API key is missing');
            return null;
        }

        try {
            const prompt = `Generate a coding prompt for ${context.fileType} with the following description: ${context.description}`;
            const response = await this.makeOpenAIRequest(prompt, 'chat');
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage('Failed to generate prompt: ' + errorMessage);
            return null;
        }
    }

    public async improvePrompt(prompt: string): Promise<string | null> {
        if (!await this.validateConfig()) {
            vscode.window.showErrorMessage('AI features are not enabled or API key is missing');
            return null;
        }

        try {
            const response = await this.makeOpenAIRequest(`Improve this prompt: ${prompt}`, 'chat');
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage('Failed to improve prompt: ' + errorMessage);
            return null;
        }
    }

    public async suggestTags(prompt: string): Promise<string[] | null> {
        if (!await this.validateConfig()) {
            vscode.window.showErrorMessage('AI features are not enabled or API key is missing');
            return null;
        }

        try {
            const response = await this.makeOpenAIRequest(`Suggest tags for this prompt: ${prompt}`, 'chat');
            return response.split(',').map(tag => tag.trim());
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage('Failed to suggest tags: ' + errorMessage);
            return null;
        }
    }

    public async categorizePrompt(prompt: string): Promise<string | null> {
        if (!await this.validateConfig()) {
            vscode.window.showErrorMessage('AI features are not enabled or API key is missing');
            return null;
        }

        try {
            const response = await this.makeOpenAIRequest(`Categorize this prompt: ${prompt}`, 'chat');
            return response.trim().toLowerCase();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage('Failed to categorize prompt: ' + errorMessage);
            return null;
        }
    }
}
