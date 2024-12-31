import { Prompt } from '../types';

export class SearchService {
    private static instance: SearchService;

    private constructor() {}

    public static getInstance(): SearchService {
        if (!SearchService.instance) {
            SearchService.instance = new SearchService();
        }
        return SearchService.instance;
    }

    public searchPrompts(prompts: Prompt[], query: string): Prompt[] {
        const searchTerms = query.toLowerCase().split(' ');
        
        return prompts.filter(prompt => {
            const searchableText = [
                prompt.label,
                prompt.text,
                prompt.category,
                ...(prompt.tags || [])
            ].join(' ').toLowerCase();

            return searchTerms.every(term => searchableText.includes(term));
        });
    }

    public filterByTags(prompts: Prompt[], tags: string[]): Prompt[] {
        if (!tags.length) return prompts;
        
        return prompts.filter(prompt => 
            tags.every(tag => prompt.tags?.includes(tag))
        );
    }

    public filterByCategory(prompts: Prompt[], category: string): Prompt[] {
        if (!category) return prompts;
        
        return prompts.filter(prompt => prompt.category === category);
    }

    public filterByLanguage(prompts: Prompt[], language: string): Prompt[] {
        if (!language) return prompts;
        
        return prompts.filter(prompt => prompt.language === language);
    }

    public filterFavorites(prompts: Prompt[]): Prompt[] {
        return prompts.filter(prompt => prompt.isFavorite);
    }

    public sortPrompts(prompts: Prompt[], sortOrder: string): Prompt[] {
        switch (sortOrder) {
            case 'alphabetical':
                return [...prompts].sort((a, b) => a.label.localeCompare(b.label));

            case 'mostUsed':
                return [...prompts].sort((a, b) => (b.useCount || 0) - (a.useCount || 0));

            case 'recentlyUsed':
                return [...prompts].sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));

            default:
                return prompts;
        }
    }

    public getUniqueTags(prompts: Prompt[]): string[] {
        const tags = new Set<string>();
        prompts.forEach(prompt => {
            prompt.tags?.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }

    public getUniqueCategories(prompts: Prompt[]): string[] {
        const categories = new Set<string>();
        prompts.forEach(prompt => {
            if (prompt.category) {
                categories.add(prompt.category);
            }
        });
        return Array.from(categories).sort();
    }

    public getRelatedPrompts(prompt: Prompt, allPrompts: Prompt[], limit: number = 5): Prompt[] {
        const promptTags = new Set(prompt.tags || []);
        
        return allPrompts
            .filter(p => p.id !== prompt.id) // Exclude the current prompt
            .map(p => ({
                prompt: p,
                score: this.calculateSimilarityScore(p, promptTags, prompt.category)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.prompt);
    }

    private calculateSimilarityScore(prompt: Prompt, targetTags: Set<string>, targetCategory: string): number {
        let score = 0;

        // Category match
        if (prompt.category === targetCategory) {
            score += 2;
        }

        // Tag matches
        const promptTags = prompt.tags || [];
        promptTags.forEach(tag => {
            if (targetTags.has(tag)) {
                score += 1;
            }
        });

        return score;
    }
}
