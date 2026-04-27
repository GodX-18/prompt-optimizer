use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

pub const DEFAULT_OPTIMIZER_PROMPT: &str = r#"You are a world-class prompt engineering expert, mastering all prompt design paradigms from simple instructions to complex chain-of-thought templates.

Your task is to reconstruct the user's "raw prompt" into a clearer, more effective, and more robust "optimized prompt" that maximizes the target large language model's comprehension and execution quality.

## Optimization Requirements

Analyze the raw prompt and optimize it along these dimensions:
- **Clarity**: Remove ambiguity, make instructions explicit and unambiguous
- **Structure**: Use appropriate formatting (numbered lists, headers, markdown) when it aids comprehension
- **Specificity**: Add necessary details, constraints, and context that were only implied
- **Completeness**: Fill in missing logical steps or information gaps needed for effective execution
- **Safety**: Remove or neutralize any harmful, biased, or unsafe elements

## Output Rules (STRICT)

1. Output ONLY the optimized prompt itself — no preamble, no explanation, no "Here's the optimized version:", no quotes, no code fences
2. Preserve the core intent and goal of the original prompt — do not change what the user is trying to achieve
3. If the original prompt is already well-optimized, return it unchanged
4. If you cannot improve the prompt without guessing beyond its stated intent, return it unchanged
5. Maintain the same language as the original prompt (English → English, Chinese → Chinese, etc.)

## Optimization Target

{{prompt}}"#;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AIConfig {
    pub provider: String,
    pub api_key: String,
    pub endpoint: String,
    pub model: String,
    #[serde(default)]
    pub optimizer_prompt: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub ai: AIConfig,
    pub hotkey: String,
    pub theme: String,
    #[serde(default = "default_lang")]
    pub lang: String,
}

fn default_lang() -> String {
    "en".to_string()
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            ai: AIConfig {
                provider: "openai".to_string(),
                api_key: "".to_string(),
                endpoint: "https://api.openai.com/v1".to_string(),
                model: "gpt-4".to_string(),
                optimizer_prompt: None,
            },
            hotkey: "CmdOrCtrl+Shift+P".to_string(),
            theme: "system".to_string(),
            lang: default_lang(),
        }
    }
}

fn get_config_path() -> PathBuf {
    let config_dir = dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("prompt-optimizer");

    if !config_dir.exists() {
        fs::create_dir_all(&config_dir).ok();
    }

    config_dir.join("config.json")
}

#[tauri::command]
pub fn read_config() -> Result<AppConfig, String> {
    let path = get_config_path();

    if path.exists() {
        let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).map_err(|e| e.to_string())
    } else {
        // Create default config
        let config = AppConfig::default();
        let _ = write_config(config.clone());
        Ok(config)
    }
}

#[tauri::command]
pub fn write_config(config: AppConfig) -> Result<(), String> {
    let path = get_config_path();
    let content = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(path, content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn build_optimize_prompt(prompt: String) -> Result<String, String> {
    let config = read_config()?;
    let template = config.ai.optimizer_prompt.unwrap_or_else(|| DEFAULT_OPTIMIZER_PROMPT.to_string());
    Ok(template.replace("{{prompt}}", &prompt))
}
