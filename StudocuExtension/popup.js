// Localization Dictionary & Helper (supporting all 54 locales)
const TRANSLATIONS = (typeof window !== 'undefined' && window.TRANSLATIONS) ? window.TRANSLATIONS : {};
let currentLang = 'vi';

function getT(lang = currentLang) {
    const dict = (typeof window !== 'undefined' && window.TRANSLATIONS) ? window.TRANSLATIONS : TRANSLATIONS;
    if (!dict) return {};
    if (lang === 'vi') return dict.vi || {};
    return dict[lang] || dict[lang.split('_')[0]] || dict.en || dict.vi || {};
}

const VIEWER_AD_I18N = {};

function getViewerAdData(lang) {
    if (!lang) lang = 'en';
    const rawLang = lang;
    const cleanLang = (lang || '').toLowerCase().replace('-', '_');
    const baseLang = cleanLang.split('_')[0];
    return VIEWER_AD_I18N[rawLang] || VIEWER_AD_I18N[cleanLang] || VIEWER_AD_I18N[baseLang] || VIEWER_AD_I18N.en || {};
}

let activeTab = null;

// Get target tab (handles normal popup and popped out window)
async function getTargetTab() {
    // Fast path: normal popup mode, query active tab in current window directly
    if (!window.location.search || !window.location.search.includes('windowId')) {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) return tab;
        } catch (e) {}
    } else {
        // Slow path: Popout mode (parse parameters and query target window)
        const urlParams = new URLSearchParams(window.location.search);
        const windowIdParam = urlParams.get('windowId');
        if (windowIdParam) {
            const windowId = parseInt(windowIdParam, 10);
            try {
                const [tab] = await chrome.tabs.query({ active: true, windowId: windowId });
                if (tab) return tab;
            } catch (e) {}
        }
    }
    
    // Fallback 1: Query active tab in the last focused window
    try {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        if (tab && !tab.url.startsWith(chrome.runtime.getURL(""))) {
            return tab;
        }
    } catch (e) {}
    
    // Fallback 2: Query all active tabs and find the one that is not this extension
    try {
        const tabs = await chrome.tabs.query({ active: true });
        const extensionUrlPrefix = chrome.runtime.getURL("");
        const nonExtensionTabs = tabs.filter(t => t.url && !t.url.startsWith(extensionUrlPrefix));
        if (nonExtensionTabs.length > 0) {
            return nonExtensionTabs[0];
        }
    } catch (e) {}
    
    // Final fallback
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
}

// Clean viewer auto-close: listen for events from inject scripts or content.js
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message) => {
        if (message && (message.action === 'banhmi_close_popup' || message.action === 'clean_viewer_ready')) {
            window.close();
        }
    });
}

let cleanViewerWatcherInterval = null;
function startCleanViewerWatcher(tabId) {
    if (!tabId) return;
    if (cleanViewerWatcherInterval) {
        clearInterval(cleanViewerWatcherInterval);
    }
    let attempts = 0;
    cleanViewerWatcherInterval = setInterval(async () => {
        attempts++;
        if (attempts > 300) { // Timeout after 90s
            clearInterval(cleanViewerWatcherInterval);
            cleanViewerWatcherInterval = null;
            return;
        }
        try {
            const [res] = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => !!document.getElementById('clean-viewer-container')
            });
            if (res && res.result) {
                clearInterval(cleanViewerWatcherInterval);
                cleanViewerWatcherInterval = null;
                window.close();
            }
        } catch (e) {
            clearInterval(cleanViewerWatcherInterval);
            cleanViewerWatcherInterval = null;
        }
    }, 300);
}

// Start tab query immediately (runs in parallel with DOM parsing)
const activeTabPromise = getTargetTab().then(async tab => {
    activeTab = tab;
    return tab;
});

// ==========================================
// SETTINGS & PERSONALIZATION STATE
// ==========================================
const DEFAULT_SETTINGS = {
    aiDefaultModel: 'gemini',        // 'gemini' | 'chatgpt'
    aiLaunchMode: 'side_window',    // 'side_window' | 'new_tab'
    aiSideWidth: 460,               // 400 | 460 | 520
    aiAutoSubmit: true,             // true | false
    aiAutoClipboard: true,          // true | false
    aiDefaultIncludeDoc: true,      // true | false
    docAutoPrint: true,             // true | false
    docAutoScrollPrompt: true,      // true | false
    docAutoCleanOnVisit: false,     // true | false
    docViewerTheme: 'dark',         // 'dark' | 'light' (giao diện trang tải PDF)
    extensionTheme: 'light',        // 'light' | 'dark' (giao diện tiện ích)
    startupTab: 'last_used',        // 'last_used' | 'download' | 'ai'
    popupScale: 100,                // 100 | 90 | 80
    customSettingLang: '',          // User-selected language in settings
    showSpssService: true,          // true | false
    showVpnGuide: true              // true | false
};

let appSettings = Object.assign({}, DEFAULT_SETTINGS);

let lastAppliedTheme = null;
function applyExtensionTheme(theme) {
    const isDark = (theme === 'dark');
    const normalized = isDark ? 'dark' : 'light';
    if (isDark) {
        document.documentElement.classList.add('dark-theme');
        if (document.body) document.body.classList.add('dark-theme');
    } else {
        document.documentElement.classList.remove('dark-theme');
        if (document.body) document.body.classList.remove('dark-theme');
    }

    if (lastAppliedTheme !== normalized) {
        lastAppliedTheme = normalized;
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        const t = getT();
        if (themeToggleBtn) {
            themeToggleBtn.title = isDark ? (t.themeToggleToLight || "Chuyển sang nền sáng") : (t.themeToggleToDark || "Chuyển sang nền tối");
            themeToggleBtn.setAttribute('aria-label', themeToggleBtn.title);
            themeToggleBtn.innerHTML = isDark
                ? `<svg id="themeToggleIcon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
                : `<svg id="themeToggleIcon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        }

        document.querySelectorAll('#stExtensionThemeGroup .settings-pill-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === normalized);
        });

        try {
            localStorage.setItem('banhmi_extension_theme', theme);
        } catch (e) {}
    }
}

// Early restore cached extension theme to prevent layout flicker
try {
    const cachedExtTheme = localStorage.getItem('banhmi_extension_theme');
    if (cachedExtTheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
    }
} catch (e) {}

let lastAppliedScale = null;
function applyPopupScale(scalePercent) {
    let pct = parseInt(scalePercent, 10);
    // Backward compatibility fallback for older pixel values
    if (![80, 90, 100].includes(pct)) {
        pct = 100;
    }
    if (lastAppliedScale === pct) return;
    lastAppliedScale = pct;
    const factor = pct / 100;
    document.documentElement.style.setProperty('--popup-scale', factor.toString());
    document.documentElement.style.zoom = factor.toString();
    document.documentElement.style.width = '350px';
    if (document.body) {
        document.body.style.width = '350px';
        document.body.style.maxWidth = '350px';
    }
    try {
        localStorage.setItem('banhmi_popup_scale', pct.toString());
    } catch (e) {}
}

function applyPopupWidth(val) {
    applyPopupScale(val);
}

// Early restore cached popup scale to prevent layout flicker
try {
    const cachedPopupScale = localStorage.getItem('banhmi_popup_scale') || localStorage.getItem('banhmi_popup_width');
    if (cachedPopupScale) {
        applyPopupScale(cachedPopupScale);
    }
} catch (e) {}

async function loadSettings() {
    try {
        const stored = await chrome.storage.local.get(['banhmi_settings', 'banhmi_lang']);
        if (stored && stored.banhmi_settings) {
            appSettings = Object.assign({}, DEFAULT_SETTINGS, stored.banhmi_settings);
        }
        if (stored && stored.banhmi_lang && (TRANSLATIONS[stored.banhmi_lang] || ALL_LOCALES.some(l => l.code === stored.banhmi_lang))) {
            currentLang = stored.banhmi_lang;
            try { localStorage.setItem('banhmi_lang', stored.banhmi_lang); } catch (e) {}
        }
    } catch (e) {
        console.warn('BamiDoc: Load settings warning:', e);
    }
}

async function saveSetting(key, value) {
    appSettings[key] = value;
    try {
        await chrome.storage.local.set({ banhmi_settings: appSettings });
    } catch (e) {
        console.warn('BamiDoc: Save setting warning:', e);
    }
}

function getSetting(key, fallback) {
    if (appSettings && appSettings[key] !== undefined) {
        return appSettings[key];
    }
    return fallback !== undefined ? fallback : DEFAULT_SETTINGS[key];
}

function applySettingsToUI() {
    // 1. AI Settings
    updateCustomDropdownUI('stDefaultModelContainer', getSetting('aiDefaultModel', 'gemini'));
    updateCustomDropdownUI('stLaunchModeContainer', getSetting('aiLaunchMode', 'side_window'));

    const sideWidth = getSetting('aiSideWidth', 460);
    document.querySelectorAll('#stSideWidthGroup .settings-pill-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.value, 10) === sideWidth);
    });

    const stSideWidthRow = document.getElementById('stSideWidthRow');
    if (stSideWidthRow) {
        stSideWidthRow.style.display = (getSetting('aiLaunchMode', 'side_window') === 'new_tab') ? 'none' : 'flex';
    }

    const stAutoSubmit = document.getElementById('stAutoSubmit');
    if (stAutoSubmit) stAutoSubmit.checked = getSetting('aiAutoSubmit', true);

    const stAutoClipboard = document.getElementById('stAutoClipboard');
    if (stAutoClipboard) stAutoClipboard.checked = getSetting('aiAutoClipboard', true);

    const stDefaultIncludeDoc = document.getElementById('stDefaultIncludeDoc');
    if (stDefaultIncludeDoc) stDefaultIncludeDoc.checked = getSetting('aiDefaultIncludeDoc', true);

    // 2. Document Settings
    const stAutoPrint = document.getElementById('stAutoPrint');
    if (stAutoPrint) stAutoPrint.checked = getSetting('docAutoPrint', true);

    const stAutoScroll = document.getElementById('stAutoScroll');
    if (stAutoScroll) stAutoScroll.checked = getSetting('docAutoScrollPrompt', true);

    const viewerTheme = getSetting('docViewerTheme', 'dark');
    document.querySelectorAll('#stViewerThemeGroup .settings-pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === viewerTheme);
    });

    // 3. General Settings
    const extTheme = getSetting('extensionTheme', localStorage.getItem('banhmi_extension_theme') || 'light');
    applyExtensionTheme(extTheme);

    updateCustomDropdownUI('stLanguageContainer', currentLang);
    updateCustomDropdownUI('stStartupTabContainer', getSetting('startupTab', 'last_used'));

    const popupScale = getSetting('popupScale', 100);
    applyPopupScale(popupScale);
    document.querySelectorAll('#stPopupWidthGroup .settings-pill-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.value, 10) === (parseInt(popupScale, 10) || 100));
    });


    // Live elements toggles
    const spssBtn = document.getElementById('guideLinkBtn');
    if (spssBtn) spssBtn.style.display = false ? 'flex' : 'none';

    const vpnGuide = document.getElementById('vpnGuide');
    if (vpnGuide) vpnGuide.style.display = 'block';

    const tipText = document.getElementById('tipText');
    if (tipText) tipText.style.display = getSetting('docAutoScrollPrompt', true) ? 'flex' : 'none';
}

async function removeAllStudocuCookies(tabUrl) {
    try {
        let currentHost = '';
        if (tabUrl) {
            try { currentHost = new URL(tabUrl).hostname; } catch(e) {}
        }
        const allCookies = await chrome.cookies.getAll({});
        for (const cookie of allCookies) {
            const d = (cookie.domain || '').toLowerCase();
            if (d.includes('studocu') || d.includes('studeersnel')) {
                let cleanDomain = d.startsWith('.') ? d.substring(1) : d;
                const path = cookie.path || '/';
                const urlsToTry = [
                    `https://${cleanDomain}${path}`,
                    `http://${cleanDomain}${path}`
                ];
                if (currentHost && currentHost !== cleanDomain) {
                    urlsToTry.push(`https://${currentHost}${path}`);
                    urlsToTry.push(`http://${currentHost}${path}`);
                }
                for (const u of urlsToTry) {
                    try {
                        await chrome.cookies.remove({ url: u, name: cookie.name, storeId: cookie.storeId });
                    } catch(e) {}
                }
            }
        }
    } catch(e) {}
}

async function clearStorageInTab(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                try {
                    window.localStorage.clear();
                    window.sessionStorage.clear();
                } catch(e) {}
            }
        });
    } catch(e) {}
}

async function clearCookiesAndReload(tab, btnElement = null) {
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en || TRANSLATIONS.vi;
    if (btnElement) {
        btnElement.style.opacity = '0.5';
        btnElement.style.pointerEvents = 'none';
        const heading = btnElement.querySelector('.btn-heading');
        if (heading) heading.innerText = t.alertProcessing || "Đang xử lý...";
    }

    try {
        await removeAllStudocuCookies(tab.url);
        await clearStorageInTab(tab.id);

        // Wait to ensure cookies deletion translates to network
        await new Promise(r => setTimeout(r, 200));

        chrome.tabs.reload(tab.id);

        // Wait a bit and restore button state
        await new Promise(r => setTimeout(r, 1500));
        if (btnElement) {
            btnElement.style.opacity = '1';
            btnElement.style.pointerEvents = 'auto';
            updateDynamicTexts();
        }

    } catch (e) {
        alert((t.alertError || "Lỗi: ") + e.message);
        if (btnElement) {
            btnElement.style.opacity = '1';
            btnElement.style.pointerEvents = 'auto';
            updateDynamicTexts();
        }
    }
}

let currentActiveTab = localStorage.getItem('banhmi_last_tab') || 'download';

