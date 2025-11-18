document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settings-btn');
    const taskList = document.getElementById('task-list');

    // Mở trang options khi nhấn nút
    settingsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    function renderTasks() {
        // Xóa danh sách cũ trước khi vẽ lại
        taskList.innerHTML = '';

        chrome.storage.sync.get({ tasks: [] }, (data) => {
            if (data.tasks && data.tasks.length > 0) {
                data.tasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = 'task-item';

                    // Trong tương lai, thuộc tính isRunning sẽ quyết định trạng thái
                    // Hiện tại, mặc định là active
                    const statusClass = task.isRunning ? 'active' : 'paused';

                // Định nghĩa các icon SVG
                const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>`;
                const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M13.75 5A.75.75 0 0013 5.75v8.5A.75.75 0 0013.75 15h.5A.75.75 0 0015 14.25V5.75A.75.75 0 0014.25 5h-.5zm-7 0A.75.75 0 006 5.75v8.5A.75.75 0 006.75 15h.5A.75.75 0 008 14.25V5.75A.75.75 0 007.25 5h-.5z" clip-rule="evenodd" /></svg>`;
                const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25a1.25 1.25 0 01-1.25 1.25h-9.5a1.25 1.25 0 01-1.25-1.25v-9.5z" /></svg>`;
                const deleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg>`;

                taskItem.innerHTML = `
                    <div class="task-info" data-task-id="${task.id}" title="Click to edit this task">
                        <div class="status-dot ${statusClass}"></div>
                        <span class="task-name">${task.name}</span>
                    </div>
                    <div class="task-actions">
                        <button class="popup-icon-btn" data-command="toggle" data-task-id="${task.id}" title="${task.isRunning ? 'Pause' : 'Resume'}">${task.isRunning ? pauseIcon : playIcon}</button>
                        <button class="popup-icon-btn" data-command="edit" data-task-id="${task.id}" title="Edit">${editIcon}</button>
                        <button class="popup-icon-btn delete" data-command="delete" data-task-id="${task.id}" title="Delete">${deleteIcon}</button>
                    </div>
                `;
                taskList.appendChild(taskItem);
                });

                // Gán sự kiện click cho các phần tử có thể hành động
                document.querySelectorAll('.task-info, .popup-icon-btn').forEach(item => {
                    item.addEventListener('click', handleActionClick);
                });

            } else {
                // Hiển thị trạng thái trống
                const emptyState = document.createElement('div');
                emptyState.id = 'empty-state';
                emptyState.textContent = 'No tasks yet. Go to settings to add a new one.';
                // Phải chèn vào content, không phải taskList
                document.querySelector('.content').appendChild(emptyState);
            }
        });
    }

    function handleActionClick(event) {
        const target = event.currentTarget;
        const taskId = event.currentTarget.dataset.taskId;
        const command = target.dataset.command;

        if (command === 'toggle') {
            chrome.runtime.sendMessage({ command: "toggleTaskState", taskId: taskId });
        } else if (command === 'delete') {
            // Thêm một bước xác nhận trước khi xóa
            if (confirm(`Are you sure you want to delete this task?`)) {
                chrome.runtime.sendMessage({ command: "deleteTask", taskId: taskId });
            }
        } else { // Mặc định là hành động sửa (khi nhấn vào .task-info hoặc nút edit)
            const optionsUrl = chrome.runtime.getURL('options.html');
            chrome.tabs.create({ url: `${optionsUrl}#edit=${taskId}` });
        }
    }
    // Vẽ giao diện khi popup được mở
    renderTasks();

    // Lắng nghe sự thay đổi trong storage để cập nhật popup ngay lập tức (nếu đang mở)
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync') {
            renderTasks();
        }
    });
});