export const en = {
  // App
  appTitle: "Prompt Optimizer",

  // Main view
  enterPrompt: "Enter your prompt",
  pastePrompt: "Paste your prompt here...",
  optimize: "Optimize",
  optimizing: "Optimizing...",
  orPress: "Or press",
  toUseClipboard: "to use clipboard content",
  pleaseEnterText: "Please enter text or copy something to clipboard",
  optimizationFailed: "Optimization failed",

  // Header
  settings: "Settings",
  minimizeToTray: "Minimize to Tray",
  history: "History",

  // Result Modal
  optimizationResult: "Optimization Result",
  original: "Original",
  optimized: "Optimized",
  copyOptimized: "Copy Optimized",
  copied: "Copied!",

  // Settings
  back: "Back",
  aiConfiguration: "AI Configuration",
  provider: "Provider",
  apiKey: "API Key",
  enterApiKey: "Enter your API key",
  endpoint: "Endpoint",
  endpointPlaceholder: "https://api.openai.com/v1",
  model: "Model",
  modelPlaceholder: "gpt-4",
  hotkey: "Hotkey",
  globalShortcut: "Global Shortcut",
  pressKeys: "Press keys...",
  clickInputPressHotkey: "Click input then press your hotkey combination",
  testConnection: "Test Connection",
  testing: "Testing...",
  saveSettings: "Save Settings",
  saving: "Saving...",
  settingsSaved: "Settings saved!",

  // History
  optimizationHistory: "Optimization History",
  clearAll: "Clear All",
  noHistory: "No optimization history yet",
  use: "Use",
  time: "",

  // Language
  language: "Language",
  selectLanguage: "Select Language",
};

export const zh = {
  // App
  appTitle: "提示词优化器",

  // Main view
  enterPrompt: "输入提示词",
  pastePrompt: "在这里粘贴你的提示词...",
  optimize: "优化",
  optimizing: "优化中...",
  orPress: "或按",
  toUseClipboard: "使用剪贴板内容",
  pleaseEnterText: "请输入文本或复制内容到剪贴板",
  optimizationFailed: "优化失败",

  // Header
  settings: "设置",
  minimizeToTray: "最小化到托盘",
  history: "历史记录",

  // Result Modal
  optimizationResult: "优化结果",
  original: "原始",
  optimized: "优化后",
  copyOptimized: "复制优化结果",
  copied: "已复制！",

  // Settings
  back: "返回",
  aiConfiguration: "AI 配置",
  provider: "提供商",
  apiKey: "API Key",
  enterApiKey: "输入你的 API key",
  endpoint: "接口地址",
  endpointPlaceholder: "https://api.openai.com/v1",
  model: "模型",
  modelPlaceholder: "gpt-4",
  hotkey: "快捷键",
  globalShortcut: "全局快捷键",
  pressKeys: "按下按键...",
  clickInputPressHotkey: "点击输入框，然后按下你的快捷键",
  testConnection: "测试连接",
  testing: "测试中...",
  saveSettings: "保存设置",
  saving: "保存中...",
  settingsSaved: "设置已保存！",

  // History
  optimizationHistory: "优化历史",
  clearAll: "清空全部",
  noHistory: "暂无优化记录",
  use: "使用",
  time: "",

  // Language
  language: "语言",
  selectLanguage: "选择语言",
};

export type TranslationKey = keyof typeof en;

const translations = { en, zh };

export function t(key: TranslationKey, lang: string): string {
  return translations[lang as keyof typeof translations]?.[key] || translations.en[key] || key;
}