// BamiDoc - Gemini Bridge Content Script (Auto-fill & Auto-send)
(function() {
    'use strict';

    if (!window.location.hostname.includes('gemini.google.com')) return;

    if (window.__banhmi_gemini_bridge_loaded) {
        return;
    }
    window.__banhmi_gemini_bridge_loaded = true;

    let lastHandledPrompt = '';
    let lastHandledTime = 0;
    let isProcessing = false;
    let currentBridgeLang = 'vi';

    const bridgeTexts = {
        vi: {
            preparing: "Đang chuẩn bị câu hỏi...",
            autoSending: "Đang tự động điền & gửi...",
            success: "Đã gửi câu hỏi thành công!",
            manualSend: "Đã điền xong! Bấm gửi để tiếp tục.",
            copied: "Đã copy prompt! Nhấn Ctrl + V để dán."
        },
        zh_CN: {
            preparing: "正在准备问题...",
            autoSending: "正在自动填写并发送...",
            success: "问题已成功发送！",
            manualSend: "已填写完毕！点击发送继续。",
            copied: "提示词已复制！按 Ctrl + V 粘贴。"
        },
        zh_TW: {
            preparing: "正在準備問題...",
            autoSending: "正在自動填寫並發送...",
            success: "問題已成功發送！",
            manualSend: "已填寫完畢！點擊發送繼續。",
            copied: "提示詞已複製！按 Ctrl + V 貼上。"
        },
        ja: {
            preparing: "質問を準備しています...",
            autoSending: "自動入力および送信中...",
            success: "質問を正常に送信しました！",
            manualSend: "入力完了！送信を押して続行してください。",
            copied: "プロンプトをコピーしました！Ctrl + V で貼り付け。"
        },
        ko: {
            preparing: "질문 준비 중...",
            autoSending: "자동 입력 및 전송 중...",
            success: "질문이 성공적으로 전송되었습니다!",
            manualSend: "입력 완료! 전송을 눌러 계속하세요.",
            copied: "프롬프트가 복사되었습니다! Ctrl + V로 붙여넣기."
        },
        es: {
            preparing: "Preparando la pregunta...",
            autoSending: "Rellenando y enviando automáticamente...",
            success: "¡Pregunta enviada con éxito!",
            manualSend: "¡Completado! Haz clic en enviar para continuar.",
            copied: "¡Prompt copiado! Presiona Ctrl + V para pegar."
        },
        fr: {
            preparing: "Préparation de la question...",
            autoSending: "Remplissage et envoi automatique...",
            success: "Question envoyée avec succès !",
            manualSend: "Terminé ! Cliquez sur envoyer pour continuer.",
            copied: "Prompt copié ! Appuyez sur Ctrl + V pour coller."
        },
        de: {
            preparing: "Frage wird vorbereitet...",
            autoSending: "Wird automatisch ausgefüllt und gesendet...",
            success: "Frage erfolgreich gesendet!",
            manualSend: "Ausgefüllt! Klicken Sie auf Senden, um fortzufahren.",
            copied: "Prompt kopiert! Drücken Sie Strg + V zum Einfügen."
        },
        ru: {
            preparing: "Подготовка вопроса...",
            autoSending: "Автоматическое заполнение и отправка...",
            success: "Вопрос успешно отправлен!",
            manualSend: "Заполнено! Нажмите отправить, чтобы продолжить.",
            copied: "Промпт скопирован! Нажмите Ctrl + V для вставки."
        },
        pt: {
            preparing: "Preparando a pergunta...",
            autoSending: "Preenchendo e enviando automaticamente...",
            success: "Pergunta enviada com sucesso!",
            manualSend: "Preenchido! Clique em enviar para continuar.",
            copied: "Prompt copiado! Pressione Ctrl + V para colar."
        },
        id: {
            preparing: "Menyiapkan pertanyaan...",
            autoSending: "Mengisi & mengirim otomatis...",
            success: "Pertanyaan berhasil dikirim!",
            manualSend: "Sudah diisi! Klik kirim untuk melanjutkan.",
            copied: "Prompt disalin! Tekan Ctrl + V untuk menempel."
        },
        en: {
            preparing: "Preparing question...",
            autoSending: "Auto-filling & submitting...",
            success: "Prompt submitted successfully!",
            manualSend: "Prompt filled! Click send to continue.",
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

    // Inject CSS for modern floating notification pill (HUD)
    function ensureNotificationStyles() {
        if (document.getElementById('banhmi-bridge-style-gemini')) return;
        const style = document.createElement('style');
        style.id = 'banhmi-bridge-style-gemini';
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

        let notif = document.getElementById('banhmi-gemini-bridge-hud');
        if (!notif) {
            notif = document.createElement('div');
            notif.id = 'banhmi-gemini-bridge-hud';
            notif.className = 'banhmi-hud-container';
            document.body.appendChild(notif);
        }

        let iconSvg = '';
        if (type === 'loading') {
            iconSvg = `<svg class="banhmi-spin" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="9" stroke-opacity="0.25"/><path d="M12 3a9 9 0 0 1 9 9"/></svg>`;
        } else if (type === 'success') {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
        } else {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
        }

        notif.innerHTML = `
            <div class="banhmi-hud-icon">${iconSvg}</div>
            <span class="banhmi-hud-text">${text}</span>
        `;

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

    function findGeminiEditor() {
        return document.querySelector(
            'rich-textarea div[contenteditable="true"], ' +
            'div.ql-editor[contenteditable="true"], ' +
            'div[role="textbox"][contenteditable="true"], ' +
            'div[contenteditable="true"]'
        );
    }

    function findGeminiSendButton() {
        return document.querySelector(
            'button.send-button, ' +
            'button[aria-label*="Send" i], ' +
            'button[aria-label*="Gửi" i], ' +
            'button[mattooltip*="Send" i], ' +
            'button[mattooltip*="Gửi" i], ' +
            'div.send-button-container button, ' +
            'button[jsname="Qx7uuf"], ' +
            'button[data-test-id="send-button"], ' +
            'button:has(mat-icon[data-mat-icon-name="send"]), ' +
            'button:has(svg path[d*="2.01 21L23 12"])'
        );
    }

    function isSendButtonEnabled(btn) {
        if (!btn) return false;
        if (btn.disabled) return false;
        if (btn.getAttribute('aria-disabled') === 'true') return false;
        if (btn.classList.contains('disabled')) return false;
        return true;
    }

    function insertTextIntoEditor(editor, text) {
        editor.focus();

        let p = editor.querySelector('p');
        if (!p) {
            p = document.createElement('p');
            editor.appendChild(p);
        }
        p.focus();

        // Select all inside p
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(p);
        selection.removeAllRanges();
        selection.addRange(range);

        // Try execCommand first (native undo and Angular detection)
        let inserted = false;
        try {
            inserted = document.execCommand('insertText', false, text);
        } catch (e) {}

        if (!inserted || !editor.innerText || !editor.innerText.trim()) {
            try {
                const clipboardData = new DataTransfer();
                clipboardData.setData('text/plain', text);
                const pasteEvent = new ClipboardEvent('paste', {
                    bubbles: true,
                    cancelable: true,
                    clipboardData: clipboardData
                });
                editor.dispatchEvent(pasteEvent);
                if (editor.innerText && editor.innerText.trim()) inserted = true;
            } catch (e) {}
        }

        if (!inserted || !editor.innerText || !editor.innerText.trim()) {
            p.textContent = text;
        }

        try {
            p.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data: text }));
            p.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertText', data: text }));
        } catch (e) {}

        editor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        editor.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    }

    function dispatchEnterKey(editor) {
        if (!editor) return;
        editor.focus();
        const enterDown = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
        });
        const enterUp = new KeyboardEvent('keyup', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
        });
        editor.dispatchEvent(enterDown);
        editor.dispatchEvent(enterUp);
    }

    function handlePrompt(promptText, autoSubmit = true) {
        if (!promptText || !promptText.trim()) return;

        const now = Date.now();
        if (lastHandledPrompt === promptText && (now - lastHandledTime) < 3000) {
            return;
        }
        lastHandledPrompt = promptText;
        lastHandledTime = now;

        if (isProcessing) return;
        isProcessing = true;

        showNotification(getHUDText('preparing'), "loading", 3000);

        let attempts = 0;
        const maxAttempts = 35; // 8.75s

        const editorInterval = setInterval(function() {
            attempts++;
            const editor = findGeminiEditor();

            if (editor) {
                clearInterval(editorInterval);

                try {
                    insertTextIntoEditor(editor, promptText);

                    if (autoSubmit === false) {
                        isProcessing = false;
                        chrome.storage.local.remove(['banhmi_gemini_pending_prompt']);
                        showNotification(getHUDText('manualSend'), "info", 3500);
                        return;
                    }

                    showNotification(getHUDText('autoSending'), "loading", 3000);

                    let sendAttempts = 0;
                    const maxSendAttempts = 20;

                    const sendInterval = setInterval(function() {
                        sendAttempts++;
                        const sendBtn = findGeminiSendButton();

                        if (isSendButtonEnabled(sendBtn)) {
                            clearInterval(sendInterval);
                            isProcessing = false;
                            chrome.storage.local.remove(['banhmi_gemini_pending_prompt']);
                            sendBtn.click();
                            showNotification(getHUDText('success'), "success", 2500);
                            return;
                        }

                        if (sendAttempts % 3 === 0) {
                            dispatchEnterKey(editor);
                        }

                        if (sendAttempts >= maxSendAttempts) {
                            clearInterval(sendInterval);
                            isProcessing = false;
                            chrome.storage.local.remove(['banhmi_gemini_pending_prompt']);
                            dispatchEnterKey(editor);
                            showNotification(getHUDText('manualSend'), "info", 3500);
                        }
                    }, 200);

                } catch (err) {
                    console.error("BamiDoc Gemini Bridge Error:", err);
                    isProcessing = false;
                    showNotification(getHUDText('copied'), "info", 3500);
                }

            } else if (attempts >= maxAttempts) {
                clearInterval(editorInterval);
                isProcessing = false;
                showNotification(getHUDText('copied'), "info", 4000);
            }
        }, 250);
    }

    function processPendingPrompt() {
        chrome.storage.local.get(['banhmi_gemini_pending_prompt'], function(res) {
            const item = res.banhmi_gemini_pending_prompt;
            if (!item || !item.prompt) return;

            const isFresh = (Date.now() - item.timestamp) < 120000;
            if (!isFresh) {
                chrome.storage.local.remove(['banhmi_gemini_pending_prompt']);
                return;
            }

            handlePrompt(item.prompt, item.autoSubmit !== false);
        });
    }

    processPendingPrompt();

    chrome.storage.onChanged.addListener(function(changes, areaName) {
        if (areaName === 'local' && changes.banhmi_gemini_pending_prompt && changes.banhmi_gemini_pending_prompt.newValue) {
            const item = changes.banhmi_gemini_pending_prompt.newValue;
            if (item && item.prompt) {
                handlePrompt(item.prompt, item.autoSubmit !== false);
            }
        }
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request && (request.action === 'banhmi_gemini_prompt' || request.action === 'banhmi_inject_prompt')) {
            if (request.prompt) {
                handlePrompt(request.prompt, request.autoSubmit !== false);
                sendResponse({ status: 'received' });
            }
        }
        return true;
    });
})();
