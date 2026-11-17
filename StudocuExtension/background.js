// ==========================================================================
// Doc Downloader - Background Service Worker
// Tự động hóa xử lý mở khóa & tải PDF trong nền (kể cả khi popup bị đóng)
// ==========================================================================

// Lắng nghe khi tab reload xong để tự động kích hoạt tải PDF (phòng trường hợp popup bị đóng khi tab reload)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete') return;
    if (!tab || !tab.url) return;

    const isStudocu = tab.url.includes('studocu') || tab.url.includes('studeersnel');
    if (!isStudocu) return;

    try {
        const data = await chrome.storage.local.get([
            'banhmi_auto_studocu_tab',
            'banhmi_auto_studocu_time',
            'banhmi_auto_lang',
            'banhmi_auto_autoprint',
            'banhmi_lang'
        ]);

        if (data && data.banhmi_auto_studocu_time && (Date.now() - data.banhmi_auto_studocu_time < 30000)) {
            if (data.banhmi_auto_studocu_tab && data.banhmi_auto_studocu_tab !== tabId) return;

            // Xóa cờ ngay để tránh chạy lặp lại
            await chrome.storage.local.remove([
                'banhmi_auto_studocu_tab',
                'banhmi_auto_studocu_time'
            ]);

            const lang = data.banhmi_auto_lang || data.banhmi_lang || 'en';
            const autoPrint = !!data.banhmi_auto_autoprint;

            // Chờ 1.5s cho trang Studocu render React / Next.js
            setTimeout(async () => {
                try {
                    // Kiểm tra xem script đã chạy chưa
                    const results = await chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        func: () => !!window.__banhmi_studocu_running
                    });

                    if (results && results[0] && results[0].result) return;

                    await chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        func: (l, ap) => {
                            window.__banhmi_lang = l;
                            window.__banhmi_autoprint = ap;
                        },
                        args: [ lang, autoPrint ]
                    });

                    await chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ['inject_studocu_pdf.js']
                    });
                } catch (err) {
                    console.warn('[DocDownloader] Background auto-inject error:', err);
                }
            }, 1500);
        }
    } catch (e) {
        console.warn('[DocDownloader] Background storage check error:', e);
    }
});

// Lắng nghe message từ content.js để kích hoạt inject khi cần
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.action === 'injectStudocuPdf' && sender && sender.tab) {
        const tabId = sender.tab.id;
        (async () => {
            try {
                const data = await chrome.storage.local.get(['banhmi_auto_lang', 'banhmi_auto_autoprint', 'banhmi_lang']);
                const lang = (data && (data.banhmi_auto_lang || data.banhmi_lang)) || 'en';
                const autoPrint = !!(data && data.banhmi_auto_autoprint);

                const results = await chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    func: () => !!window.__banhmi_studocu_running
                });

                if (results && results[0] && results[0].result) {
                    sendResponse({ success: true, alreadyRunning: true });
                    return;
                }

                await chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    func: (l, ap) => {
                            window.__banhmi_lang = l;
                            window.__banhmi_autoprint = ap;
                        },
                    args: [ lang, autoPrint ]
                });

                await chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['inject_studocu_pdf.js']
                });
                sendResponse({ success: true });
            } catch (err) {
                sendResponse({ success: false, error: err.message });
            }
        })();
        return true; // Keep message channel open for async response
    }
});
