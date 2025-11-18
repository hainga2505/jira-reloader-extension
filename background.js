// URL CHÍNH XÁC của tab Jira bạn muốn làm mới
const JIRA_URL = "https://jira.secext.samsung.net/secure/Dashboard.jspa?selectPageId=35301";
const ALARM_NAME = "jiraReloader";

// --- HÀM TÌM VÀ LÀM MỚI TAB ---
function findAndReloadJiraTab() {
  console.log("Jira Reloader: Báo thức reo, đang tìm tab...");
  chrome.tabs.query({ url: JIRA_URL }, (tabs) => {
    if (tabs.length > 0) {
      const tab = tabs[0];
      console.log(`Jira Reloader: Đã tìm thấy tab ${tab.id}. Đang làm mới.`);
      chrome.tabs.reload(tab.id);
    } else {
      console.log("Jira Reloader: Không tìm thấy tab Jira. Sẽ thử lại sau.");
    }
  });
}

// --- LẮNG NGHE CÁC SỰ KIỆN ---

// 1. Khi báo thức reo
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    findAndReloadJiraTab();
  }
});

// 2. Lắng nghe "lệnh" từ file popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "setTime") {
    // Hủy báo thức cũ
    chrome.alarms.clear(ALARM_NAME, (wasCleared) => {
      // Tạo báo thức mới với thời gian được gửi từ popup
      const minutes = parseFloat(request.minutes);
      chrome.alarms.create(ALARM_NAME, {
        periodInMinutes: minutes
      });
      
      // Lưu cài đặt này
      chrome.storage.sync.set({ reloadTime: minutes });
      
      console.log(`Jira Reloader: Đã đặt báo thức mới là ${minutes} phút.`);
      sendResponse({ status: "done" }); // (Tùy chọn) Gửi phản hồi đơn giản
    });

    // THÊM DÒNG NÀY:
    // Báo cho Chrome biết rằng chúng ta sẽ gửi phản hồi sau (bất đồng bộ)
    // Điều này sẽ giữ cho cổng tin nhắn mở và sửa lỗi.
    return true; 

  } else if (request.command === "stop") {
    // Hủy báo thức khi nhấn Stop
    chrome.alarms.clear(ALARM_NAME);
    chrome.storage.sync.set({ reloadTime: null }); // Xóa cài đặt đã lưu
    console.log("Jira Reloader: Đã dừng báo thức.");
    sendResponse({ status: "stopped" }); // (TùY CHỌN) Gửi phản hồi đơn giản

    // THÊM DÒNG NÀY Ở ĐÂY NỮA!
    // Lệnh "stop" cũng có callback trong popup.js, nên nó cũng cần.
    return true;
  }
});

// 3. Khôi phục báo thức khi trình duyệt khởi động (nếu trước đó đã cài)
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get("reloadTime", (data) => {
    if (data.reloadTime) {
      console.log(`Jira Reloader: Khôi phục báo thức ${data.reloadTime} phút.`);
      chrome.alarms.create(ALARM_NAME, {
        periodInMinutes: parseFloat(data.reloadTime)
      });
    }
  });
});