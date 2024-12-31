import * as vscode from 'vscode';

export interface Features {
    favorites: boolean;
    analytics: boolean;
    templates: boolean;
    search: boolean;
}

export class ConfigManager {
    private static instance: ConfigManager;
    private config: vscode.WorkspaceConfiguration;

    private constructor() {
        this.config = vscode.workspace.getConfiguration('codeprompt-companion');
    }

    public static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    public getFeatures(): Features {
        return {
            favorites: this.config.get<boolean>('features.favorites', true),
            analytics: this.config.get<boolean>('features.analytics', true),
            templates: this.config.get<boolean>('features.templates', true),
            search: this.config.get<boolean>('features.search', true)
        };
    }

    public getSortOrder(): 'alphabetical' | 'mostUsed' | 'recentlyUsed' {
        return this.config.get<'alphabetical' | 'mostUsed' | 'recentlyUsed'>('sortOrder', 'alphabetical');
    }

    public getAnalyticsSettings(): {
        trackUsage: boolean;
        storeDuration: number;
    } {
        return {
            trackUsage: this.config.get<boolean>('analytics.trackUsage', true),
            storeDuration: this.config.get<number>('analytics.storeDuration', 30)
        };
    }

    public getTemplateSettings(): {
        maxTemplates: number;
        allowDuplicates: boolean;
    } {
        return {
            maxTemplates: this.config.get<number>('templates.maxTemplates', 100),
            allowDuplicates: this.config.get<boolean>('templates.allowDuplicates', false)
        };
    }
}
