(function () {
    // Ngăn chặn chạy song song nhiều lần
    if (window.__banhmi_slideshare_running) return;
    window.__banhmi_slideshare_running = true;

    // ----------------------------------------------------------------------
    // 1. Đa Ngôn Ngữ (12 Ngôn Ngữ Chuẩn)
    // ----------------------------------------------------------------------
    let rawLang = window.__banhmi_lang || (navigator.language ? navigator.language.replace('-', '_') : 'en');
    let lang = rawLang;
    if (!['zh_CN', 'zh_TW', 'pt_BR', 'es_419'].includes(lang)) {
        lang = lang.split('_')[0];
    }

    const translations = {
        vi: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Tài liệu SlideShare",
            scanning: "🚀 Đang trích xuất slide {done} / {total}...",
            embedding: "Đang nạp ảnh slide chất lượng cao...",
            ready: "Trích xuất slide hoàn tất! Đang mở bản xem trước...",
            printBtnText: "In / Lưu thành PDF",
            backBtnText: "Quay lại",
            pagesCount: "{count} slide",
            noPages: "⚠️ Không tìm thấy slide nào trên trang SlideShare này.\n(Hãy đảm bảo bạn đang ở trang chi tiết slide!)",
            gatedNote: (p) => `Slide {p} đang bị làm mờ: Vui lòng bấm nút "Mở khóa SlideShare" trên tiện ích Doc Downloader trước khi tải!`,
            error: "Lỗi khi trích xuất SlideShare. Vui lòng thử lại!",
            themeLight: "Nền sáng",
            themeDark: "Nền tối",
            themeToggleToLight: "Chuyển sang nền sáng",
            themeToggleToDark: "Chuyển sang nền tối"
        },
        en: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "SlideShare Document",
            scanning: "🚀 Extracting slide {done} / {total}...",
            embedding: "Loading high-resolution slide images...",
            ready: "Slides ready! Opening clean preview...",
            printBtnText: "Print / Save as PDF",
            backBtnText: "Back",
            pagesCount: "{count} slides",
            noPages: "⚠️ No slides found on this SlideShare page.\n(Make sure you are on the document detail page!)",
            gatedNote: (p) => `Slide {p} is blurred: Please click "Unlock SlideShare" in the Doc Downloader extension before downloading!`,
            error: "Error generating SlideShare PDF. Please try again!",
            themeLight: "Light",
            themeDark: "Dark",
            themeToggleToLight: "Switch to Light Theme",
            themeToggleToDark: "Switch to Dark Theme"
        },
        mr: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "SlideShare सादरीकरण",
            scanning: "🚀 स्लाइड {done} / {total} काढत आहे...",
            embedding: "उच्च दर्जाच्या स्लाइड प्रतिमा लोड करत आहे...",
            ready: "स्लाइड्स तयार आहेत! पूर्वावलोकन उघडत आहे...",
            printBtnText: "प्रिंट / PDF म्हणून सेव्ह करा",
            backBtnText: "मागे",
            pagesCount: "{count} स्लाइड्स",
            noPages: "⚠️ कोणतेही स्लाइड आढळले नाही. कृपया तपशील पृष्ठावर असल्याचे तपासा!",
            gatedNote: (p) => `स्लाइड {p} अस्पष्ट आहे: डाउनलोड करण्यापूर्वी BamiDoc मध्ये अनलॉक करा!`,
            error: "SlideShare त्रुटी. कृपया पुन्हा प्रयत्न करा!",
            themeLight: "लाइट",
            themeDark: "डार्क",
            themeToggleToLight: "लाइट थीमवर स्विच करा",
            themeToggleToDark: "डार्क थीमवर स्विच करा"
        },
        hi: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "SlideShare प्रस्तुति",
            scanning: "🚀 स्लाइड {done} / {total} लोड हो रहा है...",
            embedding: "उच्च रिज़ॉल्यूशन स्लाइड छवियां लोड हो रही हैं...",
            ready: "स्लाइड तैयार हैं! पूर्वावलोकन खुल रहा है...",
            printBtnText: "प्रिंट / PDF के रूप में सहेजें",
            backBtnText: "वापस",
            pagesCount: "{count} स्लाइड",
            noPages: "⚠️ कोई स्लाइड नहीं मिली। कृपया दस्तावेज़ विवरण पृष्ठ पर जाएं!",
            gatedNote: (p) => `स्लाइड {p} धुंधली है: डाउनलोड करने से पहले BamiDoc में अनलॉक करें!`,
            error: "SlideShare PDF जनरेट करने में त्रुटि। कृपया पुनः प्रयास करें!",
            themeLight: "लाइट",
            themeDark: "डार्क",
            themeToggleToLight: "लाइट थीम पर स्विच करें",
            themeToggleToDark: "डार्क थीम पर स्विच करें"
        },
        zh_CN: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "SlideShare 演示文稿",
            scanning: "🚀 正在提取第 {done} / {total} 张幻灯片...",
            embedding: "正在加载高清幻灯片图像...",
            ready: "幻灯片加载完成！正在打开预览...",
            printBtnText: "打印 / 保存为 PDF",
            backBtnText: "返回",
            pagesCount: "{count} 页",
            noPages: "⚠️ 未找到任何幻灯片。请确保处于文档详情页！",
            gatedNote: (p) => `第 {p} 页已模糊：下载前请点击 BamiDoc 扩展程序中的“解锁 SlideShare”！`,
            error: "提取 SlideShare 时出错，请重试！",
            themeLight: "浅色",
            themeDark: "深色",
            themeToggleToLight: "切换至浅色主题",
            themeToggleToDark: "切换至深色主题"
        },
        zh_TW: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "SlideShare 簡報",
            scanning: "🚀 正在擷取第 {done} / {total} 張投影片...",
            embedding: "正在載入高畫質投影片圖片...",
            ready: "投影片載入完成！正在開啟預覽...",
            printBtnText: "列印 / 另存為 PDF",
            backBtnText: "返回",
            pagesCount: "{count} 頁",
            noPages: "⚠️ 未找到任何投影片。請確認處於文件詳細頁面！",
            gatedNote: (p) => `第 {p} 頁已模糊：下載前請點擊 Doc Downloader 擴充功能中的「解鎖 SlideShare」！`,
            error: "擷取 SlideShare 時發生錯誤，請重試！",
            themeLight: "淺色",
            themeDark: "深色",
            themeToggleToLight: "切換至淺色主題",
            themeToggleToDark: "切換至深色主題"
        },
        ja: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "SlideShare スライド資料",
            scanning: "🚀 スライドを抽出中 {done} / {total}...",
            embedding: "高解像度スライド画像を読み込み中...",
            ready: "準備完了！プレビューを開いています...",
            printBtnText: "印刷 / PDF保存",
            backBtnText: "戻る",
            pagesCount: "{count} スライド",
            noPages: "⚠️ スライドが見つかりませんでした。詳細ページをご確認ください！",
            gatedNote: (p) => `スライド {p} はぼかされています：ダウンロードする前に BamiDoc 拡張機能の「SlideShare ロック解除」をクリックしてください！`,
            error: "SlideShare 抽出中にエラーが発生しました。再試行してください。",
            themeLight: "ライト",
            themeDark: "ダーク",
            themeToggleToLight: "ライトテーマに切り替え",
            themeToggleToDark: "ダークテーマに切り替え"
        },
        ko: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "SlideShare 프레젠테이션",
            scanning: "🚀 슬라이드 추출 중 {done} / {total}...",
            embedding: "고해상도 슬라이드 이미지 로딩 중...",
            ready: "슬라이드 준비 완료! 미리보기를 여는 중...",
            printBtnText: "인쇄 / PDF로 저장",
            backBtnText: "돌아가기",
            pagesCount: "{count} 슬라이드",
            noPages: "⚠️ 슬라이드를 찾을 수 없습니다. 문서 상세 페이지인지 확인하세요!",
            gatedNote: (p) => `{p} 슬라이드가 블러 처리되었습니다: 다운로드하기 전에 Doc Downloader 확장 프로그램에서 "SlideShare 잠금 해제"를 클릭하세요!`,
            error: "SlideShare 추출 중 오류가 발생했습니다. 다시 시도해 주세요!",
            themeLight: "라이트",
            themeDark: "다크",
            themeToggleToLight: "라이트 테마로 전환",
            themeToggleToDark: "다크 테마로 전환"
        },
        es: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Presentación de SlideShare",
            scanning: "🚀 Extrayendo diapositiva {done} / {total}...",
            embedding: "Cargando imágenes de diapositivas en alta resolución...",
            ready: "¡Diapositivas listas! Abriendo vista previa...",
            printBtnText: "Imprimir / Guardar en PDF",
            backBtnText: "Volver",
            pagesCount: "{count} diapositivas",
            noPages: "⚠️ No se encontraron diapositivas en esta página de SlideShare.",
            gatedNote: (p) => `La diapositiva {p} está borrosa: ¡Haga clic en "Desbloquear SlideShare" en la extensión BamiDoc antes de descargar!`,
            error: "Error al generar el PDF de SlideShare. ¡Inténtalo de nuevo!",
            themeLight: "Claro",
            themeDark: "Oscuro",
            themeToggleToLight: "Cambiar a tema claro",
            themeToggleToDark: "Cambiar a tema oscuro"
        },
        fr: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Présentation SlideShare",
            scanning: "🚀 Extraction de la diapositive {done} / {total}...",
            embedding: "Chargement des images de diapositives haute résolution...",
            ready: "Diapositives prêtes ! Ouverture de l'aperçu...",
            printBtnText: "Imprimer / Enregistrer en PDF",
            backBtnText: "Retour",
            pagesCount: "{count} diapositives",
            noPages: "⚠️ Aucune diapositive trouvée sur cette page SlideShare.",
            gatedNote: (p) => `La diapositive {p} est floue : veuillez cliquer sur « Déverrouiller SlideShare » dans l'extension BamiDoc avant de télécharger !`,
            error: "Erreur lors de la génération du PDF SlideShare. Veuillez réessayer !",
            themeLight: "Clair",
            themeDark: "Sombre",
            themeToggleToLight: "Passer au thème clair",
            themeToggleToDark: "Passer au thème sombre"
        },
        de: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "SlideShare-Präsentation",
            scanning: "🚀 Folie {done} / {total} wird extrahiert...",
            embedding: "Hochauflösende Folienbilder werden geladen...",
            ready: "Folien bereit! Vorschau wird geöffnet...",
            printBtnText: "Drucken / Als PDF speichern",
            backBtnText: "Zurück",
            pagesCount: "{count} Folien",
            noPages: "⚠️ Keine Folien auf dieser SlideShare-Seite gefunden.",
            gatedNote: (p) => `Folie {p} ist verschwommen: Bitte klicken Sie vor dem Herunterladen in der BamiDoc-Erweiterung auf "SlideShare entsperren"!`,
            error: "Fehler beim Erstellen der SlideShare-PDF. Bitte versuchen Sie es erneut!",
            themeLight: "Hell",
            themeDark: "Dunkel",
            themeToggleToLight: "Zu hellem Thema wechseln",
            themeToggleToDark: "Zu dunklem Thema wechseln"
        },
        ru: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Презентация SlideShare",
            scanning: "🚀 Извлечение слайда {done} / {total}...",
            embedding: "Загрузка изображений слайдов высокого разрешения...",
            ready: "Слайды готовы! Открытие предпросмотра...",
            printBtnText: "Печать / Сохранить в PDF",
            backBtnText: "Назад",
            pagesCount: "{count} слайдов",
            noPages: "⚠️ Слайды не найдены на этой странице SlideShare.",
            gatedNote: (p) => `Слайд {p} размыт: пожалуйста, нажмите «Разблокировать SlideShare» в расширении BamiDoc перед загрузкой!`,
            error: "Ошибка при создании PDF SlideShare. Пожалуйста, попробуйте снова!",
            themeLight: "Светлая",
            themeDark: "Темная",
            themeToggleToLight: "Переключить на светлую тему",
            themeToggleToDark: "Переключить на темную тему"
        },
        pt: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Apresentação SlideShare",
            scanning: "🚀 Extraindo slide {done} / {total}...",
            embedding: "Carregando imagens de slides em alta resolução...",
            ready: "Slides prontos! Abrindo visualização...",
            printBtnText: "Imprimir / Salvar como PDF",
            backBtnText: "Voltar",
            pagesCount: "{count} slides",
            noPages: "⚠️ Nenhum slide encontrado nesta página do SlideShare.",
            gatedNote: (p) => `O slide {p} está desfocado: clique em "Desbloquear SlideShare" na extensão BamiDoc antes de baixar!`,
            error: "Erro ao gerar o PDF do SlideShare. Tente novamente!",
            themeLight: "Claro",
            themeDark: "Escuro",
            themeToggleToLight: "Mudar para tema claro",
            themeToggleToDark: "Mudar para tema escuro"
        },
        id: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Presentasi SlideShare",
            scanning: "🚀 Mengekstrak slide {done} / {total}...",
            embedding: "Memuat gambar slide resolusi tinggi...",
            ready: "Slide siap! Membuka pratinjau...",
            printBtnText: "Cetak / Simpan sebagai PDF",
            backBtnText: "Kembali",
            pagesCount: "{count} slide",
            noPages: "⚠️ Tidak ada slide yang ditemukan di halaman SlideShare ini.",
            gatedNote: (p) => `Slide {p} buram: Silakan klik "Buka Kunci SlideShare" di ekstensi BamiDoc sebelum mengunduh!`,
            error: "Terjadi kesalahan saat membuat PDF SlideShare. Silakan coba lagi!",
            themeLight: "Terang",
            themeDark: "Gelap",
            themeToggleToLight: "Beralih ke tema terang",
            themeToggleToDark: "Beralih ke tema gelap"
        },
        it: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Presentazione SlideShare",
            scanning: "🚀 Estrazione diapositiva {done} / {total}...",
            embedding: "Caricamento immagini delle diapositive ad alta risoluzione...",
            ready: "Diapositive pronte! Apertura anteprima...",
            printBtnText: "Stampa / Salva come PDF",
            backBtnText: "Indietro",
            pagesCount: "{count} diapositive",
            noPages: "⚠️ Nessuna diapositiva trovata su questa pagina SlideShare.",
            gatedNote: (p) => `La diapositiva {p} è sfocata: fai clic su "Sblocca SlideShare" nell'estensione BamiDoc prima di scaricare!`,
            error: "Errore durante l'estrazione di SlideShare. Riprova!",
            themeLight: "Chiaro",
            themeDark: "Scuro",
            themeToggleToLight: "Passa al tema chiaro",
            themeToggleToDark: "Passa al tema scuro"
        },
        nl: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "SlideShare Presentatie",
            scanning: "🚀 Dia {done} / {total} extraheren...",
            embedding: "Dia-afbeeldingen in hoge resolutie laden...",
            ready: "Dia's gereed! Voorbeeld openen...",
            printBtnText: "Afdrukken / Opslaan als PDF",
            backBtnText: "Terug",
            pagesCount: "{count} dia's",
            noPages: "⚠️ Geen dia's gevonden op deze SlideShare-pagina.",
            gatedNote: (p) => `Dia {p} is wazig: klik op "SlideShare ontgrendelen" in Doc Downloader vóór het downloaden!`,
            error: "Fout bij extraheren van SlideShare. Probeer het opnieuw!",
            themeLight: "Licht",
            themeDark: "Donker",
            themeToggleToLight: "Overschakelen naar licht thema",
            themeToggleToDark: "Overschakelen naar donker thema"
        },
        pl: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Prezentacja SlideShare",
            scanning: "🚀 Wyodrębnianie slajdu {done} / {total}...",
            embedding: "Ładowanie obrazów slajdów w wysokiej rozdzielczości...",
            ready: "Slajdy gotowe! Otwieranie podglądu...",
            printBtnText: "Drukuj / Zapisz jako PDF",
            backBtnText: "Wstecz",
            pagesCount: "{count} slajdów",
            noPages: "⚠️ Nie znaleziono slajdów na tej stronie SlideShare.",
            gatedNote: (p) => `Slajd {p} jest zamazany: Kliknij „Odblokuj SlideShare” w rozszerzeniu BamiDoc przed pobraniem!`,
            error: "Błąd podczas wyodrębniania SlideShare. Spróbuj ponownie!",
            themeLight: "Jasny",
            themeDark: "Ciemny",
            themeToggleToLight: "Przełącz na jasny motyw",
            themeToggleToDark: "Przełącz na ciemny motyw"
        },
        tr: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "SlideShare Sunumu",
            scanning: "🚀 Slayt {done} / {total} ayıklanıyor...",
            embedding: "Yüksek çözünürlüklü slayt görselleri yükleniyor...",
            ready: "Slaytlar hazır! Önizleme açılıyor...",
            printBtnText: "Yazdır / PDF Olarak Kaydet",
            backBtnText: "Geri",
            pagesCount: "{count} slayt",
            noPages: "⚠️ Bu SlideShare sayfasında slayt bulunamadı.",
            gatedNote: (p) => `Slayt {p} bulanık: İndirmeden önce BamiDoc uzantısında "SlideShare Kilidini Aç" düğmesine tıklayın!`,
            error: "SlideShare PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin!",
            themeLight: "Açık",
            themeDark: "Koyu",
            themeToggleToLight: "Açık temaya geç",
            themeToggleToDark: "Koyu temaya geç"
        },
        th: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "งานนำเสนอ SlideShare",
            scanning: "🚀 กำลังดึงข้อมูลสไลด์ {done} / {total}...",
            embedding: "กำลังโหลดภาพสไลด์ความละเอียดสูง...",
            ready: "สไลด์พร้อมแล้ว! กำลังเปิดตัวอย่าง...",
            printBtnText: "พิมพ์ / บันทึกเป็น PDF",
            backBtnText: "ย้อนกลับ",
            pagesCount: "{count} สไลด์",
            noPages: "⚠️ ไม่พบสไลด์บนหน้า SlideShare นี้",
            gatedNote: (p) => `สไลด์ {p} ถูกเบลอ: โปรดคลิก "ปลดล็อก SlideShare" ในส่วนขยาย BamiDoc ก่อนดาวน์โหลด!`,
            error: "เกิดข้อผิดพลาดในการดึงข้อมูล SlideShare โปรดลองอีกครั้ง!",
            themeLight: "ธีมสว่าง",
            themeDark: "ธีมมืด",
            themeToggleToLight: "เปลี่ยนเป็นธีมสว่าง",
            themeToggleToDark: "เปลี่ยนเป็นธีมมืด"
        },
        ar: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "عرض SlideShare",
            scanning: "🚀 جارٍ استخراج الشريحة {done} من {total}...",
            embedding: "جارٍ تحميل صور الشرائح عالية الدقة...",
            ready: "الشرائح جاهزة! جارٍ فتح المعاينة...",
            printBtnText: "طباعة / حفظ كـ PDF",
            backBtnText: "رجوع",
            pagesCount: "{count} شريحة",
            noPages: "⚠️ لم يتم العثور على أي شرائح في هذا العرض.",
            gatedNote: (p) => `الشريحة {p} غير واضحة: يرجى النقر على "إلغاء قفل SlideShare" في BamiDoc قبل التنزيل!`,
            error: "حدث خطأ أثناء استخراج SlideShare. يرجى المحاولة مرة أخرى!",
            themeLight: "فاتح",
            themeDark: "داكن",
            themeToggleToLight: "التبديل إلى الوضع الفاتح",
            themeToggleToDark: "التبديل إلى الوضع الداكن"
        },
        da: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "SlideShare præsentation",
            scanning: "🚀 Udtrækker slide {done} / {total}...",
            embedding: "Indlæser billeder i høj opløsning...",
            ready: "Slides klar! Åbner forhåndsvisning...",
            printBtnText: "Udskriv / Gem som PDF",
            backBtnText: "Tilbage",
            pagesCount: "{count} slides",
            noPages: "⚠️ Ingen slides fundet på denne SlideShare-side.",
            gatedNote: (p) => `Slide {p} er sløret: Lås op i BamiDoc før download!`,
            error: "Fejl ved generering af SlideShare-PDF. Prøv igen!",
            themeLight: "Lyst",
            themeDark: "Mørkt",
            themeToggleToLight: "Skift til lyst tema",
            themeToggleToDark: "Skift til mørkt tema"
        },
        sv: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "SlideShare presentation",
            scanning: "🚀 Extraherar bild {done} / {total}...",
            embedding: "Läser in högupplösta bilder...",
            ready: "Bilder klara! Öppnar förhandsgranskning...",
            printBtnText: "Skriv ut / Spara som PDF",
            backBtnText: "Tillbaka",
            pagesCount: "{count} bilder",
            noPages: "⚠️ Inga bilder hittades på denna SlideShare-sida.",
            gatedNote: (p) => `Bild {p} är suddig: Lås upp i BamiDoc före nedladdning!`,
            error: "Ett fel uppstod vid generering av SlideShare-PDF. Försök igen!",
            themeLight: "Ljust",
            themeDark: "Mörkt",
            themeToggleToLight: "Växla till ljust tema",
            themeToggleToDark: "Växla till mörkt tema"
        },
        cs: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Prezentace SlideShare",
            scanning: "🚀 Extrakce snímku {done} / {total}...",
            embedding: "Načítání snímků ve vysokém rozlišení...",
            ready: "Snímky připraveny! Otevírání náhledu...",
            printBtnText: "Tisk / Uložit jako PDF",
            backBtnText: "Zpět",
            pagesCount: "{count} snímků",
            noPages: "⚠️ Na této stránce SlideShare nebyly nalezeny žádné snímky.",
            gatedNote: (p) => `Snímek {p} je rozmazaný: Odemkněte v Doc Downloader před stažením!`,
            error: "Při extrakci SlideShare došlo k chybě. Zkuste to znovu!",
            themeLight: "Světlý",
            themeDark: "Tmavý",
            themeToggleToLight: "Přepnout na světlý motiv",
            themeToggleToDark: "Přepnout na tmavý motiv"
        },
        hu: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "SlideShare prezentáció",
            scanning: "🚀 {done} / {total} dia kibontása...",
            embedding: "Nagy felbontású diaképek betöltése...",
            ready: "Diák készen állnak! Előnézet megnyitása...",
            printBtnText: "Nyomtatás / Mentés PDF-ként",
            backBtnText: "Vissza",
            pagesCount: "{count} dia",
            noPages: "⚠️ Nem találhatók diák ezen a SlideShare-oldalon.",
            gatedNote: (p) => `A(z) {p}. dia elmosódott: Oldja fel a BamiDoc-ban letöltés előtt!`,
            error: "Hiba történt a SlideShare kibontásakor. Próbálja újra!",
            themeLight: "Világos",
            themeDark: "Sötét",
            themeToggleToLight: "Váltás világos témára",
            themeToggleToDark: "Váltás sötét témára"
        },
        ro: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Prezentare SlideShare",
            scanning: "🚀 Se extrage diapozitivul {done} / {total}...",
            embedding: "Se încarcă imagini de înaltă rezoluție...",
            ready: "Diapozitive gata! Se deschide previzualizarea...",
            printBtnText: "Imprimare / Salvare ca PDF",
            backBtnText: "Înapoi",
            pagesCount: "{count} diapozitive",
            noPages: "⚠️ Nu s-au găsit diapozitive pe această pagină SlideShare.",
            gatedNote: (p) => `Diapozitivul {p} este estompat: Deblocați în BamiDoc înainte de descărcare!`,
            error: "Eroare la extragerea SlideShare. Încercați din nou!",
            themeLight: "Luminos",
            themeDark: "Întunecat",
            themeToggleToLight: "Comutați la tema luminoasă",
            themeToggleToDark: "Comutați la tema întunecată"
        },
        uk: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Презентація SlideShare",
            scanning: "🚀 Видобування слайда {done} / {total}...",
            embedding: "Завантаження зображень слайдів високої роздільної здатності...",
            ready: "Слайди готові! Відкриття попереднього перегляду...",
            printBtnText: "Друк / Зберегти як PDF",
            backBtnText: "Назад",
            pagesCount: "{count} слайдів",
            noPages: "⚠️ На цій сторінці SlideShare не знайдено слайдів.",
            gatedNote: (p) => `Слайд {p} розмитий: розблокуйте в Doc Downloader перед завантаженням!`,
            error: "Помилка під час видобування SlideShare. Спробуйте знову!",
            themeLight: "Світла",
            themeDark: "Темна",
            themeToggleToLight: "Перемкнути на світлу тему",
            themeToggleToDark: "Перемкнути на темну тему"
        },
        bn: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "SlideShare উপস্থাপনা",
            scanning: "🚀 স্লাইড {done} / {total} নিষ্কাশন করা হচ্ছে...",
            embedding: "উচ্চ রেজোলিউশনের স্লাইড ছবি লোড করা হচ্ছে...",
            ready: "স্লাইড প্রস্তুত! প্রিভিউ খোলা হচ্ছে...",
            printBtnText: "প্রিন্ট / PDF হিসেবে সংরক্ষণ করুন",
            backBtnText: "ফিরে যান",
            pagesCount: "{count} স্লাইড",
            noPages: "⚠️ এই SlideShare পৃষ্ঠায় কোনো স্লাইড পাওয়া যায়নি।",
            gatedNote: (p) => `স্লাইড {p} ঝাপসা: ডাউনলোডের আগে BamiDoc-এ আনলক করুন!`,
            error: "SlideShare PDF তৈরি করতে ত্রুটি হয়েছে। আবার চেষ্টা করুন!",
            themeLight: "হালকা",
            themeDark: "গাঢ়",
            themeToggleToLight: "হালকা থিমে পরিবর্তন করুন",
            themeToggleToDark: "গাঢ় থিমে পরিবর্তন করুন"
        },
        pt_BR: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Apresentação SlideShare",
            scanning: "🚀 Extraindo slide {done} / {total}...",
            embedding: "Carregando imagens de slides em alta resolução...",
            ready: "Slides prontos! Abrindo visualização...",
            printBtnText: "Imprimir / Salvar como PDF",
            backBtnText: "Voltar",
            pagesCount: "{count} slides",
            noPages: "⚠️ Nenhum slide encontrado nesta página do SlideShare.",
            gatedNote: (p) => `O slide {p} está desfocado: clique em "Desbloquear SlideShare" na extensão BamiDoc antes de baixar!`,
            error: "Erro ao gerar o PDF do SlideShare. Tente novamente!",
            themeLight: "Claro",
            themeDark: "Escuro",
            themeToggleToLight: "Mudar para tema claro",
            themeToggleToDark: "Mudar para tema escuro"
        },
        es_419: {
            brandName: "DOC DOWNLOADER",
            defaultDocName: "Presentación de SlideShare",
            scanning: "🚀 Extrayendo diapositiva {done} / {total}...",
            embedding: "Cargando imágenes de diapositivas en alta resolución...",
            ready: "¡Diapositivas listas! Abriendo vista previa...",
            printBtnText: "Imprimir / Guardar en PDF",
            backBtnText: "Volver",
            pagesCount: "{count} diapositivas",
            noPages: "⚠️ No se encontraron diapositivas en esta página de SlideShare.",
            gatedNote: (p) => `La diapositiva {p} está borrosa: ¡Haga clic en "Desbloquear SlideShare" en la extensión BamiDoc antes de descargar!`,
            error: "Error al generar el PDF de SlideShare. ¡Inténtalo de nuevo!",
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
    // 2. Toast Tiến Trình Quét & Trích Xuất (Vị trí Top: 84px; Left: 24px)
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
                box-shadow: 0 16px 40px -4px rgba(15, 23, 42, 0.18), 0 4px 14px -2px rgba(15, 23, 42, 0.08) !important;
                border: 1px solid rgba(0, 0, 0, 0.08) !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 10px !important;
                min-width: 290px !important;
                max-width: 380px !important;
                pointer-events: none !important;
                transition: opacity 0.3s ease, transform 0.3s ease !important;
            `;

            toast.innerHTML = `
                <style>
                    @keyframes banhmi-spin { to { transform: rotate(360deg); } }
                </style>
                <div style="display:flex;align-items:center;gap:12px;">
                    <div style="width:34px;height:34px;border-radius:10px;background:rgba(255,107,0,0.1);border:1px solid rgba(255,107,0,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="animation:banhmi-spin 1s linear infinite;">
                            <circle cx="12" cy="12" r="10" stroke="#FFEDD5" stroke-width="2.5"></circle>
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="#FF6B00" stroke-width="2.5" stroke-linecap="round"></path>
                        </svg>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:2px;flex:1;min-width:0;">
                        <div style="font-size:10.5px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;color:#FF6B00;line-height:1.2;">${t.brandName}</div>
                        <div id="banhmi-toast-msg" style="font-size:12.5px;font-weight:600;color:#1E293B;line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>
                    </div>
                    <span id="banhmi-toast-pct" style="font-size:12px;font-weight:700;color:#FF6B00;font-variant-numeric:tabular-nums;flex-shrink:0;"></span>
                </div>
                <div style="width:100%;height:5px;background:#F1F5F9;border-radius:99px;overflow:hidden;">
                    <div id="banhmi-toast-bar" style="width:0%;height:100%;background:linear-gradient(90deg,#FF6B00,#FFA14A);border-radius:99px;transition:width 0.25s ease;"></div>
                </div>
            `;
            (document.documentElement || document.body).appendChild(toast);
        }

        const msgEl = toast.querySelector('#banhmi-toast-msg');
        const pctEl = toast.querySelector('#banhmi-toast-pct');
        const barEl = toast.querySelector('#banhmi-toast-bar');

        if (msgEl) msgEl.textContent = text;
        if (typeof pct === 'number') {
            const clamped = Math.max(0, Math.min(100, Math.round(pct)));
            if (pctEl) pctEl.textContent = clamped + '%';
            if (barEl) barEl.style.width = clamped + '%';
        }
    }

    function removeProgressToast() {
        const toast = document.getElementById('banhmi-scan-toast');
        if (toast) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-8px)';
            setTimeout(() => toast.remove(), 300);
        }
    }

    // ----------------------------------------------------------------------
    // ----------------------------------------------------------------------
    // 3. Cơ Chế Bypass Chặn Tải & Cào Toàn Bộ SlideShare CDN Đầy Đủ
    // ----------------------------------------------------------------------
    function getSlideShareTotalCount() {
        // 1. Quét đối tượng __NEXT_DATA__
        try {
            const nextDataEl = document.getElementById('__NEXT_DATA__');
            if (nextDataEl) {
                const data = JSON.parse(nextDataEl.textContent);
                let found = 0;
                function searchTotal(obj) {
                    if (!obj || typeof obj !== 'object' || found > 0) return;
                    const candidates = [
                        obj.totalSlides, obj.total_slides, obj.totalSlidesCount, 
                        obj.slidesCount, obj.slideCount, obj.slides_count, 
                        obj.numberOfPages, obj.pageCount, obj.page_count, obj.total
                    ];
                    for (const c of candidates) {
                        if (typeof c === 'number' && c > 0 && c < 2000) {
                            found = c;
                            return;
                        }
                        if (typeof c === 'string' && /^\d+$/.test(c)) {
                            const num = parseInt(c, 10);
                            if (num > 0 && num < 2000) {
                                found = num;
                                return;
                            }
                        }
                    }
                    for (const k in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, k)) {
                            searchTotal(obj[k]);
                            if (found > 0) return;
                        }
                    }
                }
                searchTotal(data);
                if (found > 0) return found;
            }
        } catch (e) {}

        // 2. Quét thẻ schema JSON-LD
        try {
            const jsonLdEls = document.querySelectorAll('script[type="application/ld+json"]');
            for (const el of jsonLdEls) {
                try {
                    const parsed = JSON.parse(el.textContent);
                    const candidates = [parsed.numberOfPages, parsed.totalSlides, parsed.itemCount];
                    for (const c of candidates) {
                        const n = parseInt(c, 10);
                        if (!isNaN(n) && n > 0 && n < 2000) return n;
                    }
                } catch (e) {}
            }
        } catch (e) {}

        // 3. Quét thẻ Meta tags
        const metaSelectors = [
            'meta[name="slideshare:slide_count"]',
            'meta[property="slideshare:total_slides"]',
            'meta[name="slideshare:total_slides"]',
            'meta[itemprop="numberOfPages"]'
        ];
        for (const sel of metaSelectors) {
            const m = document.querySelector(sel);
            if (m) {
                const val = parseInt(m.getAttribute('content'), 10);
                if (!isNaN(val) && val > 0 && val < 2000) return val;
            }
        }

        // 4. Quét các phần tử giao diện người chơi của SlideShare
        const domSelectors = [
            '[data-testid="slideshow-total-pages"]',
            '[data-testid="total-slides"]',
            '.total-pages',
            '[itemprop="numberOfPages"]',
            '.slide-count',
            '.j-total-slides'
        ];
        for (const sel of domSelectors) {
            const el = document.querySelector(sel);
            if (el) {
                const val = parseInt(el.textContent.replace(/\D/g, ''), 10);
                if (!isNaN(val) && val > 0 && val < 2000) return val;
            }
        }

        // 5. Quét chuỗi văn bản trên trang (vd: "1 of 52", "/ 52 slides")
        try {
            const pageTexts = document.body ? document.body.innerText : '';
            const m = pageTexts.match(/(?:of|\/)\s*(\d+)\s*(?:slides?|pages?)?/i);
            if (m) {
                const n = parseInt(m[1], 10);
                if (n > 0 && n < 1000) return n;
            }
        } catch (e) {}

        return 0;
    }

    function probeImageUrl(url) {
        return new Promise(function (resolve) {
            const img = new Image();
            let done = false;
            const timer = setTimeout(function () {
                if (!done) {
                    done = true;
                    img.src = '';
                    resolve(false);
                }
            }, 3500);

            img.onload = function () {
                if (!done) {
                    done = true;
                    clearTimeout(timer);
                    resolve(true);
                }
            };
            img.onerror = function () {
                if (!done) {
                    done = true;
                    clearTimeout(timer);
                    resolve(false);
                }
            };
            img.src = url;
        });
    }

    // Chuyển đổi bất kỳ URL slide nào của SlideShare sang cấu trúc chuẩn (hỗ trợ đổi cả thư mục quality /75/ và hậu tố -2048.jpg)
    function buildSlideShareUrl(baseUrl, slideNum, quality, width) {
        if (!baseUrl) return baseUrl;
        // Dạng chuẩn: https://image.slidesharecdn.com/<doc>/<quality>/<title>-<slideNum>-<width>.jpg
        const m = baseUrl.match(/^(https?:\/\/image\.slidesharecdn\.com\/[^\/]+\/)(\d+)(\/.*[-_])(\d+)([-_]\d+)(\.(?:jpg|jpeg|webp|png)(?:\?.*)?)$/i);
        if (m) {
            const q = quality || 75;
            const w = width || 2048;
            const num = slideNum != null ? slideNum : m[4];
            return `${m[1]}${q}${m[3]}${num}-${w}${m[6]}`;
        }
        return baseUrl;
    }

    function getSlideShareImages() {
        return new Promise(async function (resolve) {
            let totalCount = getSlideShareTotalCount();
            let rawCandidates = [];

            // 1. Quét cấu trúc slides gốc trong __NEXT_DATA__ hoặc các thẻ script JSON (Chứa host, imageLocation, title, imageSizes chuẩn 2048px)
            try {
                const nextDataEl = document.getElementById('__NEXT_DATA__');
                let rootObj = null;
                if (nextDataEl && nextDataEl.textContent) {
                    rootObj = JSON.parse(nextDataEl.textContent);
                }

                let foundSlidesMeta = null;
                let foundTotal = 0;
                let foundDims = null;

                function scanNextData(obj) {
                    if (!obj || typeof obj !== 'object') return;
                    if (obj.slides && typeof obj.slides === 'object' && obj.slides.host && obj.slides.imageLocation && obj.slides.title) {
                        foundSlidesMeta = obj.slides;
                        if (typeof obj.totalSlides === 'number' && obj.totalSlides > 0) {
                            foundTotal = obj.totalSlides;
                        }
                        if (obj.slideDimensions && obj.slideDimensions.width && obj.slideDimensions.height) {
                            foundDims = obj.slideDimensions;
                        }
                    }
                    if (typeof obj === 'string') {
                        if (obj.includes('slidesharecdn.com') && (obj.includes('.jpg') || obj.includes('.png') || obj.includes('.webp'))) {
                            rawCandidates.push(obj);
                        }
                        return;
                    }
                    for (const k in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, k)) {
                            const val = obj[k];
                            if (typeof val === 'string') {
                                if (val.includes('slidesharecdn.com') && (val.includes('.jpg') || val.includes('.png') || val.includes('.webp'))) {
                                    rawCandidates.push(val);
                                }
                            } else if (typeof val === 'object') {
                                scanNextData(val);
                            }
                        }
                    }
                }

                if (rootObj) {
                    scanNextData(rootObj);
                }

                // Nếu trang dùng script inline hoặc hidrat hóa khác, thử quét regex trên toàn bộ script
                if (!foundSlidesMeta) {
                    const scripts = document.querySelectorAll('script');
                    for (const s of scripts) {
                        const txt = s.textContent || '';
                        if (txt.includes('"imageLocation"') && txt.includes('"imageSizes"')) {
                            const locMatch = txt.match(/"imageLocation"\s*:\s*"([^"]+)"/);
                            const titleMatch = txt.match(/"slides"\s*:\s*\{[^}]*"title"\s*:\s*"([^"]+)"/) || txt.match(/"title"\s*:\s*"([^"]+)","imageLocation"/);
                            const totalMatch = txt.match(/"totalSlides"\s*:\s*(\d+)/);
                            if (locMatch && titleMatch) {
                                foundSlidesMeta = {
                                    host: 'https://image.slidesharecdn.com',
                                    imageLocation: locMatch[1],
                                    title: titleMatch[1],
                                    imageSizes: [
                                        { quality: 75, width: 2048 },
                                        { quality: 85, width: 638 },
                                        { quality: 85, width: 320 }
                                    ]
                                };
                                if (totalMatch) foundTotal = parseInt(totalMatch[1], 10);
                                break;
                            }
                        }
                    }
                }

                if (foundDims) {
                    window.__banhmi_slideshare_dimensions = foundDims;
                }
                if (foundTotal > 0) {
                    totalCount = foundTotal;
                }

                if (foundSlidesMeta && totalCount > 0) {
                    const sizes = Array.isArray(foundSlidesMeta.imageSizes) && foundSlidesMeta.imageSizes.length > 0
                        ? foundSlidesMeta.imageSizes.slice().sort((a, b) => (b.width || 0) - (a.width || 0))
                        : [{ quality: 75, width: 2048 }, { quality: 85, width: 638 }, { quality: 85, width: 320 }];
                    window.__banhmi_slideshare_sizes = sizes;
                    const best = sizes[0];
                    const host = (foundSlidesMeta.host || 'https://image.slidesharecdn.com').replace(/\/$/, '');
                    const loc = foundSlidesMeta.imageLocation;
                    const title = foundSlidesMeta.title;

                    console.log(`[BamiDoc SlideShare] Đã lấy chuẩn ${totalCount} slide độ phân giải gốc (${best.width}px, quality ${best.quality}) từ metadata!`);
                    const hdImages = [];
                    for (let i = 1; i <= totalCount; i++) {
                        hdImages.push(`${host}/${loc}/${best.quality}/${title}-${i}-${best.width}.jpg`);
                    }
                    resolve(hdImages);
                    return;
                }
            } catch (e) {}

            console.log('[BamiDoc SlideShare] Tổng số slide phát hiện được:', totalCount);

            // 2. Quét thẻ <link rel="preload" as="image"> (nơi SlideShare luôn đặt link 2048px của slide 1)
            document.querySelectorAll('link[rel="preload"][as="image"]').forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.includes('image.slidesharecdn.com')) {
                    rawCandidates.push(href);
                }
            });

            // 3. Quét DOM <picture> và <img>
            const pictures = document.querySelectorAll('picture');
            pictures.forEach(pic => {
                const source = pic.querySelector('source');
                if (source) {
                    const srcset = source.getAttribute('srcset') || '';
                    srcset.split(',').forEach(p => {
                        const u = p.trim().split(/\s+/)[0];
                        if (u && u.includes('slidesharecdn.com')) rawCandidates.push(u);
                    });
                }
                const img = pic.querySelector('img');
                if (img) {
                    const s = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-full');
                    if (s && s.includes('slidesharecdn.com')) rawCandidates.push(s);
                }
            });

            const imgs = document.querySelectorAll('img');
            imgs.forEach(img => {
                const srcset = img.getAttribute('srcset') || '';
                srcset.split(',').forEach(p => {
                    const u = p.trim().split(/\s+/)[0];
                    if (u && u.includes('slidesharecdn.com')) rawCandidates.push(u);
                });
                const s = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-full');
                if (s && s.includes('slidesharecdn.com')) rawCandidates.push(s);
            });

            // 4. Lọc bỏ các ảnh rác không phải slide
            function isJunkUrl(u) {
                if (!u || typeof u !== 'string') return true;
                if (/avatar|logo|icon|badge|illustration|signup|subscribe|paywall|upsell|placeholder|static|assets\.slidesharecdn\.com\/static|public\.slidesharecdn\.com/i.test(u)) return true;
                if (!u.includes('image.slidesharecdn.com/')) return true;
                return false;
            }

            const validUrls = Array.from(new Set(rawCandidates)).filter(u => !isJunkUrl(u));

            // Ưu tiên chọn URL mẫu có chứa -2048.jpg trước
            validUrls.sort((a, b) => {
                const a2048 = a.includes('-2048.') ? 1 : 0;
                const b2048 = b.includes('-2048.') ? 1 : 0;
                return b2048 - a2048;
            });

            // 5. Tìm Pattern URL của các slide (Tự động nâng cấp thư mục quality sang /75/ và độ phân giải sang -2048.jpg)
            let sampleUrl = null;
            for (const u of validUrls) {
                const m = u.match(/^(https?:\/\/image\.slidesharecdn\.com\/[^\/]+\/\d+\/.*[-_])(\d+)([-_]\d+\.(?:jpg|jpeg|webp|png)(?:\?.*)?)$/i);
                if (m) {
                    const slideNum = parseInt(m[2], 10);
                    if (slideNum >= 1 && slideNum <= 50) {
                        sampleUrl = u;
                        break;
                    }
                }
            }

            let finalImages = [];

            if (sampleUrl) {
                if (totalCount > 0) {
                    console.log(`[BamiDoc SlideShare] Đang sinh ${totalCount} slide chuẩn 2048px từ CDN pattern...`);
                    for (let i = 1; i <= totalCount; i++) {
                        finalImages.push(buildSlideShareUrl(sampleUrl, i, 75, 2048));
                    }
                    resolve(finalImages);
                    return;
                }

                let maxFoundIndex = 1;
                validUrls.forEach(u => {
                    const match = u.match(/[-_](\d+)[-_]\d+\.(?:jpg|jpeg|webp|png)/i) || u.match(/[-_](\d+)\.(?:jpg|jpeg|webp|png)/i);
                    if (match) {
                        const idx = parseInt(match[1], 10);
                        if (idx > maxFoundIndex) maxFoundIndex = idx;
                    }
                });

                const countToGen = Math.max(maxFoundIndex, 20);
                for (let i = 1; i <= countToGen; i++) {
                    finalImages.push(buildSlideShareUrl(sampleUrl, i, 75, 2048));
                }

                if (countToGen <= 20) {
                    let probeIndex = 21;
                    while (probeIndex <= 150) {
                        const testUrl = buildSlideShareUrl(sampleUrl, probeIndex, 75, 2048);
                        const exists = await probeImageUrl(testUrl);
                        if (exists) {
                            finalImages.push(testUrl);
                            probeIndex++;
                        } else {
                            const fallbackUrl = buildSlideShareUrl(sampleUrl, probeIndex, 85, 638);
                            const fallbackExists = await probeImageUrl(fallbackUrl);
                            if (fallbackExists) {
                                finalImages.push(fallbackUrl);
                                probeIndex++;
                                continue;
                            }
                            break;
                        }
                    }
                }

                resolve(finalImages);
                return;
            }

            // Fallback cuối: nâng cấp từng URL trong validUrls lên 2048px
            const upgraded = validUrls.map(u => buildSlideShareUrl(u, null, 75, 2048));
            resolve(upgraded);
        });
    }

    function getSlideShareTitle() {
        const h1 = document.querySelector('h1, [data-testid="slideshow-title"], .slideshow-title, .title-section h1');
        let title = '';
        if (h1) {
            title = h1.getAttribute('title') || h1.getAttribute('aria-label') || h1.textContent.trim();
        }
        if (!title || title.endsWith('...') || title.endsWith('…')) {
            if (document.title) {
                const dt = document.title.replace(/\s*[-–|]\s*(SlideShare|LinkedIn SlideShare).*$/i, '').trim();
                if (dt && dt.length > (title ? title.length : 0)) {
                    title = dt;
                }
            }
        }
        return title || (document.title ? document.title.replace(/\s*[-–|]\s*(SlideShare|LinkedIn SlideShare).*$/i, '').trim() : '') || t.defaultDocName;
    }

    // ----------------------------------------------------------------------
    // 4. Nạp Trước Ảnh Slide Độ Phân Giải Gốc 2048px (Không Dùng crossOrigin Để Tránh Lỗi CORS Của SlideShare CDN)
    // ----------------------------------------------------------------------
    function preloadSingleSlide(url) {
        return new Promise(function (resolve) {
            if (!url || url.startsWith('data:')) {
                resolve(url);
                return;
            }

            // Tạo danh sách các mức độ phân giải từ cao xuống thấp đúng chuẩn thư mục CDN của SlideShare:
            // 1. /75/...-2048.jpg (Ultra HD 2048x1152)
            // 2. /95/...-1024.jpg (HD 1024px)
            // 3. /85/...-1024.jpg
            // 4. /85/...-638.jpg (SD 638px)
            // 5. /85/...-320.jpg
            const candidates = [
                buildSlideShareUrl(url, null, 75, 2048),
                buildSlideShareUrl(url, null, 95, 1024),
                buildSlideShareUrl(url, null, 85, 1024),
                buildSlideShareUrl(url, null, 85, 638),
                buildSlideShareUrl(url, null, 85, 320),
                url
            ];
            const uniqueCandidates = Array.from(new Set(candidates.filter(Boolean)));

            function tryLoadIndex(idx) {
                if (idx >= uniqueCandidates.length) {
                    resolve(uniqueCandidates[0] || url);
                    return;
                }
                const candidateUrl = uniqueCandidates[idx];
                const img = new Image();
                // Tuyệt đối KHÔNG gán img.crossOrigin = 'anonymous' vì image.slidesharecdn.com không trả về header ACAO,
                // nếu gán crossOrigin trình duyệt sẽ báo lỗi CORS và làm tụt độ phân giải từ 2048px xuống 638px!
                img.decoding = 'sync';

                let settled = false;
                const timer = setTimeout(function () {
                    if (!settled) {
                        settled = true;
                        tryLoadIndex(idx + 1);
                    }
                }, 8000);

                img.onload = function () {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);
                    if (img.naturalWidth > 100 && img.naturalHeight > 100) {
                        const prev = window.__banhmi_slideshare_natural_size;
                        if (!prev || img.naturalWidth > prev.width) {
                            window.__banhmi_slideshare_natural_size = {
                                width: img.naturalWidth,
                                height: img.naturalHeight
                            };
                        }
                    }
                    resolve(candidateUrl);
                };

                img.onerror = function () {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);
                    tryLoadIndex(idx + 1);
                };

                img.src = candidateUrl;
            }

            tryLoadIndex(0);
        });
    }

    function preloadAndEmbedImages(urls, onProgress) {
        return new Promise(function (resolve) {
            if (!urls || urls.length === 0) {
                resolve([]);
                return;
            }
            const map = {};
            let index = 0;
            let done = 0;
            const CONCURRENCY = 6;

            function worker() {
                if (index >= urls.length) return Promise.resolve();
                const current = urls[index++];
                return preloadSingleSlide(current).then(function (bestUrl) {
                    map[current] = bestUrl || current;
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
                const results = urls.map(u => map[u] || u);
                resolve(results);
            });
        });
    }

    // ----------------------------------------------------------------------
    // 5. Xây Dựng Trang Tải (#clean-viewer-container) Chuẩn UI/UX
    // ----------------------------------------------------------------------
    function buildCleanViewer(images) {
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

        // Cụm trái: Logo + Tên Brand + Tên tài liệu + Huy hiệu số slide
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
            <div class="clean-viewer-docname" title="${getSlideShareTitle()}">${getSlideShareTitle()}</div>
        `;

        const badge = document.createElement('div');
        badge.className = 'clean-viewer-badge';
        badge.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <span>${((t && t.pagesCount) ? t.pagesCount : '{count} pages').replace('{count}', images.length)}</span>
        `;

        leftDiv.appendChild(logoDiv);
        leftDiv.appendChild(titleWrap);
        leftDiv.appendChild(badge);

        // Cụm giữa: Khoảng đệm trống tinh gọn (không quảng cáo)
        const centerDiv = document.createElement('div');
        centerDiv.className = 'clean-viewer-center';

        // Cụm phải: Nút chuyển theme, Nút In PDF và Nút Quay lại
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

        // Khung chứa các slide
        const pagesWrap = document.createElement('div');
        pagesWrap.className = 'clean-viewer-pages-wrap';

        images.forEach((imgUrl, index) => {
            const slideNum = index + 1;
            const newPage = document.createElement('div');
            newPage.className = 'slideshare-clean-page';
            newPage.id = `slide-${slideNum}`;

            const img = document.createElement('img');
            img.src = imgUrl;
            img.loading = 'eager';
            img.decoding = 'sync';
            img.style.cssText = "width: 100%; height: 100%; object-fit: contain; display: block; image-rendering: -webkit-optimize-contrast; image-rendering: high-quality;";

            function attachGatedNote() {
                if (newPage.querySelector('.banhmi-gated-note')) return;
                const note = document.createElement('div');
                note.className = 'banhmi-gated-note';
                const msgText = typeof t.gatedNote === 'function' ? t.gatedNote(slideNum) : `Slide ${slideNum} đang bị làm mờ: Vui lòng bấm nút "Mở khóa SlideShare" trên tiện ích Doc Downloader trước khi tải!`;
                note.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9800" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>${msgText}</span>
                `;
                newPage.appendChild(note);
            }

            const isGatedUrl = typeof imgUrl === 'string' && (/blur|placeholder|gated|locked/i.test(imgUrl));
            if (isGatedUrl) {
                attachGatedNote();
            }

            img.addEventListener('error', () => {
                attachGatedNote();
            });

            newPage.appendChild(img);
            pagesWrap.appendChild(newPage);
        });

        viewerContainer.appendChild(pagesWrap);
        return viewerContainer;
    }

    // ----------------------------------------------------------------------
    // 6. Inject Styles & Print Media Queries
    // ----------------------------------------------------------------------
    function injectViewerStyles() {
        let style = document.getElementById('banhmi-slideshare-clean-viewer-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'banhmi-slideshare-clean-viewer-styles';
            document.head.appendChild(style);
        }

        const nat = window.__banhmi_slideshare_natural_size || window.__banhmi_slideshare_dimensions || { width: 2048, height: 1152 };
        const ratio = (nat.width > 0 && nat.height > 0) ? (nat.height / nat.width) : (9 / 16);
        const screenW = 1050;
        const screenH = Math.round(screenW * ratio);
        const printW = nat.width >= 1280 ? Math.round(nat.width) : 2048;
        const printH = Math.round(printW * ratio);

        style.textContent = `
            body { 
                background-color: #0F172A !important; 
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
                background: #0F172A !important;
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
                padding: 10px 20px !important;
                min-height: 58px !important;
                background: rgba(15, 23, 42, 0.94) !important;
                backdrop-filter: blur(16px) !important;
                -webkit-backdrop-filter: blur(16px) !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25) !important;
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
                color: #F8FAFC !important;
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
                display: inline-flex !important;
                align-items: center !important;
                gap: 5px !important;
                padding: 0 11px !important;
                height: 28px !important;
                border-radius: 9999px !important;
                box-sizing: border-box !important;
                background: rgba(255, 255, 255, 0.1) !important;
                color: #CBD5E1 !important;
                font-size: 11.5px !important;
                font-weight: 600 !important;
                flex-shrink: 0 !important;
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
                box-shadow: 0 4px 14px rgba(255, 107, 0, 0.4) !important;
                transition: all 0.2s ease !important;
                white-space: nowrap !important;
                flex-shrink: 0 !important;
            }
            #clean-viewer-container .clean-viewer-btn-print:hover {
                background: linear-gradient(135deg, #E65A00 0%, #FF771A 100%) !important;
                box-shadow: 0 6px 18px rgba(255, 107, 0, 0.55) !important;
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
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
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
            #clean-viewer-container.theme-dark .slideshare-clean-page {
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5) !important;
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
                border: 1px solid #E2E8F0 !important;
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
            #clean-viewer-container.theme-light .clean-viewer-btn-close {
                background: #FFFFFF !important;
                color: #475569 !important;
                border: 1px solid #CBD5E1 !important;
            }
            #clean-viewer-container.theme-light .clean-viewer-btn-close:hover {
                background: #F8FAFC !important;
                color: #0F172A !important;
                border-color: #94A3B8 !important;
            }
            #clean-viewer-container.theme-light .slideshare-clean-page {
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15) !important;
            }
            #clean-viewer-container .clean-viewer-pages-wrap {
                margin-top: 24px !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                gap: 24px !important;
                width: 100% !important;
                max-width: 1100px !important;
            }
            .slideshare-clean-page {
                position: relative !important;
                width: ${screenW}px !important;
                height: ${screenH}px !important;
                max-width: 95vw !important;
                background-color: #000000 !important;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5) !important;
                border-radius: 6px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
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
            @page {
                size: ${printW}px ${printH}px;
                margin: 0;
            }
            @media print {
                html, body { 
                    margin: 0 !important;
                    padding: 0 !important;
                    background-color: #ffffff !important; 
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                body > *:not(#clean-viewer-container) { 
                    display: none !important; 
                }
                #clean-viewer-container { 
                    display: block !important;
                    position: static !important; 
                    width: ${printW}px !important; 
                    padding: 0 !important; 
                    margin: 0 !important; 
                    background: #ffffff !important;
                }
                #clean-viewer-container .clean-viewer-bar { 
                    display: none !important; 
                }
                #clean-viewer-container .clean-viewer-pages-wrap {
                    display: block !important;
                    position: static !important;
                    width: ${printW}px !important;
                    max-width: none !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    gap: 0 !important;
                }
                .slideshare-clean-page {
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    position: relative !important;
                    width: ${printW}px !important;
                    height: ${printH}px !important;
                    max-width: none !important;
                    max-height: none !important;
                    box-sizing: border-box !important;
                    margin: 0 !important; 
                    padding: 0 !important;
                    box-shadow: none !important;
                    border-radius: 0 !important;
                    background: #ffffff !important;
                    page-break-before: auto !important;
                    page-break-after: always !important;
                    break-after: page !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    border: none !important;
                    overflow: hidden !important;
                }
                .slideshare-clean-page:last-child {
                    page-break-after: auto !important;
                    break-after: auto !important;
                }
                .slideshare-clean-page img {
                    width: ${printW}px !important;
                    height: ${printH}px !important;
                    object-fit: contain !important;
                    display: block !important;
                    image-rendering: -webkit-optimize-contrast !important;
                    image-rendering: high-quality !important;
                }
                .banhmi-gated-note {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            }
        `;
    }

    function destroyCleanViewer() {
        if (window.__banhmi_slideshare_ad_timer) {
            clearInterval(window.__banhmi_slideshare_ad_timer);
            window.__banhmi_slideshare_ad_timer = null;
        }
        const viewer = document.getElementById('clean-viewer-container');
        if (viewer) viewer.remove();
        const styles = document.getElementById('banhmi-slideshare-clean-viewer-styles');
        if (styles) styles.remove();
        if (document.body) {
            document.body.style.backgroundColor = '';
        }
        document.removeEventListener('keydown', onKeyDownEsc);
        window.__banhmi_slideshare_running = false;
    }

    function onKeyDownEsc(e) {
        if (e.key === 'Escape') {
            destroyCleanViewer();
        }
    }

    // ----------------------------------------------------------------------
    // 7. Luồng Thực Thi Chính (Main Execution Workflow)
    // ----------------------------------------------------------------------
    function run() {
        const scanTpl = (t && t.scanning) ? t.scanning : '🚀 Scanning & loading page {done} / {total}...';
        showProgressToast(scanTpl.replace('{done}', 1).replace('{total}', '...'), 5);

        getSlideShareImages().then(function (rawImages) {
            if (!rawImages || rawImages.length === 0) {
                removeProgressToast();
                alert(t.noPages);
                window.__banhmi_slideshare_running = false;
                return;
            }

            // Hiện toast tiến trình ở top: 84px; left: 24px;
            const scanTpl2 = (t && t.scanning) ? t.scanning : '🚀 Scanning & loading page {done} / {total}...';
            showProgressToast(scanTpl2.replace('{done}', 1).replace('{total}', rawImages.length), 10);

            // Nạp và nhúng ảnh slide dạng Base64 để chống trắng trang khi in (10% -> 85%)
            preloadAndEmbedImages(rawImages, function (done, total) {
                const pct = 10 + Math.round((done / total) * 75);
                showProgressToast(t.scanning.replace('{done}', done).replace('{total}', total), pct);
            }).then(function (embeddedImages) {
                showProgressToast(t.ready, 95);
                return buildCleanViewer(embeddedImages);
            }).then(function (cleanViewer) {
                showProgressToast(t.ready, 100);
                setTimeout(function () {
                    removeProgressToast();

                    const existing = document.getElementById('clean-viewer-container');
                    if (existing) existing.remove();

                    document.body.appendChild(cleanViewer);
                    injectViewerStyles();
                    document.addEventListener('keydown', onKeyDownEsc);
                    window.__banhmi_slideshare_running = false;
                    window.__banhmi_slideshare_running = false;

                    // Tự động đóng popup extension khi ra Trang Tải
                    try {
                        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                            chrome.runtime.sendMessage({ action: 'banhmi_close_popup', source: 'clean_viewer_ready' });
                        }
                    } catch (e) {}
                }, 400);
            });
        }).catch(function (err) {
            console.error('BamiDoc SlideShare Error:', err);
            removeProgressToast();
            alert(t.error);
            window.__banhmi_slideshare_running = false;
        });
    }

    run();
})();
