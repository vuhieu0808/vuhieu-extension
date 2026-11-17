// Auto-PDF workflow triggering via URL Param or Auto-Unlock Storage Flag
function checkAutoStudocuDownload() {
    const isParam = window.location.href.includes('banhmi_auto_pdf=1');
    if (isParam) {
        const newUrl = window.location.href.replace(/([&?])banhmi_auto_pdf=1&?/, '$1').replace(/[&?]$/, '');
        window.history.replaceState({}, document.title, newUrl);
    }

    const host = window.location.hostname;
    if (host.includes('studocu') || host.includes('studeersnel')) {
        chrome.storage.local.get(['banhmi_auto_studocu_time'], function(data) {
            const hasRecentAuto = data && data.banhmi_auto_studocu_time && (Date.now() - data.banhmi_auto_studocu_time < 25000);
            if (isParam || hasRecentAuto) {
                chrome.storage.local.remove(['banhmi_auto_studocu_time']);
                setTimeout(() => {
                    if (window.__banhmi_studocu_running) return;

                    // Gửi message tới background service worker để executeScript (vượt qua mọi rào cản CSP của Studocu)
                    try {
                        chrome.runtime.sendMessage({ action: 'injectStudocuPdf' }, (res) => {
                            if (!res || !res.success) {
                                // Fallback: script tag injection nếu background chưa sẵn sàng
                                try {

                                    const s = document.createElement('script');
                                    s.src = chrome.runtime.getURL('inject_studocu_pdf.js');
                                    (document.head || document.documentElement).appendChild(s);
                                } catch(e) {}
                            }
                        });
                    } catch(e) {}
                }, 1200);
            }
        });
    } else if (isParam) {
        // Chờ 1s cho trang load cơ bản (Scribd / SlideShare)
        setTimeout(startAutoPDFProcess, 1000);
    }
}
checkAutoStudocuDownload();

