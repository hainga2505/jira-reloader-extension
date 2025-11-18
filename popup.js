document.addEventListener("DOMContentLoaded", () => {
    const btn1 = document.getElementById("btn-1");
    const btn2 = document.getElementById("btn-2");
    const btn3 = document.getElementById("btn-3");
    const customInput = document.getElementById("custom-minutes");
    const setCustomBtn = document.getElementById("set-custom-btn");
    const stopBtn = document.getElementById("stop-btn");
    const statusDiv = document.getElementById("status");

    // Hàm gửi lệnh đến background.js
    function setReloadTime(minutes) {
        chrome.runtime.sendMessage({ command: "setTime", minutes: minutes }, () => {
            statusDiv.textContent = `Đã đặt làm mới mỗi ${minutes} phút.`;
            window.close(); // Tự động đóng popup
        });
    }

    // Gán sự kiện cho các nút 1, 2, 3 phút
    btn1.addEventListener("click", () => setReloadTime(btn1.dataset.minutes));
    btn2.addEventListener("click", () => setReloadTime(btn2.dataset.minutes));
    btn3.addEventListener("click", () => setReloadTime(btn3.dataset.minutes));

    // Gán sự kiện cho nút tùy chỉnh
    setCustomBtn.addEventListener("click", () => {
        const minutes = customInput.value;
        if (minutes && parseFloat(minutes) > 0) {
            setReloadTime(minutes);
        } else {
            statusDiv.textContent = "Vui lòng nhập số phút hợp lệ.";
        }
    });

    // Gán sự kiện cho nút Dừng
    stopBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ command: "stop" }, () => {
            statusDiv.textContent = "Đã dừng tự động làm mới.";
            window.close(); // Tự động đóng popup
        });
    });

    // Khi mở popup, hiển thị cài đặt hiện tại
    chrome.storage.sync.get("reloadTime", (data) => {
        if (data.reloadTime) {
            statusDiv.textContent = `Hiện đang làm mới mỗi ${data.reloadTime} phút.`;
        } else {
            statusDiv.textContent = "Hiện không tự động làm mới.";
        }
    });
});