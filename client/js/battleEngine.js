/**
 * EduRank Battle Engine v2.0
 * Standardized battle controller for Classic, Ranked, Custom, and VS AI matches.
 */
class BattleEngine {
  constructor(options = {}) {
    this.mode = options.mode || 'classic'; // classic, ranked, custom, ai
    this.difficulty = options.difficulty || 'medium'; // easy, medium, hard
    this.subject = options.subject || 'Fisika';
    this.subjectId = options.subjectId || 1;
    this.user = JSON.parse(localStorage.getItem('edurank-user') || '{}');
    this.token = localStorage.getItem('edurank-token');
    
    this.currentQuestionIndex = 0;
    this.userScore = 0;
    this.opponentScore = 0;
    this.questions = [];
    this.userAnswers = [];
    this.opponentAnswers = [];
    this.timer = null;
    this.secondsLeft = 30;
    this.maxTime = 30;
    this.isAnswered = false;
    this.socket = null;
    this.roomId = options.roomId || null;
    this.opponent = options.opponent || { name: 'AI Computer', isAi: true };

    this.init();
  }

  async init() {
    this.loadQuestionBank();
    this.bindUI();

    if (this.mode === 'ai') {
      this.setupAiOpponent();
      this.startQuestion();
    } else {
      this.initSocket();
    }
  }