function startAutoPDFProcess() {
    chrome.storage.local.get(['banhmi_lang'], function(res) {
        let rawLang = (res && res.banhmi_lang) || window.__banhmi_lang || (navigator.language ? navigator.language.replace('-', '_') : 'en');
        let lang = rawLang;
        if (!['zh_CN', 'zh_TW', 'pt_BR', 'es_419'].includes(lang)) {
            lang = lang.split('_')[0];
        }

        const messages = {
            "vi": {
                        "loading": "🚀 Đang tự động load toàn trang để tạo PDF...",
                        "done": "✅ Đã tải xong tài liệu! Đang chuẩn bị PDF...",
                        "noPages": "⚠️ Không tìm thấy trang nào."
            },
            "en": {
                        "loading": "🚀 Automatically loading all pages to generate PDF...",
                        "done": "✅ Document loaded! Preparing PDF...",
                        "noPages": "⚠️ No pages found."
            },
            "mr": {
                        "loading": "🚀 PDF तयार करण्यासाठी सर्व पृष्ठे आपोआप लोड करत आहे...",
                        "done": "✅ दस्तऐवज लोड झाले! PDF तयार करत आहे...",
                        "noPages": "⚠️ कोणतीही पृष्ठे आढळली नाहीत."
            },
            "hi": {
                        "loading": "🚀 PDF बनाने के लिए सभी पृष्ठों को स्वचालित रूप से लोड किया जा रहा है...",
                        "done": "✅ दस्तावेज़ लोड हो गया! PDF तैयार की जा रही है...",
                        "noPages": "⚠️ कोई पृष्ठ नहीं मिला।"
            },
            "zh_CN": {
                        "loading": "🚀 正在自动加载全部页面以生成 PDF...",
                        "done": "✅ 文档加载完成！正在准备 PDF...",
                        "noPages": "⚠️ 未找到任何页面。"
            },
            "zh_TW": {
                        "loading": "🚀 正在自動載入全部頁面以產生 PDF...",
                        "done": "✅ 文件載入完成！正在準備 PDF...",
                        "noPages": "⚠️ 未找到任何頁面。"
            },
            "ja": {
                        "loading": "🚀 PDF作成のため全ページを自動読み込み中...",
                        "done": "✅ ドキュメントの読み込みが完了しました！PDFを準備中...",
                        "noPages": "⚠️ ページが見つかりません。"
            },
            "ko": {
                        "loading": "🚀 PDF 생성을 위해 전체 페이지 자동 로딩 중...",
                        "done": "✅ 문서 로드 완료! PDF 준비 중...",
                        "noPages": "⚠️ 페이지를 찾을 수 없습니다."
            },
            "es": {
                        "loading": "🚀 Cargando páginas automáticamente para generar PDF...",
                        "done": "✅ ¡Documento cargado! Preparando PDF...",
                        "noPages": "⚠️ No se encontraron páginas."
            },
            "fr": {
                        "loading": "🚀 Chargement automatique de toutes les pages pour générer le PDF...",
                        "done": "✅ Document chargé ! Préparation du PDF...",
                        "noPages": "⚠️ Aucune page trouvée."
            },
            "de": {
                        "loading": "🚀 Seiten werden automatisch geladen, um PDF zu erstellen...",
                        "done": "✅ Dokument geladen! PDF wird vorbereitet...",
                        "noPages": "⚠️ Keine Seiten gefunden."
            },
            "ru": {
                        "loading": "🚀 Автоматическая загрузка страниц для создания PDF...",
                        "done": "✅ Документ загружен! Подготовка PDF...",
                        "noPages": "⚠️ Страницы не найдены."
            },
            "pt": {
                        "loading": "🚀 Carregando páginas automaticamente para gerar PDF...",
                        "done": "✅ Documento carregado! Preparando PDF...",
                        "noPages": "⚠️ Nenhuma página encontrada."
            },
            "id": {
                        "loading": "🚀 Memuat seluruh halaman secara otomatis untuk membuat PDF...",
                        "done": "✅ Dokumen selesai dimuat! Menyiapkan PDF...",
                        "noPages": "⚠️ Halaman tidak ditemukan."
            },
            "it": {
                        "loading": "🚀 Caricamento automatico di tutte le pagine per generare il PDF...",
                        "done": "✅ Documento caricato! Preparazione del PDF...",
                        "noPages": "⚠️ Nessuna pagina trovata."
            },
            "nl": {
                        "loading": "🚀 Automatisch alle pagina's laden om PDF te genereren...",
                        "done": "✅ Document geladen! PDF wordt voorbereid...",
                        "noPages": "⚠️ Geen pagina's gevonden."
            },
            "pl": {
                        "loading": "🚀 Automatyczne ładowanie wszystkich stron do utworzenia pliku PDF...",
                        "done": "✅ Dokument załadowany! Przygotowywanie pliku PDF...",
                        "noPages": "⚠️ Nie znaleziono stron."
            },
            "tr": {
                        "loading": "🚀 PDF oluşturmak için tüm sayfalar otomatik olarak yükleniyor...",
                        "done": "✅ Belge yüklendi! PDF hazırlanıyor...",
                        "noPages": "⚠️ Sayfa bulunamadı."
            },
            "th": {
                        "loading": "🚀 กำลังโหลดทุกหน้าโดยอัตโนมัติเพื่อสร้าง PDF...",
                        "done": "✅ โหลดเอกสารเสร็จสมบูรณ์! กำลังเตรียม PDF...",
                        "noPages": "⚠️ ไม่พบหน้าเอกสาร"
            },
            "ar": {
                        "loading": "🚀 جاري تحميل جميع الصفحات تلقائيًا لإنشاء ملف PDF...",
                        "done": "✅ تم تحميل المستند! جاري تجهيز PDF...",
                        "noPages": "⚠️ لم يتم العثور على أي صفحات."
            },
            "da": {
                        "loading": "🚀 Indlæser automatisk alle sider for at generere PDF...",
                        "done": "✅ Dokument indlæst! Forbereder PDF...",
                        "noPages": "⚠️ Ingen sider fundet."
            },
            "sv": {
                        "loading": "🚀 Läser in alla sidor automatiskt för att generera PDF...",
                        "done": "✅ Dokument inläst! Förbereder PDF...",
                        "noPages": "⚠️ Inga sidor hittades."
            },
            "cs": {
                        "loading": "🚀 Automatické načítání všech stránek pro vygenerování PDF...",
                        "done": "✅ Dokument byl načten! Připravuje se PDF...",
                        "noPages": "⚠️ Nebyly nalezeny žádné stránky."
            },
            "hu": {
                        "loading": "🚀 Az összes oldal automatikus betöltése a PDF létrehozásához...",
                        "done": "✅ Dokumentum betöltve! PDF előkészítése folyamatban...",
                        "noPages": "⚠️ Nem találhatók oldalak."
            },
            "ro": {
                        "loading": "🚀 Se încarcă automat toate paginile pentru a genera PDF...",
                        "done": "✅ Document încărcat! Se pregătește PDF-ul...",
                        "noPages": "⚠️ Nu s-a găsit nicio pagină."
            },
            "uk": {
                        "loading": "🚀 Автоматичне завантаження всіх сторінок для створення PDF...",
                        "done": "✅ Документ завантажено! Підготовка PDF...",
                        "noPages": "⚠️ Сторінок не знайдено."
            },
            "bn": {
                        "loading": "🚀 PDF তৈরির জন্য স্বয়ংক্রিয়ভাবে সব পৃষ্ঠা লোড করা হচ্ছে...",
                        "done": "✅ ডকুমেন্ট লোড হয়েছে! PDF প্রস্তুত করা হচ্ছে...",
                        "noPages": "⚠️ কোনো পৃষ্ঠা পাওয়া যায়নি।"
            },
            "pt_BR": {
                        "loading": "🚀 Carregando páginas automaticamente para gerar PDF...",
                        "done": "✅ Documento carregado! Preparando PDF...",
                        "noPages": "⚠️ Nenhuma página encontrada."
            },
            "es_419": {
                        "loading": "🚀 Cargando páginas automáticamente para generar PDF...",
                        "done": "✅ ¡Documento cargado! Preparando PDF...",
                        "noPages": "⚠️ No se encontraron páginas."
            }
};
        const msg = messages[lang] || messages[rawLang] || (lang === 'vi' ? messages.vi : messages.en);

        // Inject viewer styles safely
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = chrome.runtime.getURL('viewer_styles.css');
        document.head.appendChild(link);

        // Bảng thông báo
        const overlayInfo = document.createElement('div');
        overlayInfo.id = "banhmi-overlay-status";
        const isStudocu = window.location.hostname.includes('studocu');
        overlayInfo.style.cssText = `
            position: fixed !important;
            top: ${isStudocu ? '108px' : '84px'} !important;
            left: ${isStudocu ? '76px' : '24px'} !important;
            right: auto !important;
            transform: none !important;
            z-index: 2147483647 !important;
            background: rgba(255, 255, 255, 0.98) !important;
            backdrop-filter: blur(16px) !important;
            -webkit-backdrop-filter: blur(16px) !important;
            color: #0F172A !important;
            padding: 12px 18px !important;
            border-radius: 14px !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            box-shadow: 0 12px 36px -4px rgba(15, 23, 42, 0.16), 0 4px 12px -2px rgba(15, 23, 42, 0.06) !important;
            border: 1px solid rgba(0, 0, 0, 0.08) !important;
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            pointer-events: none !important;
            transition: opacity 0.3s ease, transform 0.3s ease !important;
        `;
        const cleanLoading = (msg.loading || 'Đang chuẩn bị trang in...').replace(/^[\s\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1FA00}-\u{1FAFF}!]+/gu, '').trim();
        overlayInfo.innerHTML = `
            <style>@keyframes banhmi-spin { to { transform: rotate(360deg); } }</style>
            <div style="width:34px;height:34px;border-radius:10px;background:rgba(255,107,0,0.1);border:1px solid rgba(255,107,0,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="animation:banhmi-spin 1s linear infinite;">
                    <circle cx="12" cy="12" r="10" stroke="#FFEDD5" stroke-width="2.5"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#FF6B00" stroke-width="2.5" stroke-linecap="round"></path>
                </svg>
            </div>
            <div style="display:flex;flex-direction:column;gap:2px;">
                <div style="font-size:10.5px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;color:#FF6B00;line-height:1.2;">Doc Downloader</div>
                <div style="font-size:12.5px;font-weight:600;color:#1E293B;line-height:1.4;">${cleanLoading}</div>
            </div>
        `;
        (document.documentElement || document.body).appendChild(overlayInfo);

        let oldScrollY = -1;
        let sameCount = 0;
        const scrollStep = 800;

        const scrollInterval = setInterval(() => {
            window.scrollBy(0, scrollStep);

            // If scroll position hasn't changed for 3 ticks, we must be at the bottom
            if (window.scrollY === oldScrollY) {
                sameCount++;
                if (sameCount >= 3) {
                    clearInterval(scrollInterval);
                    overlayInfo.innerText = msg.done;
                    setTimeout(() => {
                        overlayInfo.style.opacity = '0';
                        setTimeout(() => overlayInfo.remove(), 300);
                        runCleanViewer(msg);
                    }, 1000);
                }
            } else {
                sameCount = 0;
                oldScrollY = window.scrollY;
            }
        }, 600);
    });
}

