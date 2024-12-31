import * as vscode from 'vscode';

interface AnalyticsData {
    usageCount: { [key: string]: number };
    lastUsed: { [key: string]: number };
    categoryUsage: { [key: string]: number };
}

export class AnalyticsService {
    private static instance: AnalyticsService;
    private context: vscode.ExtensionContext;
    private readonly ANALYTICS_KEY = 'promptAnalytics';

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public static getInstance(context: vscode.ExtensionContext): AnalyticsService {
        if (!AnalyticsService.instance) {
            AnalyticsService.instance = new AnalyticsService(context);
        }
        return AnalyticsService.instance;
    }

    public trackPromptUsage(promptId: string, category: string): void {
        const analytics = this.getAnalytics();
        
        // Update usage count
        analytics.usageCount[promptId] = (analytics.usageCount[promptId] || 0) + 1;
        
        // Update last used timestamp
        analytics.lastUsed[promptId] = Date.now();
        
        // Update category usage
        analytics.categoryUsage[category] = (analytics.categoryUsage[category] || 0) + 1;
        
        this.saveAnalytics(analytics);
    }

    public getAnalytics(): AnalyticsData {
        const analytics = this.context.globalState.get<AnalyticsData>(this.ANALYTICS_KEY);
        if (!analytics) {
            return {
                usageCount: {},
                lastUsed: {},
                categoryUsage: {}
            };
        }
        return analytics;
    }

    private saveAnalytics(analytics: AnalyticsData): void {
        this.context.globalState.update(this.ANALYTICS_KEY, analytics);
    }
}
