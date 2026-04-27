# Contributing to Prompt Optimizer

Thank you for your interest in contributing!

## Getting Started

### Prerequisites

- Node.js 18+
- Rust 1.70+
- npm 9+

### Setup

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/YOUR_USERNAME/prompt-optimizer.git
cd prompt-optimizer

# Install dependencies
npm install

# Start development
npm run tauri dev
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Follow existing code style (TypeScript strict mode)
- Add TypeScript types for new functionality
- Keep changes focused and minimal
- Test your changes with `npm run tauri dev`

### 3. Commit Your Changes

We use conventional commits:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update README"
git commit -m "refactor: improve code structure"
```

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Project Structure

```
src/                    # React frontend (TypeScript)
  ├── App.tsx          # Main app
  ├── App.css          # Styles
  └── components/      # React components

src-tauri/src/          # Rust backend
  ├── lib.rs          # App setup
  ├── config.rs       # Configuration
  ├── clipboard.rs    # Clipboard operations
  ├── hotkey.rs       # Global shortcuts
  └── history.rs      # History storage
```

## Code Style

- TypeScript: strict mode enabled, prefer explicit types
- React: functional components with hooks
- Rust: follow rustfmt conventions
- CSS: BEM-like naming, CSS variables for theming

## Testing

Before submitting:
1. Run `npm run build` to verify TypeScript compiles
2. Test the app in development mode
3. Verify all features work as expected

## Reporting Issues

Please include:
- Platform (macOS/Windows) and version
- App version
- Steps to reproduce
- Expected vs actual behavior
- Error logs if applicable

## Questions?

Open an issue for discussion before starting large changes.