function runCleanViewer(msg, retryCount = 0) {
    const pages = document.querySelectorAll('div[data-page-index]');
    if (pages.length === 0) {
        if (retryCount < 6) {
            setTimeout(() => runCleanViewer(msg, retryCount + 1), 600);
            return;
        }
        alert(msg && msg.noPages ? msg.noPages : "⚠️ No pages found.");
        return;
    }

    const SCALE_FACTOR = 4;
    const HEIGHT_SCALE_DIVISOR = 4;

    function copyComputedStyle(source, target, scaleFactor, shouldScaleHeight = false, shouldScaleWidth = false, heightScaleDivisor = 4, widthScaleDivisor = 4, shouldScaleMargin = false, marginScaleDivisor = 4) {
        const computedStyle = window.getComputedStyle(source);
        if (!computedStyle) return;

        const normalProps = [
            'position', 'left', 'top', 'bottom', 'right',
            'font-family', 'font-weight', 'font-style',
            'color', 'background-color',
            'text-align', 'white-space',
            'display', 'visibility', 'opacity', 'z-index',
            'text-shadow', 'unicode-bidi', 'font-feature-settings', 'padding'
        ];

        const scaleProps = ['font-size', 'line-height'];
        let styleString = '';

        normalProps.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value && value !== 'none' && value !== 'auto' && value !== 'normal') {
                styleString += `${prop}: ${value} !important; `;
            }
        });

        const widthValue = computedStyle.getPropertyValue('width');
        if (widthValue && widthValue !== 'none' && widthValue !== 'auto') {
            if (shouldScaleWidth) {
                const numValue = parseFloat(widthValue);
                if (!isNaN(numValue) && numValue > 0) {
                    const unit = widthValue.replace(numValue.toString(), '');
                    styleString += `width: ${numValue / widthScaleDivisor}${unit} !important; `;
                } else {
                    styleString += `width: ${widthValue} !important; `;
                }
            } else {
                styleString += `width: ${widthValue} !important; `;
            }
        }

        const heightValue = computedStyle.getPropertyValue('height');
        if (heightValue && heightValue !== 'none' && heightValue !== 'auto') {
            if (shouldScaleHeight) {
                const numValue = parseFloat(heightValue);
                if (!isNaN(numValue) && numValue > 0) {
                    const unit = heightValue.replace(numValue.toString(), '');
                    styleString += `height: ${numValue / heightScaleDivisor}${unit} !important; `;
                } else {
                    styleString += `height: ${heightValue} !important; `;
                }
            } else {
                styleString += `height: ${heightValue} !important; `;
            }
        }

        ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'].forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value && value !== 'auto') {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    if (shouldScaleMargin && numValue !== 0) {
                        const unit = value.replace(numValue.toString(), '');
                        styleString += `${prop}: ${numValue / marginScaleDivisor}${unit} !important; `;
                    } else {
                        styleString += `${prop}: ${value} !important; `;
                    }
                }
            }
        });

        scaleProps.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value && value !== 'none' && value !== 'auto' && value !== 'normal') {
                const numValue = parseFloat(value);
                if (!isNaN(numValue) && numValue !== 0) {
                    const unit = value.replace(numValue.toString(), '');
                    styleString += `${prop}: ${numValue / scaleFactor}${unit} !important; `;
                } else {
                    styleString += `${prop}: ${value} !important; `;
                }
            }
        });

        let transformOrigin = computedStyle.getPropertyValue('transform-origin');
        if (transformOrigin) {
            styleString += `transform-origin: ${transformOrigin} !important; -webkit-transform-origin: ${transformOrigin} !important; `;
        }

        styleString += 'overflow: visible !important; max-width: none !important; max-height: none !important; clip: auto !important; clip-path: none !important; ';
        target.style.cssText += styleString;
    }

    function deepCloneWithStyles(element, scaleFactor, heightScaleDivisor, depth = 0) {
        const clone = element.cloneNode(false);
        const hasTextClass = element.classList && element.classList.contains('t');
        const hasUnderscoreClass = element.classList && element.classList.contains('_');

        const shouldScaleMargin = element.tagName === 'SPAN' &&
            element.classList &&
            element.classList.contains('_') &&
            Array.from(element.classList).some(cls => /^_(?:\d+[a-z]*|[a-z]+\d*)$/i.test(cls));

        copyComputedStyle(element, clone, scaleFactor, hasTextClass, hasUnderscoreClass, heightScaleDivisor, 4, shouldScaleMargin, scaleFactor);

        if (element.classList && element.classList.contains('pc')) {
            clone.style.setProperty('transform', 'none', 'important');
            clone.style.setProperty('-webkit-transform', 'none', 'important');
            clone.style.setProperty('overflow', 'visible', 'important');
            clone.style.setProperty('max-width', 'none', 'important');
            clone.style.setProperty('max-height', 'none', 'important');
        }

        if (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3) {
            clone.textContent = element.textContent;
        } else {
            element.childNodes.forEach(child => {
                if (child.nodeType === 1) {
                    clone.appendChild(deepCloneWithStyles(child, scaleFactor, heightScaleDivisor, depth + 1));
                } else if (child.nodeType === 3) {
                    clone.appendChild(child.cloneNode(true));
                }
            });
        }
        return clone;
    }

    // Build
    const viewerContainer = document.createElement('div');
    viewerContainer.id = 'clean-viewer-container';

    let successCount = 0;

    pages.forEach((page, index) => {
        const pc = page.querySelector('.pc');
        let width = 595.3; //Fallback A4
        let height = 841.9;

        if (pc) {
            const pcStyle = window.getComputedStyle(pc);
            let pcWidth = NaN;
            let pcHeight = NaN;
            if (pcStyle) {
                pcWidth = parseFloat(pcStyle.width);
                pcHeight = parseFloat(pcStyle.height);
            }
            if (!isNaN(pcWidth) && pcWidth > 0 && !isNaN(pcHeight) && pcHeight > 0) {
                width = pcWidth;
                height = pcHeight;
            } else {
                const rect = pc.getBoundingClientRect();
                if (rect && rect.width > 10 && rect.height > 10) {
                    width = rect.width;
                    height = rect.height;
                }
            }
        }

        const newPage = document.createElement('div');
        newPage.className = 'std-page';
        newPage.id = `page-${index + 1}`;
        newPage.setAttribute('data-page-number', index + 1);

        newPage.style.width = width + 'px';
        newPage.style.height = height + 'px';

        // Layer ảnh
        const originalImg = page.querySelector('img.bi') || page.querySelector('img');
        if (originalImg) {
            const bgLayer = document.createElement('div');
            bgLayer.className = 'layer-bg';
            const imgClone = originalImg.cloneNode(true);
            imgClone.style.cssText = 'width: 100%; height: 100%; object-fit: cover; object-position: top center';
            bgLayer.appendChild(imgClone);
            newPage.appendChild(bgLayer);
        }

        // Layer Text
        const originalPc = page.querySelector('.pc');
        if (originalPc) {
            const textLayer = document.createElement('div');
            textLayer.className = 'layer-text';
            const pcClone = deepCloneWithStyles(originalPc, SCALE_FACTOR, HEIGHT_SCALE_DIVISOR);

            pcClone.querySelectorAll('img').forEach(img => img.style.display = 'none');
            textLayer.appendChild(pcClone);
            newPage.appendChild(textLayer);
        }

        viewerContainer.appendChild(newPage);
        successCount++;
    });

    document.body.appendChild(viewerContainer);

    try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ action: 'banhmi_close_popup', source: 'clean_viewer_ready' });
        }
    } catch (e) {}

    setTimeout(() => {
        window.print();
    }, 1000);
}

