use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub id: u64,
    pub timestamp: String,
    pub original: String,
    pub optimized: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct History {
    pub entries: Vec<HistoryEntry>,
    pub next_id: u64,
}

impl Default for History {
    fn default() -> Self {
        Self {
            entries: Vec::new(),
            next_id: 1,
        }
    }
}

fn get_history_path(app: &AppHandle) -> PathBuf {
    let config_dir = app.path().app_config_dir().unwrap_or_else(|_| PathBuf::from("."));
    fs::create_dir_all(&config_dir).ok();
    config_dir.join("history.json")
}

fn load_history_internal(app: &AppHandle) -> History {
    let path = get_history_path(app);
    if path.exists() {
        if let Ok(content) = fs::read_to_string(&path) {
            if let Ok(history) = serde_json::from_str(&content) {
                return history;
            }
        }
    }
    History::default()
}

fn save_history_internal(app: &AppHandle, history: &History) -> Result<(), String> {
    let path = get_history_path(app);
    let content = serde_json::to_string_pretty(history).map_err(|e| e.to_string())?;
    fs::write(path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_history(app: AppHandle) -> History {
    load_history_internal(&app)
}

#[tauri::command]
pub fn add_history_entry(app: AppHandle, original: String, optimized: String) -> Result<HistoryEntry, String> {
    let mut history = load_history_internal(&app);
    let entry = HistoryEntry {
        id: history.next_id,
        timestamp: chrono_now(),
        original,
        optimized,
    };
    history.next_id += 1;
    history.entries.insert(0, entry.clone());
    if history.entries.len() > 100 {
        history.entries = history.entries.into_iter().take(100).collect();
    }
    save_history_internal(&app, &history)?;
    Ok(entry)
}

#[tauri::command]
pub fn delete_history_entry(app: AppHandle, id: u64) -> Result<(), String> {
    let mut history = load_history_internal(&app);
    history.entries.retain(|e| e.id != id);
    save_history_internal(&app, &history)?;
    Ok(())
}

#[tauri::command]
pub fn clear_history(app: AppHandle) -> Result<(), String> {
    let history = History::default();
    save_history_internal(&app, &history)?;
    Ok(())
}

fn chrono_now() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let duration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default();
    let secs = duration.as_secs();
    let millis = duration.subsec_millis();
    format!("{}.{:03}", secs, millis)
}