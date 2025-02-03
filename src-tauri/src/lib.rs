#[tauri::command]
fn resize_window(window: tauri::Window, width: u32, height: u32) -> () {
    // 仅在桌面平台调整窗口大小
    #[cfg(desktop)]
    {
        use tauri::LogicalSize;
        let size = LogicalSize::new(width, height);
        window.set_size(size).unwrap();
    }
    // 移动端可忽略或替换为其他逻辑
    #[cfg(mobile)]
    {
        println!("Resize not supported on mobile");
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![resize_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