// ==========================================
// AUTO-CLEAN ON VISIT (Scribd & SlideShare) - Đã tắt theo yêu cầu người dùng
// ==========================================
// Đã loại bỏ chế độ tự động unblur khi vào trang để tránh phiền toái và thông báo rác.
// Thao tác mở khóa chỉ thực hiện khi người dùng chủ động bấm "Mở khóa" hoặc trong luồng "Tải PDF".

function initAutoCleanOnVisit() {
    chrome.storage.local.get(['banhmi_settings', 'banhmi_lang'], function(res) {
        const settings = (res && res.banhmi_settings) || {};
        if (!settings.docAutoCleanOnVisit) return;

        const host = window.location.hostname;
        const rawLang = (res && res.banhmi_lang) || window.__banhmi_lang || (navigator.language ? navigator.language.replace('-', '_') : 'en');
        let lang = rawLang;
        if (!['zh_CN', 'zh_TW', 'pt_BR', 'es_419'].includes(lang)) {
            lang = lang.split('_')[0];
        }

        const messages = {
            vi: {
                scribdSuccess: "Đã unblur mở khóa các trang hiện tại! Cuộn chuột để xem tiếp các trang khác.",
                slideshareSuccess: "Đã dọn sạch quảng cáo và tối ưu giao diện xem online SlideShare!"
            },
            zh_CN: {
                scribdSuccess: "已解除当前页面的模糊限制！请滚动页面以查看更多。",
                slideshareSuccess: "已清除广告并优化 SlideShare 在线阅读界面！"
            },
            zh_TW: {
                scribdSuccess: "已解除當前頁面的模糊限制！請滾動頁面以查看更多。",
                slideshareSuccess: "已清除廣告並優化 SlideShare 線上閱讀介面！"
            },
            ja: {
                scribdSuccess: "現在のページのぼかしを解除しました！スクロールして続きをご覧ください。",
                slideshareSuccess: "広告を削除し、SlideShareのオンライン閲覧を最適化しました！"
            },
            ko: {
                scribdSuccess: "현재 페이지의 블러를 해제했습니다! 계속 보려면 스크롤하세요.",
                slideshareSuccess: "광고를 제거하고 SlideShare 온라인 보기 레이아웃을 최적화했습니다!"
            },
            es: {
                scribdSuccess: "¡Se han desbloqueado las páginas actuales! Desplázate para ver más.",
                slideshareSuccess: "¡Anuncios eliminados y vista de SlideShare optimizada!"
            },
            fr: {
                scribdSuccess: "Les pages actuelles ont été déverrouillées ! Faites défiler pour continuer.",
                slideshareSuccess: "Annonces supprimées et affichage de SlideShare optimisé !"
            },
            de: {
                scribdSuccess: "Aktuelle Seiten entsperrt! Scrollen Sie, um weitere Seiten anzuzeigen.",
                slideshareSuccess: "Werbung entfernt und SlideShare-Ansicht optimiert!"
            },
            ru: {
                scribdSuccess: "Текущие страницы разблокированы! Прокрутите, чтобы увидеть остальные.",
                slideshareSuccess: "Реклама удалена, интерфейс SlideShare оптимизирован!"
            },
            pt: {
                scribdSuccess: "Páginas atuais desbloqueadas! Role para ver mais.",
                slideshareSuccess: "Anúncios removidos e visualização do SlideShare otimizada!"
            },
            id: {
                scribdSuccess: "Halaman saat ini berhasil dibuka! Gulir ke bawah untuk melihat lebih banyak.",
                slideshareSuccess: "Iklan dihapus dan tampilan SlideShare dioptimalkan!"
            },
            en: {
                scribdSuccess: "Current pages unblurred and unlocked! Scroll down to see more pages.",
                slideshareSuccess: "Cleaned ads and optimized SlideShare online view!"
            }
        };
        const msg = messages[lang] || messages[rawLang] || (lang === 'vi' ? messages.vi : messages.en);

        if (host.includes('slideshare.net')) {
            startSlideShareAutoClean(msg, lang);
        } else if (host.includes('scribd.com')) {
            startScribdAutoClean(msg, lang);
        }
    });
}

