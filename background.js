// --- LẮNG NGHE CÁC SỰ KIỆN ---

// 1. Khi báo thức reo
chrome.alarms.onAlarm.addListener((alarm) => {
    // Chỉ xử lý các báo thức của extension này
    if (!alarm.name.startsWith('task_')) return;

    const taskId = alarm.name;
    chrome.storage.sync.get({ tasks: [] }, (data) => {
        const task = data.tasks.find(t => t.id === taskId);
        if (task && task.isRunning) {
            console.log(`Reloader: Alarm fired for task "${task.name}". Searching for tab...`);
            // Lấy tất cả các tab và tự lọc để xử lý các URL có chứa hash (#)
            chrome.tabs.query({}, (tabs) => {
                // Tìm tab có URL bắt đầu bằng URL đã lưu trong tác vụ.
                // Điều này đảm bảo nó hoạt động cho cả URL thường và URL có hash.
                const targetTab = tabs.find(tab => tab.url && tab.url.startsWith(task.url));

                if (targetTab) {
                    const tabId = targetTab.id;
                    console.log(`Reloader: Found tab ${tabId}. Reloading.`);
                    chrome.tabs.reload(tabId);
                } else {
                    console.log(`Reloader: Tab not found for task "${task.name}".`);
                }
            });
        }
    });
});

// 2. Lắng nghe "lệnh" từ các file giao diện
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === "addTask") {
        const newTask = request.task;
        chrome.storage.sync.get({ tasks: [] }, (data) => {
            const updatedTasks = [...data.tasks, newTask];
            chrome.storage.sync.set({ tasks: updatedTasks }, () => {
                // Tạo báo thức mới cho tác vụ này
                chrome.alarms.create(newTask.id, {
                    delayInMinutes: 0.1,
                    periodInMinutes: newTask.interval
                });
                console.log(`Reloader: Added and started task "${newTask.name}".`);
                sendResponse({ status: "ok" });
            });
        });
        return true; // Bất đồng bộ

    } else if (request.command === "deleteTask") {
        const taskId = request.taskId;
        chrome.storage.sync.get({ tasks: [] }, (data) => {
            const updatedTasks = data.tasks.filter(t => t.id !== taskId);
            chrome.storage.sync.set({ tasks: updatedTasks }, () => {
                // Xóa báo thức tương ứng
                chrome.alarms.clear(taskId);
                console.log(`Reloader: Deleted task ${taskId}.`);
                sendResponse({ status: "ok" });
            });
        });
        return true; // Bất đồng bộ

    } else if (request.command === "updateTask") {
        const updatedTask = request.task;
        chrome.storage.sync.get({ tasks: [] }, (data) => {
            const updatedTasks = data.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
            chrome.storage.sync.set({ tasks: updatedTasks }, () => {
                // Xóa báo thức cũ và tạo lại với thông tin mới
                chrome.alarms.clear(updatedTask.id, () => {
                    if (updatedTask.isRunning) {
                        chrome.alarms.create(updatedTask.id, {
                            delayInMinutes: 0.1,
                            periodInMinutes: updatedTask.interval
                        });
                    }
                });
                console.log(`Reloader: Updated task "${updatedTask.name}".`);
                sendResponse({ status: "ok" });
            });
        });
        return true; // Bất đồng bộ
    }
    else if (request.command === "toggleTaskState") {
        const taskId = request.taskId;
        chrome.storage.sync.get({ tasks: [] }, (data) => {
            let newState;
            const updatedTasks = data.tasks.map(t => {
                if (t.id === taskId) {
                    newState = !t.isRunning;
                    return { ...t, isRunning: newState };
                }
                return t;
            });

            chrome.storage.sync.set({ tasks: updatedTasks }, () => {
                if (newState === true) { // Nếu là tiếp tục
                    const task = updatedTasks.find(t => t.id === taskId);
                    chrome.alarms.create(task.id, { delayInMinutes: 0.1, periodInMinutes: task.interval });
                } else { // Nếu là tạm dừng
                    chrome.alarms.clear(taskId);
                }
                sendResponse({ status: "ok", newState: newState });
            });
        });
        return true; // Bất đồng bộ
    }

    // Có thể thêm các lệnh khác như "pauseTask", "resumeTask" ở đây trong tương lai

    return false;
});

// 3. Khôi phục báo thức khi trình duyệt khởi động (nếu trước đó đã cài)
chrome.runtime.onStartup.addListener(() => {
    console.log("Reloader: Browser started, restoring alarms...");
    chrome.storage.sync.get({ tasks: [] }, (data) => {
        data.tasks.forEach(task => {
            if (task.isRunning) {
                // Tạo lại báo thức cho mỗi tác vụ đang chạy
                chrome.alarms.create(task.id, {
                    delayInMinutes: 1, // Chờ 1 phút sau khi khởi động
                    periodInMinutes: task.interval
                });
                console.log(`- Restoring task: "${task.name}"`);
            }
        });
    });
});