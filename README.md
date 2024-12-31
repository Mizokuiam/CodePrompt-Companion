# CodePrompt Companion

> Your intelligent companion for managing and optimizing coding prompts in VS Code

Ever found yourself rewriting the same prompts for AI assistants? CodePrompt Companion streamlines your workflow by providing a smart, organized way to manage and reuse your coding prompts. Built specifically for web developers, it helps you maintain a curated library of effective prompts for HTML, CSS, JavaScript, and more.

## ✨ Key Features

### 🎯 Smart Prompt Organization
- **Category-Based Structure**: Instantly access prompts organized by technology (HTML, CSS, JS, React)
- **Custom Categories**: Create your own categories to match your workflow
- **Quick Search**: Find the right prompt with fuzzy search across all categories

### ⭐ Smart Favorites System
- **One-Click Favorites**: Star frequently used prompts for instant access
- **Favorites View**: All your essential prompts in one place
- **Cross-Session Persistence**: Your favorites stay synchronized across VS Code sessions

### 🤖 AI Integration
- **Context-Aware Suggestions**: Get prompt suggestions based on your current code
- **OpenAI Integration**: Leverage GPT models for enhanced prompt generation
- **Customizable Settings**: Fine-tune the AI to match your preferences

### 🔍 Powerful Search
```
⌘/Ctrl + P → "Find Prompt"
```
- Fuzzy search across all prompts
- Filter by category or tags
- Sort by usage or relevance

## 🚀 Getting Started

1. Install from VS Code Marketplace:
   ```
   ext install codeprompt-companion
   ```

2. Open the CodePrompt Companion sidebar:
   - Click the CodePrompt icon in the activity bar, or
   - Press `⌘/Ctrl + Shift + P` and type "Show CodePrompt"

3. Start using prompts:
   - Browse categories in the sidebar
   - Star useful prompts (click the ⭐)
   - Use the search to find specific prompts

## 💡 Usage Examples

### Managing Prompts
1. **Add a Custom Prompt**:
   - Click the + icon in the sidebar
   - Enter prompt details and category
   - Optionally add tags for better organization

2. **Using Favorites**:
   - Click the ⭐ next to any prompt
   - Access favorites from the dedicated view
   - Remove from favorites with one click

3. **Quick Search**:
   - Press `⌘/Ctrl + P`
   - Type `>Find Prompt`
   - Enter your search terms

### AI Features
1. **Generate Context-Aware Prompts**:
   - Select code in editor
   - Press `⌘/Ctrl + Shift + P`
   - Choose "Generate AI Prompt"

2. **Configure AI Settings**:
   ```json
   {
     "codepromptCompanion.ai.model": "gpt-4",
     "codepromptCompanion.ai.temperature": 0.7
   }
   ```

## ⚙️ Configuration

### Essential Settings
```json
{
  "codepromptCompanion.features.favorites": true,
  "codepromptCompanion.features.history": true,
  "codepromptCompanion.ai.enabled": true,
  "codepromptCompanion.ai.apiKey": "your-api-key"
}
```

### Keyboard Shortcuts
| Command | Shortcut |
|---------|----------|
| Show CodePrompt | `⌘/Ctrl + Shift + P` → "Show CodePrompt" |
| Quick Find | `⌘/Ctrl + P` → ">Find Prompt" |
| Add Custom | `⌘/Ctrl + Shift + P` → "Add Custom Prompt" |

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report Issues**
   - Use the [issue tracker](https://github.com/Mizokuiam/CodePrompt-Companion/issues)
   - Include VS Code version
   - Describe steps to reproduce

2. **Submit PRs**
   - Fork the [repository](https://github.com/Mizokuiam/CodePrompt-Companion)
   - Create a feature branch
   - Submit a pull request

3. **Share Prompts**
   - Export your useful prompts
   - Submit them via PR
   - Help build our prompt library

## 📄 License

MIT License - feel free to use in your own projects!

## 🙋‍♂️ Support

Need help? Found a bug? Have a suggestion?
- [Open an issue](https://github.com/Mizokuiam/CodePrompt-Companion/issues)
- [Send us feedback](https://github.com/Mizokuiam/CodePrompt-Companion/issues)
- [Read our docs](https://github.com/Mizokuiam/CodePrompt-Companion/wiki)

---

**Made with ❤️ by developers for developers**

[Rate this extension](https://marketplace.visualstudio.com/items?itemName=codeprompt-companion) | [Check out our other extensions]()