function showAutoCleanToast(text, isError = false) {
    if (!text) return;
    try {
        const oldToast = document.getElementById('banhmi-toast-notification');
        if (oldToast) oldToast.remove();

        const cleanText = text.replace(/^[\s\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1FA00}-\u{1FAFF}!]+/gu, '').trim();

        const toast = document.createElement('div');
        toast.id = 'banhmi-toast-notification';
        const isStudocu = window.location.hostname.includes('studocu');
        toast.style.cssText = `
            position: fixed !important;
            top: ${isStudocu ? '108px' : '84px'} !important;
            left: ${isStudocu ? '76px' : '24px'} !important;
            right: auto !important;
            z-index: 2147483647 !important;
            background: rgba(255, 255, 255, 0.98) !important;
            backdrop-filter: blur(16px) !important;
            -webkit-backdrop-filter: blur(16px) !important;
            color: #0F172A !important;
            padding: 12px 18px !important;
            border-radius: 14px !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
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

        const isSlideShare = window.location.hostname.includes('slideshare');
        const iconSvg = isError ? `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        ` : (isSlideShare ? `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        ` : `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
            </svg>
        `);

        const isVi = (window.__banhmi_lang === 'vi') || (!window.__banhmi_lang && (navigator.language || '').toLowerCase().startsWith('vi'));
        const tagText = isError ? (isVi ? 'Lỗi' : 'Error') : 'Doc Downloader';

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
            <button type="button" id="banhmi-toast-close" style="background:transparent;border:none;cursor:pointer;padding:4px;color:#94A3B8;border-radius:6px;display:flex;align-items:center;justify-content:center;margin-left:4px;flex-shrink:0;outline:none;" title="${isVi ? 'Đóng' : 'Close'}">
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

const banhmiGatedNoteMessagesScribd = {
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

const banhmiGatedNoteMessagesSlideShare = {
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

function ensureBanhmiGatedStyles() {
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
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
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

function attachBanhmiGatedNote(container, num, type, currentLang) {
    if (!container || container.querySelector('.banhmi-gated-note')) return;
    ensureBanhmiGatedStyles();

    const computedPos = window.getComputedStyle(container).position;
    if (computedPos === 'static') {
        container.style.setProperty('position', 'relative', 'important');
    }

    const dict = (type === 'SlideShare') ? banhmiGatedNoteMessagesSlideShare : banhmiGatedNoteMessagesScribd;
    const getMsg = (currentLang === 'vi') ? dict.vi : (dict[currentLang] || dict.en || dict.vi);
    const msgText = typeof getMsg === 'function' ? getMsg(num) : (currentLang === 'vi' ? `${type} ${num} đang bị làm mờ` : `${type} ${num} is blurred`);

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

function startSlideShareAutoClean(msg, currentLang = 'vi') {
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

    function doClean() {
        let cleaned = false;
        selectorsToRemove.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                el.remove();
                cleaned = true;
            });
        });
        document.querySelectorAll('.blur, .blurred').forEach(el => {
            el.classList.remove('blur', 'blurred');
            cleaned = true;
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
                attachBanhmiGatedNote(slide, slideNum, 'SlideShare', currentLang);
            }
        });

        return cleaned;
    }

    setTimeout(() => {
        const cleaned = doClean();
        if (cleaned) {
            showAutoCleanToast(msg.slideshareSuccess);
        }
    }, 1000);
}

function startScribdAutoClean(msg, currentLang = 'vi') {
    if (!window.location.pathname.includes('/document/')) return;

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
        } catch (e) {}

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
            attachBanhmiGatedNote(el, getScribdPageNumber(el, index), 'Scribd', currentLang);
        } else {
            const existingNote = el.querySelector('.banhmi-gated-note');
            if (existingNote) existingNote.remove();
        }
    }

    function cleanAllScribd() {
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

        if (pages.length > 0) {
            pages.forEach((p, idx) => cleanPage(p, idx));
        }

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

        return pages.length;
    }

    let toastShown = false;
    function tryClean(showNotificationIfFound = false) {
        const count = cleanAllScribd();
        if (count > 0 && showNotificationIfFound && !toastShown) {
            toastShown = true;
            showAutoCleanToast(msg.scribdSuccess);
        }
        return count;
    }

    setTimeout(() => {
        const count = tryClean(true);
        if (count === 0) {
            setTimeout(() => tryClean(true), 2000);
        }
    }, 1200);

    let scrollTimer = null;
    window.addEventListener('scroll', () => {
        if (scrollTimer) return;
        scrollTimer = setTimeout(() => {
            scrollTimer = null;
            tryClean(false);
        }, 600);
    }, { passive: true });
}
