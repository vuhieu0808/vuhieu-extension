(function() {
    let rawLang = window.__banhmi_lang || (navigator.language ? navigator.language.replace('-', '_') : 'en');
    let lang = rawLang;
    if (!['zh_CN', 'zh_TW', 'pt_BR', 'es_419'].includes(lang)) {
        lang = lang.split('_')[0];
    }

    const messages = {
        vi: {
            noPages: "Không tìm thấy trang tài liệu nào để mở khóa.",
            success: "Đã unblur mở khóa các trang hiện tại! Cuộn chuột để xem tiếp các trang khác."
        },
        zh_CN: {
            noPages: "未找到可解锁的文档页面。",
            success: "已解除当前页面的模糊限制！请滚动页面以查看更多。"
        },
        zh_TW: {
            noPages: "未找到可解鎖的文件頁面。",
            success: "已解除當前頁面的模糊限制！請滾動頁面以查看更多。"
        },
        ja: {
            noPages: "ロック解除するドキュメントページが見つかりません。",
            success: "現在のページのぼかしを解除しました！スクロールして続きをご覧ください。"
        },
        ko: {
            noPages: "잠금 해제할 문서 페이지를 찾을 수 없습니다.",
            success: "현재 페이지의 블러를 해제했습니다! 계속 보려면 스크롤하세요."
        },
        es: {
            noPages: "No se encontraron páginas para desbloquear.",
            success: "¡Se han desbloqueado las páginas actuales! Desplázate para ver más."
        },
        fr: {
            noPages: "Aucune page trouvée à débloquer.",
            success: "Les pages actuelles ont été déverrouillées ! Faites défiler pour continuer."
        },
        de: {
            noPages: "Keine Dokumentseiten zum Entsperren gefunden.",
            success: "Aktuelle Seiten entsperrt! Scrollen Sie, um weitere Seiten anzuzeigen."
        },
        ru: {
            noPages: "Страницы для разблокировки не найдены.",
            success: "Текущие страницы разблокированы! Прокрутите, чтобы увидеть остальные."
        },
        pt: {
            noPages: "Nenhuma página de documento encontrada para desbloquear.",
            success: "Páginas atuais desbloqueadas! Role para ver mais."
        },
        id: {
            noPages: "Tidak ada halaman dokumen yang ditemukan untuk dibuka kuncinya.",
            success: "Halaman saat ini berhasil dibuka! Gulir untuk melihat lebih banyak."
        },
        en: {
            noPages: "No document pages found to unlock.",
            success: "Current pages unblurred and unlocked! Scroll down to see more pages."
        }
    };

    const gatedNoteMessages = {
        vi: (p) => `Trang ${p} đang bị làm mờ: Vui lòng bấm nút "Mở khóa Scribd" trên tiện ích Doc Downloader trước khi tải!`,
        en: (p) => `Page ${p} is blurred: Please click "Unlock Scribd" in the Doc Downloader extension before downloading!`,
        zh_CN: (p) => `第 ${p} 页已模糊：下载前请点击 Doc Downloader 扩展程序中的“解锁 Scribd”！`,
        zh_TW: (p) => `第 ${p} 頁已模糊：下載前請點擊 Doc Downloader 擴充功能中的「解鎖 Scribd」！`,
        ja: (p) => `ページ ${p} はぼかされています：ダウンロードする前に Doc Downloader 拡張機能の「Scribd ロック解除」をクリックしてください！`,
        ko: (p) => `${p} 페이지가 블러 처리되었습니다: 다운로드하기 전에 Doc Downloader 확장 프로그램에서 "Scribd 잠금 해제"를 클릭하세요!`,
        de: (p) => `Seite ${p} ist verschwommen: Bitte klicken Sie vor dem Herunterladen in der Doc Downloader-Erweiterung auf "Scribd entsperren"!`,
        ru: (p) => `Страница ${p} размыта: пожалуйста, нажмите «Разблокировать Scribd» в расширении Doc Downloader перед загрузкой!`,
        es: (p) => `La página ${p} está borrosa: ¡Haga clic en "Desbloquear Scribd" en la extensión Doc Downloader antes de descargar!`,
        id: (p) => `Halaman ${p} buram: Silakan klik "Buka Kunci Scribd" di ekstensi Doc Downloader sebelum mengunduh!`,
        pt: (p) => `A página ${p} está desfocada: clique em "Desbloquear Scribd" na extensão Doc Downloader antes de baixar!`,
        fr: (p) => `La page ${p} est floue : veuillez cliquer sur « Déverrouiller Scribd » dans l'extension Doc Downloader avant de télécharger !`
    };

    const msg = messages[lang] || messages[rawLang] || (lang === 'vi' ? messages.vi : messages.en);

    function ensureGatedStyles() {
        if (document.getElementById('banhmi-gated-note-style')) return;
        const style = document.createElement('style');
        style.id = 'banhmi-gated-note-style';
        style.innerHTML = `
            .banhmi-gated-note {
                position: absolute !important;
                left: 0 !important;
                right: 0 !important;
                top: 0 !important;
                z-index: 30 !important;
                box-sizing: border-box !important;
                margin: 0 !important;
                padding: 11px 20px !important;
                background: linear-gradient(135deg, rgba(26, 20, 16, 0.96) 0%, rgba(38, 26, 18, 0.96) 100%) !important;
                backdrop-filter: blur(8px) !important;
                -webkit-backdrop-filter: blur(8px) !important;
                color: #FFFFFF !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", "Hiragino Sans", "Yu Gothic UI", "Apple SD Gothic Neo", "Malgun Gothic", "Leelawadee UI", "Nirmala UI", "Segoe UI Historic", "Noto Sans", sans-serif !important;
                font-size: 13.5px !important;
                font-weight: 500 !important;
                line-height: 1.45 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 10px !important;
                border-bottom: 2px solid #FF6B00 !important;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25) !important;
                filter: none !important;
                opacity: 1 !important;
                pointer-events: none !important;
            }
            @media print {
                .banhmi-gated-note {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    function attachGatedNote(container, num) {
        if (!container || container.querySelector('.banhmi-gated-note')) return;
        ensureGatedStyles();
        const computedPos = window.getComputedStyle(container).position;
        if (computedPos === 'static') {
            container.style.setProperty('position', 'relative', 'important');
        }
        const getMsg = gatedNoteMessages[lang] || gatedNoteMessages[rawLang] || (lang === 'vi' ? gatedNoteMessages.vi : gatedNoteMessages.en);
        const msgText = typeof getMsg === 'function' ? getMsg(num) : (lang === 'vi' ? `Trang ${num} đang bị làm mờ: Vui lòng bấm nút "Mở khóa Scribd" trên tiện ích Doc Downloader trước khi tải!` : `Page ${num} is blurred: Please click "Unlock Scribd" in the Doc Downloader extension before downloading!`);
        const note = document.createElement('div');
        note.className = 'banhmi-gated-note';
        note.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9800" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>${msgText}</span>
        `;
        container.appendChild(note);
    }

    function showToast(text, isError = false) {
        try {
            const oldToast = document.getElementById('banhmi-toast-notification');
            if (oldToast) oldToast.remove();

            const cleanText = (text || '').replace(/^[\s\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1FA00}-\u{1FAFF}!]+/gu, '').trim();

            const toast = document.createElement('div');
            toast.id = 'banhmi-toast-notification';
            toast.style.cssText = `
                position: fixed !important;
                top: 84px !important;
                left: 24px !important;
                right: auto !important;
                z-index: 2147483647 !important;
                background: rgba(255, 255, 255, 0.98) !important;
                backdrop-filter: blur(16px) !important;
                -webkit-backdrop-filter: blur(16px) !important;
                color: #0F172A !important;
                padding: 12px 18px !important;
                border-radius: 14px !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", "Hiragino Sans", "Yu Gothic UI", "Apple SD Gothic Neo", "Malgun Gothic", "Leelawadee UI", "Nirmala UI", "Segoe UI Historic", "Noto Sans", sans-serif !important;
                box-shadow: 0 12px 36px -4px rgba(15, 23, 42, 0.16), 0 4px 12px -2px rgba(15, 23, 42, 0.06) !important;
                border: 1px solid rgba(0, 0, 0, 0.08) !important;
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                min-width: 300px !important;
                max-width: min(520px, calc(100vw - 32px)) !important;
                opacity: 0 !important;
                transform: translateY(-16px) scale(0.96) !important;
                transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
                pointer-events: auto !important;
                box-sizing: border-box !important;
            `;

            const accentColor = isError ? '#EF4444' : '#FF6B00';
            const iconBg = isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 107, 0, 0.1)';
            const iconBorder = isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 107, 0, 0.2)';

            const iconSvg = isError ? `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            ` : `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                </svg>
            `;

            const tagText = isError ? (lang === 'vi' ? 'Lỗi' : 'Error') : 'Doc Downloader';

            toast.innerHTML = `
                <div style="width:34px;height:34px;border-radius:10px;background:${iconBg};border:1px solid ${iconBorder};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    ${iconSvg}
                </div>
                <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;">
                    <div style="font-size:10.5px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;color:${accentColor};line-height:1.2;">
                        ${tagText}
                    </div>
                    <div style="font-size:12.5px;font-weight:500;color:#1E293B;line-height:1.45;word-break:break-word;">
                        ${cleanText}
                    </div>
                </div>
                <button type="button" id="banhmi-toast-close" style="background:transparent;border:none;cursor:pointer;padding:4px;color:#94A3B8;border-radius:6px;display:flex;align-items:center;justify-content:center;margin-left:4px;flex-shrink:0;outline:none;" title="${lang === 'vi' ? 'Đóng' : 'Close'}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;

            (document.documentElement || document.body).appendChild(toast);

            const closeBtn = toast.querySelector('#banhmi-toast-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateY(-16px) scale(0.96)';
                    setTimeout(() => { if (toast && toast.parentElement) toast.remove(); }, 280);
                });
                closeBtn.addEventListener('mouseenter', () => { closeBtn.style.color = '#334155'; closeBtn.style.background = '#F1F5F9'; });
                closeBtn.addEventListener('mouseleave', () => { closeBtn.style.color = '#94A3B8'; closeBtn.style.background = 'transparent'; });
            }

            requestAnimationFrame(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateY(0) scale(1)';
            });

            clearTimeout(window.__banhmi_toast_timer);
            window.__banhmi_toast_timer = setTimeout(() => {
                if (toast && toast.parentElement) {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateY(-16px) scale(0.96)';
                    setTimeout(() => { if (toast && toast.parentElement) toast.remove(); }, 280);
                }
            }, 4000);
        } catch (e) {
            console.warn('[DocDownloader] toast:', text);
        }
    }

    const pageSelectors = [
        'div.outer_page',
        'div.document_page',
        'div.page_container',
        'div.page-container',
        '[id^="page_container_"]'
    ];
    let pages = [];
    for (const sel of pageSelectors) {
        pages = document.querySelectorAll(sel);
        if (pages.length > 0) break;
    }

    if (pages.length === 0) {
        showToast(msg.noPages, true);
        return;
    }

    function getScribdPageNumber(el, index) {
        if (el.hasAttribute('data-page-number')) {
            const n = parseInt(el.getAttribute('data-page-number'), 10);
            if (!isNaN(n) && n > 0) return n;
        }
        if (el.id) {
            const m = el.id.match(/\d+/);
            if (m) {
                const n = parseInt(m[0], 10);
                if (!isNaN(n) && n > 0) return n;
            }
        }
        return (typeof index === 'number' && index >= 0) ? (index + 1) : 1;
    }

    function cleanPage(el, index) {
        const isGatedBefore = (
            el.classList.contains('blurred_page') ||
            el.classList.contains('blur') ||
            el.classList.contains('page_missing') ||
            Boolean(el.querySelector('.page-blur-promo, .page-blur-promo-overlay, .promo_overlay, .between_page_portal, .page_missing_explanation, [class*="blur-promo"], [class*="paywall"], [class*="promo"]'))
        );

        el.classList.remove('blurred_page', 'blur');
        el.querySelectorAll('.blurred_page, .blur').forEach(inner => {
            inner.classList.remove('blurred_page', 'blur');
        });

        el.querySelectorAll('img, .absimg').forEach(img => {
            img.style.setProperty('opacity', '1', 'important');
            img.style.setProperty('filter', 'none', 'important');
            img.style.setProperty('display', 'block', 'important');
        });

        // 1. Dọn dẹp bằng CSS Selectors nâng cao
        const promoSelectors = [
            '.page-blur-promo',
            '.page-blur-promo-overlay',
            '.promo_overlay',
            '.between_page_portal',
            '.between_page_ads',
            '.page_missing_explanation',
            '.page_missing_explanation_inner',
            '[class*="blur-promo"]',
            '[class*="promo-overlay"]',
            '[class*="paywall"]',
            '[class*="unlock"]',
            '[class*="promo"]'
        ];
        promoSelectors.forEach(sel => {
            el.querySelectorAll(sel).forEach(inner => inner.remove());
        });

        // 2. Dọn dẹp bằng tìm kiếm văn bản nhạy cảm
        const promoTexts = [
            "Unlock this document",
            "Upload to download",
            "Start your 30 day free trial",
            "Unlock the next",
            "Skip ad",
            "Read for free"
        ];
        
        try {
            const allElements = Array.from(el.querySelectorAll('*'));
            allElements.forEach(item => {
                if (item && item.tagName !== 'SCRIPT' && item.tagName !== 'STYLE' && 
                    item.childNodes.length === 1 && item.childNodes[0].nodeType === 3) {
                    const text = item.textContent.trim();
                    const matched = promoTexts.some(promo => text.includes(promo));
                    if (matched) {
                        let current = item;
                        while (current && current.parentElement && 
                               !current.parentElement.classList.contains('outer_page') && 
                               !current.parentElement.classList.contains('std-page') && 
                               !current.parentElement.classList.contains('document_page') && 
                               !current.parentElement.classList.contains('page_container') &&
                               !current.parentElement.id.startsWith('page-') &&
                               current.parentElement.tagName !== 'BODY') {
                            current = current.parentElement;
                        }
                        if (current && current !== el && current.tagName !== 'BODY') {
                            current.remove();
                        }
                    }
                }
            });
        } catch (e) {
            console.error("Lỗi xóa overlay văn bản: ", e);
        }

        el.querySelectorAll('.text_layer, .text_layer_container, [class*="text_layer"]').forEach(tl => {
            tl.style.setProperty('opacity', '1', 'important');
            tl.style.setProperty('color', 'black', 'important');
            tl.style.setProperty('text-shadow', 'none', 'important');
            tl.style.setProperty('visibility', 'visible', 'important');
        });

        el.querySelectorAll('svg').forEach(svg => {
            svg.style.setProperty('opacity', '1', 'important');
            svg.style.setProperty('filter', 'none', 'important');
            svg.style.setProperty('visibility', 'visible', 'important');
        });

        const hasVisualMedia = Boolean(el.querySelector('img[src], canvas, svg'));
        const textLength = (el.textContent || '').replace(/\s+/g, ' ').trim().length;
        const isBlank = !hasVisualMedia && textLength < 30;

        if (isGatedBefore || isBlank) {
            attachGatedNote(el, getScribdPageNumber(el, index));
        } else {
            const existingNote = el.querySelector('.banhmi-gated-note');
            if (existingNote) existingNote.remove();
        }
    }

    pages.forEach((p, idx) => cleanPage(p, idx));

    const globalPromos = [
        '.premium_member_only_experience',
        '.scribd_premium_banner',
        '.doc_paywall',
        '.commercial_promo',
        '.container_with_promo',
        '.blur_container',
        '[class*="paywall"]',
        '[class*="premium-banner"]'
    ];
    globalPromos.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            if (el.classList.contains('container_with_promo') || el.classList.contains('blur_container')) {
                el.classList.remove('container_with_promo', 'blur_container');
            } else {
                el.remove();
            }
        });
    });

    showToast(msg.success);
})();
