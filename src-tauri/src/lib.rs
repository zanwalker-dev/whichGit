mod commands;
mod domain;
mod infrastructure;
mod services;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::process::get_process_cwd,
            commands::git_read::get_repo_root,
            commands::git_read::get_origin_url,
            commands::git_read::get_git_user_name,
            commands::git_read::get_git_user_email,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