// Tab switching helper with smooth transitions
function switchToTab(tabName, isInitial = false) {
    tabName = "download";
    const prevTab = currentActiveTab;
    currentActiveTab = "download";
    const tabDownloadBtn = document.getElementById('tabDownloadBtn');
    const tabAIBtn = document.getElementById('tabAIBtn');
    const downloadTabContent = document.getElementById('downloadTabContent');
    const aiTabContent = document.getElementById('aiTabContent');
    const navTabsContainer = document.getElementById('navTabsContainer') || document.querySelector('.nav-tabs');
    if (!tabDownloadBtn || !tabAIBtn || !downloadTabContent || !aiTabContent) return;

    if (navTabsContainer) {
        navTabsContainer.setAttribute('data-active', tabName);
    }

    // Reset animation classes across tab contents
    downloadTabContent.classList.remove('slide-from-left', 'slide-from-right');
    aiTabContent.classList.remove('slide-from-left', 'slide-from-right');

    if (tabName === 'ai') {
        tabAIBtn.classList.add('active');
        tabDownloadBtn.classList.remove('active');
        downloadTabContent.classList.remove('active');
        aiTabContent.classList.add('active');
        if (!isInitial && prevTab === 'download') {
            requestAnimationFrame(() => {
                aiTabContent.classList.add('slide-from-right');
            });
        }
        localStorage.setItem('banhmi_last_tab', 'ai');
        const tab = activeTab;
        if (tab && typeof updateDocBadge === 'function') updateDocBadge(tab);
    } else {
        tabDownloadBtn.classList.add('active');
        tabAIBtn.classList.remove('active');
        aiTabContent.classList.remove('active');
        downloadTabContent.classList.add('active');
        if (!isInitial && prevTab === 'ai') {
            requestAnimationFrame(() => {
                downloadTabContent.classList.add('slide-from-left');
            });
        }
        localStorage.setItem('banhmi_last_tab', 'download');
    }
}

// AI Model SVGs & Switcher
const chatGptTriggerSvg = `<svg class="ai-model-logo-svg chatgpt-icon" viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829l2.02-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4018-.6818zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.6069 1.4997-2.602-1.4997z"/></svg>`;

const geminiTriggerSvg = `<svg class="ai-model-logo-svg gemini-icon" viewBox="0 0 65 65" width="15" height="15"><use href="#geminiOfficialShape"></use></svg>`;

