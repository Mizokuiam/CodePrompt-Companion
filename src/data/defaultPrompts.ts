import { Prompt } from '../types';

const now = Date.now();

export const defaultPrompts: Prompt[] = [
    // HTML Prompts
    {
        id: 'default_html_nav',
        label: 'Create Responsive Navigation',
        text: 'Create a responsive navigation menu with a hamburger menu for mobile devices and a horizontal menu for desktop. Include proper ARIA attributes for accessibility.',
        category: 'html',
        tags: ['navigation', 'responsive', 'accessibility'],
        language: 'html',
        createdAt: now,
        updatedAt: now
    },
    {
        id: 'default_seo',
        label: 'Optimize SEO Structure',
        text: 'Optimize this HTML structure for SEO. Include proper meta tags, semantic elements, and structured data.',
        category: 'seo',
        tags: ['seo', 'meta-tags', 'semantic-html'],
        language: 'html',
        createdAt: now,
        updatedAt: now
    },
    
    // CSS Prompts
    {
        id: 'default_css_flexbox',
        label: 'Flexbox Layout',
        text: 'Create a flexible layout using CSS Flexbox with proper responsive breakpoints and fallbacks for older browsers.',
        category: 'css',
        tags: ['layout', 'flexbox', 'responsive'],
        language: 'css',
        createdAt: now,
        updatedAt: now
    },
    {
        id: 'default_css_grid',
        label: 'CSS Grid Gallery',
        text: 'Create a responsive image gallery using CSS Grid with proper image optimization and lazy loading.',
        category: 'css',
        tags: ['grid', 'gallery', 'responsive'],
        language: 'css',
        createdAt: now,
        updatedAt: now
    },

    // JavaScript Prompts
    {
        id: 'default_js_es6',
        label: 'Modern ES6+ Refactor',
        text: 'Refactor this code using modern ES6+ features like arrow functions, destructuring, and async/await.',
        category: 'javascript',
        tags: ['es6', 'refactoring', 'modern-js'],
        language: 'javascript',
        createdAt: now,
        updatedAt: now
    },
    {
        id: 'default_js_perf',
        label: 'Performance Optimization',
        text: 'Optimize this JavaScript code for better performance. Consider using memoization, debouncing, and proper event handling.',
        category: 'performance',
        tags: ['performance', 'optimization', 'javascript'],
        language: 'javascript',
        createdAt: now,
        updatedAt: now
    },

    // React Prompts
    {
        id: 'default_react_hooks',
        label: 'React Hooks Implementation',
        text: 'Convert this class component to a functional component using React Hooks. Consider using useState, useEffect, and custom hooks.',
        category: 'react',
        tags: ['hooks', 'functional', 'modern-react'],
        language: 'typescriptreact',
        createdAt: now,
        updatedAt: now
    },
    {
        id: 'default_react_perf',
        label: 'React Performance',
        text: 'Optimize this React component for better performance. Use React.memo, useMemo, useCallback, and proper key handling.',
        category: 'performance',
        tags: ['performance', 'optimization', 'react'],
        language: 'typescriptreact',
        createdAt: now,
        updatedAt: now
    },

    // Accessibility Prompts
    {
        id: 'default_accessibility_aria',
        label: 'ARIA Implementation',
        text: 'Add proper ARIA attributes to this component to improve accessibility. Include proper roles, states, and properties.',
        category: 'accessibility',
        tags: ['accessibility', 'aria', 'a11y'],
        language: 'html',
        createdAt: now,
        updatedAt: now
    }
];
