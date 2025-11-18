document.addEventListener('DOMContentLoaded', () => {
    // Elements trong modal
    const editingTaskIdInput = document.getElementById('editing-task-id');
    const urlInput = document.getElementById('jira-url');
    const customMinutesInput = document.getElementById('custom-minutes');
    const tabNameInput = document.getElementById('tab-name');
    const saveTaskBtn = document.getElementById('save-task-btn');
    const timeButtons = document.querySelectorAll('.time-btn');
    
    // Elements chính
    const statusDiv = document.getElementById('status');
    const taskListContainer = document.getElementById('task-list-container');
    const modal = document.getElementById('task-modal');
    const modalTitle = document.getElementById('modal-title');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    let selectedMinutes = null;

    // --- RENDER DANH SÁCH TÁC VỤ ---
    function renderTasks(tasks = []) {
        taskListContainer.innerHTML = '';
        if (tasks.length === 0) {
            taskListContainer.innerHTML = '<p style="text-align:center; color:#83786e;">No tasks have been added yet.</p>';
            return;
        }

        tasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item-options';
            taskItem.dataset.taskId = task.id;
            taskItem.draggable = true; // Cho phép kéo thả
            const isRunning = task.isRunning;

            // Định nghĩa các icon SVG
            const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>`;
            const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M13.75 5A.75.75 0 0013 5.75v8.5A.75.75 0 0013.75 15h.5A.75.75 0 0015 14.25V5.75A.75.75 0 0014.25 5h-.5zm-7 0A.75.75 0 006 5.75v8.5A.75.75 0 006.75 15h.5A.75.75 0 008 14.25V5.75A.75.75 0 007.25 5h-.5z" clip-rule="evenodd" /></svg>`;
            const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25a1.25 1.25 0 01-1.25 1.25h-9.5a1.25 1.25 0 01-1.25-1.25v-9.5z" /></svg>`;
            const deleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg>`;

            taskItem.innerHTML = `
                <div class="drag-handle" title="Drag to reorder">⠿</div>
                <div class="info">
                    <strong>${task.name}</strong><br>
                    <span>Every ${task.interval} min - ${isRunning ? 'Running' : 'Paused'}</span>
                </div>
                <div>
                    <button class="icon-btn toggle-btn" title="${isRunning ? 'Pause' : 'Resume'}" data-task-id="${task.id}">${isRunning ? pauseIcon : playIcon}</button>
                    <button class="icon-btn edit-btn" title="Edit" data-task-id="${task.id}">${editIcon}</button>
                    <button class="icon-btn delete-btn delete" title="Delete" data-task-id="${task.id}">${deleteIcon}</button>
                </div>
            `;
            taskListContainer.appendChild(taskItem);
        });

        // Gán sự kiện cho các nút xóa mới được tạo
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.dataset.taskId;
                deleteTask(taskId);
            });
        });

        // Gán sự kiện cho các nút sửa mới được tạo
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.dataset.taskId;
                openModalForEdit(taskId);
            });
        });

        // Gán sự kiện cho các nút tạm dừng/tiếp tục
        document.querySelectorAll('.toggle-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.dataset.taskId;
                toggleTaskState(taskId);
            });
        });
    }

    // --- TẢI TÁC VỤ TỪ STORAGE ---
    function loadTasks() {
        chrome.storage.sync.get({ tasks: [] }, (data) => {
            renderTasks(data.tasks);
        });
    }

    // --- LẤY TẤT CẢ TÁC VỤ (dùng cho việc sửa) ---
    async function getTasks() {
        const data = await chrome.storage.sync.get({ tasks: [] });
        return data.tasks;
    }

    // --- XÓA MỘT TÁC VỤ ---
    function deleteTask(taskId) {
        chrome.runtime.sendMessage({ command: "deleteTask", taskId: taskId }, (response) => {
            if (response.status === "ok") {
                loadTasks(); // Tải lại danh sách
                showStatus('Task deleted!', '#dc322f');
            }
        });
    }

    // --- TẠM DỪNG / TIẾP TỤC MỘT TÁC VỤ ---
    function toggleTaskState(taskId) {
        chrome.runtime.sendMessage({ command: "toggleTaskState", taskId: taskId }, (response) => {
            if (response.status === "ok") {
                loadTasks(); // Tải lại danh sách để cập nhật trạng thái
                showStatus(`Task ${response.newState === true ? 'resumed' : 'paused'}.`, '#2aa198');
            }
        });
    }

    // --- LƯU LẠI THỨ TỰ MỚI SAU KHI KÉO THẢ ---
    function saveNewOrder() {
        const orderedTaskIds = [...taskListContainer.querySelectorAll('.task-item-options')].map(item => item.dataset.taskId);
        
        getTasks().then(tasks => {
            // Sắp xếp lại mảng tasks dựa trên thứ tự ID mới
            const newTasksArray = orderedTaskIds.map(id => {
                return tasks.find(task => task.id === id);
            }).filter(Boolean); // Lọc ra các undefined có thể xảy ra

            if (newTasksArray.length === tasks.length) {
                chrome.storage.sync.set({ tasks: newTasksArray }, () => {
                    showStatus('New order saved!', '#2aa198');
                });
            }
        });
    }

    // --- HIỂN THỊ TRẠNG THÁI ---
    function showStatus(message, color) {
        statusDiv.textContent = message;
        statusDiv.style.color = color;
        setTimeout(() => {
            statusDiv.textContent = '';
        }, 3000);
    }

    // --- XỬ LÝ CHỌN THỜI GIAN ---
    timeButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedMinutes = parseFloat(button.dataset.minutes);
            timeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            customMinutesInput.value = '';
        });
    });

    customMinutesInput.addEventListener('input', () => {
        timeButtons.forEach(btn => btn.classList.remove('active'));
        const val = parseFloat(customMinutesInput.value);
        selectedMinutes = isNaN(val) ? null : val;
    });

    // --- SỰ KIỆN NÚT THÊM TÁC VỤ ---
    saveTaskBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        const tabName = tabNameInput.value.trim();
        const minutes = selectedMinutes;
        const editingId = editingTaskIdInput.value;

        if (!url || !tabName || !minutes || minutes <= 0) {
            showStatus('Please fill in all fields: URL, Name, and Interval!', '#dc322f');
            return;
        }

        if (editingId) {
            // --- CHẾ ĐỘ SỬA ---
            // Lấy trạng thái isRunning hiện tại của tác vụ để không ghi đè nó
            getTasks().then(tasks => {
                const currentTask = tasks.find(t => t.id === editingId);
                const currentIsRunning = currentTask ? currentTask.isRunning : true; // Mặc định là true nếu không tìm thấy

                const updatedTask = { id: editingId, name: tabName, url: url, interval: minutes, isRunning: currentIsRunning };
                
                chrome.runtime.sendMessage({ command: "updateTask", task: updatedTask }, (response) => {
                    if (response.status === "ok") {
                        showStatus('Task updated successfully!', '#2aa198');
                        loadTasks();
                        closeModal();
                    }
                });
            });

        } else {
            // --- CHẾ ĐỘ THÊM MỚI ---
            const newTask = {
                id: `task_${Date.now()}`, // ID duy nhất
                name: tabName,
                url: url,
                interval: minutes,
                isRunning: true
            };
            chrome.runtime.sendMessage({ command: "addTask", task: newTask }, (response) => {
                if (response.status === "ok") {
                    showStatus('New task added successfully!', '#2aa198');
                    loadTasks();
                    closeModal();
                }
            });
        }
    });

    // --- XỬ LÝ MODAL ---
    function openModalForAdd() {
        modalTitle.textContent = 'Add New Task';
        modal.style.display = 'block';
    }

    async function openModalForEdit(taskId) {
        const tasks = await getTasks();
        const taskToEdit = tasks.find(t => t.id === taskId);
        if (!taskToEdit) return;

        modalTitle.textContent = 'Edit Task';
        editingTaskIdInput.value = taskToEdit.id;
        urlInput.value = taskToEdit.url;
        tabNameInput.value = taskToEdit.name;
        
        // Thiết lập lại các nút thời gian
        selectedMinutes = taskToEdit.interval;
        timeButtons.forEach(btn => btn.dataset.minutes == selectedMinutes ? btn.classList.add('active') : btn.classList.remove('active'));
        if (![1, 5, 15].includes(selectedMinutes)) { customMinutesInput.value = selectedMinutes; }

        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
        // Reset form khi đóng
        urlInput.value = '';
        tabNameInput.value = '';
        customMinutesInput.value = '';
        selectedMinutes = null;
        editingTaskIdInput.value = ''; // Quan trọng: xóa ID đang sửa
        timeButtons.forEach(btn => btn.classList.remove('active'));
    }

    openModalBtn.addEventListener('click', openModalForAdd);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });

    // --- XỬ LÝ KÉO THẢ ---
    taskListContainer.addEventListener('dragstart', e => {
        if (e.target.classList.contains('task-item-options')) {
            e.target.classList.add('dragging');
        }
    });

    taskListContainer.addEventListener('dragend', e => {
        if (e.target.classList.contains('task-item-options')) {
            e.target.classList.remove('dragging');
            saveNewOrder(); // Lưu lại thứ tự sau khi thả
        }
    });

    taskListContainer.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(taskListContainer, e.clientY);
        const draggingElement = document.querySelector('.dragging');
        if (draggingElement) {
            if (afterElement == null) {
                taskListContainer.appendChild(draggingElement);
            } else {
                taskListContainer.insertBefore(draggingElement, afterElement);
            }
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item-options:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Tải danh sách tác vụ khi trang được mở
    loadTasks();

    // --- KIỂM TRA URL HASH ĐỂ MỞ MODAL SỬA ---
    function checkUrlForEdit() {
        if (window.location.hash.startsWith('#edit=')) {
            const taskId = window.location.hash.substring(6); // Lấy ID từ hash, ví dụ: #edit=task_123
            openModalForEdit(taskId);
        }
    }
    checkUrlForEdit();
});