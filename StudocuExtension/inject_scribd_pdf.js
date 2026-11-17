(function() {
    'use strict';

    if (window.__banhmi_scribd_running) {
        return;
    }
    window.__banhmi_scribd_running = true;

    // ----------------------------------------------------------------------
    // 1. Đa Ngôn Ngữ (12 Ngôn Ngữ Đồng Bộ Với Toàn Hệ Thống)
    // ----------------------------------------------------------------------
    let rawLang = window.__banhmi_lang || (navigator.language ? navigator.language.replace('-', '_') : 'en');
    let lang = rawLang;
    if (!['zh_CN', 'zh_TW', 'pt_BR', 'es_419'].includes(lang)) {
        lang = lang.split('_')[0];
    }

    const translations = {
        vi: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Tài liệu Scribd",
            scanning: "Đang quét và tải trang {done} / {total}...",
            embedding: "Đang tải hình ảnh chất lượng cao...",
            ready: "Đã tải xong tài liệu! Đang mở trang xem trước...",
            printBtnText: "In / Lưu thành PDF",
            backBtnText: "Quay lại",
            pagesCount: "{count} trang",
            noPages: "Không tìm thấy trang tài liệu nào trên trang Scribd này.",
            gatedNote: (p) => `Trang {p} đang bị làm mờ: Vui lòng bấm nút "Mở khóa Scribd" trên tiện ích Doc Downloader trước khi tải!`,
            error: "Có lỗi xảy ra khi tạo PDF Scribd. Vui lòng thử lại!",
            themeLight: "Nền sáng",
            themeDark: "Nền tối",
            themeToggleToLight: "Chuyển sang nền sáng",
            themeToggleToDark: "Chuyển sang nền tối"
        },
        en: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Scribd Document",
            scanning: "Scanning page {done} / {total}...",
            embedding: "Embedding images and optimizing layout...",
            ready: "Document loaded! Opening preview...",
            printBtnText: "Print / Save as PDF",
            backBtnText: "Back",
            pagesCount: "{count} pages",
            noPages: "No document pages found on this Scribd page.",
            gatedNote: (p) => `Page {p} is blurred: Please click "Unlock Scribd" in the Doc Downloader extension before downloading!`,
            error: "An error occurred while generating Scribd PDF. Please try again!",
            themeLight: "Light",
            themeDark: "Dark",
            themeToggleToLight: "Switch to Light Theme",
            themeToggleToDark: "Switch to Dark Theme"
        },
        mr: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Scribd दस्तऐवज",
            scanning: "पृष्ठ {done} / {total} स्कॅन करत आहे...",
            embedding: "प्रतिमा एम्बेड करत आहे...",
            ready: "दस्तऐवज लोड झाला! पूर्वावलोकन उघडत आहे...",
            printBtnText: "प्रिंट / PDF म्हणून सेव्ह करा",
            backBtnText: "मागे",
            pagesCount: "{count} पृष्ठे",
            noPages: "या Scribd पृष्ठावर कोणतेही पृष्ठ आढळले नाही.",
            gatedNote: (p) => `पृष्ठ {p} अस्पष्ट आहे: डाउनलोड करण्यापूर्वी BamiDoc मध्ये अनलॉक करा!`,
            error: "Scribd PDF तयार करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा!",
            themeLight: "लाइट",
            themeDark: "डार्क",
            themeToggleToLight: "लाइट थीमवर स्विच करा",
            themeToggleToDark: "डार्क थीमवर स्विच करा"
        },
        hi: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Scribd दस्तावेज़",
            scanning: "पृष्ठ {done} / {total} स्कैन और लोड हो रहा है...",
            embedding: "छवियां एम्बेड की जा रही हैं...",
            ready: "दस्तावेज़ लोड हो गया! पूर्वावलोकन खुल रहा है...",
            printBtnText: "प्रिंट / PDF के रूप में सहेजें",
            backBtnText: "वापस",
            pagesCount: "{count} पृष्ठ",
            noPages: "इस Scribd पृष्ठ पर कोई दस्तावेज़ पृष्ठ नहीं मिला।",
            gatedNote: (p) => `पृष्ठ {p} धुंधला है: डाउनलोड करने से पहले BamiDoc में अनलॉक करें!`,
            error: "Scribd PDF जनरेट करने में त्रुटि। कृपया पुनः प्रयास करें!",
            themeLight: "लाइट",
            themeDark: "डार्क",
            themeToggleToLight: "लाइट थीम पर स्विच करें",
            themeToggleToDark: "डार्क थीम पर स्विच करें"
        },
        zh_CN: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Scribd 文档",
            scanning: "正在扫描并加载第 {done} / {total} 页...",
            embedding: "正在嵌入图像并优化排版...",
            ready: "文档加载完成！正在打开预览...",
            printBtnText: "打印 / 保存为 PDF",
            backBtnText: "返回",
            pagesCount: "{count} 页",
            noPages: "在该 Scribd 页面未找到任何文档页面。",
            gatedNote: (p) => `第 {p} 页已模糊：下载前请点击 BamiDoc 扩展程序中的“解锁 Scribd”！`,
            error: "生成 Scribd PDF 时出错，请重试！",
            themeLight: "浅色",
            themeDark: "深色",
            themeToggleToLight: "切换至浅色主题",
            themeToggleToDark: "切换至深色主题"
        },
        zh_TW: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Scribd 文件",
            scanning: "正在掃描並載入第 {done} / {total} 頁...",
            embedding: "正在嵌入圖片並最佳化排版...",
            ready: "文件載入完成！正在開啟預覽...",
            printBtnText: "列印 / 另存為 PDF",
            backBtnText: "返回",
            pagesCount: "{count} 頁",
            noPages: "在該 Scribd 頁面未找到任何文檔頁面。",
            gatedNote: (p) => `第 {p} 頁已模糊：下載前請點擊 Doc Downloader 擴充功能中的「解鎖 Scribd」！`,
            error: "產生 Scribd PDF 時發生錯誤，請重試！",
            themeLight: "淺色",
            themeDark: "深色",
            themeToggleToLight: "切換至淺色主題",
            themeToggleToDark: "切換至深色主題"
        },
        ja: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Scribd ドキュメント",
            scanning: "ページをスキャン中 {done} / {total}...",
            embedding: "画像を埋め込み、レイアウトを最適化中...",
            ready: "読み込み完了！プレビューを開いています...",
            printBtnText: "印刷 / PDF保存",
            backBtnText: "戻る",
            pagesCount: "{count} ページ",
            noPages: "この Scribd ページにドキュメントが見つかりませんでした。",
            gatedNote: (p) => `ページ {p} はぼかされています：ダウンロードする前に BamiDoc 拡張機能の「Scribd ロック解除」をクリックしてください！`,
            error: "Scribd PDF 生成中にエラーが発生しました。再試行してください。",
            themeLight: "ライト",
            themeDark: "ダーク",
            themeToggleToLight: "ライトテーマに切り替え",
            themeToggleToDark: "ダークテーマに切り替え"
        },
        ko: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Scribd 문서",
            scanning: "페이지 스캔 및 로딩 중 {done} / {total}...",
            embedding: "이미지 삽입 및 인쇄 레이아웃 최적화 중...",
            ready: "문서 로드 완료! 미리보기 여는 중...",
            printBtnText: "인쇄 / PDF로 저장",
            backBtnText: "돌아가기",
            pagesCount: "{count} 페이지",
            noPages: "Scribd 페이지에서 문서를 찾을 수 없습니다.",
            gatedNote: (p) => `{p} 페이지가 블러 처리되었습니다: 다운로드하기 전에 Doc Downloader 확장 프로그램에서 "Scribd 잠금 해제"를 클릭하세요!`,
            error: "Scribd PDF 생성 중 오류가 발생했습니다. 다시 시도해 주세요!",
            themeLight: "라이트",
            themeDark: "다크",
            themeToggleToLight: "라이트 테마로 전환",
            themeToggleToDark: "다크 테마로 전환"
        },
        es: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Documento Scribd",
            scanning: "Escaneando página {done} / {total}...",
            embedding: "Incrustando imágenes y optimizando diseño...",
            ready: "¡Documento cargado! Abriendo vista previa...",
            printBtnText: "Imprimir / Guardar en PDF",
            backBtnText: "Volver",
            pagesCount: "{count} páginas",
            noPages: "No se encontraron páginas en esta página de Scribd.",
            gatedNote: (p) => `La página {p} está borrosa: ¡Haga clic en "Desbloquear Scribd" en la extensión BamiDoc antes de descargar!`,
            error: "Ocurrió un error al generar el PDF de Scribd. ¡Inténtalo de nuevo!",
            themeLight: "Claro",
            themeDark: "Oscuro",
            themeToggleToLight: "Cambiar a tema claro",
            themeToggleToDark: "Cambiar a tema oscuro"
        },
        fr: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Document Scribd",
            scanning: "Numérisation de la page {done} / {total}...",
            embedding: "Intégration des images et optimisation...",
            ready: "Document chargé ! Ouverture de l'aperçu...",
            printBtnText: "Imprimer / Enregistrer en PDF",
            backBtnText: "Retour",
            pagesCount: "{count} pages",
            noPages: "Aucune page trouvée sur cette page Scribd.",
            gatedNote: (p) => `La page {p} est floue : veuillez cliquer sur « Déverrouiller Scribd » dans l'extension BamiDoc avant de télécharger !`,
            error: "Une erreur est survenue lors de la génération du PDF Scribd. Veuillez réessayer !",
            themeLight: "Clair",
            themeDark: "Sombre",
            themeToggleToLight: "Passer au thème clair",
            themeToggleToDark: "Passer au thème sombre"
        },
        de: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Scribd-Dokument",
            scanning: "Scanne Seite {done} / {total}...",
            embedding: "Bilder einbetten und Layout optimieren...",
            ready: "Dokument geladen! Vorschau wird geöffnet...",
            printBtnText: "Drucken / Als PDF speichern",
            backBtnText: "Zurück",
            pagesCount: "{count} Seiten",
            noPages: "Auf dieser Scribd-Seite wurden keine Dokumentseiten gefunden.",
            gatedNote: (p) => `Seite {p} ist verschwommen: Bitte klicken Sie vor dem Herunterladen in der BamiDoc-Erweiterung auf "Scribd entsperren"!`,
            error: "Fehler beim Erstellen der Scribd-PDF. Bitte versuchen Sie es erneut!",
            themeLight: "Hell",
            themeDark: "Dunkel",
            themeToggleToLight: "Zu hellem Thema wechseln",
            themeToggleToDark: "Zu dunklem Thema wechseln"
        },
        ru: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Документ Scribd",
            scanning: "Сканирование страницы {done} / {total}...",
            embedding: "Встраивание изображений и оптимизация...",
            ready: "Документ загружен! Открытие предпросмотра...",
            printBtnText: "Печать / Сохранить в PDF",
            backBtnText: "Назад",
            pagesCount: "{count} страниц",
            noPages: "На этой странице Scribd не найдено страниц документа.",
            gatedNote: (p) => `Страница {p} размыта: пожалуйста, нажмите «Разблокировать Scribd» в расширении BamiDoc перед загрузкой!`,
            error: "Ошибка при создании PDF Scribd. Пожалуйста, попробуйте снова!",
            themeLight: "Светлая",
            themeDark: "Темная",
            themeToggleToLight: "Переключить на светлую тему",
            themeToggleToDark: "Переключить на темную тему"
        },
        pt: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Documento Scribd",
            scanning: "Escaneando página {done} / {total}...",
            embedding: "Incorporando imagens e otimizando layout...",
            ready: "Documento carregado! Abrindo visualização...",
            printBtnText: "Imprimir / Salvar como PDF",
            backBtnText: "Voltar",
            pagesCount: "{count} páginas",
            noPages: "Nenhuma página encontrada nesta página do Scribd.",
            gatedNote: (p) => `A página {p} está desfocada: clique em "Desbloquear Scribd" na extensão BamiDoc antes de baixar!`,
            error: "Ocorreu um erro ao gerar o PDF do Scribd. Tente novamente!",
            themeLight: "Claro",
            themeDark: "Escuro",
            themeToggleToLight: "Mudar para tema claro",
            themeToggleToDark: "Mudar para tema escuro"
        },
        id: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Dokumen Scribd",
            scanning: "Memindai halaman {done} / {total}...",
            embedding: "Menyematkan gambar dan mengoptimalkan tata letak...",
            ready: "Dokumen dimuat! Membuka pratinjau...",
            printBtnText: "Cetak / Simpan sebagai PDF",
            backBtnText: "Kembali",
            pagesCount: "{count} halaman",
            noPages: "Tidak ada halaman yang ditemukan di halaman Scribd ini.",
            gatedNote: (p) => `Halaman {p} buram: Silakan klik "Buka Kunci Scribd" di ekstensi BamiDoc sebelum mengunduh!`,
            error: "Terjadi kesalahan saat membuat PDF Scribd. Silakan coba lagi!",
            themeLight: "Terang",
            themeDark: "Gelap",
            themeToggleToLight: "Beralih ke tema terang",
            themeToggleToDark: "Beralih ke tema gelap"
        },
        it: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Documento Scribd",
            scanning: "Scansione della pagina {done} / {total}...",
            embedding: "Incorporamento immagini e ottimizzazione layout...",
            ready: "Documento caricato! Apertura anteprima...",
            printBtnText: "Stampa / Salva come PDF",
            backBtnText: "Indietro",
            pagesCount: "{count} pagine",
            noPages: "Nessuna pagina trovata su questa pagina Scribd.",
            gatedNote: (p) => `La pagina {p} è sfocata: fai clic su "Sblocca Scribd" nell'estensione BamiDoc prima di scaricare!`,
            error: "Errore durante la generazione del PDF Scribd. Riprova!",
            themeLight: "Chiaro",
            themeDark: "Scuro",
            themeToggleToLight: "Passa al tema chiaro",
            themeToggleToDark: "Passa al tema scuro"
        },
        nl: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Scribd Document",
            scanning: "Pagina {done} / {total} scannen en laden...",
            embedding: "Afbeeldingen insluiten en lay-out optimaliseren...",
            ready: "Document geladen! Voorbeeld openen...",
            printBtnText: "Afdrukken / Opslaan als PDF",
            backBtnText: "Terug",
            pagesCount: "{count} pagina's",
            noPages: "Geen documentpagina's gevonden op deze Scribd-pagina.",
            gatedNote: (p) => `Pagina {p} is wazig: klik op "Scribd ontgrendelen" in Doc Downloader vóór het downloaden!`,
            error: "Fout bij genereren van Scribd-PDF. Probeer het opnieuw!",
            themeLight: "Licht",
            themeDark: "Donker",
            themeToggleToLight: "Overschakelen naar licht thema",
            themeToggleToDark: "Overschakelen naar donker thema"
        },
        pl: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Dokument Scribd",
            scanning: "Skanowanie i ładowanie strony {done} / {total}...",
            embedding: "Osadzanie obrazów i optymalizacja układu...",
            ready: "Dokument załadowany! Otwieranie podglądu...",
            printBtnText: "Drukuj / Zapisz jako PDF",
            backBtnText: "Wstecz",
            pagesCount: "{count} stron",
            noPages: "Nie znaleziono stron dokumentu na tej stronie Scribd.",
            gatedNote: (p) => `Strona {p} jest zamazana: Kliknij „Odblokuj Scribd” w rozszerzeniu BamiDoc przed pobraniem!`,
            error: "Błąd podczas generowania pliku PDF Scribd. Spróbuj ponownie!",
            themeLight: "Jasny",
            themeDark: "Ciemny",
            themeToggleToLight: "Przełącz na jasny motyw",
            themeToggleToDark: "Przełącz na ciemny motyw"
        },
        tr: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Scribd Belgesi",
            scanning: "Sayfa {done} / {total} taranıyor ve yükleniyor...",
            embedding: "Görseller yerleştiriliyor ve düzen optimize ediliyor...",
            ready: "Belge yüklendi! Önizleme açılıyor...",
            printBtnText: "Yazdır / PDF Olarak Kaydet",
            backBtnText: "Geri",
            pagesCount: "{count} sayfa",
            noPages: "Bu Scribd sayfasında belge sayfası bulunamadı.",
            gatedNote: (p) => `Sayfa {p} bulanık: İndirmeden önce BamiDoc uzantısında "Scribd Kilidini Aç" düğmesine tıklayın!`,
            error: "Scribd PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin!",
            themeLight: "Açık",
            themeDark: "Koyu",
            themeToggleToLight: "Açık temaya geç",
            themeToggleToDark: "Koyu temaya geç"
        },
        th: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "เอกสาร Scribd",
            scanning: "กำลังสแกนและโหลดหน้า {done} / {total}...",
            embedding: "กำลังฝังรูปภาพและจัดรูปแบบ...",
            ready: "โหลดเอกสารเรียบร้อย! กำลังเปิดตัวอย่าง...",
            printBtnText: "พิมพ์ / บันทึกเป็น PDF",
            backBtnText: "ย้อนกลับ",
            pagesCount: "{count} หน้า",
            noPages: "ไม่พบหน้าเอกสารบนหน้า Scribd นี้",
            gatedNote: (p) => `หน้า {p} ถูกเบลอ: โปรดคลิก "ปลดล็อก Scribd" ในส่วนขยาย BamiDoc ก่อนดาวน์โหลด!`,
            error: "เกิดข้อผิดพลาดในการสร้าง PDF จาก Scribd โปรดลองอีกครั้ง!",
            themeLight: "ธีมสว่าง",
            themeDark: "ธีมมืด",
            themeToggleToLight: "เปลี่ยนเป็นธีมสว่าง",
            themeToggleToDark: "เปลี่ยนเป็นธีมมืด"
        },
        ar: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "مستند Scribd",
            scanning: "جارٍ فحص وتحميل الصفحة {done} من {total}...",
            embedding: "جارٍ تضمين الصور وتنسيق الصفحات...",
            ready: "تم تحميل المستند! جارٍ فتح المعاينة...",
            printBtnText: "طباعة / حفظ كـ PDF",
            backBtnText: "رجوع",
            pagesCount: "{count} صفحة",
            noPages: "لم يتم العثور على أي صفحات في هذا المستند.",
            gatedNote: (p) => `الصفحة {p} غير واضحة: يرجى النقر على "إلغاء قفل Scribd" في BamiDoc قبل التنزيل!`,
            error: "حدث خطأ أثناء إنشاء PDF من Scribd. يرجى المحاولة مرة أخرى!",
            themeLight: "فاتح",
            themeDark: "داكن",
            themeToggleToLight: "التبديل إلى الوضع الفاتح",
            themeToggleToDark: "التبديل إلى الوضع الداكن"
        },
        da: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Scribd dokument",
            scanning: "Scanner side {done} / {total}...",
            embedding: "Indlejrer billeder og optimerer layout...",
            ready: "Dokument indlæst! Åbner forhåndsvisning...",
            printBtnText: "Udskriv / Gem som PDF",
            backBtnText: "Tilbage",
            pagesCount: "{count} sider",
            noPages: "Ingen dokumentsider fundet på denne Scribd-side.",
            gatedNote: (p) => `Side {p} er sløret: Lås op i BamiDoc før download!`,
            error: "Fejl ved generering af Scribd-PDF. Prøv igen!",
            themeLight: "Lyst",
            themeDark: "Mørkt",
            themeToggleToLight: "Skift til lyst tema",
            themeToggleToDark: "Skift til mørkt tema"
        },
        sv: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Scribd dokument",
            scanning: "Skannar sida {done} / {total}...",
            embedding: "Bäddar in bilder och optimerar layout...",
            ready: "Dokument laddat! Öppnar förhandsgranskning...",
            printBtnText: "Skriv ut / Spara som PDF",
            backBtnText: "Tillbaka",
            pagesCount: "{count} sidor",
            noPages: "Inga dokumentsidor hittades på denna Scribd-sida.",
            gatedNote: (p) => `Sida {p} är suddig: Lås upp i BamiDoc före nedladdning!`,
            error: "Ett fel uppstod vid generering av Scribd-PDF. Försök igen!",
            themeLight: "Ljust",
            themeDark: "Mörkt",
            themeToggleToLight: "Växla till ljust tema",
            themeToggleToDark: "Växla till mörkt tema"
        },
        cs: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Dokument Scribd",
            scanning: "Skenování stránky {done} / {total}...",
            embedding: "Vkládání obrázků a optimalizace rozvržení...",
            ready: "Dokument načten! Otevírání náhledu...",
            printBtnText: "Tisk / Uložit jako PDF",
            backBtnText: "Zpět",
            pagesCount: "{count} stránek",
            noPages: "Na této stránce Scribd nebyly nalezeny žádné stránky dokumentu.",
            gatedNote: (p) => `Stránka {p} je rozmazaná: Odemkněte v Doc Downloader před stažením!`,
            error: "Při generování PDF Scribd došlo k chybě. Zkuste to znovu!",
            themeLight: "Světlý",
            themeDark: "Tmavý",
            themeToggleToLight: "Přepnout na světlý motiv",
            themeToggleToDark: "Přepnout na tmavý motiv"
        },
        hu: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Scribd dokumentum",
            scanning: "{done} / {total} oldal beolvasása...",
            embedding: "Képek beágyazása és elrendezés optimalizálása...",
            ready: "Dokumentum betöltve! Előnézet megnyitása...",
            printBtnText: "Nyomtatás / Mentés PDF-ként",
            backBtnText: "Vissza",
            pagesCount: "{count} oldal",
            noPages: "Nem találhatók dokumentumoldalak ezen a Scribd-oldalon.",
            gatedNote: (p) => `A(z) {p}. oldal elmosódott: Oldja fel a BamiDoc-ban letöltés előtt!`,
            error: "Hiba történt a Scribd PDF létrehozásakor. Próbálja újra!",
            themeLight: "Világos",
            themeDark: "Sötét",
            themeToggleToLight: "Váltás világos témára",
            themeToggleToDark: "Váltás sötét témára"
        },
        ro: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Document Scribd",
            scanning: "Se scanează pagina {done} / {total}...",
            embedding: "Se încorporează imagini și se optimizează aspectul...",
            ready: "Document încărcat! Se deschide previzualizarea...",
            printBtnText: "Imprimare / Salvare ca PDF",
            backBtnText: "Înapoi",
            pagesCount: "{count} pagini",
            noPages: "Nu s-au găsit pagini de document pe această pagină Scribd.",
            gatedNote: (p) => `Pagina {p} este estompată: Deblocați în BamiDoc înainte de descărcare!`,
            error: "Eroare la generarea PDF Scribd. Încercați din nou!",
            themeLight: "Luminos",
            themeDark: "Întunecat",
            themeToggleToLight: "Comutați la tema luminoasă",
            themeToggleToDark: "Comutați la tema întunecată"
        },
        uk: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Документ Scribd",
            scanning: "Сканування сторінки {done} / {total}...",
            embedding: "Вбудовування зображень та оптимізація...",
            ready: "Документ завантажено! Відкриття попереднього перегляду...",
            printBtnText: "Друк / Зберегти як PDF",
            backBtnText: "Назад",
            pagesCount: "{count} сторінок",
            noPages: "На цій сторінці Scribd не знайдено сторінок документа.",
            gatedNote: (p) => `Сторінка {p} розмита: розблокуйте в Doc Downloader перед завантаженням!`,
            error: "Помилка під час створення PDF Scribd. Спробуйте знову!",
            themeLight: "Світла",
            themeDark: "Темна",
            themeToggleToLight: "Перемкнути на світлу тему",
            themeToggleToDark: "Перемкнути на темну тему"
        },
        bn: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Scribd নথি",
            scanning: "পৃষ্ঠা {done} / {total} স্ক্যান হচ্ছে...",
            embedding: "ছবি এম্বেড করা হচ্ছে এবং বিন্যাস অপ্টিমাইজ করা হচ্ছে...",
            ready: "নথি লোড সম্পন্ন! প্রিভিউ খোলা হচ্ছে...",
            printBtnText: "প্রিন্ট / PDF হিসেবে সংরক্ষণ করুন",
            backBtnText: "ফিরে যান",
            pagesCount: "{count} পৃষ্ঠা",
            noPages: "এই Scribd পৃষ্ঠায় কোনো নথির পৃষ্ঠা পাওয়া যায়নি।",
            gatedNote: (p) => `পৃষ্ঠা {p} ঝাপসা: ডাউনলোডের আগে BamiDoc-এ আনলক করুন!`,
            error: "Scribd PDF তৈরি করতে ত্রুটি হয়েছে। আবার চেষ্টা করুন!",
            themeLight: "হালকা",
            themeDark: "গাঢ়",
            themeToggleToLight: "হালকা থিমে পরিবর্তন করুন",
            themeToggleToDark: "গাঢ় থিমে পরিবর্তন করুন"
        },
        pt_BR: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Documento Scribd",
            scanning: "Escaneando página {done} / {total}...",
            embedding: "Incorporando imagens e otimizando layout...",
            ready: "Documento carregado! Abrindo visualização...",
            printBtnText: "Imprimir / Salvar como PDF",
            backBtnText: "Voltar",
            pagesCount: "{count} páginas",
            noPages: "Nenhuma página encontrada nesta página do Scribd.",
            gatedNote: (p) => `A página {p} está desfocada: clique em "Desbloquear Scribd" na extensão BamiDoc antes de baixar!`,
            error: "Ocorreu um erro ao gerar o PDF do Scribd. Tente novamente!",
            themeLight: "Claro",
            themeDark: "Escuro",
            themeToggleToLight: "Mudar para tema claro",
            themeToggleToDark: "Mudar para tema escuro"
        },
        es_419: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Documento Scribd",
            scanning: "Escaneando página {done} / {total}...",
            embedding: "Incrustando imágenes y optimizando diseño...",
            ready: "¡Documento cargado! Abriendo vista previa...",
            printBtnText: "Imprimir / Guardar en PDF",
            backBtnText: "Volver",
            pagesCount: "{count} páginas",
            noPages: "No se encontraron páginas en esta página de Scribd.",
            gatedNote: (p) => `La página {p} está borrosa: ¡Haga clic en "Desbloquear Scribd" en la extensión BamiDoc antes de descargar!`,
            error: "Ocurrió un error al generar el PDF de Scribd. ¡Inténtalo de nuevo!",
            themeLight: "Claro",
            themeDark: "Oscuro",
            themeToggleToLight: "Cambiar a tema claro",
            themeToggleToDark: "Cambiar a tema oscuro"
        }
    };

    const fallbackT = (lang === 'vi') ? translations.vi : (translations[lang] || translations[rawLang] || translations[lang.split('_')[0]] || translations.en);
    const t = Object.assign({}, fallbackT, window.__banhmi_viewer_t || {});
    t.brandName = "DOC DOWNLOADER";

    // ----------------------------------------------------------------------
    // 2. Toast Tiến Trình Quét Trang (Vị trí Top: 84px; Left: 24px)
    // ----------------------------------------------------------------------
    function showProgressToast(text, pct) {
        let toast = document.getElementById('banhmi-scan-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'banhmi-scan-toast';
            toast.style.cssText = `
                position: fixed !important;
                top: 84px !important;
                left: 24px !important;
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
                box-shadow: 0 10px 30px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.08) !important;
                border: 1px solid rgba(255, 107, 0, 0.15) !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 8px !important;
                min-width: 260px !important;
                max-width: 400px !important;
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
        const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1FA00}-\u{1FAFF}]/gu, '').trim();
        if (labelEl) labelEl.textContent = cleanText;
        if (barEl && pct !== undefined) barEl.style.width = pct + '%';
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
    // 3. Tìm Kiếm Trang & Tiêu Đề Tài Liệu Scribd
    // ----------------------------------------------------------------------
    function getViewerPages() {
        const selectors = [
            'div.outer_page',
            'div.document_page',
            'div[data-page-number]',
            'div.page_container',
            'div.page-container',
            '[id^="page_container_"]',
            'div.page'
        ];
        for (let i = 0; i < selectors.length; i++) {
            const all = document.querySelectorAll(selectors[i]);
            const filtered = Array.prototype.filter.call(all, function (pf) {
                return !pf.closest('#clean-viewer-container');
            });
            if (filtered.length > 0) return filtered;
        }
        return [];
    }

    function getDocumentTitle() {
        const h1 = document.querySelector('h1, .document_title, [data-qa="document-title"]');
        return h1 ? h1.textContent.trim() : (document.title || t.defaultDocName);
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

    // ----------------------------------------------------------------------
    // 4. Cơ Chế Tự Động Cuộn & Bắt Các Trang (Auto-Scan & Capture)
    // ----------------------------------------------------------------------
    function saveScroll() {
        return { y: window.scrollY || 0, x: window.scrollX || 0 };
    }

    function restoreScroll(saved) {
        if (!saved) return;
        try { window.scrollTo(saved.x, saved.y); } catch (e) {}
    }

    function isPageRendered(el) {
        if (!el) return false;
        const hasSpans = el.querySelectorAll('span').length > 3;
        const img = el.querySelector('img, .absimg');
        const imgLoaded = !!(img && (img.complete || img.naturalWidth > 0));
        const hasCanvasOrSvg = !!el.querySelector('canvas, svg');
        const isGatedExplanation = !!el.querySelector('.page_missing_explanation, .page-blur-promo, .promo_overlay');
        return (hasSpans || imgLoaded || hasCanvasOrSvg || isGatedExplanation || el.innerHTML.length > 400);
    }

    function isPageReadyNow(el) {
        if (!el || !isPageRendered(el)) return false;
        const w = el.offsetWidth || 0;
        const h = el.offsetHeight || 0;
        if (w > 50 && h > 50) return true;
        const rect = el.getBoundingClientRect();
        return rect.width > 50 && rect.height > 50;
    }

    function waitForPageReady(pageEl) {
        // Fast-path: Nếu trang đã render sẵn và có kích thước thì hoàn tất tức thì (15ms)
        if (isPageReadyNow(pageEl)) {
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
                if (isPageRendered(pageEl)) {
                    const len = pageEl.innerHTML.length;
                    if (len === lastLen && len > 400) {
                        done();
                        return;
                    }
                    lastLen = len;
                }
                if (tries++ > 35) { // Tối đa ~1.3s mỗi trang nếu mạng chậm
                    done();
                    return;
                }
                setTimeout(check, 35); // Polling siêu tốc 35ms thay vì 150ms
            }

            // MutationObserver: Bắt tức thì thời điểm Scribd chèn nội dung vào trang
            if (typeof MutationObserver !== 'undefined') {
                try {
                    observer = new MutationObserver(function () {
                        if (isPageReadyNow(pageEl)) {
                            done();
                        }
                    });
                    observer.observe(pageEl, { childList: true, subtree: true, attributes: false });
                } catch (e) {}
            }

            check();
        });
    }

    function cleanScribdPage(el, pageNum) {
        const isGatedBefore = (
            el.classList.contains('blurred_page') ||
            el.classList.contains('blur') ||
            el.classList.contains('page_missing') ||
            Boolean(el.querySelector('.page-blur-promo, .page-blur-promo-overlay, .promo_overlay, .between_page_portal, .between_page_ads, .page_missing_explanation, [class*="blur-promo"], [class*="paywall"], [class*="promo"]'))
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

        // 2. Mở khóa display: none và filter: blur
        el.querySelectorAll('[style]').forEach(e => {
            const st = e.getAttribute('style') || '';
            if (/display:\s*none/i.test(st)) {
                e.setAttribute('style', st.replace(/display:\s*none/ig, 'display:block'));
            }
            if (/filter:\s*blur/i.test(st)) {
                e.setAttribute('style', st.replace(/filter:\s*blur\([^)]*\)/ig, 'filter:none'));
            }
        });

        const hasVisuals = el.querySelector('img, .absimg, svg, canvas');
        const textLen = (el.innerText || el.textContent || '').trim().length;
        const isGated = isGatedBefore || (!hasVisuals && textLen < 30);

        return isGated;
    }

    function captureAllPages(pages, onProgress) {
        const saved = saveScroll();
        const captured = [];
        const LOOKAHEAD = 4; // Cuộn đón đầu 3-4 trang tiếp theo để nạp song song

        return new Promise(function (resolve) {
            let i = 0;
            (function next() {
                if (i >= pages.length) {
                    restoreScroll(saved);
                    resolve(captured);
                    return;
                }
                const pageEl = pages[i];
                const pageNum = getScribdPageNumber(pageEl, i);

                // 1. Cuộn đón đầu (Lookahead Pre-scroll): Kích hoạt tải trước 3-4 trang kế tiếp trong nền
                for (let k = 1; k <= LOOKAHEAD; k++) {
                    const nextEl = pages[i + k];
                    if (nextEl && !isPageReadyNow(nextEl)) {
                        try {
                            nextEl.scrollIntoView({ behavior: 'instant', block: 'nearest' });
                        } catch (e) {}
                    }
                }

                // 2. Đưa trang hiện tại vào tâm màn hình
                try {
                    pageEl.scrollIntoView({ behavior: 'instant', block: 'center' });
                } catch (e) {
                    try { pageEl.scrollIntoView(true); } catch (e2) {}
                }
                window.dispatchEvent(new Event('scroll'));

                waitForPageReady(pageEl).then(function () {
                    // Dọn dẹp trang trực tiếp trước khi clone
                    const isGated = cleanScribdPage(pageEl, pageNum);

                    // Đo kích thước thực tế từ LIVE DOM
                    let w = 0, h = 0;
                    const rect = pageEl.getBoundingClientRect();
                    const style = window.getComputedStyle(pageEl);

                    const styleW = parseFloat(style.width);
                    if (!isNaN(styleW) && styleW > 50) w = styleW;
                    else if (rect.width > 50) w = rect.width;

                    const styleH = parseFloat(style.height);
                    if (!isNaN(styleH) && styleH > 50) h = styleH;
                    else if (rect.height > 50) h = rect.height;

                    const img = pageEl.querySelector('img, .absimg');
                    if ((!w || !h) && img && img.naturalWidth > 50 && img.naturalHeight > 50) {
                        if (!w) w = img.naturalWidth;
                        if (!h) h = img.naturalHeight;
                    }

                    const clone = pageEl.cloneNode(true);
                    clone.__docWidth = w > 50 ? Math.round(w) : 0;
                    clone.__docHeight = h > 50 ? Math.round(h) : 0;
                    clone.__pageNumber = pageNum;
                    clone.__isGated = isGated;
                    clone.__originalClassName = pageEl.className;

                    captured.push(clone);
                    i++;
                    if (onProgress) onProgress(i, pages.length);
                    next();
                });
            })();
        });
    }

    // ----------------------------------------------------------------------
    // 5. Nhúng Toàn Bộ Ảnh Sang Base64 Data URI
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
        const targets = Array.prototype.filter.call(root.querySelectorAll('img, .absimg'), function (img) {
            const s = img.getAttribute('src') || '';
            return s && !s.startsWith('data:');
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
    // 6. Xây Dựng Trang Tải (#clean-viewer-container) Chuẩn UI/UX
    // ----------------------------------------------------------------------
    function buildCleanViewer(capturedPages) {
        let currentTheme = window.__banhmi_viewer_theme || 'dark';
        const viewerContainer = document.createElement('div');
        viewerContainer.id = 'clean-viewer-container';
        viewerContainer.className = (currentTheme === 'light') ? 'theme-light' : 'theme-dark';
        if (document.body) {
            document.body.style.backgroundColor = (currentTheme === 'light') ? '#F1F5F9' : '#0F172A';
        }

        // Sticky Top Bar
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

        // Khung chứa các trang
        const pagesWrap = document.createElement('div');
        pagesWrap.className = 'clean-viewer-pages-wrap';

        // Tìm kích thước chuẩn chung của tài liệu từ trang mở khóa đầu tiên
        let fallbackW = 0, fallbackH = 0;
        for (let j = 0; j < capturedPages.length; j++) {
            if (!capturedPages[j].__isGated && capturedPages[j].__docWidth > 50 && capturedPages[j].__docHeight > 50) {
                fallbackW = capturedPages[j].__docWidth;
                fallbackH = capturedPages[j].__docHeight;
                break;
            }
        }
        if (!fallbackW || !fallbackH) {
            for (let j = 0; j < capturedPages.length; j++) {
                if (capturedPages[j].__docWidth > 50 && capturedPages[j].__docHeight > 50) {
                    fallbackW = capturedPages[j].__docWidth;
                    fallbackH = capturedPages[j].__docHeight;
                    break;
                }
            }
        }
        if (!fallbackW || !fallbackH) {
            fallbackW = 595;
            fallbackH = 842;
        }

        capturedPages.forEach(function (pf, idx) {
            const pageNum = pf.__pageNumber || (idx + 1);
            let width = (!pf.__isGated && pf.__docWidth > 50) ? pf.__docWidth : fallbackW;
            let height = (!pf.__isGated && pf.__docHeight > 50) ? pf.__docHeight : fallbackH;

            const newPage = document.createElement('div');
            const origClass = pf.__originalClassName || pf.className || '';
            newPage.className = `std-page ${origClass}`.trim();
            newPage.id = `page-${pageNum}`;
            newPage.setAttribute('data-page-number', pageNum);
            newPage.__docWidth = Math.round(width);
            newPage.__docHeight = Math.round(height);
            newPage.__isGated = !!pf.__isGated;
            newPage.style.width = Math.round(width) + 'px';
            newPage.style.height = Math.round(height) + 'px';
            newPage.style.position = 'relative';
            newPage.style.margin = '0 auto 24px auto';
            newPage.style.transform = 'none';

            if (pf.__isGated) {
                const note = document.createElement('div');
                note.className = 'banhmi-gated-note';
                const msg = typeof t.gatedNote === 'function' ? t.gatedNote(pageNum) : `Trang ${pageNum} đang bị làm mờ: Vui lòng bấm nút "Mở khóa Scribd" trên tiện ích Doc Downloader trước khi tải!`;
                note.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9800" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>${msg}</span>
                `;
                newPage.appendChild(note);
            }

            // Chuyển toàn bộ con của clone pf vào newPage
            while (pf.firstChild) {
                newPage.appendChild(pf.firstChild);
            }

            pagesWrap.appendChild(newPage);
        });

        viewerContainer.appendChild(pagesWrap);
        return viewerContainer;
    }

    // ----------------------------------------------------------------------
    // 7. Kích thước trang in động (@page theo pixel) & Styles Trang Tải
    // ----------------------------------------------------------------------
    function applyScribdPageSizes(container) {
        const pages = container.querySelectorAll('.std-page');
        if (!pages.length) return;

        const rules = [];
        let first = null;
        for (let i = 0; i < pages.length; i++) {
            const p = pages[i];
            const r = p.getBoundingClientRect();
            const w = Math.round((!p.__isGated && r.width > 50) ? r.width : (p.__docWidth || 595));
            const h = Math.round((!p.__isGated && r.height > 50) ? r.height : (p.__docHeight || 842));
            if (!first) first = { w: w, h: h };

            p.style.setProperty('width', w + 'px', 'important');
            p.style.setProperty('height', h + 'px', 'important');

            const name = 'banhmi-scribd-page-' + (i + 1);
            rules.push('@page ' + name + ' { size: ' + w + 'px ' + h + 'px; margin: 0; }');
            p.style.setProperty('page', name);
        }

        if (first) {
            rules.unshift('@page { size: ' + first.w + 'px ' + first.h + 'px; margin: 0; }');
        }

        let style = document.getElementById('banhmi-scribd-page-size-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'banhmi-scribd-page-size-styles';
            document.head.appendChild(style);
        }
        style.textContent = rules.join('\n');
    }

    function injectViewerStyles() {
        let style = document.getElementById('banhmi-scribd-clean-viewer-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'banhmi-scribd-clean-viewer-styles';
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
                object-fit: contain !important;
                display: block !important;
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
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                max-width: 200px !important;
                line-height: 1.35 !important;
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
                display: inline-flex !important;
                align-items: center !important;
                gap: 5px !important;
                background: #F1F5F9 !important;
                color: #475569 !important;
                font-size: 11.5px !important;
                font-weight: 600 !important;
                padding: 0 11px !important;
                height: 28px !important;
                border-radius: 9999px !important;
                border: 1px solid #E2E8F0 !important;
                white-space: nowrap !important;
                flex-shrink: 0 !important;
                box-sizing: border-box !important;
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
                background: linear-gradient(135deg, #FF6B00 0%, #FF8533 100%) !important;
                color: #FFFFFF !important;
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
                background: linear-gradient(135deg, #E65A00 0%, #FF771A 100%) !important;
                box-shadow: 0 6px 18px rgba(255, 107, 0, 0.5) !important;
                transform: translateY(-1px) !important;
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
            #clean-viewer-container.theme-dark .std-page {
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
            #clean-viewer-container.theme-light .std-page {
                box-shadow: 0 6px 24px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04) !important;
            }
            #clean-viewer-container .clean-viewer-pages-wrap {
                margin-top: 24px !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
            }
            #clean-viewer-container .std-page {
                position: relative !important;
                background-color: #ffffff !important;
                box-shadow: 0 6px 24px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04) !important;
                border-radius: 4px !important;
                margin: 0 auto 24px auto !important;
                display: block !important;
                border: none !important;
                overflow: hidden !important;
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
                #clean-viewer-container .std-page { 
                    margin: 0 !important; 
                    padding: 0 !important;
                    box-shadow: none !important;
                    border-radius: 0 !important;
                    border: none !important;
                    overflow: hidden !important;
                    background: #ffffff !important;
                    page-break-after: always;
                    break-after: page;
                    page-break-inside: avoid;
                    break-inside: avoid;
                }
                #clean-viewer-container .std-page:last-child {
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
        if (window.__banhmi_scribd_ad_timer) {
            clearInterval(window.__banhmi_scribd_ad_timer);
            window.__banhmi_scribd_ad_timer = null;
        }
        const viewer = document.getElementById('clean-viewer-container');
        if (viewer) viewer.remove();
        const styles = document.getElementById('banhmi-scribd-clean-viewer-styles');
        if (styles) styles.remove();
        const pageStyles = document.getElementById('banhmi-scribd-page-size-styles');
        if (pageStyles) pageStyles.remove();
        if (document.body) document.body.style.backgroundColor = '';
        document.removeEventListener('keydown', onKeyDownEsc);
        window.__banhmi_scribd_running = false;
    }

    function onKeyDownEsc(e) {
        if (e.key === 'Escape') {
            destroyCleanViewer();
        }
    }

    // ----------------------------------------------------------------------
    // 8. Luồng Thực Thi Chính (Main Execution Workflow)
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
                    startScribdCapture(pages);
                } else if (attempts >= 6) {
                    clearInterval(retryInterval);
                    alert(t.noPages);
                    window.__banhmi_scribd_running = false;
                }
            }, 500);
            return;
        }
        startScribdCapture(pages);
    }

    function startScribdCapture(pages) {

        // Hiện toast tiến trình ở top: 84px; left: 24px;
        const scanTpl = (t && t.scanning) ? t.scanning : '🚀 Scanning & loading page {done} / {total}...';
        showProgressToast(scanTpl.replace('{done}', 1).replace('{total}', pages.length), 5);

        // Bước 1: Tự động cuộn & nạp sạch toàn bộ các trang (5% -> 70%)
        captureAllPages(pages, function (done, total) {
            const pct = Math.round((done / total) * 70);
            const scanTpl2 = (t && t.scanning) ? t.scanning : '🚀 Scanning & loading page {done} / {total}...';
            showProgressToast(scanTpl2.replace('{done}', done).replace('{total}', total), pct);
        }).then(function (capturedPages) {
            if (!capturedPages || capturedPages.length === 0) {
                throw new Error('No pages captured');
            }

            // Bước 2: Tạo "Trang Tải" (#clean-viewer-container)
            const cleanViewer = buildCleanViewer(capturedPages);

            // Bước 3: Nhúng toàn bộ ảnh sang Base64 Data URI (70% -> 100%)
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

                const existing = document.getElementById('clean-viewer-container');
                if (existing) existing.remove();

                document.body.appendChild(cleanViewer);
                injectViewerStyles();
                applyScribdPageSizes(cleanViewer);
                document.addEventListener('keydown', onKeyDownEsc);
                window.__banhmi_scribd_running = false;
                window.__banhmi_scribd_running = false;

                // Tự động đóng popup extension khi ra Trang Tải
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                        chrome.runtime.sendMessage({ action: 'banhmi_close_popup', source: 'clean_viewer_ready' });
                    }
                } catch (e) {}
            }, 400);
        }).catch(function (err) {
            console.error('BamiDoc Scribd Error:', err);
            removeProgressToast();
            alert(t.error);
            window.__banhmi_scribd_running = false;
        });
    }

    run();
})();
