import * as vscode from 'vscode';
import { PromptTemplate } from '../types';

export class TemplateService {
    private static instance: TemplateService;
    private context: vscode.ExtensionContext;
    private templates: PromptTemplate[] = [];

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.loadTemplates();
    }

    public static getInstance(context: vscode.ExtensionContext): TemplateService {
        if (!TemplateService.instance) {
            TemplateService.instance = new TemplateService(context);
        }
        return TemplateService.instance;
    }

    private loadTemplates() {
        this.templates = this.context.globalState.get('promptTemplates', []);
    }

    private saveTemplates() {
        this.context.globalState.update('promptTemplates', this.templates);
    }

    public getTemplates(): PromptTemplate[] {
        return this.templates;
    }

    public getTemplate(id: string): PromptTemplate | undefined {
        return this.templates.find(t => t.id === id);
    }

    public addTemplate(template: Omit<PromptTemplate, 'id'>) {
        const newTemplate: PromptTemplate = {
            ...template,
            id: Date.now().toString()
        };
        this.templates.push(newTemplate);
        this.saveTemplates();
        return newTemplate;
    }

    public updateTemplate(id: string, template: Partial<PromptTemplate>) {
        const index = this.templates.findIndex(t => t.id === id);
        if (index !== -1) {
            this.templates[index] = { ...this.templates[index], ...template };
            this.saveTemplates();
            return true;
        }
        return false;
    }

    public deleteTemplate(id: string) {
        const index = this.templates.findIndex(t => t.id === id);
        if (index !== -1) {
            this.templates.splice(index, 1);
            this.saveTemplates();
            return true;
        }
        return false;
    }

    public async fillTemplate(text: string): Promise<string> {
        let result = text;
        const variables = this.extractVariables(text);

        for (const variable of variables) {
            let value: string | undefined;

            switch (variable) {
                case 'selection':
                    value = vscode.window.activeTextEditor?.document.getText(
                        vscode.window.activeTextEditor.selection
                    );
                    break;

                case 'fileName':
                    value = vscode.window.activeTextEditor?.document.fileName.split(/[\\/]/).pop();
                    break;

                case 'fileType':
                    value = vscode.window.activeTextEditor?.document.languageId;
                    break;

                case 'clipboard':
                    value = await vscode.env.clipboard.readText();
                    break;

                default:
                    value = await vscode.window.showInputBox({
                        prompt: `Enter value for ${variable}`,
                        placeHolder: `Value for ${variable}`
                    });
            }

            if (value !== undefined) {
                result = result.replace(new RegExp(`\\$\\{${variable}\\}`, 'g'), value);
            }
        }

        return result;
    }

    public extractVariables(text: string): string[] {
        const regex = /\$\{([^}]+)\}/g;
        const variables: string[] = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
            variables.push(match[1]);
        }

        return [...new Set(variables)]; // Remove duplicates
    }

    public async previewTemplate(text: string): Promise<string> {
        const variables = this.extractVariables(text);
        let preview = text;

        for (const variable of variables) {
            let placeholder = '';
            switch (variable) {
                case 'selection':
                    placeholder = '[Selected Text]';
                    break;
                case 'fileName':
                    placeholder = '[Current File Name]';
                    break;
                case 'fileType':
                    placeholder = '[Current File Type]';
                    break;
                case 'clipboard':
                    placeholder = '[Clipboard Content]';
                    break;
                default:
                    placeholder = `[${variable}]`;
            }
            preview = preview.replace(new RegExp(`\\$\\{${variable}\\}`, 'g'), placeholder);
        }

        return preview;
    }
}
