# Auto Tab Reloader

A simple yet powerful Chrome extension to automatically reload browser tabs at a specified interval. Manage multiple reloading tasks, customize URLs and timings, and keep your dashboards and live-feeds up-to-date without manual intervention.



## 🌟 Features

- **Multi-Tab Management**: Add and manage multiple auto-reloading tasks for different tabs.
- **Custom Intervals**: Set reload times in minutes, including fractional values (e.g., 0.5 for 30 seconds).
- **Smart URL Matching**: Works with complex URLs, including those with hash (`#`) fragments, common in modern single-page applications (SPAs).
- **Pause & Resume**: Easily toggle individual reloading tasks on or off without deleting them.
- **Intuitive UI**: A clean, modern, and easy-to-navigate interface for managing your tasks.
- **Drag & Drop Reordering**: Organize your tasks by simply dragging and dropping them in the settings page.
- **Quick Actions Popup**: Pause, resume, edit, or delete tasks directly from the extension's popup.

## 🚀 Installation

### From the Chrome Web Store (Coming Soon)

*(Once your extension is published, you can add the link here.)*

### Manual Installation (for Development)

1.  **Download or Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    ```
    Or download the ZIP file and extract it.

2.  **Open Chrome Extensions**:
    -   Navigate to `chrome://extensions` in your Chrome browser.

3.  **Enable Developer Mode**:
    -   In the top-right corner, toggle the "Developer mode" switch on.

4.  **Load the Extension**:
    -   Click the "Load unpacked" button.
    -   Select the directory where you cloned or extracted the project files.

5.  **Done!** The "Auto Tab Reloader" icon should now appear in your browser's toolbar.

## 📖 How to Use

1.  **Open Settings**:
    -   Click the extension icon in the toolbar.
    -   Click the settings (gear) icon in the popup header to open the main settings page.

2.  **Add a New Task**:
    -   On the settings page, click the "Add New Task" button.
    -   A modal will appear. Fill in the following fields:
        -   **URL to reload**: The full URL of the tab you want to reload.
        -   **Display Name**: A friendly name for the task (e.g., "My Dashboard").
        -   **Reload Interval**: Select a preset time or enter a custom value in minutes.
    -   Click "Save Task".

3.  **Manage Tasks**:
    -   **From the Popup**:
        -   **Pause/Resume**: Click the pause/play icon.
        -   **Edit**: Click the pencil icon to open the settings page for that task.
        -   **Delete**: Click the trash icon.
    -   **From the Settings Page**:
        -   **Reorder**: Drag and drop tasks using the handle (⠿) on the left.
        -   **Pause/Resume, Edit, Delete**: Use the corresponding icons for each task.

## 🛠️ Built With

-   HTML5
-   CSS3
-   JavaScript (ES6+)
-   Chrome Extension APIs (Manifest V3)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📄 License

This project is licensed under the MIT License - see the `LICENSE.md` file for details.