function updateAIModelUI(model) {
    if (!['gemini', 'chatgpt'].includes(model)) model = 'gemini';
    const aiModelSelect = document.getElementById('aiModelSelect');
    const aiModelCurrentIcon = document.getElementById('aiModelCurrentIcon');
    const aiModelCurrentName = document.getElementById('aiModelCurrentName');
    const aiModelMenuItems = document.querySelectorAll('.ai-model-menu-item');

    if (aiModelSelect) {
        aiModelSelect.value = model;
    }
    localStorage.setItem('banhmi_ai_model', model);

    if (aiModelCurrentIcon && aiModelCurrentName) {
        if (model === 'chatgpt') {
            aiModelCurrentIcon.innerHTML = chatGptTriggerSvg;
            aiModelCurrentName.textContent = 'ChatGPT';
        } else {
            aiModelCurrentIcon.innerHTML = geminiTriggerSvg;
            aiModelCurrentName.textContent = 'Gemini';
        }
    }

    if (aiModelMenuItems) {
        aiModelMenuItems.forEach(item => {
            if (item.getAttribute('data-value') === model) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// Universal SVG Flag icons for 54 Chrome Web Store locales
const FLAG_SVG_CACHE = new Map();
function getFlagSvg(code) {
    if (FLAG_SVG_CACHE.has(code)) return FLAG_SVG_CACHE.get(code);
    let res = '';
    switch (code) {
        case 'vi':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#da251d"/><polygon points="15,4 16.17,7.62 20,7.62 16.9,9.88 18.08,13.5 15,11.25 11.92,13.5 13.1,9.88 10,7.62 13.83,7.62" fill="#ffff00"/></svg>';
            break;
        case 'en':
        case 'en_US':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#fff"/><rect width="30" height="1.54" y="0" fill="#b22234"/><rect width="30" height="1.54" y="3.08" fill="#b22234"/><rect width="30" height="1.54" y="6.16" fill="#b22234"/><rect width="30" height="1.54" y="9.24" fill="#b22234"/><rect width="30" height="1.54" y="12.32" fill="#b22234"/><rect width="30" height="1.54" y="15.4" fill="#b22234"/><rect width="30" height="1.54" y="18.46" fill="#b22234"/><rect width="12" height="10.8" fill="#3c3b6e"/></svg>';
            break;
        case 'en_GB':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#012169"/><path d="M0,0 L30,20 M30,0 L0,20" stroke="#fff" stroke-width="4"/><path d="M0,0 L30,20 M30,0 L0,20" stroke="#c8102e" stroke-width="2"/><path d="M15,0 V20 M0,10 H30" stroke="#fff" stroke-width="6"/><path d="M15,0 V20 M0,10 H30" stroke="#c8102e" stroke-width="3.5"/></svg>';
            break;
        case 'es':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#c60b1e"/><rect width="30" height="10" y="5" fill="#ffc400"/><rect width="2.5" height="4" x="6" y="8" fill="#c60b1e" rx="0.5"/><circle cx="7.25" cy="7" r="1" fill="#ffff00"/></svg>';
            break;
        case 'es_419':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#74acdf"/><rect width="30" height="6.6" y="6.6" fill="#fff"/><circle cx="15" cy="10" r="2.2" fill="#f6b40e"/></svg>';
            break;
        case 'fr':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="10" height="20" fill="#002654"/><rect width="10" height="20" x="10" fill="#fff"/><rect width="10" height="20" x="20" fill="#ed2939"/></svg>';
            break;
        case 'de':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="6.66" fill="#000"/><rect width="30" height="6.66" y="6.66" fill="#dd0000"/><rect width="30" height="6.66" y="13.32" fill="#ffce00"/></svg>';
            break;
        case 'it':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="10" height="20" fill="#009246"/><rect width="10" height="20" x="10" fill="#fff"/><rect width="10" height="20" x="20" fill="#ce2b37"/></svg>';
            break;
        case 'id':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="10" fill="#e21c21"/><rect width="30" height="10" y="10" fill="#fff"/></svg>';
            break;
        case 'pt':
        case 'pt_PT':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#de1219"/><rect width="12" height="20" fill="#00662f"/><circle cx="12" cy="10" r="3.5" fill="#ffd700"/><rect width="2" height="2.5" x="11" y="8.75" fill="#de1219"/></svg>';
            break;
        case 'pt_BR':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#009739"/><polygon points="15,2 27,10 15,18 3,10" fill="#fedd00"/><circle cx="15" cy="10" r="4" fill="#012169"/></svg>';
            break;
        case 'zh_CN':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#de2910"/><polygon points="5,3 5.8,5.4 8,5.4 6.2,6.8 6.9,9 5,7.6 3.1,9 3.8,6.8 2,5.4 4.2,5.4" fill="#ffde00"/></svg>';
            break;
        case 'zh_TW':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#fe0000"/><rect width="15" height="10" fill="#000095"/><circle cx="7.5" cy="5" r="3" fill="#fff"/></svg>';
            break;
        case 'ja':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="5.5" fill="#bc002d"/></svg>';
            break;
        case 'ko':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="4.5" fill="#cd2e3a"/><path d="M15,14.5 A4.5,4.5 0 0,0 15,5.5 A2.25,2.25 0 0,0 15,10 A2.25,2.25 0 0,1 15,14.5" fill="#0047a0"/></svg>';
            break;
        case 'ru':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="6.66" fill="#fff"/><rect width="30" height="6.66" y="6.66" fill="#0039a6"/><rect width="30" height="6.66" y="13.32" fill="#d52b1e"/></svg>';
            break;
        case 'th':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#a51931"/><rect width="30" height="13.3" y="3.3" fill="#f4f5f8"/><rect width="30" height="6.6" y="6.6" fill="#2d2a4a"/></svg>';
            break;
        case 'ar':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="6.66" fill="#000"/><rect width="30" height="6.66" y="6.66" fill="#fff"/><rect width="30" height="6.66" y="13.32" fill="#007a3d"/><polygon points="0,0 10,10 0,20" fill="#ce1126"/></svg>';
            break;
        case 'hi':
        case 'gu':
        case 'kn':
        case 'ml':
        case 'mr':
        case 'ta':
        case 'te':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="6.66" fill="#ff9933"/><rect width="30" height="6.66" y="6.66" fill="#fff"/><rect width="30" height="6.66" y="13.32" fill="#138808"/><circle cx="15" cy="10" r="2.2" fill="#000080"/></svg>';
            break;
        case 'tr':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#e30a17"/><circle cx="13" cy="10" r="4.5" fill="#fff"/><circle cx="14.2" cy="10" r="3.6" fill="#e30a17"/><polygon points="18.5,10 16.5,9.2 17.5,11" fill="#fff"/></svg>';
            break;
        case 'pl':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="10" fill="#fff"/><rect width="30" height="10" y="10" fill="#dc143c"/></svg>';
            break;
        case 'nl':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="6.66" fill="#ae1c28"/><rect width="30" height="6.66" y="6.66" fill="#fff"/><rect width="30" height="6.66" y="13.32" fill="#21468b"/></svg>';
            break;
        case 'sv':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#006aa7"/><rect width="4" height="20" x="9" fill="#fecc00"/><rect width="30" height="4" y="8" fill="#fecc00"/></svg>';
            break;
        case 'uk':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="10" fill="#0057b7"/><rect width="30" height="10" y="10" fill="#ffd700"/></svg>';
            break;
        case 'cs':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="10" fill="#fff"/><rect width="30" height="10" y="10" fill="#d7141a"/><polygon points="0,0 12,10 0,20" fill="#11457e"/></svg>';
            break;
        case 'el':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#0d5eaf"/><rect width="30" height="2.2" y="2.2" fill="#fff"/><rect width="30" height="2.2" y="6.6" fill="#fff"/><rect width="30" height="2.2" y="11" fill="#fff"/><rect width="30" height="2.2" y="15.4" fill="#fff"/><rect width="10" height="10" fill="#0d5eaf"/><rect width="2.2" height="10" x="3.9" fill="#fff"/><rect width="10" height="2.2" y="3.9" fill="#fff"/></svg>';
            break;
        case 'he':
        case 'iw':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#fff"/><rect width="30" height="3" y="2" fill="#0038b8"/><rect width="30" height="3" y="15" fill="#0038b8"/><polygon points="15,6.5 17.5,11.5 12.5,11.5" stroke="#0038b8" fill="none" stroke-width="0.8"/><polygon points="15,12.5 17.5,7.5 12.5,7.5" stroke="#0038b8" fill="none" stroke-width="0.8"/></svg>';
            break;
        case 'ro':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="10" height="20" fill="#002b7f"/><rect width="10" height="20" x="10" fill="#fcd116"/><rect width="10" height="20" x="20" fill="#ce1126"/></svg>';
            break;
        case 'hu':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="6.66" fill="#ce2939"/><rect width="30" height="6.66" y="6.66" fill="#fff"/><rect width="30" height="6.66" y="13.32" fill="#477050"/></svg>';
            break;
        case 'da':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#c8102e"/><rect width="3.5" height="20" x="8" fill="#fff"/><rect width="30" height="3.5" y="8.2" fill="#fff"/></svg>';
            break;
        case 'fi':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#fff"/><rect width="4.5" height="20" x="8" fill="#002f6c"/><rect width="30" height="4.5" y="7.7" fill="#002f6c"/></svg>';
            break;
        case 'no':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#ba0c2f"/><rect width="5" height="20" x="8" fill="#fff"/><rect width="30" height="5" y="7.5" fill="#fff"/><rect width="2.5" height="20" x="9.2" fill="#00205b"/><rect width="30" height="2.5" y="8.7" fill="#00205b"/></svg>';
            break;
        case 'sk':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="6.66" fill="#fff"/><rect width="30" height="6.66" y="6.66" fill="#0b4ea2"/><rect width="30" height="6.66" y="13.32" fill="#ee1c25"/></svg>';
            break;
        case 'bg':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="6.66" fill="#fff"/><rect width="30" height="6.66" y="6.66" fill="#00966e"/><rect width="30" height="6.66" y="13.32" fill="#d62612"/></svg>';
            break;
        case 'hr':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="6.66" fill="#ff0000"/><rect width="30" height="6.66" y="6.66" fill="#fff"/><rect width="30" height="6.66" y="13.32" fill="#171796"/><rect width="4" height="4" x="13" y="8" fill="#ff0000"/></svg>';
            break;
        case 'sr':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="6.66" fill="#c6363c"/><rect width="30" height="6.66" y="6.66" fill="#0c4076"/><rect width="30" height="6.66" y="13.32" fill="#fff"/></svg>';
            break;
        case 'sl':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="6.66" fill="#fff"/><rect width="30" height="6.66" y="6.66" fill="#005ce6"/><rect width="30" height="6.66" y="13.32" fill="#ed1c24"/></svg>';
            break;
        case 'ca':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#fad100"/><rect width="30" height="2.5" y="2.5" fill="#de1219"/><rect width="30" height="2.5" y="7.5" fill="#de1219"/><rect width="30" height="2.5" y="12.5" fill="#de1219"/><rect width="30" height="2.5" y="17.5" fill="#de1219"/></svg>';
            break;
        case 'ms':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#fff"/><rect width="30" height="1.8" fill="#cc0001"/><rect width="30" height="1.8" y="3.6" fill="#cc0001"/><rect width="30" height="1.8" y="7.2" fill="#cc0001"/><rect width="30" height="1.8" y="10.8" fill="#cc0001"/><rect width="30" height="1.8" y="14.4" fill="#cc0001"/><rect width="30" height="1.8" y="18" fill="#cc0001"/><rect width="14" height="10" fill="#010066"/><circle cx="7" cy="5" r="2.5" fill="#ffcc00"/></svg>';
            break;
        case 'fil':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="10" fill="#0038a8"/><rect width="30" height="10" y="10" fill="#ce1126"/><polygon points="0,0 12,10 0,20" fill="#fff"/><circle cx="4" cy="10" r="1.5" fill="#fcd116"/></svg>';
            break;
        case 'bn':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#006a4e"/><circle cx="13" cy="10" r="5" fill="#f42a41"/></svg>';
            break;
        case 'fa':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="6.66" fill="#239f40"/><rect width="30" height="6.66" y="6.66" fill="#fff"/><rect width="30" height="6.66" y="13.32" fill="#da0000"/><circle cx="15" cy="10" r="1.8" fill="#da0000"/></svg>';
            break;
        case 'et':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="6.66" fill="#0072ce"/><rect width="30" height="6.66" y="6.66" fill="#000"/><rect width="30" height="6.66" y="13.32" fill="#fff"/></svg>';
            break;
        case 'lv':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#9e3039"/><rect width="30" height="4" y="8" fill="#fff"/></svg>';
            break;
        case 'lt':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="6.66" fill="#fdb913"/><rect width="30" height="6.66" y="6.66" fill="#006a44"/><rect width="30" height="6.66" y="13.32" fill="#c1272d"/></svg>';
            break;
        case 'sw':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><polygon points="0,0 30,0 0,16" fill="#1eb53a"/><polygon points="30,4 30,20 0,20" fill="#00a3dd"/><polygon points="0,17 0,20 5,20 30,3 30,0 25,0" fill="#fcd116"/><polygon points="0,18.5 0,20 2,20 30,1.5 30,0 28,0" fill="#000"/></svg>';
            break;
        case 'am':
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="6.66" fill="#078930"/><rect width="30" height="6.66" y="6.66" fill="#fcdd09"/><rect width="30" height="6.66" y="13.32" fill="#da121a"/><circle cx="15" cy="10" r="2.5" fill="#0f47af"/></svg>';
            break;
        default:
            res = '<svg class="flag-icon" viewBox="0 0 30 20" width="16" height="11"><rect width="30" height="20" fill="#4B5563" rx="2"/><text x="15" y="14" fill="#fff" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle">' + code.toUpperCase().slice(0, 2) + '</text></svg>';
            break;
    }
    FLAG_SVG_CACHE.set(code, res);
    return res;
}

// 54 Official Chrome Web Store locales
const ALL_LOCALES = [
    { code: 'vi', name: 'Tiếng Việt', en: 'Vietnamese', tag: 'VI' },
    { code: 'en', name: 'English', en: 'English', tag: 'EN' }
];

const LOCALE_MAP = new Map(ALL_LOCALES.map(loc => [loc.code, loc]));

let isLanguageDropdownBuilt = false;

function ensureLanguageDropdownBuilt() {
    const list = document.getElementById('stLanguageList');
    if (!list || isLanguageDropdownBuilt) return list;

    list.innerHTML = ALL_LOCALES.map(loc => {
        const flagSvg = getFlagSvg(loc.code);
        return `
            <div class="settings-dropdown-item" data-value="${loc.code}">
                <div class="settings-dropdown-item-left">
                    <span class="settings-dropdown-flag">${flagSvg}</span>
                    <span class="settings-dropdown-item-name">${loc.name} (${loc.tag})</span>
                </div>
                <svg class="settings-dropdown-check" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
        `;
    }).join('');

    // Single delegated click listener on list container for instant responsiveness
    list.addEventListener('click', (e) => {
        const item = e.target.closest('.settings-dropdown-item');
        if (!item) return;
        e.stopPropagation();
        const val = item.getAttribute('data-value');
        const wrapper = document.getElementById('stLanguageContainer');
        const input = document.getElementById('stLanguage');
        const trigger = document.getElementById('stLanguageTrigger');
        const menu = document.getElementById('stLanguageMenu');

        if (input) {
            input.value = val;
            input.dispatchEvent(new Event('change'));
        }
        updateCustomDropdownUI('stLanguageContainer', val);

        if (wrapper) wrapper.classList.remove('open', 'dropup');
        if (trigger) {
            trigger.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
        }
        if (menu) menu.classList.remove('open');

        // Record as user-chosen language in settings for quick toggle
        saveSetting('customSettingLang', val);
        try {
            localStorage.setItem('banhmi_setting_lang', val);
        } catch (err) {}

        applyLanguage(val, true);
    });

    isLanguageDropdownBuilt = true;
    return list;
}

function renderLanguageDropdown(activeCode) {
    const list = ensureLanguageDropdownBuilt();
    if (!list) return;

    // High performance toggle: update class on previous & active items only
    const prevActive = list.querySelector('.settings-dropdown-item.active');
    if (prevActive && prevActive.getAttribute('data-value') === activeCode) {
        return;
    }
    if (prevActive) {
        prevActive.classList.remove('active');
    }
    const currentActive = list.querySelector(`.settings-dropdown-item[data-value="${activeCode}"]`);
    if (currentActive) {
        currentActive.classList.add('active');
    }
}

function initLanguageSearch() {
    const searchInput = document.getElementById('stLanguageSearch');
    if (!searchInput) return;

    searchInput.addEventListener('click', (e) => e.stopPropagation());
    searchInput.addEventListener('keydown', (e) => e.stopPropagation());

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.trim().toLowerCase();
        const items = document.querySelectorAll('#stLanguageList .settings-dropdown-item');
        items.forEach(item => {
            const val = item.getAttribute('data-value');
            const loc = LOCALE_MAP.get(val);
            const text = (item.textContent || '').toLowerCase();
            const enText = loc ? loc.en.toLowerCase() : '';
            if (!term || text.includes(term) || (val && val.toLowerCase().includes(term)) || enText.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

// Settings Custom Dropdown Helpers
function updateCustomDropdownUI(wrapperId, value) {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    const input = wrapper.querySelector('input[type="hidden"]');
    if (input) input.value = value;

    const triggerText = wrapper.querySelector('.settings-dropdown-text');
    const triggerIcon = wrapper.querySelector('.settings-dropdown-icon');

    if (wrapperId === 'stLanguageContainer') {
        const items = wrapper.querySelectorAll('.settings-dropdown-item');
        items.forEach(item => {
            if (item.getAttribute('data-value') === value) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        const loc = LOCALE_MAP.get(value);
        if (loc) {
            if (triggerText) triggerText.textContent = loc.name;
            if (triggerIcon) triggerIcon.innerHTML = getFlagSvg(loc.code);
        }
        return;
    }

    const items = wrapper.querySelectorAll('.settings-dropdown-item');
    let matchedItem = null;
    items.forEach(item => {
        if (item.getAttribute('data-value') === value) {
            item.classList.add('active');
            matchedItem = item;
        } else {
            item.classList.remove('active');
        }
    });

    if (matchedItem) {
        const itemText = matchedItem.querySelector('.settings-dropdown-item-name');
        if (triggerText && itemText) triggerText.textContent = itemText.textContent;
        const itemIcon = matchedItem.querySelector('.dropdown-logo-svg, .settings-dropdown-flag, svg');
        if (triggerIcon && itemIcon) {
            if (wrapperId === 'stDefaultModelContainer' && value === 'gemini') {
                triggerIcon.innerHTML = `<svg class="dropdown-logo-svg gemini-icon" viewBox="0 0 65 65" width="14" height="14"><use href="#geminiOfficialShape"></use></svg>`;
            } else {
                triggerIcon.innerHTML = itemIcon.outerHTML;
            }
        }
    }
}

function initSettingsDropdowns() {
    const dropdownWrappers = document.querySelectorAll('.settings-dropdown-wrapper');

    dropdownWrappers.forEach(wrapper => {
        const trigger = wrapper.querySelector('.settings-dropdown-trigger');
        const menu = wrapper.querySelector('.settings-dropdown-menu');
        const items = wrapper.querySelectorAll('.settings-dropdown-item');
        const input = wrapper.querySelector('input[type="hidden"]');

        if (!trigger || !menu) return;

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = wrapper.classList.contains('open');

            // Close all dropdowns
            dropdownWrappers.forEach(w => {
                w.classList.remove('open', 'dropup');
                const t = w.querySelector('.settings-dropdown-trigger');
                const m = w.querySelector('.settings-dropdown-menu');
                if (t) {
                    t.classList.remove('open');
                    t.setAttribute('aria-expanded', 'false');
                }
                if (m) m.classList.remove('open');
            });

            if (!isOpen) {
                const rect = trigger.getBoundingClientRect();
                if (window.innerHeight - rect.bottom < 180 && rect.top > 160) {
                    wrapper.classList.add('dropup');
                }
                wrapper.classList.add('open');
                trigger.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
                menu.classList.add('open');

                if (wrapper.id === 'stLanguageContainer') {
                    const searchInput = document.getElementById('stLanguageSearch');
                    if (searchInput) {
                        searchInput.value = '';
                        const langItems = document.querySelectorAll('#stLanguageList .settings-dropdown-item');
                        langItems.forEach(i => i.style.display = 'flex');
                        setTimeout(() => {
                            searchInput.focus();
                            const activeItem = document.querySelector('#stLanguageList .settings-dropdown-item.active');
                            if (activeItem) {
                                activeItem.scrollIntoView({ block: 'nearest' });
                            }
                        }, 50);
                    }
                }
            }
        });

        // Skip language items as they are dynamically managed by renderLanguageDropdown
        if (wrapper.id === 'stLanguageContainer') return;

        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const val = item.getAttribute('data-value');
                if (input) {
                    input.value = val;
                    input.dispatchEvent(new Event('change'));
                }
                updateCustomDropdownUI(wrapper.id, val);

                wrapper.classList.remove('open', 'dropup');
                trigger.classList.remove('open');
                trigger.setAttribute('aria-expanded', 'false');
                menu.classList.remove('open');

                if (wrapper.id === 'stDefaultModelContainer') {
                    saveSetting('aiDefaultModel', val);
                    updateAIModelUI(val);
                } else if (wrapper.id === 'stLaunchModeContainer') {
                    saveSetting('aiLaunchMode', val);
                    const stSideWidthRow = document.getElementById('stSideWidthRow');
                    if (stSideWidthRow) {
                        stSideWidthRow.style.display = (val === 'new_tab') ? 'none' : 'flex';
                    }
                } else if (wrapper.id === 'stStartupTabContainer') {
                    saveSetting('startupTab', val);
                }
            });
        });
    });

    document.addEventListener('click', (e) => {
        dropdownWrappers.forEach(w => {
            if (!w.contains(e.target)) {
                w.classList.remove('open', 'dropup');
                const t = w.querySelector('.settings-dropdown-trigger');
                const m = w.querySelector('.settings-dropdown-menu');
                if (t) {
                    t.classList.remove('open');
                    t.setAttribute('aria-expanded', 'false');
                }
                if (m) m.classList.remove('open');
            }
        });
    });
}

// Deferred initialization of all event listeners & DOM queries to avoid blocking paint
function initEventListeners() {
    // Mở khóa / Xem file & Xóa Watermark click listener
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', async (e) => {
            const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en || TRANSLATIONS.vi;
            const tab = activeTab || await getTargetTab();
            if (!tab) {
                alert(t.alertCannotDetectTab || "⚠️ Không thể xác định tab hiện tại.");
                return;
            }
            
            if (tab.url.includes("studocu") || tab.url.includes("studeersnel")) {
                clearCookiesAndReload(tab, clearBtn);
            } else if (tab.url.includes("scribd.com")) {
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: (lang) => { window.__banhmi_lang = lang; },
                        args: [currentLang]
                    });
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ["inject_scribd_unblur.js"]
                    });
                    const heading = clearBtn ? clearBtn.querySelector('.btn-heading') : null;
                    if (heading) {
                        const originalText = heading.innerText;
                        heading.innerText = t.btnDone || (currentLang === 'vi' ? "Hoàn tất!" : "Done!");
                        setTimeout(() => { if (heading) heading.innerText = originalText; }, 2000);
                    }
                } catch (err) {
                    alert((t.alertError || "⚠️ Lỗi: ") + err.message);
                }
            } else if (tab.url.includes("slideshare.net")) {
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: (lang) => { window.__banhmi_lang = lang; },
                        args: [currentLang]
                    });
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ["inject_slideshare_unblur.js"]
                    });
                    const heading = clearBtn ? clearBtn.querySelector('.btn-heading') : null;
                    if (heading) {
                        const originalText = heading.innerText;
                        heading.innerText = t.btnDone || (currentLang === 'vi' ? "Hoàn tất!" : "Done!");
                        setTimeout(() => { if (heading) heading.innerText = originalText; }, 2000);
                    }
                } catch (err) {
                    alert((t.alertError || "⚠️ Lỗi: ") + err.message);
                }
            } else {
                alert(t.alertSupportedSitesOnly || "⚠️ Tính năng này chỉ hoạt động trên trang Studocu, Scribd hoặc SlideShare.");
            }
        });
    }

    // Tải File PDF click listener
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
        checkBtn.addEventListener('click', async (e) => {
            const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en || TRANSLATIONS.vi;
            const tab = activeTab || await getTargetTab();
            if (!tab) {
                alert(t.alertCannotDetectTab || "⚠️ Không thể xác định tab hiện tại.");
                return;
            }

            if (tab.url.includes("studocu") || tab.url.includes("studeersnel")) {
                const headingEl = checkBtn.querySelector('.btn-heading');
                const subEl = checkBtn.querySelector('.btn-sub');
                const origHeading = headingEl ? headingEl.innerText : '';
                const origSub = subEl ? subEl.innerText : '';

                try {
                    // 1. Kiểm tra chính xác xem tài liệu có trang bị khóa/mờ không
                    let docCheck = null;
                    try {
                        const [{ result }] = await chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            func: () => {
                                try {
                                    let isGated = false;
                                    let total = 0;
                                    let validAllowed = 0;

                                    // A. Kiểm tra qua __NEXT_DATA__
                                    const el = document.querySelector('#__NEXT_DATA__');
                                    if (el && el.textContent) {
                                        try {
                                            const data = JSON.parse(el.textContent);
                                            const props = data && data.props && data.props.pageProps;
                                            const da = props && props.documentAccess;
                                            const doc = props && props.document;
                                            const sp = da && da.signedQueryParams;
                                            total = doc ? (doc.numberOfPages || doc.pageCount || 0) : 0;
                                            const hasBlurred = !!(da && da.hasBlurredPages) || !!(doc && doc.hasBlurredPages) || !!(props && props.hasBlurredPages);
                                            
                                            // Đếm số trang thực sự có chữ ký (không bị mờ)
                                            if (sp && Array.isArray(sp.pages)) {
                                                sp.pages.forEach(p => {
                                                    if (p && typeof p.signedQueryParams === 'string' && p.signedQueryParams.trim().length > 0) {
                                                        validAllowed++;
                                                    }
                                                });
                                            }

                                            if (hasBlurred) {
                                                isGated = true;
                                            } else if (total > 0 && validAllowed > 0 && total > validAllowed) {
                                                isGated = true;
                                            }
                                        } catch(e) {}
                                    }

                                    // B. Kiểm tra qua DOM phần tử bị làm mờ / banner giới hạn
                                    if (!isGated) {
                                        const blurredEl = document.querySelector(
                                            '.blurred-page, img[src*="/pages/blurred/"], img[src*="/blurred/"], [class*="blurred-page"], [class*="BlurredPage"], [data-test-selector*="blurred"], [class*="PremiumBanner"], .banhmi-gated-note'
                                        );
                                        if (blurredEl) isGated = true;
                                    }

                                    return { isGated, total, validAllowed };
                                } catch (e) {
                                    const domHasBlurred = !!document.querySelector('.blurred-page, img[src*="/pages/blurred/"], [class*="blurred"]');
                                    return { isGated: domHasBlurred };
                                }
                            }
                        });
                        docCheck = result;
                    } catch (e) {}

                    // 2. Nếu có trang bị khóa: TỰ ĐỘNG XÓA MỜ VÀ TẢI LẠI TRANG
                    if (docCheck && docCheck.isGated) {
                        if (headingEl) headingEl.innerText = t.alertAutoUnlocking || (currentLang === 'vi' ? "Đang tự mở khóa..." : "Unlocking document...");
                        if (subEl) subEl.innerText = t.alertReloadingDoc || (currentLang === 'vi' ? "Làm sạch & tải lại trang..." : "Cleaning & reloading page...");

                        // Xóa sạch cookie và storage rào cản của Studocu
                        await removeAllStudocuCookies(tab.url);
                        await clearStorageInTab(tab.id);

                        // Lưu cờ auto-download vào storage để background service worker hoặc content.js bắt được nếu popup bị đóng
                        await chrome.storage.local.set({
                            banhmi_auto_studocu_tab: tab.id,
                            banhmi_auto_studocu_time: Date.now(),
                            banhmi_auto_lang: currentLang,
                            banhmi_auto_autoprint: getSetting('docAutoPrint', false)
                        });

                        await new Promise(r => setTimeout(r, 200));
                        chrome.tabs.reload(tab.id);

                        // Chờ tab reload hoàn tất
                        await new Promise((resolve) => {
                            const onUpdated = (updatedTabId, changeInfo) => {
                                if (updatedTabId === tab.id && changeInfo.status === 'complete') {
                                    chrome.tabs.onUpdated.removeListener(onUpdated);
                                    resolve();
                                }
                            };
                            chrome.tabs.onUpdated.addListener(onUpdated);
                            setTimeout(() => {
                                chrome.tabs.onUpdated.removeListener(onUpdated);
                                resolve();
                            }, 8000);
                        });

                        // Chờ 1.5s cho Studocu render React
                        await new Promise(r => setTimeout(r, 1500));
                    }

                    // 3. Khôi phục text nút và tiến hành nạp bộ tải PDF
                    if (headingEl) headingEl.innerText = origHeading;
                    if (subEl) subEl.innerText = origSub;

                    // Xóa cờ storage vì popup vẫn đang chạy và tự quản lý inject
                    chrome.storage.local.remove(['banhmi_auto_studocu_time', 'banhmi_auto_studocu_tab']);

                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: (lang, autoPrint, logoUrl, showSpss, viewerTheme, adData) => { 
                            window.__banhmi_lang = lang; 
                            window.__banhmi_autoprint = autoPrint;
                            window.__banhmi_logo_url = logoUrl;
                                                                                    window.__banhmi_show_spss = showSpss;
                            window.__banhmi_viewer_theme = viewerTheme;
                            window.__banhmi_ad_data = adData;
                        },
                        args: [
                            currentLang, 
                            getSetting('docAutoPrint', false), 
                            '',
                            false,
                            getSetting('docViewerTheme', 'dark'),
                            getViewerAdData(currentLang)
                        ]
                    });

                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ["inject_studocu_pdf.js"]
                    });
                    startCleanViewerWatcher(tab.id);
                } catch (err) {
                    alert((t.alertError || "⚠️ Lỗi: ") + err.message);
                    if (headingEl) headingEl.innerText = origHeading;
                    if (subEl) subEl.innerText = origSub;
                }
            } else if (tab.url.includes("scribd.com")) {
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: (lang, autoPrint, brandLogoUrl, showSpss, viewerTheme, adData) => { 
                            window.__banhmi_lang = lang; 
                            window.__banhmi_autoprint = autoPrint;
                            window.__banhmi_logo_url = brandLogoUrl;
                            window.__banhmi_show_spss = showSpss;
                            window.__banhmi_viewer_theme = viewerTheme;
                            window.__banhmi_ad_data = adData;
                        },
                        args: [
                            currentLang, 
                            getSetting('docAutoPrint', true),
                            '',
                            false,
                            getSetting('docViewerTheme', 'dark'),
                            getViewerAdData(currentLang)
                        ]
                    });

                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ["inject_scribd_pdf.js"]
                    });
                    startCleanViewerWatcher(tab.id);
                } catch (err) {
                    alert((t.alertError || "⚠️ Lỗi: ") + err.message);
                }
            } else if (tab.url.includes("slideshare.net")) {
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: (lang, autoPrint, brandLogoUrl, showSpss, viewerTheme, adData) => { 
                            window.__banhmi_lang = lang; 
                            window.__banhmi_autoprint = autoPrint;
                            window.__banhmi_logo_url = brandLogoUrl;
                            window.__banhmi_show_spss = showSpss;
                            window.__banhmi_viewer_theme = viewerTheme;
                            window.__banhmi_ad_data = adData;
                        },
                        args: [
                            currentLang, 
                            getSetting('docAutoPrint', true),
                            '',
                            false,
                            getSetting('docViewerTheme', 'dark'),
                            getViewerAdData(currentLang)
                        ]
                    });

                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ["inject_slideshare_pdf.js"]
                    });
                    startCleanViewerWatcher(tab.id);
                } catch (err) {
                    alert((t.alertError || "⚠️ Lỗi: ") + err.message);
                }
            } else {
                alert(t.alertSupportedSitesOnly || "⚠️ Tính năng này chỉ hoạt động trên trang Studocu, Scribd hoặc SlideShare.");
            }
        });
    }

    // Language switch click listener (Việt, Anh, Trung, Hàn + ngôn ngữ chọn trong setting)
    const langToggleBtn = document.getElementById('langToggleBtn');
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            const sequence = getQuickToggleSequence();
            let currentIndex = sequence.indexOf(currentLang);
            if (currentIndex === -1) {
                currentIndex = 0;
            } else {
                currentIndex = (currentIndex + 1) % sequence.length;
            }
            const nextLang = sequence[currentIndex];
            applyLanguage(nextLang, true);
        });
    }

    // Modal close logic
    const qrModal = document.getElementById('qrModal');
    const qrClose = document.querySelector('.qr-close');
    if (qrModal && qrClose) {
        qrClose.addEventListener('click', () => {
            qrModal.style.display = 'none';
        });
        qrModal.addEventListener('click', (e) => {
            if (e.target === qrModal) {
                qrModal.style.display = 'none';
            }
        });
    }

    // Support links click listeners
    const studocuBtn = document.getElementById('studocuBtn');
    if (studocuBtn) {
        studocuBtn.addEventListener('click', () => {
            const url = (currentLang === 'vi') ? 'https://www.studocu.vn/vn' : 'https://www.studocu.com/';
            chrome.tabs.create({ url: url });
        });
    }

    const scribdBtn = document.getElementById('scribdBtn');
    if (scribdBtn) {
        scribdBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://www.scribd.com/' });
        });
    }

    const slideshareBtn = document.getElementById('slideshareBtn');
    if (slideshareBtn) {
        slideshareBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://www.slideshare.net/' });
        });
    }

    const vpnBtn = document.getElementById('vpnBtn');
    if (vpnBtn) {
        vpnBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://one.one.one.one/' });
        });
    }

    ;

    document.querySelectorAll('#rateBtn, #aiRateBtn, .rate-stars-btn').forEach(card => {
        const label = card.querySelector('.rate-stars-label');
        const stars = card.querySelectorAll('.star-svg');

        stars.forEach(star => {
            star.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                const val = parseInt(star.getAttribute('data-value'), 10);
                const fb = ratingFeedback[currentLang] || ratingFeedback['default'];
                if (label && fb && fb[val]) {
                    label.textContent = fb[val];
                    label.style.color = '#EA580C';
                }
            });
        });

        const starsGroup = card.querySelector('.stars-group');
        if (starsGroup) {
            starsGroup.addEventListener('mouseleave', () => {
                if (label) {
                    label.textContent = getT().rateTitle || 'Đánh giá 5 sao';
                    label.style.color = '';
                }
            });
        }

        card.addEventListener('mouseleave', () => {
            if (label) {
                label.textContent = getT().rateTitle || 'Đánh giá 5 sao';
                label.style.color = '';
            }
        });

        card.addEventListener('click', () => {
            card.classList.add('star-celebrate');
            if (label) {
                const fb = ratingFeedback[currentLang] || ratingFeedback['default'];
                label.textContent = fb.thank;
                label.style.color = '#EA580C';
            }
            setTimeout(() => {
                chrome.tabs.create({ url: 'https://chromewebstore.google.com/detail/hakfedklifkcbkjakhdaebokggdcnagf?utm_source=item-share-cb' });
                setTimeout(() => {
                    card.classList.remove('star-celebrate');
                    if (label) {
                        label.textContent = getT().rateTitle || 'Đánh giá 5 sao';
                        label.style.color = '';
                    }
                }, 400);
            }, 250);
        });
    });

    // Popout button standalone logic
    const popoutBtn = document.getElementById('popoutBtn');
    if (popoutBtn) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'standalone') {
            popoutBtn.style.display = 'none';
        } else {
            popoutBtn.addEventListener('click', async () => {
                const tab = activeTab || await getTargetTab();
                const targetWindowId = tab ? tab.windowId : null;
                
                let url = chrome.runtime.getURL("popup.html?mode=standalone");
                if (targetWindowId) {
                    url += `&windowId=${targetWindowId}`;
                }
                
                const scale = getSetting('popupScale', 100);
                const factor = (parseInt(scale, 10) || 100) / 100;
                const targetWidth = Math.round(360 * factor);
                const targetHeight = Math.round(640 * factor);
                chrome.windows.create({
                    url: url,
                    type: "popup",
                    width: targetWidth,
                    height: targetHeight
                });
                window.close(); // Close the dropdown popup
            });
        }
    }

    const tabDownloadBtn = document.getElementById('tabDownloadBtn');
    const tabAIBtn = document.getElementById('tabAIBtn');
    if (tabDownloadBtn) tabDownloadBtn.addEventListener('click', () => switchToTab('download'));
    if (tabAIBtn) tabAIBtn.addEventListener('click', () => switchToTab('ai'));

    // Settings View Navigation (Toggle on settingsBtn click and restore current active tab)
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsBackBtn = document.getElementById('settingsBackBtn');
    const mainView = document.getElementById('mainView');
    const settingsView = document.getElementById('settingsView');

    let isTransitioningSettings = false;

    function openSettingsView() {
        if (isTransitioningSettings) return;
        mainView.style.display = 'none';
        settingsView.classList.remove('closing');
        settingsView.style.display = 'flex';
        if (settingsBtn) settingsBtn.classList.add('active');
        applySettingsToUI();
        const stContent = document.querySelector('.settings-content');
        if (stContent) stContent.scrollTop = 0;
        window.scrollTo(0, 0);
    }

    function closeSettingsView() {
        if (isTransitioningSettings || settingsView.style.display === 'none') return;
        isTransitioningSettings = true;
        if (settingsBtn) settingsBtn.classList.remove('active');
        
        settingsView.classList.add('closing');
        setTimeout(() => {
            settingsView.style.display = 'none';
            settingsView.classList.remove('closing');
            
            mainView.style.display = 'block';
            mainView.classList.remove('slide-back');
            void mainView.offsetWidth; // Force reflow
            mainView.classList.add('slide-back');
            if (mainView) mainView.scrollTop = 0;
            
            const tabToRestore = currentActiveTab || localStorage.getItem('banhmi_last_tab') || 'download';
            switchToTab(tabToRestore, true);
            window.scrollTo(0, 0);
            isTransitioningSettings = false;
        }, 180);
    }

    if (settingsBtn && settingsBackBtn && mainView && settingsView) {
        settingsBtn.addEventListener('click', () => {
            const isSettingsOpen = settingsView.style.display !== 'none' && getComputedStyle(settingsView).display !== 'none';
            if (isSettingsOpen) {
                closeSettingsView();
            } else {
                openSettingsView();
            }
        });

        settingsBackBtn.addEventListener('click', () => {
            closeSettingsView();
        });
    }

    // Initialize Language Dropdown & Search
    renderLanguageDropdown(currentLang);
    initLanguageSearch();

    // Initialize Settings Custom Dropdowns
    initSettingsDropdowns();

    document.querySelectorAll('#stSideWidthGroup .settings-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#stSideWidthGroup .settings-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            saveSetting('aiSideWidth', parseInt(btn.dataset.value, 10));
        });
    });

    const stAutoSubmit = document.getElementById('stAutoSubmit');
    if (stAutoSubmit) {
        stAutoSubmit.addEventListener('change', (e) => saveSetting('aiAutoSubmit', e.target.checked));
    }

    const stAutoClipboard = document.getElementById('stAutoClipboard');
    if (stAutoClipboard) {
        stAutoClipboard.addEventListener('change', (e) => saveSetting('aiAutoClipboard', e.target.checked));
    }

    const stDefaultIncludeDoc = document.getElementById('stDefaultIncludeDoc');
    if (stDefaultIncludeDoc) {
        stDefaultIncludeDoc.addEventListener('change', (e) => {
            saveSetting('aiDefaultIncludeDoc', e.target.checked);
            const aiIncludeDocCheck = document.getElementById('aiIncludeDocCheck');
            if (aiIncludeDocCheck) aiIncludeDocCheck.checked = e.target.checked;
        });
    }

    const stAutoPrint = document.getElementById('stAutoPrint');
    if (stAutoPrint) {
        stAutoPrint.addEventListener('change', (e) => saveSetting('docAutoPrint', e.target.checked));
    }

    const stAutoScroll = document.getElementById('stAutoScroll');
    if (stAutoScroll) {
        stAutoScroll.addEventListener('change', (e) => {
            saveSetting('docAutoScrollPrompt', e.target.checked);
            const tipText = document.getElementById('tipText');
            if (tipText) tipText.style.display = e.target.checked ? 'flex' : 'none';
        });
    }

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.classList.contains('dark-theme') ? 'dark' : 'light';
            const newTheme = (currentTheme === 'dark') ? 'light' : 'dark';
            applyExtensionTheme(newTheme);
            saveSetting('extensionTheme', newTheme);
            chrome.storage.local.set({ banhmi_extension_theme: newTheme });
        });
    }

    document.querySelectorAll('#stExtensionThemeGroup .settings-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#stExtensionThemeGroup .settings-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const val = btn.dataset.value;
            applyExtensionTheme(val);
            saveSetting('extensionTheme', val);
            chrome.storage.local.set({ banhmi_extension_theme: val });
        });
    });

    document.querySelectorAll('#stViewerThemeGroup .settings-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#stViewerThemeGroup .settings-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const val = btn.dataset.value;
            saveSetting('docViewerTheme', val);
            chrome.storage.local.set({ banhmi_viewer_theme: val });
        });
    });


    document.querySelectorAll('#stPopupWidthGroup .settings-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#stPopupWidthGroup .settings-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const val = parseInt(btn.dataset.value, 10);
            saveSetting('popupScale', val);
            applyPopupScale(val);
        });
    });

    const stResetBtn = document.getElementById('stResetBtn');
    if (stResetBtn) {
        stResetBtn.addEventListener('click', async () => {
            const t = TRANSLATIONS[currentLang] || TRANSLATIONS.vi;
            if (confirm(t.stResetConfirm || "Bạn có chắc muốn đặt lại tất cả cài đặt về mặc định không?")) {
                appSettings = Object.assign({}, DEFAULT_SETTINGS);
                await chrome.storage.local.set({ banhmi_settings: appSettings });
                try {
                    localStorage.removeItem('banhmi_setting_lang');
                    localStorage.removeItem('banhmi_popup_scale');
                    localStorage.removeItem('banhmi_popup_width');
                    localStorage.removeItem('banhmi_extension_theme');
                } catch (err) {}
                applySettingsToUI();
                updateAIModelUI(DEFAULT_SETTINGS.aiDefaultModel);
            }
        });
    }

    // AI Custom Model Selector Dropdown
    const aiModelSelect = document.getElementById('aiModelSelect');
    const aiModelDropdownContainer = document.getElementById('aiModelDropdownContainer');
    const aiModelTriggerBtn = document.getElementById('aiModelTriggerBtn');
    const aiModelMenu = document.getElementById('aiModelMenu');
    const aiModelCurrentIcon = document.getElementById('aiModelCurrentIcon');
    const aiModelCurrentName = document.getElementById('aiModelCurrentName');
    if (aiModelTriggerBtn && aiModelMenu) {
        // Load initial model from settings, storage or fallback
        const initialModel = getSetting('aiDefaultModel', localStorage.getItem('banhmi_ai_model') || 'gemini');
        updateAIModelUI(initialModel);

        // Toggle dropdown open/close
        aiModelTriggerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = aiModelMenu.classList.toggle('open');
            aiModelTriggerBtn.classList.toggle('open', isOpen);
            aiModelTriggerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Item selection
        const aiModelMenuItems = document.querySelectorAll('.ai-model-menu-item');
        aiModelMenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const selectedModel = item.getAttribute('data-value');
                updateAIModelUI(selectedModel);
                aiModelMenu.classList.remove('open');
                aiModelTriggerBtn.classList.remove('open');
                aiModelTriggerBtn.setAttribute('aria-expanded', 'false');
            });
        });

        // Click outside closes dropdown
        document.addEventListener('click', (e) => {
            if (aiModelDropdownContainer && !aiModelDropdownContainer.contains(e.target)) {
                aiModelMenu.classList.remove('open');
                aiModelTriggerBtn.classList.remove('open');
                aiModelTriggerBtn.setAttribute('aria-expanded', 'false');
            }
        });
    } else if (aiModelSelect) {
        const savedModel = localStorage.getItem('banhmi_ai_model');
        if (savedModel && ['gemini', 'chatgpt'].includes(savedModel)) {
            aiModelSelect.value = savedModel;
        }
        aiModelSelect.addEventListener('change', () => {
            localStorage.setItem('banhmi_ai_model', aiModelSelect.value);
        });
    }

    // AI Quick Action Chips
    const aiSummarizeBtn = document.getElementById('aiSummarizeBtn');
    if (aiSummarizeBtn) {
        aiSummarizeBtn.addEventListener('click', () => {
            handleAIAction('summarize');
        });
    }

    const aiTranslateBtn = document.getElementById('aiTranslateBtn');
    if (aiTranslateBtn) {
        aiTranslateBtn.addEventListener('click', () => {
            handleAIAction('translate');
        });
    }

    const aiKeyPointsBtn = document.getElementById('aiKeyPointsBtn');
    if (aiKeyPointsBtn) {
        aiKeyPointsBtn.addEventListener('click', () => {
            handleAIAction('keypoints');
        });
    }

    // AI Send button & Enter key
    const aiSendBtn = document.getElementById('aiSendBtn');
    const aiPromptInput = document.getElementById('aiPromptInput');
    if (aiSendBtn && aiPromptInput) {
        const sendCustomQuestion = () => {
            const question = aiPromptInput.value.trim();
            if (!question) {
                aiPromptInput.focus();
                return;
            }
            handleAIAction('custom', question);
        };

        aiSendBtn.addEventListener('click', sendCustomQuestion);

        aiPromptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendCustomQuestion();
            }
        });
    }
}

