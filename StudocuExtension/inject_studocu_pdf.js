// ==========================================================================
// Doc Downloader Engine
// 1. Quét trang thông minh khi trang còn hiển thị (không làm trắng trang)
// 2. Chuyển đổi ảnh sang Base64 Data URI để không mất hình ảnh khi in
// 3. Tự động mở "Trang Tải" (#clean-viewer-container) sau khi nạp xong
// 4. Kích thước trang @page động theo pixel không bị viền trắng
// 5. Thanh công cụ Top Bar thiết kế chuẩn UI/UX Glassmorphism cao cấp
// ==========================================================================

(function () {
    'use strict';

    // Tránh chạy trùng lặp
    if (window.__banhmi_studocu_running) return;
    window.__banhmi_studocu_running = true;

    // ----------------------------------------------------------------------
    // 1. Đa ngôn ngữ (i18n)
    // ----------------------------------------------------------------------
    let rawLang = window.__banhmi_lang || (navigator.language ? navigator.language.replace('-', '_') : 'en');
    let lang = rawLang;
    if (!['zh_CN', 'zh_TW', 'pt_BR', 'es_419'].includes(lang)) {
        lang = lang.split('_')[0];
    }

    const I18N = {
        vi: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Trang In Tài Liệu Studocu",
            scanning: "🚀 Đang quét và tải trang {done} / {total}...",
            embedding: "🖼️ Đang tải hình ảnh chất lượng cao...",
            ready: "✅ Đã nạp xong tài liệu! Đang mở trang tải...",
            printBtnText: "In / Lưu thành PDF",
            backBtnText: "Quay lại",
            hintText: "Mẹo: Chọn <strong>Save as PDF</strong> trong hộp thoại in",
            pagesCount: "{count} trang",
            noPages: "⚠️ Không tìm thấy trang tài liệu Studocu nào. Vui lòng thử cuộn nhẹ trang hoặc F5 lại!",
            gatedNote: (p) => `Trang {p} đang bị làm mờ: Vui lòng bấm nút "Mở khóa Studocu" trên tiện ích Doc Downloader trước khi tải!`,
            error: "❌ Không thể khởi tạo trang tải. Vui lòng tải lại trang và thử lại.",
            themeLight: "Nền sáng",
            themeDark: "Nền tối",
            themeToggleToLight: "Chuyển sang nền sáng",
            themeToggleToDark: "Chuyển sang nền tối"
        },
        en: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Studocu Document Print Viewer",
            scanning: "🚀 Scanning & loading page {done} / {total}...",
            embedding: "🖼️ Embedding high quality images...",
            ready: "✅ Document loaded! Opening download viewer...",
            printBtnText: "Print / Save as PDF",
            backBtnText: "Back",
            hintText: "Tip: Choose <strong>Save as PDF</strong> in print dialog",
            pagesCount: "{count} pages",
            noPages: "⚠️ No Studocu document pages found. Please scroll slightly or refresh the page!",
            gatedNote: (p) => `Page {p} is blurred: Please click "Unlock Studocu" in the Doc Downloader extension before downloading!`,
            error: "❌ Could not build download viewer. Please refresh and try again.",
            themeLight: "Light",
            themeDark: "Dark",
            themeToggleToLight: "Switch to Light Theme",
            themeToggleToDark: "Switch to Dark Theme"
        },
        mr: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Studocu दस्तऐवज प्रिंट दर्शक",
            scanning: "🚀 पृष्ठ {done} / {total} स्कॅन आणि लोड करत आहे...",
            embedding: "🖼️ उच्च दर्जाच्या प्रतिमा लोड करत आहे...",
            ready: "✅ दस्तऐवज लोड झाला! डाउनलोड दर्शक उघडत आहे...",
            printBtnText: "प्रिंट / PDF म्हणून सेव्ह करा",
            backBtnText: "मागे",
            hintText: "टीप: प्रिंट विंडोमध्ये <strong>Save as PDF</strong> निवडा",
            pagesCount: "{count} पृष्ठे",
            noPages: "⚠️ कोणतेही पृष्ठ आढळले नाही. कृपया पृष्ठ रीफ्रेश करा!",
            gatedNote: (p) => `पृष्ठ {p} अस्पष्ट आहे: डाउनलोड करण्यापूर्वी BamiDoc मध्ये अनलॉक करा!`,
            error: "❌ डाउनलोड दर्शक तयार करता आला नाही. कृपया पुन्हा प्रयत्न करा.",
            themeLight: "लाइट",
            themeDark: "डार्क",
            themeToggleToLight: "लाइट थीमवर स्विच करा",
            themeToggleToDark: "डार्क थीमवर स्विच करा"
        },
        hi: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Studocu दस्तावेज़ प्रिंट दर्शक",
            scanning: "🚀 पृष्ठ {done} / {total} स्कैन और लोड हो रहा है...",
            embedding: "🖼️ उच्च गुणवत्ता वाली छवियां लोड हो रही हैं...",
            ready: "✅ दस्तावेज़ लोड हो गया! डाउनलोड व्यूअर खुल रहा है...",
            printBtnText: "प्रिंट / PDF के रूप में सहेजें",
            backBtnText: "वापस",
            hintText: "सुझाव: प्रिंट डायलॉग में <strong>Save as PDF</strong> चुनें",
            pagesCount: "{count} पृष्ठ",
            noPages: "⚠️ कोई पृष्ठ नहीं मिला। कृपया पृष्ठ रीफ्रेश करें!",
            gatedNote: (p) => `पृष्ठ {p} धुंधला है: डाउनलोड करने से पहले BamiDoc में अनलॉक करें!`,
            error: "❌ डाउनलोड व्यूअर नहीं बनाया जा सका। कृपया पुनः प्रयास करें।",
            themeLight: "लाइट",
            themeDark: "डार्क",
            themeToggleToLight: "लाइट थीम पर स्विच करें",
            themeToggleToDark: "डार्क थीम पर स्विच करें"
        },
        zh_CN: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Studocu 文档打印预览",
            scanning: "🚀 正在扫描与加载第 {done} / {total} 页...",
            embedding: "🖼️ 正在嵌入高清图片...",
            ready: "✅ 加载完成！正在打开下载页面...",
            printBtnText: "打印 / 保存为 PDF",
            backBtnText: "返回",
            hintText: "提示：在打印对话框中选择 <strong>另存为 PDF</strong>",
            pagesCount: "{count} 页",
            noPages: "⚠️ 未找到 Studocu 页面。请刷新页面后重试！",
            gatedNote: (p) => `第 {p} 页已模糊：请在下载前点击 Doc Downloader 插件中的“解锁 Studocu”按钮！`,
            error: "❌ 无法创建下载页面。请刷新页面后重试。",
            themeLight: "浅色",
            themeDark: "深色",
            themeToggleToLight: "切换至浅色主题",
            themeToggleToDark: "切换至深色主题"
        },
        zh_TW: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Studocu 文檔列印預覽",
            scanning: "🚀 正在掃描與載入第 {done} / {total} 頁...",
            embedding: "🖼️ 正在嵌入高畫質圖片...",
            ready: "✅ 載入完成！正在開啟下載頁面...",
            printBtnText: "列印 / 另存為 PDF",
            backBtnText: "返回",
            hintText: "提示：在列印對話框中選擇 <strong>另存為 PDF</strong>",
            pagesCount: "{count} 頁",
            noPages: "⚠️ 未找到 Studocu 頁面。請重新整理後重試！",
            gatedNote: (p) => `第 {p} 頁已模糊：請在下載前點擊 Doc Downloader 插件中的「解鎖 Studocu」按鈕！`,
            error: "❌ 無法建立下載頁面。請重新整理後重試。",
            themeLight: "淺色",
            themeDark: "深色",
            themeToggleToLight: "切換至淺色主題",
            themeToggleToDark: "切換至深色主題"
        },
        ja: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Studocu 印刷ビューアー",
            scanning: "🚀 ページを読み込み中 {done} / {total}...",
            embedding: "🖼️ 画像を埋め込み中...",
            ready: "✅ 読み込み完了！ダウンロードページを開いています...",
            printBtnText: "印刷 / PDF保存",
            backBtnText: "戻る",
            hintText: "ヒント：印刷画面で <strong>PDFに保存</strong> を選択",
            pagesCount: "{count} ページ",
            noPages: "⚠️ ページが見つかりません。再読み込みしてください！",
            gatedNote: (p) => `ページ {p} はぼかされています：ダウンロード前に Doc Downloader の「Studocuのロック解除」ボタンを押してください！`,
            error: "❌ ダウンロードページを作成できませんでした。",
            themeLight: "ライト",
            themeDark: "ダーク",
            themeToggleToLight: "ライトテーマに切り替え",
            themeToggleToDark: "ダークテーマに切り替え"
        },
        ko: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Studocu 문서 인쇄 뷰어",
            scanning: "🚀 페이지 스캔 및 로딩 중 {done} / {total}...",
            embedding: "🖼️ 고해상도 이미지 임베딩 중...",
            ready: "✅ 문서 로드 완료! 다운로드 페이지를 여는 중...",
            printBtnText: "인쇄 / PDF로 저장",
            backBtnText: "돌아가기",
            hintText: "팁: 인쇄 대화상자에서 <strong>PDF로 저장</strong> 선택",
            pagesCount: "{count} 페이지",
            noPages: "⚠️ 문서를 찾을 수 없습니다. 새로고침 후 다시 시도해 주세요!",
            gatedNote: (p) => `{p}페이지가 흐리게 표시됨: 다운로드 전 Doc Downloader 확장 프로그램에서 "Studocu 잠금 해제" 버튼을 눌러주세요!`,
            error: "❌ 문서를 생성할 수 없습니다.",
            themeLight: "라이트",
            themeDark: "다크",
            themeToggleToLight: "라이트 테마로 전환",
            themeToggleToDark: "다크 테마로 전환"
        },
        es: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Visor de Impresión de Studocu",
            scanning: "🚀 Escaneando y cargando página {done} / {total}...",
            embedding: "🖼️ Incrustando imágenes de alta calidad...",
            ready: "✅ ¡Documento cargado! Abriendo visor de descarga...",
            printBtnText: "Imprimir / Guardar en PDF",
            backBtnText: "Volver",
            hintText: "Consejo: Seleccione <strong>Guardar como PDF</strong> en la ventana de impresión",
            pagesCount: "{count} páginas",
            noPages: "⚠️ No se encontraron páginas. ¡Por favor recarga la página!",
            gatedNote: (p) => `La página {p} está borrosa: ¡Desbloquea en Doc Downloader antes de descargar!`,
            error: "❌ No se pudo crear el visor de descarga. Recargue la página.",
            themeLight: "Claro",
            themeDark: "Oscuro",
            themeToggleToLight: "Cambiar a tema claro",
            themeToggleToDark: "Cambiar a tema oscuro"
        },
        fr: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Aperçu d'impression Studocu",
            scanning: "🚀 Numérisation et chargement de la page {done} / {total}...",
            embedding: "🖼️ Intégration d'images haute résolution...",
            ready: "✅ Document chargé ! Ouverture de la visionneuse...",
            printBtnText: "Imprimer / Enregistrer en PDF",
            backBtnText: "Retour",
            hintText: "Astuce : Choisissez <strong>Enregistrer au format PDF</strong>",
            pagesCount: "{count} pages",
            noPages: "⚠️ Aucune page trouvée. Veuillez actualiser la page !",
            gatedNote: (p) => `La page {p} est floue : déverrouillez-la dans Doc Downloader avant de télécharger !`,
            error: "❌ Impossible de créer la visionneuse. Veuillez réessayer.",
            themeLight: "Clair",
            themeDark: "Sombre",
            themeToggleToLight: "Passer au thème clair",
            themeToggleToDark: "Passer au thème sombre"
        },
        de: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Studocu Druckansicht",
            scanning: "🚀 Seite wird geladen {done} / {total}...",
            embedding: "🖼️ Bilder werden eingebettet...",
            ready: "✅ Dokument geladen! Download-Ansicht wird geöffnet...",
            printBtnText: "Drucken / Als PDF speichern",
            backBtnText: "Zurück",
            hintText: "Tipp: Im Druckdialog <strong>Als PDF speichern</strong> wählen",
            pagesCount: "{count} Seiten",
            noPages: "⚠️ Keine Seiten gefunden. Bitte Seite aktualisieren!",
            gatedNote: (p) => `Seite {p} ist unscharf: Bitte vor dem Herunterladen in der Erweiterung auf "Studocu entsperren" klicken!`,
            error: "❌ Download-Ansicht konnte nicht erstellt werden.",
            themeLight: "Hell",
            themeDark: "Dunkel",
            themeToggleToLight: "Zu hellem Thema wechseln",
            themeToggleToDark: "Zu dunklem Thema wechseln"
        },
        ru: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Просмотр печати Studocu",
            scanning: "🚀 Сканирование страницы {done} / {total}...",
            embedding: "🖼️ Встраивание изображений...",
            ready: "✅ Документ загружен! Открытие страницы загрузки...",
            printBtnText: "Печать / Сохранить в PDF",
            backBtnText: "Назад",
            hintText: "Совет: Выберите <strong>Сохранить как PDF</strong> в диалоге печати",
            pagesCount: "{count} стр.",
            noPages: "⚠️ Страницы не найдены. Обновите страницу!",
            gatedNote: (p) => `Страница {p} размыта: Нажмите «Разблокировать Studocu» в расширении перед скачиванием!`,
            error: "❌ Не удалось создать страницу загрузки.",
            themeLight: "Светлая",
            themeDark: "Темная",
            themeToggleToLight: "Переключить на светлую тему",
            themeToggleToDark: "Переключить на темную тему"
        },
        pt: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Visualizador de Impressão Studocu",
            scanning: "🚀 Escaneando página {done} / {total}...",
            embedding: "🖼️ Incorporando imagens...",
            ready: "✅ Documento carregado! Abrindo página de download...",
            printBtnText: "Imprimir / Salvar como PDF",
            backBtnText: "Voltar",
            hintText: "Dica: Escolha <strong>Salvar como PDF</strong> no diálogo de impressão",
            pagesCount: "{count} páginas",
            noPages: "⚠️ Nenhuma página encontrada. Atualize a página!",
            gatedNote: (p) => `A página {p} está desfocada: Desbloqueie no Doc Downloader antes de baixar!`,
            error: "❌ Não foi possível criar a página de download.",
            themeLight: "Claro",
            themeDark: "Escuro",
            themeToggleToLight: "Mudar para tema claro",
            themeToggleToDark: "Mudar para tema escuro"
        },
        id: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Penampil Cetak Dokumen Studocu",
            scanning: "🚀 Memindai & memuat halaman {done} / {total}...",
            embedding: "🖼️ Menyematkan gambar resolusi tinggi...",
            ready: "✅ Dokumen dimuat! Membuka penampil unduhan...",
            printBtnText: "Cetak / Simpan sebagai PDF",
            backBtnText: "Kembali",
            hintText: "Tips: Pilih <strong>Simpan sebagai PDF</strong> di menu cetak",
            pagesCount: "{count} halaman",
            noPages: "⚠️ Halaman tidak ditemukan. Silakan segarkan halaman!",
            gatedNote: (p) => `Halaman {p} buram: Buka kunci di Doc Downloader sebelum mengunduh!`,
            error: "❌ Gagal membuat penampil unduhan. Silakan segarkan.",
            themeLight: "Terang",
            themeDark: "Gelap",
            themeToggleToLight: "Beralih ke tema terang",
            themeToggleToDark: "Beralih ke tema gelap"
        },
        it: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Visualizzatore di Stampa Studocu",
            scanning: "🚀 Scansione e caricamento pagina {done} / {total}...",
            embedding: "🖼️ Incorporamento immagini ad alta risoluzione...",
            ready: "✅ Documento caricato! Apertura visualizzatore...",
            printBtnText: "Stampa / Salva come PDF",
            backBtnText: "Indietro",
            hintText: "Suggerimento: scegli <strong>Salva come PDF</strong> nella finestra di stampa",
            pagesCount: "{count} pagine",
            noPages: "⚠️ Nessuna pagina trovata. Ricarica la pagina!",
            gatedNote: (p) => `La pagina {p} è sfocata: sbloccala con l'estensione BamiDoc prima di scaricare!`,
            error: "❌ Impossibile creare il visualizzatore. Ricarica la pagina.",
            themeLight: "Chiaro",
            themeDark: "Scuro",
            themeToggleToLight: "Passa al tema chiaro",
            themeToggleToDark: "Passa al tema scuro"
        },
        nl: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Studocu Afdrukvoorbeeld",
            scanning: "🚀 Pagina {done} / {total} scannen en laden...",
            embedding: "🖼️ Afbeeldingen met hoge resolutie laden...",
            ready: "✅ Document geladen! Downloadviewer openen...",
            printBtnText: "Afdrukken / Opslaan als PDF",
            backBtnText: "Terug",
            hintText: "Tip: Kies <strong>Opslaan als PDF</strong> in het afdrukmenu",
            pagesCount: "{count} pagina's",
            noPages: "⚠️ Geen pagina's gevonden. Vernieuw de pagina!",
            gatedNote: (p) => `Pagina {p} is wazig: ontgrendel in Doc Downloader vóór het downloaden!`,
            error: "❌ Kan downloadviewer niet openen. Vernieuw de pagina.",
            themeLight: "Licht",
            themeDark: "Donker",
            themeToggleToLight: "Overschakelen naar licht thema",
            themeToggleToDark: "Overschakelen naar donker thema"
        },
        pl: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Podgląd wydruku Studocu",
            scanning: "🚀 Skanowanie i ładowanie strony {done} / {total}...",
            embedding: "🖼️ Osadzanie obrazów wysokiej jakości...",
            ready: "✅ Dokument załadowany! Otwieranie przeglądarki...",
            printBtnText: "Drukuj / Zapisz jako PDF",
            backBtnText: "Wstecz",
            hintText: "Wskazówka: Wybierz <strong>Zapisz jako PDF</strong> w oknie drukowania",
            pagesCount: "{count} stron",
            noPages: "⚠️ Nie znaleziono stron. Odśwież stronę!",
            gatedNote: (p) => `Strona {p} jest zamazana: Odblokuj w Doc Downloader przed pobraniem!`,
            error: "❌ Nie udało się utworzyć podglądu. Odśwież stronę.",
            themeLight: "Jasny",
            themeDark: "Ciemny",
            themeToggleToLight: "Przełącz na jasny motyw",
            themeToggleToDark: "Przełącz na ciemny motyw"
        },
        tr: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Studocu Yazdırma Görüntüleyici",
            scanning: "🚀 Sayfa {done} / {total} taranıyor ve yükleniyor...",
            embedding: "🖼️ Yüksek çözünürlüklü görseller yerleştiriliyor...",
            ready: "✅ Belge yüklendi! İndirme sayfası açılıyor...",
            printBtnText: "Yazdır / PDF Olarak Kaydet",
            backBtnText: "Geri",
            hintText: "İpucu: Yazdırma menüsünde <strong>PDF olarak kaydet</strong> seçeneğini seçin",
            pagesCount: "{count} sayfa",
            noPages: "⚠️ Sayfa bulunamadı. Lütfen sayfayı yenileyin!",
            gatedNote: (p) => `Sayfa {p} bulanık: İndirmeden önce Doc Downloader uzantısından kilidi açın!`,
            error: "❌ İndirme sayfası oluşturulamadı. Lütfen sayfayı yenileyin.",
            themeLight: "Açık",
            themeDark: "Koyu",
            themeToggleToLight: "Açık temaya geç",
            themeToggleToDark: "Koyu temaya geç"
        },
        th: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "มุมมองพิมพ์เอกสาร Studocu",
            scanning: "🚀 กำลังสแกนและโหลดหน้า {done} / {total}...",
            embedding: "🖼️ กำลังโหลดรูปภาพความละเอียดสูง...",
            ready: "✅ โหลดเอกสารเสร็จสมบูรณ์! กำลังเปิดหน้าต่างดาวน์โหลด...",
            printBtnText: "พิมพ์ / บันทึกเป็น PDF",
            backBtnText: "ย้อนกลับ",
            hintText: "คำแนะนำ: เลือก <strong>บันทึกเป็น PDF</strong> ในหน้าต่างพิมพ์",
            pagesCount: "{count} หน้า",
            noPages: "⚠️ ไม่พบหน้าเอกสาร กรุณารีเฟรชหน้าเว็บ!",
            gatedNote: (p) => `หน้า {p} ถูกเบลอ: โปรดปลดล็อกใน BamiDoc ก่อนดาวน์โหลด!`,
            error: "❌ ไม่สามารถสร้างหน้าดาวน์โหลดได้ กรุณารีเฟรชแล้วลองใหม่",
            themeLight: "ธีมสว่าง",
            themeDark: "ธีมมืด",
            themeToggleToLight: "เปลี่ยนเป็นธีมสว่าง",
            themeToggleToDark: "เปลี่ยนเป็นธีมมืด"
        },
        ar: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "معاين طباعة مستندات Studocu",
            scanning: "🚀 جارٍ فحص وتحميل الصفحة {done} من {total}...",
            embedding: "🖼️ جارٍ تضمين الصور عالية الدقة...",
            ready: "✅ تم تحميل المستند! جارٍ فتح صفحة التنزيل...",
            printBtnText: "طباعة / حفظ كـ PDF",
            backBtnText: "رجوع",
            hintText: "نصيحة: اختر <strong>حفظ بتنسيق PDF</strong> في نافذة الطباعة",
            pagesCount: "{count} صفحة",
            noPages: "⚠️ لم يتم العثور على أي صفحات. يرجى تحديث الصفحة!",
            gatedNote: (p) => `الصفحة {p} غير واضحة: يرجى إلغاء القفل عبر إضافة BamiDoc قبل التنزيل!`,
            error: "❌ تعذر إنشاء عارض التنزيل. يرجى التحديث والمحاولة مجددًا.",
            themeLight: "فاتح",
            themeDark: "داكن",
            themeToggleToLight: "التبديل إلى الوضع الفاتح",
            themeToggleToDark: "التبديل إلى الوضع الداكن"
        },
        da: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Studocu dokumentviser",
            scanning: "🚀 Scanner & indlæser side {done} / {total}...",
            embedding: "🖼️ Indlejrer billeder i høj kvalitet...",
            ready: "✅ Dokument indlæst! Åbner download-visning...",
            printBtnText: "Udskriv / Gem som PDF",
            backBtnText: "Tilbage",
            hintText: "Tip: Vælg <strong>Gem som PDF</strong> i udskriftsdialogen",
            pagesCount: "{count} sider",
            noPages: "⚠️ Ingen sider fundet. Genindlæs venligst siden!",
            gatedNote: (p) => `Side {p} er sløret: Lås op i BamiDoc før download!`,
            error: "❌ Kunne ikke oprette download-visning. Prøv igen.",
            themeLight: "Lyst",
            themeDark: "Mørkt",
            themeToggleToLight: "Skift til lyst tema",
            themeToggleToDark: "Skift til mørkt tema"
        },
        sv: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Studocu dokumentvisare",
            scanning: "🚀 Skannar & läser in sida {done} / {total}...",
            embedding: "🖼️ Bäddar in högupplösta bilder...",
            ready: "✅ Dokumentet laddat! Öppnar nedladdningsvy...",
            printBtnText: "Skriv ut / Spara som PDF",
            backBtnText: "Tillbaka",
            hintText: "Tips: Välj <strong>Spara som PDF</strong> i utskriftsdialogen",
            pagesCount: "{count} sidor",
            noPages: "⚠️ Inga sidor hittades. Uppdatera sidan!",
            gatedNote: (p) => `Sida {p} är suddig: Lås upp i BamiDoc före nedladdning!`,
            error: "❌ Kunde inte skapa nedladdningsvy. Försök igen.",
            themeLight: "Ljust",
            themeDark: "Mörkt",
            themeToggleToLight: "Växla till ljust tema",
            themeToggleToDark: "Växla till mörkt tema"
        },
        cs: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Prohlížeč tisku Studocu",
            scanning: "🚀 Skenování & načítání stránky {done} / {total}...",
            embedding: "🖼️ Vkládání obrázků ve vysokém rozlišení...",
            ready: "✅ Dokument načten! Otevírání prohlížeče stahování...",
            printBtnText: "Tisk / Uložit jako PDF",
            backBtnText: "Zpět",
            hintText: "Tip: V tiskovém dialogu zvolte <strong>Uložit jako PDF</strong>",
            pagesCount: "{count} stránek",
            noPages: "⚠️ Nebyly nalezeny žádné stránky. Obnovte stránku!",
            gatedNote: (p) => `Stránka {p} je rozmazaná: Odemkněte v Doc Downloader před stažením!`,
            error: "❌ Nelze vytvořit prohlížeč pro stahování. Zkuste to znovu.",
            themeLight: "Světlý",
            themeDark: "Tmavý",
            themeToggleToLight: "Přepnout na světlý motiv",
            themeToggleToDark: "Přepnout na tmavý motiv"
        },
        hu: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Studocu nyomtatási nézet",
            scanning: "🚀 {done} / {total} oldal beolvasása és betöltése...",
            embedding: "🖼️ Nagy felbontású képek beágyazása...",
            ready: "✅ Dokumentum betöltve! Letöltési nézet megnyitása...",
            printBtnText: "Nyomtatás / Mentés PDF-ként",
            backBtnText: "Vissza",
            hintText: "Tipp: Válassza a <strong>Mentés PDF-ként</strong> opciót",
            pagesCount: "{count} oldal",
            noPages: "⚠️ Nem találhatók oldalak. Frissítse az oldalt!",
            gatedNote: (p) => `A(z) {p}. oldal elmosódott: Oldja fel a BamiDoc-ban letöltés előtt!`,
            error: "❌ A letöltési nézet létrehozása nem sikerült. Próbálja újra.",
            themeLight: "Világos",
            themeDark: "Sötét",
            themeToggleToLight: "Váltás világos témára",
            themeToggleToDark: "Váltás sötét témára"
        },
        ro: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Vizualizator de imprimare Studocu",
            scanning: "🚀 Se scanează și se încarcă pagina {done} / {total}...",
            embedding: "🖼️ Se încorporează imagini de înaltă calitate...",
            ready: "✅ Document încărcat! Se deschide vizualizatorul de descărcare...",
            printBtnText: "Imprimare / Salvare ca PDF",
            backBtnText: "Înapoi",
            hintText: "Sfat: Alegeți <strong>Salvare ca PDF</strong> în dialogul de imprimare",
            pagesCount: "{count} pagini",
            noPages: "⚠️ Nu s-au găsit pagini. Reîncărcați pagina!",
            gatedNote: (p) => `Pagina {p} este estompată: Deblocați în BamiDoc înainte de descărcare!`,
            error: "❌ Nu s-a putut crea vizualizatorul de descărcare. Încercați din nou.",
            themeLight: "Luminos",
            themeDark: "Întunecat",
            themeToggleToLight: "Comutați la tema luminoasă",
            themeToggleToDark: "Comutați la tema întunecată"
        },
        uk: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Вікно друку Studocu",
            scanning: "🚀 Сканування та завантаження сторінки {done} / {total}...",
            embedding: "🖼️ Вбудовування високоякісних зображень...",
            ready: "✅ Документ завантажено! Відкриття вікна завантаження...",
            printBtnText: "Друк / Зберегти як PDF",
            backBtnText: "Назад",
            hintText: "Порада: виберіть <strong>Зберегти як PDF</strong> у вікні друку",
            pagesCount: "{count} стор.",
            noPages: "⚠️ Сторінок не знайдено. Оновіть сторінку!",
            gatedNote: (p) => `Сторінка {p} розмита: розблокуйте в Doc Downloader перед завантаженням!`,
            error: "❌ Не вдалося створити вікно завантаження. Спробуйте знову.",
            themeLight: "Світла",
            themeDark: "Темна",
            themeToggleToLight: "Перемкнути на світлу тему",
            themeToggleToDark: "Перемкнути на темну тему"
        },
        bn: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Studocu নথি প্রিন্ট ভিউয়ার",
            scanning: "🚀 পৃষ্ঠা {done} / {total} স্ক্যান ও লোড হচ্ছে...",
            embedding: "🖼️ উচ্চ মানের ছবি এম্বেড করা হচ্ছে...",
            ready: "✅ নথি লোড সম্পন্ন! ডাউনলোড ভিউয়ার খোলা হচ্ছে...",
            printBtnText: "প্রিন্ট / PDF হিসেবে সংরক্ষণ করুন",
            backBtnText: "ফিরে যান",
            hintText: "পরামর্শ: প্রিন্ট উইন্ডোতে <strong>PDF হিসেবে সংরক্ষণ করুন</strong> নির্বাচন করুন",
            pagesCount: "{count} পৃষ্ঠা",
            noPages: "⚠️ কোনো পৃষ্ঠা পাওয়া যায়নি। পৃষ্ঠাটি রিফ্রেশ করুন!",
            gatedNote: (p) => `পৃষ্ঠা {p} ঝাপসা: ডাউনলোডের আগে BamiDoc-এ আনলক করুন!`,
            error: "❌ ডাউনলোড ভিউয়ার তৈরি করা যায়নি। আবার চেষ্টা করুন।",
            themeLight: "হালকা",
            themeDark: "গাঢ়",
            themeToggleToLight: "হালকা থিমে পরিবর্তন করুন",
            themeToggleToDark: "গাঢ় থিমে পরিবর্তন করুন"
        },
        pt_BR: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Visualizador de Impressão Studocu",
            scanning: "🚀 Escaneando página {done} / {total}...",
            embedding: "🖼️ Incorporando imagens...",
            ready: "✅ Documento carregado! Abrindo página de download...",
            printBtnText: "Imprimir / Salvar como PDF",
            backBtnText: "Voltar",
            hintText: "Dica: Escolha <strong>Salvar como PDF</strong> no diálogo de impressão",
            pagesCount: "{count} páginas",
            noPages: "⚠️ Nenhuma página encontrada. Atualize a página!",
            gatedNote: (p) => `A página {p} está desfocada: Desbloqueie no Doc Downloader antes de baixar!`,
            error: "❌ Não foi possível criar a página de download.",
            themeLight: "Claro",
            themeDark: "Escuro",
            themeToggleToLight: "Mudar para tema claro",
            themeToggleToDark: "Mudar para tema escuro"
        },
        es_419: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Visor de Impresión de Studocu",
            scanning: "🚀 Escaneando y cargando página {done} / {total}...",
            embedding: "🖼️ Incrustando imágenes de alta calidad...",
            ready: "✅ ¡Documento cargado! Abriendo visor de descarga...",
            printBtnText: "Imprimir / Guardar en PDF",
            backBtnText: "Volver",
            hintText: "Consejo: Seleccione <strong>Guardar como PDF</strong> en la ventana de impresión",
            pagesCount: "{count} páginas",
            noPages: "⚠️ No se encontraron páginas. ¡Por favor recarga la página!",
            gatedNote: (p) => `La página {p} está borrosa: ¡Desbloquea en Doc Downloader antes de descargar!`,
            error: "❌ No se pudo crear el visor de descarga. Recargue la página.",
            themeLight: "Claro",
            themeDark: "Oscuro",
            themeToggleToLight: "Cambiar a tema claro",
            themeToggleToDark: "Cambiar a tema oscuro"
        }
    };

    const fallbackI18N = (lang === 'vi') ? I18N.vi : (I18N[lang] || I18N[rawLang] || I18N[lang.split('_')[0]] || I18N.en);
    const t = Object.assign({}, fallbackI18N, window.__banhmi_viewer_t || {});
    t.brandName = "DOC DOWNLOADER";

    // ----------------------------------------------------------------------
    // 2. Toast Tiến Trình Quét Trang (Floating Toast - Light Glassmorphism)
    // ----------------------------------------------------------------------
    function showProgressToast(text, pct) {
        let toast = document.getElementById('banhmi-scan-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'banhmi-scan-toast';
            toast.style.cssText = `
                position: fixed !important;
                top: 108px !important;
                left: 76px !important;
                right: auto !important;
                transform: none !important;
                z-index: 2147483647 !important;
                background: rgba(255, 255, 255, 0.98) !important;
                backdrop-filter: blur(16px) !important;
                -webkit-backdrop-filter: blur(16px) !important;
                color: #0F172A !important;
                padding: 14px 18px !important;
                border-radius: 14px !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", "Hiragino Sans", "Yu Gothic UI", "Apple SD Gothic Neo", "Malgun Gothic", "Leelawadee UI", "Nirmala UI", "Segoe UI Historic", "Noto Sans", sans-serif !important;
                font-size: 13.5px !important;
                font-weight: 600 !important;
                box-shadow: 0 12px 36px -4px rgba(15, 23, 42, 0.16), 0 4px 12px -2px rgba(15, 23, 42, 0.06) !important;
                border: 1px solid rgba(0, 0, 0, 0.08) !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 10px !important;
                min-width: 320px !important;
                max-width: min(460px, calc(100vw - 32px)) !important;
                pointer-events: none !important;
                transition: opacity 0.3s ease, transform 0.3s ease !important;
            `;
            toast.innerHTML = `
                <style>
                    @keyframes banhmi-spin { to { transform: rotate(360deg); } }
                </style>
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                    <div style="font-size:10.5px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;color:#FF6B00;line-height:1.2;">DOC DOWNLOADER</div>
                </div>
                <div id="banhmi-scan-toast-text" style="display:flex;align-items:center;gap:10px;color:#0F172A;line-height:1.4;">
                    <div id="banhmi-scan-toast-icon" style="flex-shrink:0;width:22px;height:22px;display:flex;align-items:center;justify-content:center;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="animation:banhmi-spin 1s linear infinite;">
                            <circle cx="12" cy="12" r="10" stroke="#F1F5F9" stroke-width="2.5"></circle>
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="#FF6B00" stroke-width="2.5" stroke-linecap="round"></path>
                        </svg>
                    </div>
                    <span id="banhmi-scan-toast-label"></span>
                </div>
                <div style="width:100%;height:5px;background:#F1F5F9;border-radius:3px;overflow:hidden;">
                    <div id="banhmi-scan-toast-bar" style="width:0%;height:100%;background:linear-gradient(90deg,#FF6B00,#FFA726);border-radius:3px;transition:width 0.3s ease;"></div>
                </div>
            `;
            (document.documentElement || document.body).appendChild(toast);
        }
        const labelEl = document.getElementById('banhmi-scan-toast-label');
        const barEl = document.getElementById('banhmi-scan-toast-bar');
        const iconEl = document.getElementById('banhmi-scan-toast-icon');
        // Strip emoji from text for clean display
        const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1FA00}-\u{1FAFF}]/gu, '').trim();
        if (labelEl) labelEl.textContent = cleanText;
        if (barEl && pct !== undefined) barEl.style.width = pct + '%';
        // Switch icon to check mark when complete
        if (pct >= 100 && iconEl) {
            iconEl.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#FF6B00" opacity="0.12"></circle>
                    <path d="M8 12.5l2.5 2.5 5.5-5.5" stroke="#FF6B00" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            `;
        }
    }

    function removeProgressToast() {
        const toast = document.getElementById('banhmi-scan-toast');
        if (toast) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-8px)';
            setTimeout(() => {
                if (toast && toast.parentElement) toast.remove();
            }, 300);
        }
    }

    // ----------------------------------------------------------------------
    // 3. Tìm kiếm trang tài liệu (Hỗ trợ cả .pf và div[data-page-index])
    // ----------------------------------------------------------------------
    function getViewerPages() {
        const all = document.querySelectorAll('.pf');
        const filtered = Array.prototype.filter.call(all, function (pf) {
            return !pf.closest('#clean-viewer-container');
        });
        if (filtered.length > 0) return filtered;

        const dataPages = document.querySelectorAll('div[data-page-index]');
        return Array.prototype.filter.call(dataPages, function (pf) {
            return !pf.closest('#clean-viewer-container');
        });
    }

    function getDocumentTitle() {
        const h1 = document.querySelector('h1');
        return h1 ? h1.textContent.trim() : (document.title || t.defaultDocName);
    }

    // ----------------------------------------------------------------------
    // 4. Phân tích Document Access Data từ #__NEXT_DATA__
    // ----------------------------------------------------------------------
    const DOC_ASSETS = 'https://doc-assets.studocu.com/';

    function pickParam(sp, keys) {
        if (!sp) return '';
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (typeof sp[k] === 'string' && sp[k]) return sp[k];
        }
        return '';
    }

    function getDocumentAccessData() {
        try {
            const el = document.querySelector('#__NEXT_DATA__');
            if (!el) return null;
            const data = JSON.parse(el.textContent);
            const props = data && data.props && data.props.pageProps;
            const da = props && props.documentAccess;
            const doc = props && props.document;
            if (!da || !da.objectKey || !da.signedQueryParams) return null;

            const sp = da.signedQueryParams;
            const pageParams = {};
            if (Array.isArray(sp.pages)) {
                sp.pages.forEach(function (p) {
                    if (p && p.pageNumber && typeof p.signedQueryParams === 'string') {
                        pageParams[p.pageNumber] = p.signedQueryParams;
                    }
                });
            }

            return {
                objectKey: da.objectKey,
                bgParams: pickParam(sp, ['png', 'global']),
                pageParams: pageParams,
                blurredParams: pickParam(sp, ['blurredPage', 'global']),
                hasBlurredPages: !!da.hasBlurredPages,
                pageCount: doc ? (doc.numberOfPages || doc.pageCount || 0) : 0,
                hasTextLayer: Array.isArray(sp.pages)
            };
        } catch (e) {
            return null;
        }
    }

    function resolvePageAssets() {
        const a = getDocumentAccessData();
        if (a && a.bgParams) {
            return {
                bgUrl: function (n) {
                    return DOC_ASSETS + a.objectKey + '/html/bg' + n.toString(16) + '.png' + a.bgParams;
                },
                blurUrl: function (n) {
                    if (!a.blurredParams) return '';
                    return DOC_ASSETS + a.objectKey + '/html/pages/blurred/page' + n + '.webp' + a.blurredParams;
                },
                isGated: function (n) {
                    return !!(a.hasTextLayer && !a.pageParams[n]);
                }
            };
        }

        const imgs = document.querySelectorAll('.pf img, div[data-page-index] img');
        for (let i = 0; i < imgs.length; i++) {
            const s = imgs[i].src || '';
            if (s.indexOf('/bg') !== -1 && s.indexOf('doc-assets') !== -1 && imgs[i].naturalWidth > 600) {
                const m = s.match(/(.*?\/bg)[0-9a-f]+(\.png\?.*)/i);
                if (m) {
                    return {
                        bgUrl: function (n) { return m[1] + n.toString(16) + m[2]; },
                        blurUrl: function () { return ''; },
                        isGated: function () { return false; }
                    };
                }
            }
        }
        return null;
    }

    function deblurUrl(url) {
        if (!url || url.indexOf('/blurred/') === -1) return null;
        return url.replace('/pages/blurred/', '/pages/').replace('/blurred/', '/');
    }

    // ----------------------------------------------------------------------
    // 5. Cuộn và Bắt từng trang khi trang đang hiển thị
    // ----------------------------------------------------------------------
    function getScroller() {
        const candidates = [document.getElementById('viewer-wrapper'), document.getElementById('document-wrapper')];
        for (let i = 0; i < candidates.length; i++) {
            const el = candidates[i];
            if (!el || el.scrollHeight <= el.clientHeight + 1) continue;
            const oy = window.getComputedStyle(el).overflowY;
            if (oy === 'auto' || oy === 'scroll') return el;
        }
        return document.scrollingElement || document.documentElement;
    }

    function saveScroll() {
        const el = getScroller();
        return { el: el, top: el ? el.scrollTop : 0, y: window.scrollY || 0 };
    }

    function restoreScroll(saved) {
        if (!saved) return;
        try { if (saved.el) saved.el.scrollTop = saved.top; } catch (e) {}
        try { window.scrollTo(0, saved.y); } catch (e) {}
    }

    function isPageRendered(pf) {
        if (!pf) return false;
        const hasSpans = pf.querySelectorAll('span').length > 3;
        const img = pf.querySelector('img');
        const imgLoaded = !!(img && img.complete && img.naturalWidth > 0);
        return pf.innerHTML.length > 500 && (hasSpans || imgLoaded);
    }

    function isPageReadyNow(pf) {
        if (!pf || !isPageRendered(pf)) return false;
        const w = pf.offsetWidth || 0;
        const h = pf.offsetHeight || 0;
        if (w > 50 && h > 50) return true;
        const rect = pf.getBoundingClientRect();
        return rect.width > 50 && rect.height > 50;
    }

    function waitForPageReady(pf) {
        // Fast-path: Nếu trang đã render đầy đủ và có kích thước thì hoàn tất tức thì (15ms)
        if (isPageReadyNow(pf)) {
            return new Promise(function (resolve) {
                setTimeout(resolve, 15);
            });
        }

        return new Promise(function (resolve) {
            let lastLen = -1, tries = 0;
            let observer = null;
            let resolved = false;

            function done() {
                if (resolved) return;
                resolved = true;
                if (observer) {
                    try { observer.disconnect(); } catch (e) {}
                }
                resolve();
            }

            function check() {
                if (resolved) return;
                const len = pf.innerHTML.length;
                if (isPageRendered(pf)) {
                    if (len === lastLen && len > 500) {
                        done();
                        return;
                    }
                    lastLen = len;
                }
                if (tries++ > 40) { // Tối đa ~1.4s mỗi trang nếu mạng chậm
                    done();
                    return;
                }
                setTimeout(check, 35); // Polling siêu tốc 35ms thay vì 150ms
            }

            // MutationObserver: Bắt tức thì thời điểm Studocu chèn DOM vào trang
            if (typeof MutationObserver !== 'undefined') {
                try {
                    observer = new MutationObserver(function () {
                        if (isPageReadyNow(pf)) {
                            done();
                        }
                    });
                    observer.observe(pf, { childList: true, subtree: true, attributes: false });
                } catch (e) {}
            }

            check();
        });
    }

    function captureAllPages(pages, onProgress) {
        const saved = saveScroll();
        const captured = [];
        const LOOKAHEAD = 4; // Cuộn đón đầu 3-4 trang kế tiếp để kích hoạt lazy-load song song

        return new Promise(function (resolve) {
            let i = 0;
            (function next() {
                if (i >= pages.length) {
                    restoreScroll(saved);
                    resolve(captured);
                    return;
                }
                const pf = pages[i];

                // 1. Cuộn đón đầu (Lookahead Pre-scroll): Kích hoạt tải trước 3-4 trang kế tiếp trong nền
                for (let k = 1; k <= LOOKAHEAD; k++) {
                    const nextPf = pages[i + k];
                    if (nextPf && !isPageReadyNow(nextPf)) {
                        try {
                            nextPf.scrollIntoView({ behavior: 'instant', block: 'nearest' });
                        } catch (e) {}
                    }
                }

                // 2. Đưa trang hiện tại vào tâm màn hình
                try {
                    pf.scrollIntoView({ behavior: 'instant', block: 'center' });
                } catch (e) {}

                waitForPageReady(pf).then(function () {
                    // Đo kích thước khung .pf trực tiếp (tuyệt đối không đo .pc vì .pc có hệ tọa độ nội bộ 4x trước transform)
                    let w = pf.offsetWidth || 0;
                    let h = pf.offsetHeight || 0;
                    if (w <= 50 || h <= 50) {
                        const rect = pf.getBoundingClientRect();
                        if (w <= 50 && rect.width > 50) w = rect.width;
                        if (h <= 50 && rect.height > 50) h = rect.height;
                    }

                    const clone = pf.cloneNode(true);
                    clone.__liveWidth = w > 50 ? Math.round(w) : 0;
                    clone.__liveHeight = h > 50 ? Math.round(h) : 0;
                    clone.__originalClassName = pf.className || '';

                    captured.push(clone);
                    i++;
                    if (onProgress) onProgress(i, pages.length);
                    next();
                });
            })();
        });
    }

    // ----------------------------------------------------------------------
    // 6. Nhúng toàn bộ ảnh sang Base64 Data URI
    // ----------------------------------------------------------------------
    function fetchDataUri(url) {
        return fetch(url, { credentials: 'omit' })
            .then(function (r) { return r.ok ? r.blob() : null; })
            .then(function (blob) {
                if (!blob || blob.size === 0) return null;
                return new Promise(function (resolve) {
                    const fr = new FileReader();
                    fr.onload = function () { resolve(fr.result); };
                    fr.onerror = function () { resolve(null); };
                    fr.readAsDataURL(blob);
                });
            })
            .catch(function () { return null; });
    }

    function embedImages(root, onProgress) {
        const targets = Array.prototype.filter.call(root.querySelectorAll('img'), function (img) {
            const s = img.getAttribute('src') || '';
            return s.indexOf('doc-assets') !== -1 || s.indexOf('/bg') !== -1;
        });
        const urls = Array.from(new Set(targets.map(function (img) { return img.getAttribute('src'); }))).filter(Boolean);
        const map = {};
        let next = 0, done = 0;
        const CONCURRENCY = 10; // Tăng lên 10 luồng tải song song HTTP/2

        return new Promise(function (resolve) {
            if (urls.length === 0) {
                resolve();
                return;
            }
            function worker() {
                if (next >= urls.length) return Promise.resolve();
                const url = urls[next++];
                return fetchDataUri(url).then(function (dataUri) {
                    if (dataUri) map[url] = dataUri;
                    done++;
                    if (onProgress) onProgress(done, urls.length);
                    return worker();
                });
            }
            const starters = [];
            for (let c = 0; c < Math.min(CONCURRENCY, urls.length); c++) {
                starters.push(worker());
            }
            Promise.all(starters).then(function () {
                targets.forEach(function (img) {
                    const s = img.getAttribute('src');
                    if (map[s]) {
                        img.setAttribute('src', map[s]);
                        img.removeAttribute('srcset');
                        img.removeAttribute('data-src');
                    }
                });
                resolve();
            });
        });
    }

    // ----------------------------------------------------------------------
    // 7. Tạo "Trang Tải" (#clean-viewer-container) Thiết Kế Chuẩn UI/UX
    // ----------------------------------------------------------------------
    function buildCleanViewer(capturedPages, assets) {
        let currentTheme = window.__banhmi_viewer_theme || 'dark';
        const viewerContainer = document.createElement('div');
        viewerContainer.id = 'clean-viewer-container';
        viewerContainer.className = (currentTheme === 'light') ? 'theme-light' : 'theme-dark';
        if (document.body) {
            document.body.style.backgroundColor = (currentTheme === 'light') ? '#F1F5F9' : '#0F172A';
        }

        // Thanh công cụ đầu trang (Sticky Top Bar - Glassmorphism)
        const bar = document.createElement('div');
        bar.className = 'clean-viewer-bar';

        // Cụm trái: Logo + Tên Brand + Tên tài liệu + Huy hiệu số trang
        const leftDiv = document.createElement('div');
        leftDiv.className = 'clean-viewer-left';

        const logoDiv = document.createElement('div');
        logoDiv.className = 'clean-viewer-logo';
        logoDiv.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color: #FF6B00;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
        `;

        const titleWrap = document.createElement('div');
        titleWrap.className = 'clean-viewer-title-wrap';
        titleWrap.innerHTML = `
            <div class="clean-viewer-brand">${t.brandName}</div>
            <div class="clean-viewer-docname" title="${getDocumentTitle()}">${getDocumentTitle()}</div>
        `;

        const badge = document.createElement('div');
        badge.className = 'clean-viewer-badge';
        badge.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span>${((t && t.pagesCount) ? t.pagesCount : '{count} pages').replace('{count}', capturedPages.length)}</span>
        `;

        leftDiv.appendChild(logoDiv);
        leftDiv.appendChild(titleWrap);
        leftDiv.appendChild(badge);

        // Cụm giữa: Khoảng đệm trống tinh gọn (không quảng cáo)
        const centerDiv = document.createElement('div');
        centerDiv.className = 'clean-viewer-center';

        // Cụm phải: Nút chuyển theme, Nút In / Lưu thành PDF và Nút Quay lại
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'clean-viewer-actions';

        const themeBtn = document.createElement('button');
        themeBtn.type = 'button';
        themeBtn.className = 'clean-viewer-btn-theme';
        themeBtn.id = 'cleanViewerThemeBtn';

        function updateThemeBtnUI() {
            const isDark = (currentTheme === 'dark');
            const tooltip = isDark ? (t.themeToggleToLight || "Chuyển sang nền sáng") : (t.themeToggleToDark || "Chuyển sang nền tối");
            themeBtn.setAttribute('title', tooltip);
            themeBtn.setAttribute('aria-label', tooltip);
            if (isDark) {
                themeBtn.innerHTML = `
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                `;
            } else {
                themeBtn.innerHTML = `
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                `;
            }
        }
        updateThemeBtnUI();

        function applyTheme(newTheme) {
            currentTheme = newTheme;
            window.__banhmi_viewer_theme = newTheme;
            viewerContainer.classList.remove('theme-dark', 'theme-light');
            viewerContainer.classList.add(newTheme === 'light' ? 'theme-light' : 'theme-dark');
            if (document.body) {
                document.body.style.backgroundColor = (newTheme === 'light') ? '#F1F5F9' : '#0F172A';
            }
            updateThemeBtnUI();
            try {
                if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                    chrome.storage.local.set({ banhmi_viewer_theme: newTheme });
                    chrome.storage.local.get(['banhmi_settings'], function(res) {
                        if (res && res.banhmi_settings) {
                            res.banhmi_settings.docViewerTheme = newTheme;
                            chrome.storage.local.set({ banhmi_settings: res.banhmi_settings });
                        }
                    });
                }
            } catch(e) {}
        }

        themeBtn.addEventListener('click', function () {
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });

        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(['banhmi_viewer_theme', 'banhmi_settings'], function(data) {
                    if (data) {
                        const saved = data.banhmi_viewer_theme || (data.banhmi_settings && data.banhmi_settings.docViewerTheme);
                        if (saved && (saved === 'dark' || saved === 'light') && saved !== currentTheme) {
                            applyTheme(saved);
                        }
                    }
                });
            }
        } catch(e) {}

        const printBtn = document.createElement('button');
        printBtn.type = 'button';
        printBtn.className = 'clean-viewer-btn-print';
        printBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>${t.printBtnText}</span>
        `;
        printBtn.addEventListener('click', function () {
            window.print();
        });

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'clean-viewer-btn-close';
        closeBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>${t.backBtnText}</span>
        `;
        closeBtn.addEventListener('click', function () {
            destroyCleanViewer();
        });

        actionsDiv.appendChild(themeBtn);
        actionsDiv.appendChild(printBtn);
        actionsDiv.appendChild(closeBtn);

        bar.appendChild(leftDiv);
        bar.appendChild(centerDiv);
        bar.appendChild(actionsDiv);
        viewerContainer.appendChild(bar);

        // Khung chứa các trang (.p2hv để kế thừa 100% stylesheet font, kích thước .pf và ma trận transform .pc của Studocu)
        const pagesWrap = document.createElement('div');
        pagesWrap.className = 'clean-viewer-pages-wrap p2hv';

        // Tìm các class kích thước gốc (như w0, h0) từ trang mở khóa để đồng bộ cho các trang bị khóa (gated)
        let sizeClasses = [];
        for (let j = 0; j < capturedPages.length; j++) {
            const p = capturedPages[j];
            if (p.classList) {
                const cls = Array.from(p.classList).filter(function (c) {
                    return /^[wh][0-9a-f]+$/i.test(c);
                });
                if (cls.length >= 2) {
                    sizeClasses = cls;
                    break;
                }
            }
        }

        capturedPages.forEach(function (pf, idx) {
            const pageNum = idx + 1;
            const isGated = assets ? assets.isGated(pageNum) : false;
            pf.__isGated = isGated;

            // Giữ nguyên phần tử .pf gốc để bảo toàn 100% cấu trúc pdf2htmlEX (.pf > .pc > img.bi + span)
            pf.removeAttribute('style');
            pf.classList.add('std-page', 'pf');
            sizeClasses.forEach(function (c) {
                if (!pf.classList.contains(c)) pf.classList.add(c);
            });
            pf.id = `page-${pageNum}`;
            pf.setAttribute('data-page-number', pageNum);

            // Xóa rác, quảng cáo
            pf.querySelectorAll('.banhmi-studocu-dl-btn, .download-button-1, [data-ad-banner], [class*="InlineBanner"], [class*="PremiumBanner"]').forEach(function (e) {
                e.remove();
            });

            // Mở khóa display: none
            pf.querySelectorAll('[style]').forEach(function (e) {
                const st = e.getAttribute('style') || '';
                if (/display:\s*none/i.test(st)) {
                    e.setAttribute('style', st.replace(/display:\s*none/ig, 'display:block'));
                }
            });

            if (assets) {
                const hasPc = !!pf.querySelector('.pc');
                let img = pf.querySelector('img.bi') || pf.querySelector('img');
                const cur = img ? (img.getAttribute('src') || '') : '';
                if (!img) {
                    img = document.createElement('img');
                    img.className = 'bi x0 y0 w1 h1';
                    (pf.querySelector('.pc') || pf).appendChild(img);
                }

                if (isGated) {
                    const blur = assets.blurUrl(pageNum);
                    if (cur.indexOf('/pages/blurred/') === -1 && blur) {
                        img.setAttribute('src', blur);
                    }
                    // Trang bị khóa không có .pc, căn ảnh preview mờ vừa khít khung .pf
                    if (!hasPc) {
                        img.style.cssText = 'position:absolute !important;top:0 !important;left:0 !important;width:100% !important;height:100% !important;object-fit:contain !important;display:block !important;';
                    }
                    const note = document.createElement('div');
                    note.className = 'banhmi-gated-note';
                    const msg = typeof t.gatedNote === 'function' ? t.gatedNote(pageNum) : `Trang ${pageNum} đang bị làm mờ: Vui lòng bấm nút "Mở khóa Studocu" trên tiện ích Doc Downloader trước khi tải!`;
                    note.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9800" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <span>${msg}</span>
                    `;
                    pf.appendChild(note);
                } else {
                    const clear = deblurUrl(cur);
                    img.setAttribute('src', clear || assets.bgUrl(pageNum));
                    if (!hasPc) {
                        img.style.cssText = 'position:absolute !important;top:0 !important;left:0 !important;width:100% !important;height:100% !important;object-fit:contain !important;display:block !important;';
                    }
                }
                img.removeAttribute('srcset');
                img.removeAttribute('data-src');
            }

            // Hiển thị .page-content và .pc nhưng TUYỆT ĐỐI giữ nguyên transform matrix của .pc
            pf.querySelectorAll('.page-content').forEach(function (el) {
                el.style.cssText = 'display:block !important; filter:none !important;';
            });
            pf.querySelectorAll('.pc').forEach(function (el) {
                el.style.setProperty('display', 'block', 'important');
                el.style.setProperty('visibility', 'visible', 'important');
                el.style.setProperty('opacity', '1', 'important');
                el.style.setProperty('filter', 'none', 'important');
            });

            pagesWrap.appendChild(pf);
        });

        viewerContainer.appendChild(pagesWrap);
        return viewerContainer;
    }

    // ----------------------------------------------------------------------
    // 8. Kích thước trang in động (@page theo pixel thực tế) & Styles Trang Tải
    // ----------------------------------------------------------------------
    function applyPageSizes(container) {
        const pfs = container.querySelectorAll('.pf');
        if (!pfs.length) return;

        // 1. Đo kích thước chuẩn từ trang mở khóa đầu tiên (đã được áp dụng stylesheet .p2hv)
        let defaultW = 0, defaultH = 0;
        for (let i = 0; i < pfs.length; i++) {
            if (pfs[i].__isGated) continue;
            const r = pfs[i].getBoundingClientRect();
            if (r.width > 50 && r.height > 50) {
                defaultW = Math.round(r.width);
                defaultH = Math.round(r.height);
                break;
            }
            if (pfs[i].__liveWidth > 50 && pfs[i].__liveHeight > 50) {
                defaultW = pfs[i].__liveWidth;
                defaultH = pfs[i].__liveHeight;
                break;
            }
        }
        // Fallback nếu tất cả các trang đều bị khóa
        if (!defaultW || !defaultH) {
            for (let i = 0; i < pfs.length; i++) {
                const r = pfs[i].getBoundingClientRect();
                if (r.width > 50 && r.height > 50) {
                    defaultW = Math.round(r.width);
                    defaultH = Math.round(r.height);
                    break;
                }
                if (pfs[i].__liveWidth > 50 && pfs[i].__liveHeight > 50) {
                    defaultW = pfs[i].__liveWidth;
                    defaultH = pfs[i].__liveHeight;
                    break;
                }
            }
        }
        if (!defaultW || !defaultH) {
            defaultW = 595;
            defaultH = 842;
        }

        const rules = [];
        let first = null;
        for (let i = 0; i < pfs.length; i++) {
            const pf = pfs[i];
            let w = defaultW, h = defaultH;
            if (!pf.__isGated) {
                const r = pf.getBoundingClientRect();
                if (r.width > 50 && r.height > 50) {
                    w = Math.round(r.width);
                    h = Math.round(r.height);
                } else if (pf.__liveWidth > 50 && pf.__liveHeight > 50) {
                    w = pf.__liveWidth;
                    h = pf.__liveHeight;
                }
            }
            if (!first) first = { w: w, h: h };

            // Khóa kích thước khung .pf thành số nguyên pixel khớp tuyệt đối với @page để chống tràn subpixel
            pf.style.setProperty('width', w + 'px', 'important');
            pf.style.setProperty('height', h + 'px', 'important');

            const name = 'banhmi-page-' + (i + 1);
            rules.push('@page ' + name + ' { size: ' + w + 'px ' + h + 'px; margin: 0; }');
            pf.style.setProperty('page', name);
        }

        if (first) {
            rules.unshift('@page { size: ' + first.w + 'px ' + first.h + 'px; margin: 0; }');
        }

        let style = document.getElementById('banhmi-page-size-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'banhmi-page-size-styles';
            document.head.appendChild(style);
        }
        style.textContent = rules.join('\n');
    }

    function injectViewerStyles() {
        let style = document.getElementById('banhmi-clean-viewer-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'banhmi-clean-viewer-styles';
            document.head.appendChild(style);
        }

        style.textContent = `
            body { 
                background-color: #F1F5F9 !important; 
                margin: 0 !important; 
                overflow: auto !important; 
            }
            body > *:not(#clean-viewer-container) { 
                display: none !important; 
            }
            #clean-viewer-container {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                min-height: 100vh !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                padding: 0 0 40px 0 !important;
                z-index: 2147483647 !important;
                background: #F1F5F9 !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", "Hiragino Sans", "Yu Gothic UI", "Apple SD Gothic Neo", "Malgun Gothic", "Leelawadee UI", "Nirmala UI", "Segoe UI Historic", "Noto Sans", sans-serif !important;
            }
            #clean-viewer-container .clean-viewer-bar {
                position: sticky !important;
                top: 0 !important;
                z-index: 1000 !important;
                width: 100% !important;
                box-sizing: border-box !important;
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                gap: 12px !important;
                background: rgba(255, 255, 255, 0.94) !important;
                backdrop-filter: blur(16px) saturate(180%) !important;
                -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
                border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
                box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03) !important;
                padding: 10px 20px !important;
                min-height: 58px !important;
            }
            #clean-viewer-container .clean-viewer-left {
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
                min-width: 0 !important;
                flex-shrink: 0 !important;
            }
            #clean-viewer-container .clean-viewer-logo {
                width: 38px !important;
                height: 38px !important;
                border-radius: 10px !important;
                overflow: hidden !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                flex-shrink: 0 !important;
            }
            #clean-viewer-container .clean-viewer-logo-img {
                width: 38px !important;
                height: 38px !important;
                border-radius: 10px !important;
                object-fit: cover !important;
            }
            #clean-viewer-container .clean-viewer-title-wrap {
                display: flex !important;
                flex-direction: column !important;
                min-width: 0 !important;
            }
            #clean-viewer-container .clean-viewer-brand {
                font-size: 11px !important;
                font-weight: 800 !important;
                color: #FF6B00 !important;
                letter-spacing: 0.6px !important;
                text-transform: uppercase !important;
                line-height: 1.2 !important;
                white-space: nowrap !important;
            }
            #clean-viewer-container .clean-viewer-docname {
                font-size: 13.5px !important;
                font-weight: 600 !important;
                color: #0F172A !important;
                line-height: 1.35 !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                max-width: 200px !important;
            }
            @media (min-width: 1280px) {
                #clean-viewer-container .clean-viewer-docname {
                    max-width: 280px !important;
                }
            }
            @media (min-width: 1440px) {
                #clean-viewer-container .clean-viewer-docname {
                    max-width: 340px !important;
                }
            }
            #clean-viewer-container .clean-viewer-badge {
                background: #F1F5F9 !important;
                color: #475569 !important;
                border: 1px solid #E2E8F0 !important;
                padding: 0 11px !important;
                height: 28px !important;
                border-radius: 9999px !important;
                font-size: 11.5px !important;
                font-weight: 600 !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 5px !important;
                flex-shrink: 0 !important;
                box-sizing: border-box !important;
                white-space: nowrap !important;
            }
            #clean-viewer-container .clean-viewer-center {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                flex: 1 1 auto !important;
                max-width: 440px !important;
                margin: 0 auto !important;
                min-width: 0 !important;
                overflow: hidden !important;
            }
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            #clean-viewer-container .clean-viewer-actions {
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                flex-shrink: 0 !important;
            }
            #clean-viewer-container .clean-viewer-btn-print {
                background: linear-gradient(135deg, #FF6B00 0%, #FF8800 100%) !important;
                color: #ffffff !important;
                border: none !important;
                border-radius: 9999px !important;
                padding: 0 16px !important;
                height: 38px !important;
                font-size: 13px !important;
                font-weight: 700 !important;
                cursor: pointer !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 7px !important;
                box-shadow: 0 4px 14px rgba(255, 107, 0, 0.35) !important;
                transition: all 0.2s ease !important;
                white-space: nowrap !important;
                flex-shrink: 0 !important;
            }
            #clean-viewer-container .clean-viewer-btn-print:hover {
                transform: translateY(-1px) !important;
                box-shadow: 0 6px 18px rgba(255, 107, 0, 0.5) !important;
                filter: brightness(1.05) !important;
            }
            #clean-viewer-container .clean-viewer-btn-print:active {
                transform: translateY(0) !important;
            }
            #clean-viewer-container .clean-viewer-btn-close {
                background: #FFFFFF !important;
                color: #475569 !important;
                border: 1px solid #CBD5E1 !important;
                border-radius: 9999px !important;
                padding: 0 14px !important;
                height: 38px !important;
                font-size: 13px !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 6px !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
                transition: all 0.2s ease !important;
                white-space: nowrap !important;
                flex-shrink: 0 !important;
            }
            #clean-viewer-container .clean-viewer-btn-close:hover {
                background: #F8FAFC !important;
                color: #0F172A !important;
                border-color: #94A3B8 !important;
            }
            .clean-viewer-btn-theme {
                border-radius: 50% !important;
                width: 38px !important;
                height: 38px !important;
                padding: 0 !important;
                cursor: pointer !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
                transition: all 0.2s ease !important;
                user-select: none !important;
            }

            /* Theme Dark */
            #clean-viewer-container.theme-dark {
                background: #0F172A !important;
            }
            #clean-viewer-container.theme-dark .clean-viewer-bar {
                background: rgba(15, 23, 42, 0.94) !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25) !important;
            }
            #clean-viewer-container.theme-dark .clean-viewer-docname {
                color: #F8FAFC !important;
            }
            #clean-viewer-container.theme-dark .clean-viewer-badge {
                background: rgba(255, 255, 255, 0.1) !important;
                color: #CBD5E1 !important;
                border-color: rgba(255, 255, 255, 0.15) !important;
            }
            
            
            
            
            
            
            
            #clean-viewer-container.theme-dark .clean-viewer-btn-theme {
                background: rgba(255, 255, 255, 0.1) !important;
                color: #F8FAFC !important;
                border: 1px solid rgba(255, 255, 255, 0.18) !important;
            }
            #clean-viewer-container.theme-dark .clean-viewer-btn-theme:hover {
                background: rgba(255, 255, 255, 0.18) !important;
                border-color: rgba(255, 255, 255, 0.3) !important;
            }
            #clean-viewer-container.theme-dark .clean-viewer-btn-close {
                background: rgba(255, 255, 255, 0.1) !important;
                color: #F8FAFC !important;
                border: 1px solid rgba(255, 255, 255, 0.18) !important;
            }
            #clean-viewer-container.theme-dark .clean-viewer-btn-close:hover {
                background: rgba(255, 255, 255, 0.18) !important;
                color: #FFFFFF !important;
                border-color: rgba(255, 255, 255, 0.3) !important;
            }
            #clean-viewer-container.theme-dark .pf {
                box-shadow: 0 10px 35px rgba(0, 0, 0, 0.6) !important;
            }

            /* Theme Light */
            #clean-viewer-container.theme-light {
                background: #F1F5F9 !important;
            }
            #clean-viewer-container.theme-light .clean-viewer-bar {
                background: rgba(255, 255, 255, 0.94) !important;
                border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
                box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03) !important;
            }
            #clean-viewer-container.theme-light .clean-viewer-docname {
                color: #0F172A !important;
            }
            #clean-viewer-container.theme-light .clean-viewer-badge {
                background: #F1F5F9 !important;
                color: #475569 !important;
                border-color: #E2E8F0 !important;
            }
            
            
            
            #clean-viewer-container.theme-light .clean-viewer-btn-theme {
                background: #FFFFFF !important;
                color: #475569 !important;
                border: 1px solid #CBD5E1 !important;
            }
            #clean-viewer-container.theme-light .clean-viewer-btn-theme:hover {
                background: #F8FAFC !important;
                color: #0F172A !important;
                border-color: #94A3B8 !important;
            }
            #clean-viewer-container.theme-light .pf {
                box-shadow: 0 6px 24px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04) !important;
            }
            #clean-viewer-container .clean-viewer-pages-wrap {
                margin-top: 24px !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
            }
            #clean-viewer-container .pf {
                position: relative !important;
                background-color: #ffffff !important;
                box-shadow: 0 6px 24px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04) !important;
                border-radius: 4px !important;
                margin: 0 auto 24px auto !important;
                display: block !important;
                border: none !important;
                overflow: hidden !important;
                filter: none !important;
                opacity: 1 !important;
            }
            #clean-viewer-container .pc {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
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
            @media (max-width: 1260px) {
                #clean-viewer-container .clean-viewer-docname {
                    max-width: 140px !important;
                }
                
                
                #clean-viewer-container .clean-viewer-btn-print {
                    padding: 0 13px !important;
                    font-size: 12.5px !important;
                }
                #clean-viewer-container .clean-viewer-btn-close {
                    padding: 0 12px !important;
                    font-size: 12.5px !important;
                }
            }
            @media (max-width: 1100px) {
                #clean-viewer-container .clean-viewer-center {
                    display: none !important;
                }
                #clean-viewer-container .clean-viewer-docname {
                    max-width: 240px !important;
                }
            }
            @media (max-width: 800px) {
                #clean-viewer-container .clean-viewer-docname {
                    max-width: 150px !important;
                }
            }
            @media print {
                @page { 
                    margin: 0; 
                }
                body > *:not(#clean-viewer-container) { 
                    display: none !important; 
                }
                html, body { 
                    background-color: white !important; 
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                #clean-viewer-container { 
                    display: block !important;
                    position: static !important; 
                    width: 100% !important; 
                    padding: 0 !important; 
                    margin: 0 !important; 
                    background: transparent !important;
                }
                #clean-viewer-container .clean-viewer-bar { 
                    display: none !important; 
                }
                #clean-viewer-container .clean-viewer-pages-wrap { 
                    display: block !important;
                    position: static !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                #clean-viewer-container .pf { 
                    margin: 0 !important; 
                    padding: 0 !important;
                    box-shadow: none !important;
                    border-radius: 0 !important;
                    border: none !important;
                    overflow: hidden !important;
                    page-break-after: always;
                    break-after: page;
                    page-break-inside: avoid;
                    break-inside: avoid;
                }
                #clean-viewer-container .pf:last-child {
                    page-break-after: auto;
                    break-after: auto;
                }
                .banhmi-gated-note {
                    backdrop-filter: none !important;
                    -webkit-backdrop-filter: none !important;
                    box-shadow: none !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            }
        `;
    }

    function destroyCleanViewer() {
        if (window.__banhmi_ad_timer) {
            clearInterval(window.__banhmi_ad_timer);
            window.__banhmi_ad_timer = null;
        }
        const viewer = document.getElementById('clean-viewer-container');
        if (viewer) viewer.remove();
        const styles = document.getElementById('banhmi-clean-viewer-styles');
        if (styles) styles.remove();
        const pageStyles = document.getElementById('banhmi-page-size-styles');
        if (pageStyles) pageStyles.remove();
        if (document.body) document.body.style.backgroundColor = '';
        document.removeEventListener('keydown', onKeyDownEsc);
        window.__banhmi_studocu_running = false;
    }

    function onKeyDownEsc(e) {
        if (e.key === 'Escape') {
            destroyCleanViewer();
        }
    }

    // ----------------------------------------------------------------------
    // 9. Luồng Thực Thi Chính (Main Execution Workflow)
    // ----------------------------------------------------------------------
    function run() {
        let pages = getViewerPages();
        if (!pages || pages.length === 0) {
            let attempts = 0;
            const retryInterval = setInterval(function() {
                attempts++;
                pages = getViewerPages();
                if (pages && pages.length > 0) {
                    clearInterval(retryInterval);
                    startStudocuCapture(pages);
                } else if (attempts >= 6) {
                    clearInterval(retryInterval);
                    alert(t.noPages);
                    window.__banhmi_studocu_running = false;
                }
            }, 500);
            return;
        }
        startStudocuCapture(pages);
    }

    function startStudocuCapture(pages) {

        // Bắt đầu quét: Studocu vẫn hiển thị bình thường, hiện toast tiến trình
        const scanTpl = (t && t.scanning) ? t.scanning : '🚀 Scanning & loading page {done} / {total}...';
        showProgressToast(scanTpl.replace('{done}', 1).replace('{total}', pages.length), 5);

        const assets = resolvePageAssets();

        // Bước 1: Quét và bắt các trang (5% -> 70%)
        captureAllPages(pages, function (done, total) {
            const pct = Math.round((done / total) * 70);
            const scanTpl2 = (t && t.scanning) ? t.scanning : '🚀 Scanning & loading page {done} / {total}...';
            showProgressToast(scanTpl2.replace('{done}', done).replace('{total}', total), pct);
        }).then(function (capturedPages) {
            if (!capturedPages || capturedPages.length === 0) {
                throw new Error('No pages captured');
            }

            // Bước 2: Tạo "Trang Tải" (#clean-viewer-container)
            const cleanViewer = buildCleanViewer(capturedPages, assets);

            // Bước 3: Nhúng ảnh sang Base64 Data URI (70% -> 100%)
            showProgressToast(t.embedding, 75);
            return embedImages(cleanViewer, function (done, total) {
                const pct = 70 + Math.round((total ? done / total : 1) * 30);
                showProgressToast(t.embedding, pct);
            }).then(function () {
                return cleanViewer;
            });
        }).then(function (cleanViewer) {
            // Bước 4: Hoàn tất -> Đóng toast và mở "Trang Tải"
            showProgressToast(t.ready, 100);
            setTimeout(function () {
                removeProgressToast();

                // Đưa #clean-viewer-container vào body, áp dụng styles và đo kích thước @page thực tế
                const existing = document.getElementById('clean-viewer-container');
                if (existing) existing.remove();

                document.body.appendChild(cleanViewer);
                injectViewerStyles();
                applyPageSizes(cleanViewer);
                document.addEventListener('keydown', onKeyDownEsc);
                window.__banhmi_studocu_running = false;

                // Tự động đóng popup extension khi ra Trang Tải
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                        chrome.runtime.sendMessage({ action: 'banhmi_close_popup', source: 'clean_viewer_ready' });
                    }
                } catch (e) {}
            }, 400);
        }).catch(function (err) {
            console.error('BamiDoc Studocu Error:', err);
            removeProgressToast();
            alert(t.error);
            window.__banhmi_studocu_running = false;
        });
    }

    run();
})();
