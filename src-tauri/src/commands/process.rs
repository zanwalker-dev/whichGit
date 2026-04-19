use tauri::command;

/// Diretório de trabalho atual do processo (caminho absoluto, UTF-8).
#[command]
pub fn get_process_cwd() -> Result<String, String> {
    let cwd = std::env::current_dir().map_err(|e| e.to_string())?;
    let path = cwd.canonicalize().unwrap_or(cwd);
    path
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "current directory path is not valid UTF-8".to_string())
}
