// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn load_video(file_path: String) -> Result<Vec<u8>, String> {
    let video = std::fs::read(file_path).map_err(|e| e.to_string())?;

    Ok(video)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![load_video])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
