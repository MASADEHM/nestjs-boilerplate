# VS Code Configuration for Marina Management API

This folder contains VS Code workspace configuration for optimal development experience with the Marina Management API (Backend).

## 🚀 Quick Start

1. **Install Recommended Extensions**
   - When you open the workspace, VS Code will prompt you to install recommended extensions
   - Or manually: `Ctrl+Shift+P` → "Extensions: Show Recommended Extensions"

## 📁 Configuration Files

### `settings.json`
- **Auto-formatting** on save for all file types
- **ESLint** integration for TypeScript and JavaScript
- **Prettier** as the default formatter with custom config path
- **TypeScript** enhanced settings with auto-imports
- **Code spell checker** with Arabic character support
- **Search exclusions** for common build and dependency folders

### `extensions.json`
Recommended extensions for the backend project:

#### Core Extensions:
- **Prettier** (`esbenp.prettier-vscode`) - Code formatting
- **ESLint** (`dbaeumer.vscode-eslint`) - Code linting

#### NestJS/Node Extensions:
- **Path Intellisense** (`christian-kohler.path-intellisense`) - File path autocomplete
- **NPM Intellisense** (`christian-kohler.npm-intellisense`) - Package import autocomplete

#### Development Utilities:
- **Better Comments** (`aaron-bond.better-comments`) - Enhanced comment styling
- **Code Spell Checker** (`streetsidesoftware.code-spell-checker`) - Spell checking
- **Todo Tree** (`gruntfuggly.todo-tree`) - TODO/FIXME management
- **Todo Highlight** (`wayou.vscode-todo-highlight`) - TODO highlighting

#### Git & Version Control:
- **GitLens** (`eamodio.gitlens`) - Enhanced Git support

#### Database & ORM:
- **Prisma** (`prisma.prisma`) - Prisma ORM support

### `tasks.json` & `launch.json`
Currently empty - debug configurations and build tasks will be added later.

## 🔧 Key Features

### Auto-Formatting
- **Format on Save**: Automatically formats code when you save
- **Format on Paste**: Formats pasted code automatically
- **Consistent Style**: Uses Prettier with custom configuration
- **ESLint Auto-fix**: Automatically fixes linting issues on save
- **Import Organization**: Automatically organizes imports on save

### ESLint Integration
- **Real-time Linting**: Shows errors and warnings as you type
- **File Type Support**: Works with JavaScript and TypeScript files

### TypeScript Enhancements
- **Auto-imports**: Automatically adds import statements
- **Non-relative Imports**: Prefers absolute import paths
- **File Move Updates**: Prompts to update imports when files are moved

### Code Quality
- **Rulers**: Visual guides at 80 and 120 characters
- **Consistent Indentation**: 2 spaces, no tab detection
- **Spell Checking**: English spell checking with Arabic character exclusion
- **Auto Save**: Saves files when focus changes

## 🛠️ Project Structure Support

The configuration is optimized for:
- **NestJS Backend**: TypeScript-based Node.js framework
- **Prisma ORM**: For database management
- **RESTful APIs**: Backend service development

## 📋 Usage Tips

### Code Formatting
- **Manual Format**: `Shift+Alt+F`
- **Format Selection**: Select code → `Shift+Alt+F`
- **Auto Format**: Enabled on save by default

### Spell Checking
- **Add Words**: Right-click on underlined words to add to dictionary
- **Arabic Support**: Arabic characters are ignored by spell checker

### Search Optimization
Excluded from search results:
- `node_modules`, `dist`, `coverage`, `.git`, `tmp`, `build`

## 🛠️ Troubleshooting

### Formatting Issues
- Ensure Prettier extension is installed and enabled
- Check if `.prettierrc` exists in project root
- Verify Prettier config path in settings

### ESLint Not Working
- Check if ESLint extension is installed
- Ensure ESLint config exists in project root

### Prisma Issues
- Verify Prisma extension is installed
- Check that `schema.prisma` file exists
- Ensure Prisma CLI is available

## 🔄 Updates

To update this configuration:
1. Modify files in `.vscode/` folder
2. Restart VS Code or reload window (`Ctrl+Shift+P` → "Developer: Reload Window")
3. Share changes with team via version control

## 🤝 Team Collaboration

- All configuration files are version controlled
- Team members get consistent development environment
- Recommended extensions ensure everyone has the same tools
- Shared formatting rules maintain code consistency

## 📚 Additional Resources

- [VS Code Extension Marketplace](https://marketplace.visualstudio.com/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma VS Code Extension](https://www.prisma.io/docs/concepts/database-connectors/connection-urls) 