use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};

#[tauri::command]
pub fn register_hotkey(
    app: tauri::AppHandle,
    hotkey: String,
) -> Result<(), String> {
    let shortcut: Shortcut = hotkey.parse().map_err(|e: <Shortcut as std::str::FromStr>::Err| e.to_string())?;

    app.global_shortcut()
        .on_shortcut(shortcut, |app, _shortcut, _event| {
            log::info!("Hotkey triggered!");
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.emit("hotkey-triggered", ());
            }
        })
        .map_err(|e| e.to_string())?;

    log::info!("Registered hotkey: {}", hotkey);
    Ok(())
}

#[tauri::command]
pub fn unregister_hotkey(app: tauri::AppHandle, hotkey: String) -> Result<(), String> {
    let shortcut: Shortcut = hotkey.parse().map_err(|e: <Shortcut as std::str::FromStr>::Err| e.to_string())?;
    app.global_shortcut()
        .unregister(shortcut)
        .map_err(|e| e.to_string())?;
    log::info!("Unregistered hotkey: {}", hotkey);
    Ok(())
}