  loadQuestionBank() {
    // Dynamic question bank per subject
    const subjectQuestions = {
      'Fisika': [
        { q: 'Berapakah percepatan gravitasi standar di bumi?', options: ['9.8 m/s²', '8.9 m/s²', '10.5 m/s²', '12 m/s²'], answer: 0 },
        { q: 'Hukum Newton II dirumuskan sebagai:', options: ['F = m / a', 'F = m × a', 'F = m + a', 'F = m² × a'], answer: 1 },
        { q: 'Satuan Standar Internasional (SI) untuk usaha adalah:', options: ['Watt', 'Pascal', 'Joule', 'Newton'], answer: 2 },
        { q: 'Energi kinetik suatu benda bermassa m bermuatan v adalah:', options: ['½ m v²', 'm v', 'm g h', '½ m² v'], answer: 0 },
        { q: 'Kecepatan cahaya di ruang hampa adalah sebesar:', options: ['3 × 10⁸ m/s', '3 × 10⁶ m/s', '1.5 × 10⁸ m/s', '3 × 10¹⁰ m/s'], answer: 0 },
        { q: 'Bunyi merambat paling cepat pada medium:', options: ['Udara', 'Air', 'Padat (Besi)', 'Hampa Udara'], answer: 2 },
        { q: 'Alat untuk mengukur arus listrik adalah:', options: ['Voltmeter', 'Ampermeter', 'Ohmmeter', 'Thermometer'], answer: 1 },
        { q: 'Pernyataan bahwa tekanan berbanding terbalik dengan volume adalah:', options: ['Hukum Pascal', 'Hukum Archimedes', 'Hukum Boyle', 'Hukum Hooke'], answer: 2 },
        { q: 'Lensa cembung bersifat:', options: ['Mengumpulkan cahaya (Konvergen)', 'Menyebarkan cahaya (Divergen)', 'Membiaskan lurus', 'Memantulkan sempurna'], answer: 0 },
        { q: 'Besaran yang memiliki nilai dan arah disebut:', options: ['Besaran Skalar', 'Besaran Vektor', 'Besaran Turunan', 'Besaran Pokok'], answer: 1 }
      ],
      'Matematika': [
        { q: 'Turunan pertama dari f(x) = 3x² + 5x - 4 adalah:', options: ['6x + 5', '3x + 5', '6x² + 5', '6x - 4'], answer: 0 },
        { q: 'Hasil dari ∫ (2x + 3) dx adalah:', options: ['x² + 3x + C', '2x² + 3x + C', 'x² + C', '3x² + C'], answer: 0 },
        { q: 'Jika sin(A) = 3/5 pada segitiga siku-siku, berapa cos(A)?', options: ['4/5', '3/4', '5/4', '2/5'], answer: 0 },
        { q: 'Akar-akar dari persamaan kuadrat x² - 5x + 6 = 0 adalah:', options: ['2 dan 3', '-2 dan -3', '1 dan 6', '-1 dan -6'], answer: 0 },
        { q: 'Nilai dari log₁₀(1000) adalah:', options: ['3', '2', '10', '100'], answer: 0 },
        { q: 'Suku ke-10 dari barisan aritmatika 2, 5, 8, 11... adalah:', options: ['29', '27', '31', '30'], answer: 0 },
        { q: 'Determinant matriks [[2, 3], [1, 4]] adalah:', options: ['5', '8', '10', '11'], answer: 0 },
        { q: 'Berapakah nilai dari 5! (5 faktorial)?', options: ['120', '100', '60', '24'], answer: 0 },
        { q: 'Persamaan lingkaran berpuncak di (0,0) ber-jari-jari 5 adalah:', options: ['x² + y² = 25', 'x² + y² = 5', 'x + y = 25', 'x² - y² = 25'], answer: 0 },
        { q: 'Berapakah luas segitiga dengan alas 10 cm dan tinggi 8 cm?', options: ['40 cm²', '80 cm²', '20 cm²', '50 cm²'], answer: 0 }
      ],
      'Bahasa Inggris': [
        { q: 'Choose the correct passive voice: "She reads a book."', options: ['A book is read by her.', 'A book was read by her.', 'A book is reading by her.', 'A book has read by her.'], answer: 0 },
        { q: 'What is the synonym of "Vast"?', options: ['Huge', 'Small', 'Tiny', 'Narrow'], answer: 0 },
        { q: 'If I ___ rich, I would travel the world.', options: ['were', 'was', 'am', 'be'], answer: 0 },
        { q: 'Identify the noun in: "He runs quickly."', options: ['He', 'runs', 'quickly', 'None'], answer: 0 },
        { q: 'She has been working here ___ 2020.', options: ['since', 'for', 'during', 'by'], answer: 0 },
        { q: 'What is the antonym of "Generous"?', options: ['Stingy', 'Kind', 'Polite', 'Brave'], answer: 0 },
        { q: 'They ___ to the cinema last night.', options: ['went', 'go', 'gone', 'going'], answer: 0 },
        { q: 'The sun ___ in the east.', options: ['rises', 'rose', 'rising', 'is rise'], answer: 0 },
        { q: 'Which word is spelled correctly?', options: ['Necessary', 'Neccessary', 'Necesary', 'Nessessary'], answer: 0 },
        { q: 'Could you please ___ me the salt?', options: ['pass', 'passed', 'passing', 'passes'], answer: 0 }
      ],
      'Informatika': [
        { q: 'Struktur data mana yang menggunakan prinsip LIFO (Last In First Out)?', options: ['Stack', 'Queue', 'Array', 'Linked List'], answer: 0 },
        { q: 'Komponen hardware yang berfungsi sebagai otak utama komputer adalah:', options: ['CPU', 'RAM', 'Harddisk', 'GPU'], answer: 0 },
        { q: 'Bahasa pemrograman yang sering digunakan untuk pengembangan web frontend adalah:', options: ['JavaScript', 'C++', 'Assembly', 'SQL'], answer: 0 },
        { q: 'Protokol standar yang digunakan untuk transfer data web yang aman adalah:', options: ['HTTPS', 'HTTP', 'FTP', 'SMTP'], answer: 0 },
        { q: 'Kompleksitas waktu pencarian (search) pada Binary Search Tree ideal adalah:', options: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'], answer: 0 },
        { q: 'Perintah SQL untuk menambahkan data baru ke dalam tabel adalah:', options: ['INSERT INTO', 'UPDATE', 'CREATE TABLE', 'SELECT'], answer: 0 },
        { q: 'Penulisan alamat IPv4 terdiri dari berapa bit?', options: ['32 bit', '64 bit', '128 bit', '16 bit'], answer: 0 },
        { q: 'Prinsip OOP di mana satu class mewarisi sifat dari class lain disebut:', options: ['Inheritance', 'Encapsulation', 'Polymorphism', 'Abstraction'], answer: 0 },
        { q: 'Perangkat keras penukar sinyal digital ke analog dan sebaliknya adalah:', options: ['Modem', 'Router', 'Switch', 'Hub'], answer: 0 },
        { q: 'Istilah untuk kesalahan logika atau sintaks pada program adalah:', options: ['Bug', 'Glitch', 'Virus', 'Malware'], answer: 0 }
      ]
    };

    this.questions = subjectQuestions[this.subject] || subjectQuestions['Fisika'];
  }

  setupAiOpponent() {
    const difficulties = {
      easy: { name: 'AI Novice (Mudah)', accuracy: 0.4, delayRange: [4000, 10000] },
      medium: { name: 'AI Pro (Sedang)', accuracy: 0.65, delayRange: [3000, 7000] },
      hard: { name: 'AI Master (Sulit)', accuracy: 0.88, delayRange: [1500, 4500] }
    };
    const config = difficulties[this.difficulty] || difficulties.medium;
    this.opponent = {
      name: config.name,
      isAi: true,
      accuracy: config.accuracy,
      delayRange: config.delayRange
    };
    
    this.updatePlayerUI();
  }

  bindUI() {
    this.questionTextEl = document.getElementById('question-text');
    this.optionsContainerEl = document.getElementById('options-container');
    this.timerEl = document.getElementById('countdown-timer');
    this.questionNumEl = document.getElementById('question-number');
    
    // Player 1 UI
    this.p1NameEl = document.getElementById('p1-name');
    this.p1ScoreEl = document.getElementById('p1-score');
    
    // Player 2 UI
    this.p2NameEl = document.getElementById('p2-name');
    this.p2ScoreEl = document.getElementById('p2-score');

    this.updatePlayerUI();
  }

  updatePlayerUI() {
    if (this.p1NameEl) this.p1NameEl.textContent = this.user.name || 'Kamu';
    if (this.p1ScoreEl) this.p1ScoreEl.textContent = `Skor: ${this.userScore}`;
    
    if (this.p2NameEl) this.p2NameEl.textContent = this.opponent.name;
    if (this.p2ScoreEl) this.p2ScoreEl.textContent = `Skor: ${this.opponentScore}`;
  }

  startQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.finishBattle();
      return;
    }

