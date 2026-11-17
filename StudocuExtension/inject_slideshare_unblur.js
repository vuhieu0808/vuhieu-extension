(function() {
    let rawLang = window.__banhmi_lang || (navigator.language ? navigator.language.replace('-', '_') : 'en');
    let lang = rawLang;
    if (!['zh_CN', 'zh_TW', 'pt_BR', 'es_419'].includes(lang)) {
        lang = lang.split('_')[0];
    }

    const messages = {
        vi: "Đã dọn sạch quảng cáo và tối ưu giao diện xem online SlideShare!",
        zh_CN: "已清除广告并优化 SlideShare 在线阅读界面！",
        zh_TW: "已清除廣告並優化 SlideShare 線上閱讀介面！",
        ja: "広告を削除し、SlideShareのオンライン閲覧を最適化しました！",
        ko: "광고를 제거하고 SlideShare 온라인 보기 레이아웃을 최적화했습니다!",
        es: "¡Anuncios eliminados y vista de SlideShare optimizada!",
        fr: "Annonces supprimées et affichage de SlideShare optimisé !",
        de: "Werbung entfernt und SlideShare-Ansicht optimiert!",
        ru: "Реклама удалена, интерфейс SlideShare оптимизирован!",
        pt: "Anúncios removidos e visualização do SlideShare otimizada!",
        id: "Iklan dihapus dan tampilan SlideShare dioptimalkan!",
        en: "Cleaned ads and optimized SlideShare online view!"
    };

    const gatedNoteMessages = {
        vi: (p) => `Slide ${p} đang bị làm mờ: Vui lòng bấm nút "Mở khóa SlideShare" trên tiện ích Doc Downloader trước khi tải!`,
        en: (p) => `Slide ${p} is blurred: Please click "Unlock SlideShare" in the Doc Downloader extension before downloading!`,
        zh_CN: (p) => `幻灯片 ${p} 已模糊：下载前请点击 Doc Downloader 扩展程序中的“解锁 SlideShare”！`,
        zh_TW: (p) => `投影片 ${p} 已模糊：下載前請點擊 Doc Downloader 擴充功能中的「解鎖 SlideShare」！`,
        ja: (p) => `スライド ${p} はぼかされています：ダウンロードする前に Doc Downloader 拡張機能の「SlideShare ロック解除」をクリックしてください！`,
        ko: (p) => `슬라이드 ${p}이(가) 블러 처리되었습니다: 다운로드하기 전에 Doc Downloader 확장 프로그램에서 "SlideShare 잠금 해제"를 클릭하세요!`,
        de: (p) => `Folie ${p} ist verschwommen: Bitte klicken Sie vor dem Herunterladen in der Doc Downloader-Erweiterung auf "SlideShare entsperren"!`,
        ru: (p) => `Слайд ${p} размыт: пожалуйста, нажмите «Разблокировать SlideShare» в расширении Doc Downloader перед загрузкой!`,
        es: (p) => `La diapositiva ${p} está borrosa: ¡Haga clic en "Desbloquear SlideShare" en la extensión Doc Downloader antes de descargar!`,
        id: (p) => `Slide ${p} buram: Silakan klik "Buka Kunci SlideShare" di ekstensi Doc Downloader sebelum mengunduh!`,
        pt: (p) => `O slide ${p} está desfocado: clique em "Desbloquear SlideShare" na extensão Doc Downloader antes de baixar!`,
        fr: (p) => `La diapositive ${p} est floue : veuillez cliquer sur « Déverrouiller SlideShare » dans l'extension Doc Downloader avant de télécharger !`
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
        const msgText = typeof getMsg === 'function' ? getMsg(num) : (lang === 'vi' ? `Slide ${num} đang bị làm mờ: Vui lòng bấm nút "Mở khóa SlideShare" trên tiện ích Doc Downloader trước khi tải!` : `Slide ${num} is blurred: Please click "Unlock SlideShare" in the Doc Downloader extension before downloading!`);
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

    function showToast(text) {
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

            const accentColor = '#FF6B00';
            const iconBg = 'rgba(255, 107, 0, 0.1)';
            const iconBorder = 'rgba(255, 107, 0, 0.2)';

            // Clean checkmark / sparkles SVG
            const iconSvg = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            `;

            const tagText = 'Doc Downloader';

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

    const selectorsToRemove = [
        '.sidebar',
        '#related-slideshows',
        '.ad-banner',
        '.global-ad-slot',
        '.ad-container',
        '.advertisement',
        '[class*="premium-promo"]',
        '[class*="paywall"]',
        'iframe[src*="ad"]',
        'div[class*="ad-"]',
        'div[id*="ad-"]'
    ];
    selectorsToRemove.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.remove());
    });
    
    document.querySelectorAll('.blur, .blurred').forEach(el => {
        el.classList.remove('blur', 'blurred');
    });

    const slideSelectors = [
        '[data-testid="slide-container"]',
        '.slide-container',
        '.slide',
        'div[class*="slide-container"]',
        'div[class*="slide_container"]'
    ];
    let slides = [];
    for (const sel of slideSelectors) {
        slides = Array.from(document.querySelectorAll(sel));
        if (slides.length > 0) break;
    }

    slides.forEach((slide, idx) => {
        const slideNum = idx + 1;
        const img = slide.querySelector('img');
        const isGated = Boolean(
            slide.classList.contains('blur') ||
            slide.classList.contains('blurred') ||
            slide.querySelector('.blur, .blurred, [class*="paywall"], [class*="locked"]') ||
            (img && img.src && (/blur|placeholder|gated|locked/i.test(img.src)))
        );
        if (isGated) {
            attachGatedNote(slide, slideNum);
        } else {
            const existingNote = slide.querySelector('.banhmi-gated-note');
            if (existingNote) existingNote.remove();
        }
    });
    
    showToast(msg);
})();
