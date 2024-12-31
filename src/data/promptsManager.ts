import * as vscode from 'vscode';
import * as fs from 'fs';
import { defaultPrompts } from './defaultPrompts';
import { Prompt as BasePrompt } from '../types';

export type Prompt = BasePrompt & { isFavorite: boolean };

export class PromptsManager {
    private static instance: PromptsManager;
    private context: vscode.ExtensionContext;
    private customPrompts: Prompt[] = [];

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.loadCustomPrompts();
    }

    public static getInstance(context: vscode.ExtensionContext): PromptsManager {
        if (!PromptsManager.instance) {
            PromptsManager.instance = new PromptsManager(context);
        }
        return PromptsManager.instance;
    }

    private loadCustomPrompts() {
        const savedPrompts = this.context.globalState.get<Prompt[]>('customPrompts', []);
        this.customPrompts = savedPrompts.map(p => ({
            ...p,
            createdAt: p.createdAt || Date.now(),
            updatedAt: p.updatedAt || Date.now()
        }));
    }

    private saveCustomPrompts() {
        this.context.globalState.update('customPrompts', this.customPrompts);
    }

    public addPrompt(prompt: Omit<Prompt, 'id' | 'isFavorite'>) {
        const newPrompt: Prompt = {
            ...prompt,
            id: Date.now().toString(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isFavorite: false
        };
        this.customPrompts.push(newPrompt);
        this.saveCustomPrompts();
    }

    public editPrompt(id: string, updatedPrompt: Partial<Prompt>) {
        const index = this.customPrompts.findIndex(p => p.id === id);
        if (index !== -1) {
            this.customPrompts[index] = {
                ...this.customPrompts[index],
                ...updatedPrompt,
                updatedAt: Date.now()
            };
            this.saveCustomPrompts();
        }
    }

    public deletePrompt(id: string) {
        const index = this.customPrompts.findIndex(p => p.id === id);
        if (index !== -1) {
            this.customPrompts.splice(index, 1);
            this.saveCustomPrompts();
        }
    }

    public getPrompts(): Prompt[] {
        const allPrompts = [...defaultPrompts, ...this.customPrompts];
        
        // Load favorite status from storage
        const favoriteIds = this.context.globalState.get<string[]>('favoritePrompts', []);
        return allPrompts.map(prompt => ({
            ...prompt,
            isFavorite: favoriteIds.includes(prompt.id)
        }));
    }

    public toggleFavorite(id: string) {
        const favoriteIds = this.context.globalState.get<string[]>('favoritePrompts', []);
        const newFavoriteIds = favoriteIds.includes(id)
            ? favoriteIds.filter(fid => fid !== id)
            : [...favoriteIds, id];
        
        this.context.globalState.update('favoritePrompts', newFavoriteIds);
    }

    public async exportPrompts(filePath: string): Promise<boolean> {
        try {
            const data = JSON.stringify(this.customPrompts, null, 2);
            fs.writeFileSync(filePath, data);
            return true;
        } catch (error) {
            vscode.window.showErrorMessage('Failed to export prompts: ' + error);
            return false;
        }
    }

    public async importPrompts(filePath: string): Promise<boolean> {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            const prompts = JSON.parse(data) as Prompt[];
            
            // Validate imported prompts
            const validPrompts = prompts.filter(p => 
                p.id && p.label && p.text && p.category && Array.isArray(p.tags)
            );

            if (validPrompts.length !== prompts.length) {
                vscode.window.showWarningMessage('Some prompts were invalid and were not imported');
            }

            this.customPrompts.push(...validPrompts);
            this.saveCustomPrompts();
            return true;
        } catch (error) {
            vscode.window.showErrorMessage('Failed to import prompts: ' + error);
            return false;
        }
    }
}
