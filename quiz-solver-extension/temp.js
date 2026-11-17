(function () {
  const OriginalWorker = window.Worker;

  window.Worker = function (...args) {
    console.log('%c[Worker] Tạo mới:', 'color: green; font-weight: bold', args[0]);
    const worker = new OriginalWorker(...args);

    // ---- Bóc từng lớp bọc cho tới khi ra được ["room/message", {...}] ----
    function normalize(raw, depth = 0) {
      if (depth > 5) return null;

      let value = raw;

      if (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch {
          return null;
        }
      }

      if (!value || typeof value !== 'object') return null;

      if (Array.isArray(value) && value[0] === 'room/message') {
        return value;
      }

      if (Array.isArray(value) && value[0] === 'send' && typeof value[1] === 'string') {
        return normalize(value[1], depth + 1);
      }

      if (Array.isArray(value) && value[0] === 'onmessage') {
        const wrapper = value[2];
        if (wrapper && typeof wrapper === 'object' && typeof wrapper.data === 'string') {
          return normalize(wrapper.data, depth + 1);
        }
        return null;
      }

      if (!Array.isArray(value) && typeof value.data === 'string') {
        return normalize(value.data, depth + 1);
      }

      return null;
    }

    // ---- Format đáp án để hiển thị (giữ nguyên) ----
    function formatAnswer(slide) {
      const answers = slide.answers || [];

      switch (slide.type) {
        case 'Classic':
        case 'TypeAnswer': {
          const correct = answers.find(a => a.isCorrect);
          return correct ? correct.text : '(không tìm thấy)';
        }
        case 'CheckBoxes': {
          const corrects = answers.filter(a => a.isCorrect).map(a => a.text);
          return corrects.length ? corrects.join(', ') : '(không tìm thấy)';
        }
        case 'Reorder': {
          const sorted = [...answers].sort((a, b) => a.pos - b.pos);
          return sorted.map(a => a.text).join(' → ');
        }
        case 'Range': {
          const correct = answers.find(a => a.isCorrect);
          return correct ? correct.text : '(không tìm thấy)';
        }
        default: {
          const corrects = answers.filter(a => a.isCorrect).map(a => a.text);
          return corrects.length ? corrects.join(', ') : '(không xác định loại: ' + slide.type + ')';
        }
      }
    }

    // ---- Tạo object answer theo loại câu hỏi ----
    function createAnswerObject(slide) {
      const answers = slide.answers || [];
      let answerValue;

      switch (slide.type) {
        case 'Classic': {
          const correctIndex = answers.findIndex(a => a.isCorrect);
          answerValue = correctIndex; // 0-based index
          break;
        }
        case 'CheckBoxes': {
          answerValue = answers.map(a => a.isCorrect); // mảng boolean
          break;
        }
        case 'Reorder': {
          // Sắp xếp các chỉ số theo thứ tự pos tăng dần
          const sortedIndices = answers
            .map((_, idx) => idx)
            .sort((a, b) => answers[a].pos - answers[b].pos);
          answerValue = sortedIndices;
          break;
        }
        case 'Range':
        case 'TypeAnswer': {
          const correct = answers.find(a => a.isCorrect);
          answerValue = correct ? correct.text : '';
          break;
        }
        default: {
          // Fallback: lấy tất cả đáp án đúng (dạng mảng hoặc chuỗi)
          const corrects = answers.filter(a => a.isCorrect).map(a => a.text);
          answerValue = corrects.length === 1 ? corrects[0] : corrects;
        }
      }

      return {
        slideIndex: slide.index,
        answer: answerValue,
        progress: 0.5,          // có thể điều chỉnh hoặc bỏ qua
        unsubmitted: false,
        timestamp: Date.now()
      };
    }

    // ---- Xử lý slideObject: log + tự động gửi đáp án ----
    const answeredSlides = new Set(); // tránh gửi trùng lặp

    function handleSlideObject(slide, direction, roomId, originalPostMessage) {
      if (slide === null || slide === undefined) return;

      // 1. Log đáp án (giữ nguyên chức năng cũ)
      const answerText = formatAnswer(slide);
      console.log(
        `%c[SlideObject | ${direction}]`,
        'color: blue; font-weight: bold',
        `\nLoại: ${slide.type}` +
        `\nCâu hỏi: ${slide.question}` +
        `\nĐáp án đúng: ${answerText}`
      );

      // 2. Nếu là nhận từ server và chưa trả lời slide này
      if (direction === 'Worker → Main' && !answeredSlides.has(slide.index)) {
        const answerObj = createAnswerObject(slide);
        const answerMessage = [
          "room/message",
          {
            roomId: roomId,
            message: {
              answer: answerObj,
              serverTimestamp: Date.now()
            }
          }
        ];


        // Gửi qua originalPostMessage để tránh bị intercept lại
        originalPostMessage(answerMessage);
        console.log(`%c[Auto-Answer] Đã gửi đáp án cho slide ${slide.index}`, 'color: orange;');
        console.log(`%c[Auto-Answer] Nội dung gửi:`, 'color: orange;', answerMessage);

        answeredSlides.add(slide.index);
      }
    }

    // ---- Xử lý message chính (giữ nguyên, chỉ sửa chỗ gọi printSlide) ----
    function handleData(raw, direction, originalPostMessage) {
      const parsed = normalize(raw);
      if (!parsed) return;

      const payload = parsed[1];
      const message = payload?.message;
      if (!message) return;

      // Lấy roomId từ payload (dùng để gửi answer)
      const roomId = payload.roomId || null;

      if (Array.isArray(message.patch)) {
        for (const p of message.patch) {
          if (p.path !== '/slideObject') continue;
          // Thay vì gọi printSlide, gọi handleSlideObject
          handleSlideObject(p.value, direction, roomId, originalPostMessage);
        }
      }

      if (message.state && 'slideObject' in message.state) {
        handleSlideObject(message.state.slideObject, direction, roomId, originalPostMessage);
      }
    }

    // ---- Intercept message từ Worker ----
    worker.addEventListener('message', (event) => {
      handleData(event.data, 'Worker → Main', originalPostMessage);
    });
    
    // ---- Intercept message gửi tới Worker ----
    const originalPostMessage = worker.postMessage.bind(worker);
    worker.postMessage = function (msg, ...rest) {
      handleData(msg, 'Main → Worker', originalPostMessage);
      return originalPostMessage(msg, ...rest);
    };

    return worker;
  };

  window.Worker.prototype = OriginalWorker.prototype;
})();