// Base 4 languages: Vietnamese, English, Chinese (Simplified), Korean + user-chosen setting language
const BASE_QUICK_LANGS = ['vi', 'en'];

function getQuickToggleSequence() {
    let settingLang = getSetting('customSettingLang', '') || localStorage.getItem('banhmi_setting_lang') || '';
    
    // If not set yet, check if currently saved banhmi_lang is a non-base language
    if (!settingLang) {
        const savedLang = localStorage.getItem('banhmi_lang');
        if (savedLang && !BASE_QUICK_LANGS.includes(savedLang)) {
            settingLang = savedLang;
        }
    }
    
    const seq = [...BASE_QUICK_LANGS];
    if (settingLang && !seq.includes(settingLang) && (TRANSLATIONS[settingLang] || LOCALE_MAP.has(settingLang))) {
        seq.push(settingLang);
    }
    return seq;
}

function getHeaderLangTag(lang) {
    if (!lang) return 'VI';
    if (lang === 'zh_CN' || lang === 'zh_TW' || lang === 'zh') return 'ZH';
    if (lang === 'en_US' || lang === 'en_GB' || lang === 'en') return 'EN';
    if (lang === 'pt_BR' || lang === 'pt_PT' || lang === 'pt') return 'PT';
    if (lang === 'es_419' || lang === 'es') return 'ES';
    const loc = LOCALE_MAP.get(lang);
    if (loc && loc.tag) {
        return loc.tag.split('-')[0].toUpperCase();
    }
    return lang.toUpperCase().slice(0, 2);
}

