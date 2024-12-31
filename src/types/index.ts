export interface Prompt {
    id: string;
    label: string;
    text: string;
    category: string;
    tags: string[];
    language: string;
    isFavorite?: boolean;
    useCount?: number;
    lastUsed?: number;
    variables?: string[];
    description?: string;
    isMarkdown?: boolean;
    creator?: string;
    createdAt: number;
    updatedAt: number;
}

export interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    content: string;
    variables: string[];
    createdAt: number;
    updatedAt?: number;
}

export interface AnalyticsData {
    mostUsed: Prompt[];
    recentlyUsed: Prompt[];
    byCategory: { [key: string]: number };
    totalUses: number;
}

export interface AIConfig {
    enabled: boolean;
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
}

export interface ExtensionConfig {
    ai: AIConfig;
    features: {
        search: boolean;
        templates: boolean;
        favorites: boolean;
        analytics: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    sortOrder: 'alphabetical' | 'mostUsed' | 'recentlyUsed';
    maxHistoryItems: number;
    showPreview: boolean;
}
