(function () {
  const OriginalWorker = window.Worker;

  window.Worker = function (...args) {
    console.log('%c[Worker] Tạo mới:', 'color: green; font-weight: bold', args[0]);
    const worker = new OriginalWorker(...args);

    // ---- Bóc từng lớp bọc cho tới khi ra được ["room/message", {...}] ----
    function normalize(raw, depth = 0) {
      if (depth > 5) return null; // tránh lặp vô hạn

      let value = raw;

      // Nếu là string -> thử parse JSON
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch {
          return null;
        }
      }

      if (!value || typeof value !== 'object') return null;

      // Trường hợp đích: ["room/message", {...}]
      if (Array.isArray(value) && value[0] === 'room/message') {
        return value;
      }

      // Trường hợp: ["send", "chuỗi JSON"]
      if (Array.isArray(value) && value[0] === 'send' && typeof value[1] === 'string') {
        return normalize(value[1], depth + 1);
      }

      // Trường hợp: ["onmessage", số, { data: "chuỗi JSON" }]
      if (Array.isArray(value) && value[0] === 'onmessage') {
        const wrapper = value[2];
        if (wrapper && typeof wrapper === 'object' && typeof wrapper.data === 'string') {
          return normalize(wrapper.data, depth + 1);
        }
        return null;
      }

      // Trường hợp: object có field .data là string JSON
      if (!Array.isArray(value) && typeof value.data === 'string') {
        return normalize(value.data, depth + 1);
      }

      return null;
    }

    // Format đáp án theo từng loại slide.type 
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

    function printSlide(slide, direction) {
      if (slide === null || slide === undefined) return;

      const answerText = formatAnswer(slide);

      console.log(
        `%c[SlideObject | ${direction}]`,
        'color: blue; font-weight: bold',
        `\nLoại: ${slide.type}` +
        `\nCâu hỏi: ${slide.question}` +
        `\nĐáp án đúng: ${answerText}`
      );
    }

    function handleData(raw, direction) {
      const parsed = normalize(raw);
      if (!parsed) return;

      const payload = parsed[1];
      const message = payload?.message;
      if (!message) return;

      if (Array.isArray(message.patch)) {
        for (const p of message.patch) {
          if (p.path !== '/slideObject') continue;
          printSlide(p.value, direction);
        }
      }

      if (message.state && 'slideObject' in message.state) {
        printSlide(message.state.slideObject, direction);
      }
    }

    worker.addEventListener('message', (event) => {
      handleData(event.data, 'Worker → Main');
    });

    const originalPostMessage = worker.postMessage.bind(worker);
    worker.postMessage = function (msg, ...rest) {
      handleData(msg, 'Main → Worker');
      return originalPostMessage(msg, ...rest);
    };

    return worker;
  };

  window.Worker.prototype = OriginalWorker.prototype;
})();