    this.isAnswered = false;
    const qData = this.questions[this.currentQuestionIndex];
    
    if (this.questionNumEl) {
      this.questionNumEl.textContent = `Soal ${this.currentQuestionIndex + 1} / ${this.questions.length}`;
    }

    if (this.questionTextEl) {
      this.questionTextEl.textContent = qData.q;
    }

    this.renderOptions(qData.options);
    this.startTimer();

    if (this.opponent.isAi) {
      this.scheduleAiAnswer(qData);
    }
  }

  renderOptions(options) {
    if (!this.optionsContainerEl) return;
    
    const labels = ['A', 'B', 'C', 'D'];
    this.optionsContainerEl.innerHTML = options.map((opt, idx) => `
      <button class="option-btn w-full p-4 rounded-xl border-2 border-outline-variant/30 bg-surface-container-lowest hover:border-primary hover:bg-surface-container-low transition-all text-left flex items-center gap-3" data-index="${idx}">
        <span class="w-8 h-8 rounded-lg bg-surface-container text-on-surface font-bold flex items-center justify-center shrink-0 border border-outline-variant/40">${labels[idx]}</span>
        <span class="font-body-md text-on-surface font-medium">${opt}</span>
      </button>
    `).join('');

    this.optionsContainerEl.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedIdx = parseInt(btn.dataset.index, 10);
        this.submitAnswer(selectedIdx);
      });
    });
  }

  submitAnswer(selectedIdx) {
    if (this.isAnswered) return;
    this.isAnswered = true;
    clearInterval(this.timer);

    const qData = this.questions[this.currentQuestionIndex];
    const isCorrect = selectedIdx === qData.answer;

    if (isCorrect) {
      this.userScore += 10;
    }
    this.userAnswers.push(isCorrect);
    this.updatePlayerUI();

    // Visual feedback on options
    const btns = this.optionsContainerEl.querySelectorAll('.option-btn');
    btns.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === qData.answer) {
        btn.classList.remove('border-outline-variant/30', 'bg-surface-container-lowest');
        btn.classList.add('border-emerald-500', 'bg-emerald-500/20', 'text-emerald-700', 'font-bold');
      } else if (idx === selectedIdx && !isCorrect) {
        btn.classList.remove('border-outline-variant/30', 'bg-surface-container-lowest');
        btn.classList.add('border-rose-500', 'bg-rose-500/20', 'text-rose-700');
      }
    });

    if (this.socket && this.roomId) {
      this.socket.emit('battle_answer', { roomId: this.roomId, correct: isCorrect });
    }

    setTimeout(() => {
      this.nextQuestion();
    }, 1200);
  }

  scheduleAiAnswer() {
    const [minDelay, maxDelay] = this.opponent.delayRange;
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    setTimeout(() => {
      if (this.currentQuestionIndex >= this.questions.length) return;
      const isCorrect = Math.random() < this.opponent.accuracy;
      if (isCorrect) {
        this.opponentScore += 10;
      }
      this.opponentAnswers.push(isCorrect);
      this.updatePlayerUI();
    }, delay);
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    this.startQuestion();
  }

  startTimer() {
    clearInterval(this.timer);
    this.secondsLeft = this.maxTime;
    this.updateTimerDisplay();

    this.timer = setInterval(() => {
      this.secondsLeft--;
      this.updateTimerDisplay();

      if (this.secondsLeft <= 0) {
        clearInterval(this.timer);
        if (!this.isAnswered) {
          this.submitAnswer(-1); // Time out answer
        }
      }
    }, 1000);
  }

  updateTimerDisplay() {
    if (!this.timerEl) return;
    this.timerEl.textContent = `${this.secondsLeft}`;
  }

  async finishBattle() {
    clearInterval(this.timer);
    const isWin = this.userScore > this.opponentScore;
    const isDraw = this.userScore === this.opponentScore;
    
    let eloChange = 0;
    if (this.mode === 'ranked') {
      eloChange = isWin ? 15 : (isDraw ? 0 : -10);
    }
    const xpGained = isWin ? 50 : (isDraw ? 25 : 10);

    // Save battle stats to user profile if user email exists
    if (this.user && this.user.email) {
      try {
        const wins = (Number(this.user.wins) || 0) + (isWin ? 1 : 0);
        const losses = (Number(this.user.losses) || 0) + (!isWin && !isDraw ? 1 : 0);
        const draws = (Number(this.user.draws) || 0) + (isDraw ? 1 : 0);
        const currentElo = Number(this.user.elo) || 400;
        const newElo = Math.max(0, currentElo + eloChange);
        const currentXp = Number(this.user.xp) || 0;

        await fetch('/api/user/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({
            email: this.user.email,
            elo: newElo,
            xp: currentXp + xpGained,
            wins,
            losses,
            draws
          })
        });
      } catch (err) {
        console.error('Failed to update user stats post battle:', err);
      }
    }

    if (typeof window.onBattleFinished === 'function') {
      window.onBattleFinished({
        mode: this.mode,
        subject: this.subject,
        userScore: this.userScore,
        opponentScore: this.opponentScore,
        opponentName: this.opponent.name,
        isWin,
        isDraw,
        eloChange,
        xpGained
      });
    }
  }

  initSocket() {
    if (typeof io === 'undefined') return;
    this.socket = io({ auth: { token: this.token } });

    this.socket.on('battle_update', (data) => {
      if (data.score) {
        this.opponentScore = data.score;
        this.updatePlayerUI();
      }
    });

    this.socket.on('battle_finish', () => {
      this.finishBattle();
    });
  }
}

window.BattleEngine = BattleEngine;
