# Prompt Optimizer

A elegant desktop application that helps you transform rough prompts into highly effective AI interactions. Built with Tauri, React, and TypeScript.

![Prompt Optimizer](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/Version-0.1.0-orange)

## Features

- **One-Click Optimization** - Transform rough prompts into expertly crafted instructions
- **Global Hotkey** - Press `Cmd/Ctrl+Shift+P` to instantly optimize clipboard content
- **Markdown Preview** - View optimized prompts with full markdown rendering
- **Multi-Provider Support** - Works with OpenAI, DeepSeek, and MiniMax APIs
- **History Tracking** - Browse and reuse your optimization history
- **System Tray** - Runs quietly in the background
- **Dark/Light Mode** - Adapts to your system theme
- **Auto Update** - Automatically checks for new releases on GitHub

## Screenshots

```
┌─────────────────────────────────────────────┐
│  Prompt Optimizer          [History] [⚙️] [−]│
├─────────────────────────────────────────────┤
│                                             │
│  Enter your prompt to optimize              │
│  ┌─────────────────────────────────────┐   │
│  │ Write code to sort a list...        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│        [ ✨ Optimize Prompt ]              │
│                                             │
│  or press Cmd/Ctrl+Shift+P to use clipboard │
└─────────────────────────────────────────────┘
```

## Installation

### macOS

**Direct Download:** [Prompt Optimizer_0.1.0_aarch64.dmg](https://github.com/GodX-18/prompt-optimizer/releases/download/v0.1.0/Prompt.Optimizer_0.1.0_aarch64.dmg)

1. Download the DMG file above
2. Open the DMG file
3. Drag `Prompt Optimizer.app` to Applications
4. Launch from Applications (first launch may require permission)

### Windows

> Note: Windows build not yet available. Build from source or request a binary.

1. Download the `.msi` installer from [releases](https://github.com/GodX-18/prompt-optimizer/releases)
2. Run the installer
3. Launch from Start Menu

### Build from Source

```bash
# Prerequisites
# - Node.js 18+
# - Rust 1.70+
# - npm

# Clone and install
git clone https://github.com/GodX-18/prompt-optimizer.git
cd prompt-optimizer
npm install

# Development
npm run tauri dev

# Production build
npm run tauri build
```

## Usage

### Basic Usage

1. **Configure API** - Go to Settings and enter your AI provider credentials:
   - API Provider (OpenAI / DeepSeek / MiniMax)
   - API Key
   - Endpoint URL (auto-filled for known providers)
   - Model name

2. **Optimize a Prompt**
   - Type or paste your prompt in the input area
   - Click "Optimize Prompt" or press the hotkey
   - View the optimized result with markdown preview
   - Click "Copy" to copy to clipboard

### Global Hotkey

Press `Cmd/Ctrl+Shift+P` from anywhere to:
1. Read text from clipboard
2. Optimize the prompt
3. Show the result modal

### History

All optimization results are saved locally. You can:
- Browse past optimizations
- Load a previous result back into the editor
- Delete individual entries or clear all history

## Configuration

### Settings Options

| Option | Description | Default |
|--------|-------------|---------|
| API Provider | AI service to use | OpenAI |
| API Key | Your API authentication key | - |
| Endpoint | API base URL | Provider default |
| Model | Model identifier | Provider default |
| Hotkey | Global shortcut | CmdOrCtrl+Shift+P |
| Theme | App appearance | System |
| Language | UI language | English |

### Custom Optimizer Prompt

Advanced users can customize the optimization prompt. In `~/.config/prompt-optimizer/config.json`:

```json
{
  "ai": {
    "optimizer_prompt": "Your custom optimization prompt template with {{prompt}} placeholder"
  }
}
```

## How It Works

The app uses a sophisticated system prompt for optimization:

> You are a world-class prompt engineering expert...
>
> Optimize along dimensions:
> - **Clarity** - Remove ambiguity
> - **Structure** - Use appropriate formatting
> - **Specificity** - Add necessary details
> - **Completeness** - Fill missing gaps
> - **Safety** - Remove harmful content
>
> Output ONLY the optimized prompt, no explanations.

## Tech Stack

- **Frontend** - React 19, TypeScript, Vite
- **Backend** - Tauri 2 (Rust)
- **Styling** - CSS with dark mode support
- **Markdown** - react-markdown
- **API** - REST with fetch

## Project Structure

```
prompt-optimizer/
├── src/                    # React frontend
│   ├── App.tsx            # Main app component
│   ├── App.css            # Global styles
│   ├── components/        # React components
│   │   ├── ResultModal.tsx
│   │   ├── Settings.tsx
│   │   └── History.tsx
│   └── locales/           # i18n strings
├── src-tauri/             # Rust backend
│   └── src/
│       ├── lib.rs        # Tauri app setup
│       ├── config.rs     # Configuration management
│       ├── clipboard.rs  # Clipboard operations
│       ├── hotkey.rs     # Global shortcut handling
│       └── history.rs    # History storage
└── dist/                  # Build output
```

## Development

```bash
# Start development server
npm run tauri dev

# Run type checking
npm run build

# Check for linting (if configured)
# npm run lint
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Acknowledgments

Built with [Tauri](https://tauri.app/) - a framework for building smaller, faster, and more secure desktop applications.