function getInitialLanguage() {
    const saved = localStorage.getItem('banhmi_lang');
    if (saved && (TRANSLATIONS[saved] || LOCALE_MAP.has(saved))) {
        return saved;
    }
    
    // Auto-detect browser language
    const browserLang = (
        (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getUILanguage && chrome.i18n.getUILanguage()) ||
        navigator.language ||
        navigator.userLanguage ||
        'en'
    ).toLowerCase().replace('-', '_');
    
    // Exact match in ALL_LOCALES (e.g. "en_gb", "pt_br", "zh_cn")
    const exact = ALL_LOCALES.find(l => l.code.toLowerCase() === browserLang);
    if (exact) return exact.code;

    // Normalization mapping for regional & legacy variants:
    if (browserLang.startsWith('nb') || browserLang.startsWith('nn')) return 'no';
    if (browserLang.startsWith('iw')) return 'he';
    if (browserLang.startsWith('in')) return 'id';
    if (browserLang === 'zh_tw' || browserLang === 'zh_hk' || browserLang === 'zh_mo' || browserLang.includes('hant')) return 'zh_TW';
    if (browserLang.startsWith('zh')) return 'zh_CN';
    if (['es_419', 'es_mx', 'es_ar', 'es_co', 'es_cl', 'es_pe', 'es_ve'].includes(browserLang)) return 'es_419';
    if (browserLang === 'pt' || browserLang === 'pt_pt') return 'pt_PT';
    if (browserLang === 'pt_br') return 'pt_BR';

    // Prefix match (e.g. "vi_vn" -> "vi", "es_mx" -> "es", "fr_ca" -> "fr")
    const prefix = browserLang.split('_')[0];
    const prefixMatch = ALL_LOCALES.find(l => l.code.toLowerCase() === prefix);
    if (prefixMatch) return prefixMatch.code;
    
    return 'en';
}

currentLang = getInitialLanguage();

