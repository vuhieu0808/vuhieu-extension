// BamiDoc - ChatGPT Bridge Content Script (Auto-fill & Auto-send)
(function() {
    'use strict';

    if (!window.location.hostname.includes('chatgpt.com') && !window.location.hostname.includes('openai.com')) return;

    if (window.__banhmi_chatgpt_bridge_loaded) {
        return;
    }
    window.__banhmi_chatgpt_bridge_loaded = true;

    let lastHandledPrompt = '';
    let lastHandledTime = 0;
    let isProcessing = false;
    let currentCheckInterval = null;
    let currentSendInterval = null;
    let currentSafetyTimeout = null;
    let currentBridgeLang = 'vi';

    function clearAllPromptTimers() {
        if (currentCheckInterval) {
            clearInterval(currentCheckInterval);
            currentCheckInterval = null;
        }
        if (currentSendInterval) {
            clearInterval(currentSendInterval);
            currentSendInterval = null;
        }
        if (currentSafetyTimeout) {
            clearTimeout(currentSafetyTimeout);
            currentSafetyTimeout = null;
        }
        isProcessing = false;
    }

    const bridgeTexts = {
        vi: {
            preparing: "Đang chuẩn bị câu hỏi...",
            autoSending: "Đang tự động điền & gửi...",
            success: "Đã gửi câu hỏi thành công!",
            manualSend: "Đã điền xong! Nhấn Enter để gửi.",
            copied: "Đã copy prompt! Nhấn Ctrl + V để dán."
        },
        zh_CN: {
            preparing: "正在准备问题...",
            autoSending: "正在自动填写并发送...",
            success: "问题已成功发送！",
            manualSend: "已填写完毕！按 Enter 键发送。",
            copied: "提示词已复制！按 Ctrl + V 粘贴。"
        },
        zh_TW: {
            preparing: "正在準備問題...",
            autoSending: "正在自動填寫並發送...",
            success: "問題已成功發送！",
            manualSend: "已填寫完畢！按 Enter 鍵發送。",
            copied: "提示詞已複製！按 Ctrl + V 貼上。"
        },
        ja: {
            preparing: "質問を準備しています...",
            autoSending: "自動入力および送信中...",
            success: "質問を正常に送信しました！",
            manualSend: "入力完了！Enterキーを押して送信。",
            copied: "プロンプトをコピーしました！Ctrl + V で貼り付け。"
        },
        ko: {
            preparing: "질문 준비 중...",
            autoSending: "자동 입력 및 전송 중...",
            success: "질문이 성공적으로 전송되었습니다!",
            manualSend: "입력 완료! Enter를 눌러 전송하세요.",
            copied: "프롬프트가 복사되었습니다! Ctrl + V로 붙여넣기."
        },
        es: {
            preparing: "Preparando la pregunta...",
            autoSending: "Rellenando y enviando automáticamente...",
            success: "¡Pregunta enviada con éxito!",
            manualSend: "¡Completado! Presiona Enter para enviar.",
            copied: "¡Prompt copiado! Presiona Ctrl + V para pegar."
        },
        fr: {
            preparing: "Préparation de la question...",
            autoSending: "Remplissage et envoi automatique...",
            success: "Question envoyée avec succès !",
            manualSend: "Terminé ! Appuyez sur Entrée pour envoyer.",
            copied: "Prompt copié ! Appuyez sur Ctrl + V pour coller."
        },
        de: {
            preparing: "Frage wird vorbereitet...",
            autoSending: "Wird automatisch ausgefüllt und gesendet...",
            success: "Frage erfolgreich gesendet!",
            manualSend: "Ausgefüllt! Drücken Sie Enter zum Senden.",
            copied: "Prompt kopiert! Drücken Sie Strg + V zum Einfügen."
        },
        ru: {
            preparing: "Подготовка вопроса...",
            autoSending: "Автоматическое заполнение и отправка...",
            success: "Вопрос успешно отправлен!",
            manualSend: "Заполнено! Нажмите Enter для отправки.",
            copied: "Промпт скопирован! Нажмите Ctrl + V для вставки."
        },
        pt: {
            preparing: "Preparando a pergunta...",
            autoSending: "Preenchendo e enviando automaticamente...",
            success: "Pergunta enviada com sucesso!",
            manualSend: "Preenchido! Pressione Enter para enviar.",
            copied: "Prompt copiado! Pressione Ctrl + V para colar."
        },
        id: {
            preparing: "Menyiapkan pertanyaan...",
            autoSending: "Mengisi & mengirim otomatis...",
            success: "Pertanyaan berhasil dikirim!",
            manualSend: "Sudah diisi! Tekan Enter untuk mengirim.",
            copied: "Prompt disalin! Tekan Ctrl + V untuk menempel."
        },
        en: {
            preparing: "Preparing question...",
            autoSending: "Auto-filling & submitting...",
            success: "Prompt submitted successfully!",
            manualSend: "Prompt filled! Press Enter to send.",
            copied: "Prompt copied! Press Ctrl + V to paste."
        }
    };

    function getHUDText(key) {
        const lang = currentBridgeLang || 'en';
        const dict = bridgeTexts[lang] || bridgeTexts[lang.split('_')[0]] || bridgeTexts[lang.split('-')[0]] || bridgeTexts.en;
        return dict[key] || bridgeTexts.en[key] || '';
    }

    try {
        chrome.storage.local.get(['banhmi_lang'], (res) => {
            if (res && res.banhmi_lang) {
                currentBridgeLang = res.banhmi_lang;
            }
        });
    } catch (e) {}

    chrome.storage.onChanged.addListener(function(changes, areaName) {
        if (areaName === 'local' && changes.banhmi_lang && changes.banhmi_lang.newValue) {
            currentBridgeLang = changes.banhmi_lang.newValue;
        }
    });

    // Inject CSS for modern floating notification pill (Apple / Glassmorphism HUD)
    function ensureNotificationStyles() {
        if (document.getElementById('banhmi-bridge-style')) return;
        const style = document.createElement('style');
        style.id = 'banhmi-bridge-style';
        style.textContent = `
            .banhmi-hud-container {
                position: fixed;
                top: 14px;
                left: 50%;
                transform: translateX(-50%) translateY(-12px) scale(0.94);
                z-index: 2147483647;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 7px 16px;
                border-radius: 9999px;
                background: rgba(22, 22, 26, 0.92);
                backdrop-filter: blur(18px);
                -webkit-backdrop-filter: blur(18px);
                border: 1px solid rgba(255, 255, 255, 0.16);
                box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.25);
                color: #F9FAFB;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                font-size: 12.5px;
                font-weight: 500;
                letter-spacing: 0.15px;
                pointer-events: none;
                opacity: 0;
                transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease;
                user-select: none;
            }
            .banhmi-hud-container.banhmi-hud-show {
                opacity: 1;
                transform: translateX(-50%) translateY(0) scale(1);
            }
            .banhmi-hud-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            .banhmi-hud-icon svg {
                width: 15px;
                height: 15px;
                display: block;
            }
            .banhmi-hud-text {
                white-space: nowrap;
            }
            @keyframes banhmi-spin-anim {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .banhmi-spin {
                animation: banhmi-spin-anim 0.85s linear infinite;
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    function showNotification(text, type = 'loading', duration = 3000) {
        ensureNotificationStyles();

        let notif = document.getElementById('banhmi-chatgpt-bridge-hud');
        if (!notif) {
            notif = document.createElement('div');
            notif.id = 'banhmi-chatgpt-bridge-hud';
            notif.className = 'banhmi-hud-container';
            document.body.appendChild(notif);
        }

        let iconSvg = '';
        if (type === 'loading') {
            iconSvg = `<svg class="banhmi-spin" viewBox="0 0 24 24" fill="none" stroke="#FF8A00" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="9" stroke-opacity="0.25"/><path d="M12 3a9 9 0 0 1 9 9"/></svg>`;
        } else if (type === 'success') {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
        } else {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
        }

        notif.innerHTML = `
            <div class="banhmi-hud-icon">${iconSvg}</div>
            <span class="banhmi-hud-text">${text}</span>
        `;

        // Trigger animation
        requestAnimationFrame(() => {
            notif.classList.add('banhmi-hud-show');
        });

        if (notif._hideTimeout) {
            clearTimeout(notif._hideTimeout);
        }

        notif._hideTimeout = setTimeout(() => {
            notif.classList.remove('banhmi-hud-show');
        }, duration);
    }

    function findChatGPTRichEditor() {
        return document.querySelector(
            '#prompt-textarea, ' +
            'div[contenteditable="true"]#prompt-textarea, ' +
            'div[contenteditable="true"][data-placeholder], ' +
            'div.ProseMirror[contenteditable="true"], ' +
            'div.ProseMirror, ' +
            'textarea[data-id="root"], ' +
            'textarea#prompt-textarea, ' +
            'textarea'
        );
    }

    function isChatGPTGenerating() {
        const stopBtn = document.querySelector(
            'button[data-testid="stop-button"], ' +
            'button[data-testid="fruitjuice-stop-button"], ' +
            'button[aria-label*="Stop" i], ' +
            'button[aria-label*="Dừng" i]'
        );
        return !!stopBtn;
    }

    function findChatGPTSendButton() {
        return document.querySelector(
            'button[data-testid="send-button"], ' +
            'button[data-testid="fruitjuice-send-button"], ' +
            'button[aria-label*="Send" i], ' +
            'button[aria-label*="Gửi" i], ' +
            'button[aria-label*="Envoyer" i], ' +
            'button[aria-label*="Enviar" i], ' +
            'button[aria-label*="Отправить" i], ' +
            'button[aria-label*="送信" i], ' +
            'button[aria-label*="전송" i], ' +
            'button[aria-label*="发送" i], ' +
            'button[aria-label*="傳送" i], ' +
            'button[data-testid="composer-speech-button"] + button, ' +
            'button[data-testid="composer-speech-button"] ~ button, ' +
            '#prompt-textarea + button, ' +
            '#prompt-textarea ~ button, ' +
            'form button[type="submit"], ' +
            'div[data-testid="composer-speech-button"] ~ button'
        );
    }

    function isSendButtonEnabled(btn) {
        if (!btn) return false;
        if (btn.disabled) return false;
        if (btn.getAttribute('aria-disabled') === 'true') return false;
        if (btn.classList.contains('disabled')) return false;
        return true;
    }

    function clickSendButton(btn) {
        if (!btn) return false;
        btn.focus();
        try {
            btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window }));
            btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
            btn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, view: window }));
            btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
        } catch (e) {}
        btn.click();
        return true;
    }

    function dispatchEnterKey(editor) {
        if (!editor) return;
        const target = editor.querySelector('p') || editor;
        target.focus();

        const eventParams = {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true,
            view: window
        };
        target.dispatchEvent(new KeyboardEvent('keydown', eventParams));
        target.dispatchEvent(new KeyboardEvent('keypress', eventParams));
        target.dispatchEvent(new KeyboardEvent('keyup', eventParams));

        if (target !== editor) {
            editor.dispatchEvent(new KeyboardEvent('keydown', eventParams));
            editor.dispatchEvent(new KeyboardEvent('keypress', eventParams));
            editor.dispatchEvent(new KeyboardEvent('keyup', eventParams));
        }
    }

    function insertTextIntoChatGPT(editor, text) {
        if (!editor) return false;
        editor.focus();

        if (editor.tagName === 'TEXTAREA') {
            editor.value = text;
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            editor.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }

        // ProseMirror contenteditable container
        let p = editor.querySelector('p');
        if (!p) {
            p = document.createElement('p');
            editor.appendChild(p);
        }
        p.focus();

        // Target range inside the paragraph only so execCommand does not select the full document
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(p);
        selection.removeAllRanges();
        selection.addRange(range);

        // Delete previous content inside p if any
        try {
            document.execCommand('delete', false, null);
        } catch (e) {}

        // Native execCommand('insertText') which ProseMirror intercepts cleanly
        let inserted = false;
        try {
            inserted = document.execCommand('insertText', false, text);
        } catch (e) {
            console.warn('BamiDoc: execCommand insertText fallback', e);
        }

        // Fallback: ProseMirror beforeinput event
        if (!inserted || !editor.innerText || !editor.innerText.trim()) {
            try {
                p.dispatchEvent(new InputEvent('beforeinput', {
                    bubbles: true,
                    cancelable: true,
                    inputType: 'insertText',
                    data: text
                }));
            } catch (e) {}
        }

        // Direct textContent fallback if still empty
        if (!editor.innerText || !editor.innerText.trim()) {
            p.textContent = text;
        }

        // Fire InputEvent to update React internal state and enable the send button
        try {
            p.dispatchEvent(new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                inputType: 'insertText',
                data: text
            }));
        } catch (e) {}

        editor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        editor.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

        return true;
    }

    function handlePrompt(promptText, autoSubmit = true) {
        if (!promptText || !promptText.trim()) return;

        const now = Date.now();
        // Debounce exact same prompt within 1.5s
        if (lastHandledPrompt === promptText && (now - lastHandledTime) < 1500) {
            return;
        }
        lastHandledPrompt = promptText;
        lastHandledTime = now;

        // If currently in an existing conversation (/c/... or /g/...),
        // always open a brand new conversation as requested by user
        const isExistingChatUrl = window.location.pathname.startsWith('/c/') || window.location.pathname.startsWith('/g/');
        if (isExistingChatUrl) {
            clearAllPromptTimers();
            chrome.storage.local.set({
                banhmi_chatgpt_pending_prompt: {
                    prompt: promptText,
                    autoSubmit: autoSubmit,
                    timestamp: Date.now()
                }
            }, () => {
                window.location.href = 'https://chatgpt.com/';
            });
            return;
        }

        // Clear any previous running intervals so this new prompt executes immediately
        clearAllPromptTimers();
        isProcessing = true;

        // Safety timeout: reset processing lock after 12s
        currentSafetyTimeout = setTimeout(() => {
            clearAllPromptTimers();
        }, 12000);

        showNotification(getHUDText('preparing'), "loading", 3000);

        let waitAttempts = 0;
        const maxWaitAttempts = 35; // 7 seconds

        currentCheckInterval = setInterval(function() {
            waitAttempts++;

            // If ChatGPT is actively generating, wait up to 25 attempts (5s)
            if (isChatGPTGenerating() && waitAttempts < 25) {
                return;
            }

            const editor = findChatGPTRichEditor();
            if (editor) {
                clearInterval(currentCheckInterval);
                currentCheckInterval = null;

                try {
                    insertTextIntoChatGPT(editor, promptText);

                    if (autoSubmit === false) {
                        clearAllPromptTimers();
                        chrome.storage.local.remove(['banhmi_chatgpt_pending_prompt']);
                        showNotification(getHUDText('manualSend'), "info", 3500);
                        return;
                    }

                    showNotification(getHUDText('autoSending'), "loading", 3000);

                    // Polling to submit via Send button or Enter key
                    let sendAttempts = 0;
                    const maxSendAttempts = 20; // 4 seconds

                    currentSendInterval = setInterval(function() {
                        sendAttempts++;

                        // 1. If ChatGPT is already generating, prompt was sent
                        if (isChatGPTGenerating()) {
                            clearAllPromptTimers();
                            chrome.storage.local.remove(['banhmi_chatgpt_pending_prompt']);
                            showNotification(getHUDText('success'), "success", 2500);
                            return;
                        }

                        // 2. Try send button
                        const sendBtn = findChatGPTSendButton();
                        if (isSendButtonEnabled(sendBtn)) {
                            clickSendButton(sendBtn);
                            clearAllPromptTimers();
                            chrome.storage.local.remove(['banhmi_chatgpt_pending_prompt']);
                            showNotification(getHUDText('success'), "success", 2500);
                            return;
                        }

                        // 3. Fallback enter key after some attempts
                        if (sendAttempts === 4 || sendAttempts === 8 || sendAttempts === 12) {
                            dispatchEnterKey(editor);
                        }

                        // 4. If editor cleared after attempt 3 (submitted)
                        if (sendAttempts > 3 && (!editor.innerText || !editor.innerText.trim())) {
                            clearAllPromptTimers();
                            chrome.storage.local.remove(['banhmi_chatgpt_pending_prompt']);
                            showNotification(getHUDText('success'), "success", 2500);
                            return;
                        }

                        if (sendAttempts >= maxSendAttempts) {
                            dispatchEnterKey(editor);
                            clearAllPromptTimers();
                            chrome.storage.local.remove(['banhmi_chatgpt_pending_prompt']);
                            showNotification(getHUDText('manualSend'), "info", 3500);
                        }
                    }, 200);

                } catch (err) {
                    console.error("BamiDoc ChatGPT Bridge Error:", err);
                    clearAllPromptTimers();
                    showNotification(getHUDText('copied'), "info", 3500);
                }

            } else if (waitAttempts >= maxWaitAttempts) {
                clearAllPromptTimers();
                showNotification(getHUDText('copied'), "info", 4000);
            }
        }, 200);
    }

    function processPendingChatGPT() {
        chrome.storage.local.get(['banhmi_chatgpt_pending_prompt'], function(res) {
            const item = res.banhmi_chatgpt_pending_prompt;
            if (!item || !item.prompt) return;

            const isFresh = (Date.now() - item.timestamp) < 120000;
            if (!isFresh) {
                chrome.storage.local.remove(['banhmi_chatgpt_pending_prompt']);
                return;
            }

            handlePrompt(item.prompt, item.autoSubmit !== false);
        });
    }

    // 1. Process on page load / initialization
    processPendingChatGPT();

    // 2. Listen for storage changes
    chrome.storage.onChanged.addListener(function(changes, areaName) {
        if (areaName === 'local' && changes.banhmi_chatgpt_pending_prompt && changes.banhmi_chatgpt_pending_prompt.newValue) {
            const item = changes.banhmi_chatgpt_pending_prompt.newValue;
            if (item && item.prompt) {
                handlePrompt(item.prompt, item.autoSubmit !== false);
            }
        }
    });

    // 3. Listen for direct runtime message from popup
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request && (request.action === 'banhmi_chatgpt_prompt' || request.action === 'banhmi_inject_prompt')) {
            if (request.prompt) {
                handlePrompt(request.prompt, request.autoSubmit !== false);
                sendResponse({ status: 'received' });
            }
        }
        return true;
    });
})();