function applyLanguage(lang, persist = true) {
    currentLang = lang;
    if (persist) {
        localStorage.setItem('banhmi_lang', lang);
    }
    try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ banhmi_lang: lang });
        }
    } catch (e) {}

    try {
        const htmlLang = lang.replace('_', '-');
        document.documentElement.lang = htmlLang;
        document.documentElement.setAttribute('data-lang', lang);
        if (document.body) {
            document.body.setAttribute('data-lang', lang);
        }
    } catch (e) {}
    
    const t = TRANSLATIONS[lang] || TRANSLATIONS.en || TRANSLATIONS.vi;
    if (!t) return;
    
    const mainTitle = document.getElementById('mainTitle');
    if (mainTitle) mainTitle.textContent = t.mainTitle;
    
    const devTag = document.getElementById('devTag') || document.querySelector('.dev-tag');
    if (devTag) {
        devTag.innerHTML = '';
    }
    
    const tipText = document.getElementById('tipText');
    if (tipText) tipText.innerHTML = t.tipText;
    
    const supportTitle = document.getElementById('supportTitle');
    if (supportTitle) supportTitle.textContent = t.supportTitle;
    
    const studocuSub = document.getElementById('studocuSub');
    if (studocuSub) studocuSub.textContent = t.studocuSub;
    
    const studocuBtn = document.getElementById('studocuBtn');
    if (studocuBtn) {
        const heading = studocuBtn.querySelector('.support-btn-heading');
        if (heading) heading.textContent = t.studocuTitle;
    }
    
    const scribdSub = document.getElementById('scribdSub');
    if (scribdSub) scribdSub.textContent = t.scribdSub;
    
    const slideshareSub = document.getElementById('slideshareSub');
    if (slideshareSub) slideshareSub.textContent = t.slideshareSub;
    
    const vpnTitle = document.getElementById('vpnTitle');
    if (vpnTitle) vpnTitle.textContent = t.vpnTitle;
    
    const vpnSub = document.getElementById('vpnSub');
    if (vpnSub) vpnSub.textContent = t.vpnSub;
    
    const vpnGuide = document.getElementById('vpnGuide');
    if (vpnGuide) vpnGuide.innerHTML = t.vpnGuide;
    
    const serviceTitle = document.getElementById('serviceTitle');
    if (serviceTitle && t.serviceTitle) serviceTitle.textContent = t.serviceTitle;
    
    const serviceSub = document.getElementById('serviceSub');
    if (serviceSub && t.serviceSub) serviceSub.textContent = t.serviceSub;

    const serviceIcon = document.getElementById('serviceIcon');
    if (serviceIcon) {
        if (lang === 'vi') {
            serviceIcon.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><line x1="9" y1="12" x2="15" y2="12"></line><line x1="9" y1="16" x2="13" y2="16"></line></svg>`;
        } else {
            serviceIcon.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;
        }
    }

    // AI Tab Elements
    const tabDownloadText = document.getElementById('tabDownloadText');
    if (tabDownloadText && t.tabDownloadText) tabDownloadText.textContent = t.tabDownloadText;

    const tabAIText = document.getElementById('tabAIText');
    if (tabAIText && t.tabAIText) tabAIText.textContent = t.tabAIText;

    const aiPromptInput = document.getElementById('aiPromptInput');
    if (aiPromptInput && t.aiPlaceholder) aiPromptInput.placeholder = t.aiPlaceholder;

    const aiIncludeDocText = document.getElementById('aiIncludeDocText');
    if (aiIncludeDocText && t.aiIncludeDocText) aiIncludeDocText.textContent = t.aiIncludeDocText;

    const aiSummarizeText = document.getElementById('aiSummarizeText');
    if (aiSummarizeText && t.aiSummarizeText) aiSummarizeText.textContent = t.aiSummarizeText;

    const aiTranslateText = document.getElementById('aiTranslateText');
    if (aiTranslateText && t.aiTranslateText) aiTranslateText.textContent = t.aiTranslateText;

    const aiKeyPointsText = document.getElementById('aiKeyPointsText');
    if (aiKeyPointsText && t.aiKeyPointsText) aiKeyPointsText.textContent = t.aiKeyPointsText;

    const aiModelLabel = document.getElementById('aiModelLabel');
    if (aiModelLabel && t.aiModelLabel) aiModelLabel.textContent = t.aiModelLabel;

    const popoutBtn = document.getElementById('popoutBtn');
    if (popoutBtn && t.popoutBtnTitle) popoutBtn.title = t.popoutBtnTitle;

    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn && (t.settingsBtnTitle || t.settingsTitle)) settingsBtn.title = t.settingsBtnTitle || t.settingsTitle;

    const aiSendBtn = document.getElementById('aiSendBtn');
    if (aiSendBtn && t.aiSendBtnTitle) aiSendBtn.title = t.aiSendBtnTitle;

    const stLanguageSearch = document.getElementById('stLanguageSearch');
    if (stLanguageSearch && (t.searchLangPlaceholder || t.stSearchPlaceholder)) {
        stLanguageSearch.placeholder = t.searchLangPlaceholder || t.stSearchPlaceholder;
    }

    // Settings Elements Localization
    const settingsBackText = document.getElementById('settingsBackText');
    if (settingsBackText && t.settingsBack) settingsBackText.textContent = t.settingsBack;

    const settingsHeaderTitle = document.getElementById('settingsHeaderTitle');
    if (settingsHeaderTitle && t.settingsTitle) settingsHeaderTitle.textContent = t.settingsTitle;

    const stGroupAITitle = document.getElementById('stGroupAITitle');
    if (stGroupAITitle && t.stGroupAITitle) stGroupAITitle.textContent = t.stGroupAITitle;

    const stDefaultModelLabel = document.getElementById('stDefaultModelLabel');
    if (stDefaultModelLabel && t.stDefaultModelLabel) stDefaultModelLabel.textContent = t.stDefaultModelLabel;

    const stDefaultModelSub = document.getElementById('stDefaultModelSub');
    if (stDefaultModelSub && t.stDefaultModelSub) stDefaultModelSub.textContent = t.stDefaultModelSub;

    const stLaunchModeLabel = document.getElementById('stLaunchModeLabel');
    if (stLaunchModeLabel && t.stLaunchModeLabel) stLaunchModeLabel.textContent = t.stLaunchModeLabel;

    const stLaunchModeSub = document.getElementById('stLaunchModeSub');
    if (stLaunchModeSub && t.stLaunchModeSub) stLaunchModeSub.textContent = t.stLaunchModeSub;

    const stLaunchModeSide = document.getElementById('stLaunchModeSide');
    if (stLaunchModeSide && t.stLaunchModeSide) stLaunchModeSide.textContent = t.stLaunchModeSide;

    const stLaunchModeTab = document.getElementById('stLaunchModeTab');
    if (stLaunchModeTab && t.stLaunchModeTab) stLaunchModeTab.textContent = t.stLaunchModeTab;

    const stSideWidthLabel = document.getElementById('stSideWidthLabel');
    if (stSideWidthLabel && t.stSideWidthLabel) stSideWidthLabel.textContent = t.stSideWidthLabel;

    const stSideWidthSub = document.getElementById('stSideWidthSub');
    if (stSideWidthSub && t.stSideWidthSub) stSideWidthSub.textContent = t.stSideWidthSub;

    const stAutoSubmitLabel = document.getElementById('stAutoSubmitLabel');
    if (stAutoSubmitLabel && t.stAutoSubmitLabel) stAutoSubmitLabel.textContent = t.stAutoSubmitLabel;

    const stAutoSubmitSub = document.getElementById('stAutoSubmitSub');
    if (stAutoSubmitSub && t.stAutoSubmitSub) stAutoSubmitSub.textContent = t.stAutoSubmitSub;

    const stAutoClipboardLabel = document.getElementById('stAutoClipboardLabel');
    if (stAutoClipboardLabel && t.stAutoClipboardLabel) stAutoClipboardLabel.textContent = t.stAutoClipboardLabel;

    const stAutoClipboardSub = document.getElementById('stAutoClipboardSub');
    if (stAutoClipboardSub && t.stAutoClipboardSub) stAutoClipboardSub.textContent = t.stAutoClipboardSub;

    const stDefaultIncludeDocLabel = document.getElementById('stDefaultIncludeDocLabel');
    if (stDefaultIncludeDocLabel && t.stDefaultIncludeDocLabel) stDefaultIncludeDocLabel.textContent = t.stDefaultIncludeDocLabel;

    const stDefaultIncludeDocSub = document.getElementById('stDefaultIncludeDocSub');
    if (stDefaultIncludeDocSub && t.stDefaultIncludeDocSub) stDefaultIncludeDocSub.textContent = t.stDefaultIncludeDocSub;

    const stGroupDocTitle = document.getElementById('stGroupDocTitle');
    if (stGroupDocTitle && t.stGroupDocTitle) stGroupDocTitle.textContent = t.stGroupDocTitle;

    const stAutoPrintLabel = document.getElementById('stAutoPrintLabel');
    if (stAutoPrintLabel && t.stAutoPrintLabel) stAutoPrintLabel.textContent = t.stAutoPrintLabel;

    const stAutoPrintSub = document.getElementById('stAutoPrintSub');
    if (stAutoPrintSub && t.stAutoPrintSub) stAutoPrintSub.textContent = t.stAutoPrintSub;

    const stExtensionThemeLabel = document.getElementById('stExtensionThemeLabel');
    if (stExtensionThemeLabel && t.stExtensionThemeLabel) stExtensionThemeLabel.textContent = t.stExtensionThemeLabel;

    const stExtensionThemeSub = document.getElementById('stExtensionThemeSub');
    if (stExtensionThemeSub && t.stExtensionThemeSub) stExtensionThemeSub.textContent = t.stExtensionThemeSub;

    const stExtThemeDarkBtn = document.getElementById('stExtThemeDarkBtn');
    if (stExtThemeDarkBtn && t.stDocThemeDark) {
        stExtThemeDarkBtn.setAttribute('title', t.stDocThemeDark);
        stExtThemeDarkBtn.setAttribute('aria-label', t.stDocThemeDark);
    }

    const stExtThemeLightBtn = document.getElementById('stExtThemeLightBtn');
    if (stExtThemeLightBtn && t.stDocThemeLight) {
        stExtThemeLightBtn.setAttribute('title', t.stDocThemeLight);
        stExtThemeLightBtn.setAttribute('aria-label', t.stDocThemeLight);
    }

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        const isDark = document.documentElement.classList.contains('dark-theme');
        themeToggleBtn.title = isDark ? (t.themeToggleToLight || "Chuyển sang nền sáng") : (t.themeToggleToDark || "Chuyển sang nền tối");
        themeToggleBtn.setAttribute('aria-label', themeToggleBtn.title);
    }

    const stViewerThemeLabel = document.getElementById('stViewerThemeLabel');
    if (stViewerThemeLabel && t.stViewerThemeLabel) stViewerThemeLabel.textContent = t.stViewerThemeLabel;

    const stViewerThemeSub = document.getElementById('stViewerThemeSub');
    if (stViewerThemeSub && t.stViewerThemeSub) stViewerThemeSub.textContent = t.stViewerThemeSub;

    const stDocThemeDarkBtn = document.getElementById('stDocThemeDarkBtn');
    if (stDocThemeDarkBtn && t.stDocThemeDark) {
        stDocThemeDarkBtn.setAttribute('title', t.stDocThemeDark);
        stDocThemeDarkBtn.setAttribute('aria-label', t.stDocThemeDark);
    }

    const stDocThemeLightBtn = document.getElementById('stDocThemeLightBtn');
    if (stDocThemeLightBtn && t.stDocThemeLight) {
        stDocThemeLightBtn.setAttribute('title', t.stDocThemeLight);
        stDocThemeLightBtn.setAttribute('aria-label', t.stDocThemeLight);
    }

    const stAutoScrollLabel = document.getElementById('stAutoScrollLabel');
    if (stAutoScrollLabel && t.stAutoScrollLabel) stAutoScrollLabel.textContent = t.stAutoScrollLabel;

    const stAutoScrollSub = document.getElementById('stAutoScrollSub');
    if (stAutoScrollSub && t.stAutoScrollSub) stAutoScrollSub.textContent = t.stAutoScrollSub;

    const stAutoCleanLabel = document.getElementById('stAutoCleanLabel');
    if (stAutoCleanLabel && t.stAutoCleanLabel) stAutoCleanLabel.textContent = t.stAutoCleanLabel;

    const stAutoCleanSub = document.getElementById('stAutoCleanSub');
    if (stAutoCleanSub && t.stAutoCleanSub) stAutoCleanSub.textContent = t.stAutoCleanSub;

    const stGroupGeneralTitle = document.getElementById('stGroupGeneralTitle');
    if (stGroupGeneralTitle && t.stGroupGeneralTitle) stGroupGeneralTitle.textContent = t.stGroupGeneralTitle;

    const stLanguageLabel = document.getElementById('stLanguageLabel');
    if (stLanguageLabel && t.stLanguageLabel) stLanguageLabel.textContent = t.stLanguageLabel;

    const stLanguageSub = document.getElementById('stLanguageSub');
    if (stLanguageSub && t.stLanguageSub) stLanguageSub.textContent = t.stLanguageSub;

    const stStartupTabLabel = document.getElementById('stStartupTabLabel');
    if (stStartupTabLabel && t.stStartupTabLabel) stStartupTabLabel.textContent = t.stStartupTabLabel;

    const stStartupTabSub = document.getElementById('stStartupTabSub');
    if (stStartupTabSub && t.stStartupTabSub) stStartupTabSub.textContent = t.stStartupTabSub;

    const stStartupTabLast = document.getElementById('stStartupTabLast');
    if (stStartupTabLast && t.stStartupTabLast) stStartupTabLast.textContent = t.stStartupTabLast;

    const stStartupTabDownload = document.getElementById('stStartupTabDownload');
    if (stStartupTabDownload && t.stStartupTabDownload) stStartupTabDownload.textContent = t.stStartupTabDownload;

    const stStartupTabAI = document.getElementById('stStartupTabAI');
    if (stStartupTabAI && t.stStartupTabAI) stStartupTabAI.textContent = t.stStartupTabAI;

    const stPopupWidthLabel = document.getElementById('stPopupWidthLabel');
    if (stPopupWidthLabel && t.stPopupWidthLabel) stPopupWidthLabel.textContent = t.stPopupWidthLabel;

    const stPopupWidthSub = document.getElementById('stPopupWidthSub');
    if (stPopupWidthSub && t.stPopupWidthSub) stPopupWidthSub.textContent = t.stPopupWidthSub;




    const stResetBtnText = document.getElementById('stResetBtnText');
    if (stResetBtnText && t.stResetBtn) stResetBtnText.textContent = t.stResetBtn;

    // Refresh custom dropdown triggers with new language texts
    const defaultModel = document.getElementById('stDefaultModel')?.value || getSetting('aiDefaultModel', 'gemini');
    updateCustomDropdownUI('stDefaultModelContainer', defaultModel);

    const launchMode = document.getElementById('stLaunchMode')?.value || getSetting('aiLaunchMode', 'side_window');
    updateCustomDropdownUI('stLaunchModeContainer', launchMode);

    updateCustomDropdownUI('stLanguageContainer', lang);

    const startupTab = document.getElementById('stStartupTab')?.value || getSetting('startupTab', 'last_used');
    updateCustomDropdownUI('stStartupTabContainer', startupTab);

    // Refresh language dropdown active state
    renderLanguageDropdown(lang);

    const langFlag = document.getElementById('langFlag');
    const langText = document.getElementById('langText');
    const langToggleBtn = document.getElementById('langToggleBtn');
    if (langFlag && langText) {
        langFlag.innerHTML = getFlagSvg(lang);
        langText.textContent = getHeaderLangTag(lang);
    }
    if (langToggleBtn) {
        const seq = getQuickToggleSequence();
        const nextIdx = (seq.indexOf(lang) + 1) % seq.length;
        const nextLang = seq[nextIdx];
        const nextTag = getHeaderLangTag(nextLang);
        langToggleBtn.title = (t.switchLanguage || 'Chuyển ngôn ngữ') + ` (${nextTag})`;
    }
    
    updateDynamicTexts();
    if (activeTab) {
        updateDocBadge(activeTab);
    }
}

function updateDynamicTexts() {
    const tab = activeTab;
    const checkBtn = document.getElementById('checkBtn');
    const clearBtn = document.getElementById('clearBtn');
    if (checkBtn && clearBtn) {
        const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en || TRANSLATIONS.vi;
        if (t) {
            const url = (tab && tab.url) ? tab.url : "";
            const checkHeading = checkBtn.querySelector('.btn-heading');
            const checkSub = checkBtn.querySelector('.btn-sub');
            const clearHeading = clearBtn.querySelector('.btn-heading');
            const clearSub = clearBtn.querySelector('.btn-sub');

            if (url.includes("scribd.com")) {
                if (checkHeading) checkHeading.textContent = t.scribdCheckHeading;
                if (checkSub) checkSub.textContent = t.scribdCheckSub;
                if (clearHeading) clearHeading.textContent = t.scribdClearHeading;
                if (clearSub) clearSub.textContent = t.scribdClearSub;
            } else if (url.includes("studocu") || url.includes("studeersnel")) {
                if (checkHeading) checkHeading.textContent = t.studocuCheckHeading;
                if (checkSub) checkSub.textContent = t.studocuCheckSub;
                if (clearHeading) clearHeading.textContent = t.studocuClearHeading;
                if (clearSub) clearSub.textContent = t.studocuClearSub;
            } else if (url.includes("slideshare.net")) {
                if (checkHeading) checkHeading.textContent = t.slideshareCheckHeading;
                if (checkSub) checkSub.textContent = t.slideshareCheckSub;
                if (clearHeading) clearHeading.textContent = t.slideshareClearHeading;
                if (clearSub) clearSub.textContent = t.slideshareClearSub;
            } else {
                if (checkHeading) checkHeading.textContent = t.outsideCheckHeading;
                if (checkSub) checkSub.textContent = t.outsideCheckSub;
                if (clearHeading) clearHeading.textContent = t.outsideClearHeading;
                if (clearSub) clearSub.textContent = t.outsideClearSub;
            }
        }
    }

    


}

function getGoogleAiModalHTML(lang = currentLang) { return ''; }
function getDonateModalHTML(lang = currentLang) { return ''; }

// ==========================================
// ASK AI HELPER FUNCTIONS (Cốc Cốc style)
// ==========================================

function updateDocBadge(tab) {
    const aiDocTitle = document.getElementById('aiDocTitle');
    const aiDocUrl = document.getElementById('aiDocUrl');
    const aiIncludeDocCheck = document.getElementById('aiIncludeDocCheck');
    if (!aiDocTitle || !aiDocUrl) return;

    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en || TRANSLATIONS.vi;

    if (!tab || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        aiDocTitle.textContent = t.aiDocNoActive || 'No active document page';
        aiDocUrl.textContent = '---';
        if (aiIncludeDocCheck) {
            aiIncludeDocCheck.checked = false;
            aiIncludeDocCheck.disabled = true;
        }
        return;
    }

    try {
        const urlObj = new URL(tab.url);
        aiDocTitle.textContent = tab.title || (t.aiDocActive || 'Active document');
        aiDocUrl.textContent = urlObj.hostname;
        if (aiIncludeDocCheck) {
            aiIncludeDocCheck.disabled = false;
            aiIncludeDocCheck.checked = true;
        }
    } catch (e) {
        aiDocTitle.textContent = tab.title || 'Document';
        aiDocUrl.textContent = tab.url;
    }
}

async function extractDocContent(tab) {
    if (!tab || !tab.id || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        return {
            title: tab ? tab.title : 'Document',
            url: tab ? tab.url : '',
            text: ''
        };
    }

    try {
        const executePromise = chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                let extractedText = '';
                const url = window.location.href;

                // 1. Studocu
                if (url.includes('studocu.com') || url.includes('studocu.vn')) {
                    const pageNodes = document.querySelectorAll('.page-content, .textLayer, [data-page-no], #document-wrapper, .document-container');
                    if (pageNodes.length > 0) {
                        const texts = [];
                        pageNodes.forEach(node => {
                            const t = node.innerText ? node.innerText.trim() : '';
                            if (t.length > 25) texts.push(t);
                        });
                        extractedText = texts.join('\n\n');
                    }
                }

                // 2. Scribd
                if (!extractedText && url.includes('scribd.com')) {
                    const docWrapper = document.querySelector('.document_scroller, .document_column, .text_layer, .page_missing_explanation_wrapper, [data-page]');
                    if (docWrapper) {
                        extractedText = docWrapper.innerText ? docWrapper.innerText.trim() : '';
                    }
                }

                // 3. SlideShare
                if (!extractedText && url.includes('slideshare.net')) {
                    const slideNodes = document.querySelectorAll('.slide-content, .slide_text, .transcription, #transcription, [data-testid="slide-container"]');
                    if (slideNodes.length > 0) {
                        const texts = [];
                        slideNodes.forEach(node => {
                            const t = node.innerText ? node.innerText.trim() : '';
                            if (t) texts.push(t);
                        });
                        extractedText = texts.join('\n\n');
                    }
                }

                // 4. General fallback: article, main, or content container
                if (!extractedText) {
                    const mainNode = document.querySelector('article, main, #content, .content, .main-content, .post-content');
                    if (mainNode) {
                        extractedText = mainNode.innerText ? mainNode.innerText.trim() : '';
                    }
                }

                // 5. Body fallback
                if (!extractedText && document.body) {
                    extractedText = document.body.innerText ? document.body.innerText.trim() : '';
                }

                // Clean up whitespace
                extractedText = extractedText.replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ');

                // Truncate to ~15,000 characters to keep prompt responsive and avoid deep-link limits
                if (extractedText.length > 15000) {
                    extractedText = extractedText.substring(0, 15000) + '\n\n...';
                }

                return {
                    title: document.title || '',
                    url: window.location.href || '',
                    text: extractedText
                };
            }
        });

        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Extraction timeout')), 2500)
        );

        const results = await Promise.race([executePromise, timeoutPromise]);

        if (results && results[0] && results[0].result) {
            return results[0].result;
        }
    } catch (err) {
        console.warn('BamiDoc extractDocContent warning:', err);
    }

    return {
        title: tab.title || '',
        url: tab.url || '',
        text: ''
    };
}

function buildSummarizePrompt(docInfo, lang) {
    const loc = LOCALE_MAP.get(lang);
    const targetLangName = loc ? (lang === 'vi' ? 'Tiếng Việt' : loc.name) : 'English';
    const contentText = docInfo.text || ((lang === 'vi') 
        ? `(Không thể trích xuất văn bản trực tiếp từ trang. Vui lòng tham khảo theo đường dẫn: ${docInfo.url})` 
        : (lang.startsWith('zh') 
            ? `(无法直接提取文本。请参考链接：${docInfo.url})` 
            : `(Could not extract direct text. Please refer to: ${docInfo.url})`));

    switch (lang) {
        case 'vi':
            return `Dựa trên tài liệu/trang web sau:\nTiêu đề: ${docInfo.title}\nNguồn: ${docInfo.url}\n\nNội dung tài liệu:\n"""\n${contentText}\n"""\n\nHãy tóm tắt ngắn gọn, mạch lạc các ý chính của tài liệu này bằng Tiếng Việt (sử dụng gạch đầu dòng rõ ràng, làm nổi bật ý trọng tâm và có kết luận súc tích).`;
        case 'zh_CN':
            return `基于以下文档/网页：\n标题: ${docInfo.title}\n来源: ${docInfo.url}\n\n文档内容：\n"""\n${contentText}\n"""\n\n请用简体中文清晰、简洁地总结本文档的核心要点（使用要点列表列出关键点，突出核心结论）。`;
        case 'zh_TW':
            return `基於以下文檔/網頁：\n標題: ${docInfo.title}\n來源: ${docInfo.url}\n\n文檔內容：\n"""\n${contentText}\n"""\n\n請用繁體中文清晰、簡潔地總結本文檔的核心要點（使用清單列出關鍵點，突出核心結論）。`;
        case 'ja':
            return `以下のドキュメント/ウェブページに基づいて：\nタイトル: ${docInfo.title}\n出典: ${docInfo.url}\n\nドキュメント内容：\n"""\n${contentText}\n"""\n\nこのドキュメントの要点を日本語で箇条書きにし、分かりやすく簡潔に要約してください。`;
        case 'ko':
            return `다음 문서/웹페이지를 바탕으로：\n제목: ${docInfo.title}\n출처: ${docInfo.url}\n\n문서 내용：\n"""\n${contentText}\n"""\n\n이 문서의 핵심 요점을 글머리 기호를 사용하여 한국어로 명확하고 간결하게 요약해 주세요.`;
        case 'es':
        case 'es_419':
            return `Basándote en el siguiente documento/página web:\nTítulo: ${docInfo.title}\nFuente: ${docInfo.url}\n\nContenido:\n"""\n${contentText}\n"""\n\nPor favor, resume los puntos clave de forma concisa y clara en español (utiliza viñetas, resalta las conclusiones principales y añade una conclusión breve).`;
        case 'fr':
            return `En vous basant sur le document/la page web suivante :\nTitre: ${docInfo.title}\nSource: ${docInfo.url}\n\nContenu :\n"""\n${contentText}\n"""\n\nVeuillez résumer les points clés de manière concise et claire en français (avec des puces, en mettant en valeur les éléments essentiels).`;
        case 'de':
            return `Basierend auf folgendem Dokument / folgender Webseite:\nTitel: ${docInfo.title}\nQuelle: ${docInfo.url}\n\nInhalt:\n"""\n${contentText}\n"""\n\nBitte fassen Sie die Kernpunkte auf Deutsch prägnant und strukturiert mit Aufzählungspunkten zusammen.`;
        case 'ru':
            return `На основе следующего документа/веб-страницы:\nЗаголовок: ${docInfo.title}\nИсточник: ${docInfo.url}\n\nСодержание:\n"""\n${contentText}\n"""\n\nПожалуйста, кратко и четко выделите ключевые моменты на русском языке (используйте маркированный список, выделите главное).`;
        case 'pt':
        case 'pt_BR':
        case 'pt_PT':
            return `Com base no seguinte documento/página web:\nTítulo: ${docInfo.title}\nFonte: ${docInfo.url}\n\nConteúdo:\n"""\n${contentText}\n"""\n\nPor favor, resuma os pontos principais de forma concisa e clara em português (usando marcadores e destacando as conclusões centrais).`;
        default:
            return `Based on the following document/webpage:\nTitle: ${docInfo.title}\nSource: ${docInfo.url}\n\nDocument Content:\n"""\n${contentText}\n"""\n\nPlease summarize the key points concisely and clearly in ${targetLangName} with bullet points, highlighted takeaways, and a brief conclusion.`;
    }
}

function buildTranslatePrompt(docInfo, lang) {
    const loc = LOCALE_MAP.get(lang);
    const targetLangName = loc ? (lang === 'vi' ? 'Tiếng Việt' : loc.name) : 'English';
    const contentText = docInfo.text || ((lang === 'vi') ? `(Tham khảo tài liệu tại: ${docInfo.url})` : `(Refer to: ${docInfo.url})`);

    switch (lang) {
        case 'vi':
            return `Dựa trên tài liệu/trang web sau:\nTiêu đề: ${docInfo.title}\nNguồn: ${docInfo.url}\n\nNội dung tài liệu:\n"""\n${contentText}\n"""\n\nHãy dịch tóm tắt cốt lõi và các phần quan trọng của tài liệu này sang Tiếng Việt một cách tự nhiên, chuẩn xác theo văn phong học thuật/chuyên môn.`;
        case 'zh_CN':
            return `基于以下文档/网页：\n标题: ${docInfo.title}\n来源: ${docInfo.url}\n\n文档内容：\n"""\n${contentText}\n"""\n\n请将本文档的核心摘要及重要部分准确、通顺地翻译为简体中文（符合学术/专业表达习惯）。`;
        case 'zh_TW':
            return `基於以下文檔/網頁：\n標題: ${docInfo.title}\n來源: ${docInfo.url}\n\n文檔內容：\n"""\n${contentText}\n"""\n\n請將本文檔的核心摘要及重要部分準確、通順地翻譯為繁體中文（符合學術/專業表達習慣）。`;
        case 'ja':
            return `以下のドキュメント/ウェブページに基づいて：\nタイトル: ${docInfo.title}\n出典: ${docInfo.url}\n\nドキュメント内容：\n"""\n${contentText}\n"""\n\nこのドキュメントの重要な要約と主要部分を、自然で正確な日本語（学術・専門用語に適した表現）に翻訳してください。`;
        case 'ko':
            return `다음 문서/웹페이지를 바탕으로：\n제목: ${docInfo.title}\n출처: ${docInfo.url}\n\n문서 내용：\n"""\n${contentText}\n"""\n\n이 문서의 핵심 요약과 중요 부분을 자연스럽고 정확한 한국어로 번역해 주세요.`;
        case 'es':
        case 'es_419':
            return `Basándote en el siguiente documento/página web:\nTítulo: ${docInfo.title}\nFuente: ${docInfo.url}\n\nContenido:\n"""\n${contentText}\n"""\n\nPor favor, traduce el resumen fundamental và las partes más importantes de este documento al español con precisión y fluidez profesional.`;
        case 'fr':
            return `En vous basant sur le document/la page web suivante :\nTitre: ${docInfo.title}\nSource: ${docInfo.url}\n\nContenu :\n"""\n${contentText}\n"""\n\nVeuillez traduire le résumé essentiel et les passages importants en français de manière fluide et fidèle au ton académique.`;
        case 'de':
            return `Basierend auf folgendem Dokument / folgender Webseite:\nTitel: ${docInfo.title}\nQuelle: ${docInfo.url}\n\nInhalt:\n"""\n${contentText}\n"""\n\nBitte übersetzen Sie die Kerninhalte und wesentlichen Passagen präzise und fachgerecht ins Deutsche.`;
        case 'ru':
            return `На основе следующего документа/веб-страницы:\nЗаголовок: ${docInfo.title}\nИсточник: ${docInfo.url}\n\nСодержание:\n"""\n${contentText}\n"""\n\nПожалуйста, переведите основные положения и важные разделы этого документа на русский язык точно и профессионально.`;
        default:
            return `Based on the following document/webpage:\nTitle: ${docInfo.title}\nSource: ${docInfo.url}\n\nDocument Content:\n"""\n${contentText}\n"""\n\nPlease translate the core summary and key parts of this document into ${targetLangName} naturally and accurately according to academic/professional standards.`;
    }
}

function buildKeyPointsPrompt(docInfo, lang) {
    const loc = LOCALE_MAP.get(lang);
    const targetLangName = loc ? (lang === 'vi' ? 'Tiếng Việt' : loc.name) : 'English';
    const contentText = docInfo.text || ((lang === 'vi') ? `(Tham khảo tài liệu tại: ${docInfo.url})` : `(Refer to: ${docInfo.url})`);

    switch (lang) {
        case 'vi':
            return `Dựa trên tài liệu/trang web sau:\nTiêu đề: ${docInfo.title}\nNguồn: ${docInfo.url}\n\nNội dung tài liệu:\n"""\n${contentText}\n"""\n\nHãy trích xuất các kiến thức cốt lõi, công thức/định nghĩa quan trọng và những điểm trọng tâm cần lưu ý khi ôn thi từ tài liệu trên bằng Tiếng Việt.`;
        case 'zh_CN':
            return `基于以下文档/网页：\n标题: ${docInfo.title}\n来源: ${docInfo.url}\n\n文档内容：\n"""\n${contentText}\n"""\n\n请用简体中文提炼出本文档的核心概念、重要定义/公式以及备考复习时必须掌握的关键知识点。`;
        case 'zh_TW':
            return `基於以下文檔/網頁：\n標題: ${docInfo.title}\n來源: ${docInfo.url}\n\n文檔內容：\n"""\n${contentText}\n"""\n\n請用繁體中文提煉出本文檔的核心概念、重要定義/公式以及備考複習時必須掌握的關鍵知識點。`;
        case 'ja':
            return `以下のドキュメント/ウェブページに基づいて：\nタイトル: ${docInfo.title}\n出典: ${docInfo.url}\n\nドキュメント内容：\n"""\n${contentText}\n"""\n\nこのドキュメントから、重要な基本概念、重要公式/定義、および試験対策に必須の重要ポイントを日本語で抽出してください。`;
        case 'ko':
            return `다음 문서/웹페이지를 바탕으로：\n제목: ${docInfo.title}\n출처: ${docInfo.url}\n\n문서 내용：\n"""\n${contentText}\n"""\n\n이 문서에서 핵심 개념, 주요 공식/정의, 시험 대비를 위한 필수 핵심 포인트를 한국어로 정리해 주세요.`;
        case 'es':
        case 'es_419':
            return `Basándote en el siguiente documento/página web:\nTítulo: ${docInfo.title}\nFuente: ${docInfo.url}\n\nContenido:\n"""\n${contentText}\n"""\n\nPor favor, extrae los conceptos clave, fórmulas/definiciones fundamentales y los puntos esenciales para el estudio/examen en español.`;
        case 'fr':
            return `En vous basant sur le document/la page web suivante :\nTitre: ${docInfo.title}\nSource: ${docInfo.url}\n\nContenu :\n"""\n${contentText}\n"""\n\nVeuillez extraire les notions fondamentales, définitions/formules clés et points essentiels pour réviser en français.`;
        case 'de':
            return `Basierend auf folgendem Dokument / folgender Webseite:\nTitel: ${docInfo.title}\nQuelle: ${docInfo.url}\n\nInhalt:\n"""\n${contentText}\n"""\n\nBitte arbeiten Sie die grundlegenden Konzepte, Schlüsseldefinitionen/-formeln und prüfungsrelevanten Schwerpunkte auf Deutsch heraus.`;
        case 'ru':
            return `На основе следующего документа/веб-страницы:\nЗаголовок: ${docInfo.title}\nИсточник: ${docInfo.url}\n\nСодержание:\n"""\n${contentText}\n"""\n\nПожалуйста, выделите основные понятия, важные определения/формулы и ключевые пункты для подготовки к экзаменам на русском языке.`;
        default:
            return `Based on the following document/webpage:\nTitle: ${docInfo.title}\nSource: ${docInfo.url}\n\nDocument Content:\n"""\n${contentText}\n"""\n\nPlease extract the essential core concepts, key definitions/formulas, and critical revision takeaways for exams from this document in ${targetLangName}.`;
    }
}

function buildCustomQuestionPrompt(question, docInfo, includeDoc, lang) {
    if (!includeDoc || (!docInfo.text && !docInfo.url)) {
        return question;
    }
    const contentText = docInfo.text || `(Refer to: ${docInfo.url})`;

    switch (lang) {
        case 'vi':
            return `${question}\n\n(Dựa trên nội dung tài liệu sau đây để trả lời):\nTiêu đề: ${docInfo.title}\nNguồn: ${docInfo.url}\n\nNội dung:\n"""\n${contentText}\n"""`;
        case 'zh_CN':
            return `${question}\n\n（请依据以下文档内容作答）：\n标题: ${docInfo.title}\n来源: ${docInfo.url}\n\n内容:\n"""\n${contentText}\n"""`;
        case 'zh_TW':
            return `${question}\n\n（請依據以下文檔內容作答）：\n標題: ${docInfo.title}\n來源: ${docInfo.url}\n\n內容:\n"""\n${contentText}\n"""`;
        case 'ja':
            return `${question}\n\n（以下のドキュメント内容に基づいて回答してください）：\nタイトル: ${docInfo.title}\n出典: ${docInfo.url}\n\n内容:\n"""\n${contentText}\n"""`;
        case 'ko':
            return `${question}\n\n(다음 문서 내용을 바탕으로 답변해 주세요):\n제목: ${docInfo.title}\n출처: ${docInfo.url}\n\n내용:\n"""\n${contentText}\n"""`;
        case 'es':
        case 'es_419':
            return `${question}\n\n(Por favor responde basándote en el siguiente documento):\nTítulo: ${docInfo.title}\nFuente: ${docInfo.url}\n\nContenido:\n"""\n${contentText}\n"""`;
        default:
            return `${question}\n\n(Please answer based on the following document):\nTitle: ${docInfo.title}\nSource: ${docInfo.url}\n\nContent:\n"""\n${contentText}\n"""`;
    }
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (e) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        } catch (err) {
            console.warn('Clipboard write error:', err);
            return false;
        }
    }
}

async function forwardToAI(promptText, model) {
    // 1. Copy full prompt to clipboard based on user setting
    if (getSetting('aiAutoClipboard', true)) {
        await copyToClipboard(promptText);
    }

    const t = getT();
    const autoSubmit = getSetting('aiAutoSubmit', true);

    let targetUrl = '';
    if (model === 'chatgpt') {
        showAIStatus(t.aiNoticeForwardingChatGPT || "Đang chuyển tiếp câu hỏi sang ChatGPT...", 'loading');
        await chrome.storage.local.set({
            banhmi_chatgpt_pending_prompt: {
                prompt: promptText,
                autoSubmit: autoSubmit,
                timestamp: Date.now()
            }
        });
        targetUrl = 'https://chatgpt.com/';
    } else {
        showAIStatus(t.aiNoticeForwardingGemini || "Đang chuyển tiếp câu hỏi sang Google Gemini...", 'loading');
        await chrome.storage.local.set({
            banhmi_gemini_pending_prompt: {
                prompt: promptText,
                autoSubmit: autoSubmit,
                timestamp: Date.now()
            }
        });
        targetUrl = 'https://gemini.google.com/app';
    }

    // 2. Launch mode: open in New Tab if configured
    const launchMode = getSetting('aiLaunchMode', 'side_window');
    if (launchMode === 'new_tab') {
        chrome.tabs.create({ url: targetUrl });
        return;
    }

    // 3. Otherwise open as a docked Side Window on the right of the screen
    const screenWidth = window.screen.availWidth || 1440;
    const screenHeight = window.screen.availHeight || 900;
    const sideWidth = parseInt(getSetting('aiSideWidth', 460), 10) || 460;
    const sideLeft = Math.max(0, screenWidth - sideWidth);

    try {
        // Check if an AI companion window is already open
        const stored = await chrome.storage.local.get(['banhmi_ai_window_id']);
        let existingWin = null;
        if (stored && stored.banhmi_ai_window_id) {
            try {
                existingWin = await chrome.windows.get(stored.banhmi_ai_window_id, { populate: true });
            } catch (e) {
                existingWin = null;
            }
        }

        if (existingWin && existingWin.tabs && existingWin.tabs.length > 0) {
            // Window already open! Update tab and bring to focus
            const targetDomain = (model === 'chatgpt') ? 'chatgpt.com' : 'gemini.google.com';
            const existingTab = existingWin.tabs.find(t => t.url && t.url.includes(targetDomain)) || existingWin.tabs.find(t => t.active) || existingWin.tabs[0];
            
            if (existingTab && existingTab.url && existingTab.url.includes(targetDomain)) {
                // Same AI platform already open: bring window to focus
                await chrome.windows.update(existingWin.id, { focused: true, state: 'normal' });

                if (model === 'chatgpt') {
                    // For ChatGPT: always open a brand new conversation as requested
                    const isRoot = existingTab.url === 'https://chatgpt.com/' || existingTab.url === 'https://chatgpt.com';
                    if (isRoot) {
                        try {
                            await chrome.tabs.sendMessage(existingTab.id, {
                                action: 'banhmi_chatgpt_prompt',
                                prompt: promptText,
                                autoSubmit: autoSubmit,
                                timestamp: Date.now()
                            });
                        } catch (msgErr) {
                            await chrome.tabs.reload(existingTab.id);
                        }
                    } else {
                        // In an existing conversation (/c/..., /g/...): navigate to fresh root to start a new chat
                        await chrome.tabs.update(existingTab.id, { url: 'https://chatgpt.com/' });
                    }
                    return;
                }

                const actionName = 'banhmi_gemini_prompt';
                const scriptFile = 'gemini_bridge.js';

                try {
                    await chrome.tabs.sendMessage(existingTab.id, {
                        action: actionName,
                        prompt: promptText,
                        autoSubmit: autoSubmit,
                        timestamp: Date.now()
                    });
                } catch (msgErr) {
                    try {
                        await chrome.scripting.executeScript({
                            target: { tabId: existingTab.id },
                            files: [scriptFile]
                        });
                        setTimeout(() => {
                            chrome.tabs.sendMessage(existingTab.id, {
                                action: actionName,
                                prompt: promptText,
                                autoSubmit: autoSubmit,
                                timestamp: Date.now()
                            }).catch(() => {});
                        }, 250);
                    } catch (injErr) {
                        console.warn('BamiDoc: Bridge reinjection fallback failed:', injErr);
                    }
                }
            } else {
                // Different platform: navigate to target URL
                await chrome.tabs.update(existingTab.id, { url: targetUrl });
                await chrome.windows.update(existingWin.id, { focused: true, state: 'normal' });
            }
        } else {
            // Create a new docked side-by-side popup window
            const newWin = await chrome.windows.create({
                url: targetUrl,
                type: 'popup',
                width: sideWidth,
                height: screenHeight,
                left: sideLeft,
                top: 0,
                focused: true
            });
            if (newWin && newWin.id) {
                await chrome.storage.local.set({ banhmi_ai_window_id: newWin.id });
            }
        }
    } catch (err) {
        console.warn('Could not create popup window, fallback to tab:', err);
        chrome.tabs.create({ url: targetUrl });
    }
}

function showAIStatus(message, type = 'loading') {
    const noticeEl = document.getElementById('aiStatusNotice');
    if (!noticeEl) return;

    let iconSvg = '';
    if (type === 'loading') {
        iconSvg = `
            <svg class="ai-status-icon-svg ai-status-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <circle cx="12" cy="12" r="9" stroke-opacity="0.25"></circle>
                <path d="M12 3a9 9 0 0 1 9 9"></path>
            </svg>
        `;
    } else if (type === 'success') {
        iconSvg = `
            <svg class="ai-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
    } else if (type === 'error') {
        iconSvg = `
            <svg class="ai-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        `;
    } else {
        iconSvg = `
            <svg class="ai-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
        `;
    }

    noticeEl.className = `ai-status-notice status-${type}`;
    noticeEl.innerHTML = `
        <div class="ai-status-icon-box">${iconSvg}</div>
        <span class="ai-status-message">${message}</span>
    `;
    noticeEl.style.display = 'flex';

    if (noticeEl._hideTimer) {
        clearTimeout(noticeEl._hideTimer);
    }
    noticeEl._hideTimer = setTimeout(() => {
        if (noticeEl) {
            noticeEl.style.display = 'none';
        }
    }, 4500);
}

async function handleAIAction(actionType, customQuestion = '') {
    try {
        const aiModelSelect = document.getElementById('aiModelSelect');
        const selectedModel = aiModelSelect ? aiModelSelect.value : 'gemini';
        const aiIncludeDocCheck = document.getElementById('aiIncludeDocCheck');
        const includeDoc = aiIncludeDocCheck ? aiIncludeDocCheck.checked : true;

        const t = getT();
        showAIStatus(t.aiPreparingPrompt || "Đang chuẩn bị nội dung tài liệu...", 'loading');

        const tab = activeTab || await getTargetTab();
        let docInfo = { title: '', url: '', text: '' };
        if (includeDoc && tab) {
            docInfo = await extractDocContent(tab);
        }

        let finalPrompt = '';
        if (actionType === 'summarize') {
            finalPrompt = buildSummarizePrompt(docInfo, currentLang);
        } else if (actionType === 'translate') {
            finalPrompt = buildTranslatePrompt(docInfo, currentLang);
        } else if (actionType === 'keypoints') {
            finalPrompt = buildKeyPointsPrompt(docInfo, currentLang);
        } else if (actionType === 'custom') {
            finalPrompt = buildCustomQuestionPrompt(customQuestion, docInfo, includeDoc, currentLang);
        }

        if (!finalPrompt.trim()) {
            showAIStatus(t.aiPromptEmpty || "Vui lòng nhập hoặc chọn câu hỏi!", 'error');
            return;
        }

        await forwardToAI(finalPrompt, selectedModel);
    } catch (err) {
        console.error('BamiDoc handleAIAction error:', err);
        const t = getT();
        showAIStatus((t.alertError || "⚠️ Lỗi: ") + err.message, 'error');
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // 0. Load persisted settings
    await loadSettings();
    applyPopupScale(getSetting('popupScale', 100));

    // 1. Bind event listeners immediately (interactivity has zero delay)
    initEventListeners();
    
    // 2. Apply initial language (whether from saved preferences or auto-detected)
    applyLanguage(currentLang, false);

    // 3. Apply settings to UI controls & layout
    applySettingsToUI();

    // 4. Default AI model
    const preferredModel = getSetting('aiDefaultModel', 'gemini');
    if (typeof updateAIModelUI === 'function') {
        updateAIModelUI(preferredModel);
    }

    // 5. Default tab based on settings
    const startTabSetting = getSetting('startupTab', 'last_used');
    if (startTabSetting === 'ai') {
        switchToTab('ai', true);
    } else if (startTabSetting === 'download') {
        switchToTab('download', true);
    } else {
        const lastTab = localStorage.getItem('banhmi_last_tab') || 'download';
        switchToTab(lastTab, true);
    }

    // 6. Default Include Doc checkbox
    const aiIncludeDocCheck = document.getElementById('aiIncludeDocCheck');
    if (aiIncludeDocCheck) {
        aiIncludeDocCheck.checked = getSetting('aiDefaultIncludeDoc', true);
    }
    
    // 7. Update dynamic texts & AI badge as soon as the tab query resolves
    activeTabPromise.then((tab) => {
        updateDynamicTexts();
        if (tab) {
            updateDocBadge(tab);
        }
    });
});