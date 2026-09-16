/**
 * EduRank Battle Engine v3.0
 * Supports Ranked (XP+ELO), Classic (XP only), Custom (0 XP, 0 ELO),
 * detailed question explanations, and real-time backend DB sync.
 */
class BattleEngine {
  constructor(options = {}) {
    this.mode = options.mode || 'classic'; // ranked, classic, custom, ai
    this.difficulty = options.difficulty || 'medium';
    this.subject = options.subject || 'Fisika';
    this.subjectId = options.subjectId || 1;
    this.user = JSON.parse(localStorage.getItem('edurank-user') || '{}');
    this.token = localStorage.getItem('edurank-token');
    
    this.currentQuestionIndex = 0;
    this.userScore = 0;
    this.opponentScore = 0;
    this.questions = [];
    this.userAnswersHistory = [];
    this.timer = null;
    this.secondsLeft = 30;
    this.maxTime = 30;
    this.isAnswered = false;
    this.socket = options.socket || null;
    this.roomId = options.roomId || null;
    this.opponent = options.opponent || { name: 'AI Computer', isAi: true };

    this.init();
  }

  init() {
    this.loadQuestionBank();
    this.bindUI();

    if (this.socket) {
      this.socket.on('battle_update', (room) => {
        if (!room || !room.players) return;
        const opp = room.players.find(p => String(p.id) !== String(this.user.id));
        if (opp) {
          if (room.score && room.score[opp.id] !== undefined) {
            this.opponentScore = room.score[opp.id];
          }
          if (room.progress && room.progress[opp.id] !== undefined) {
            this.opponentProgress = room.progress[opp.id];
          }
          if (opp.name && !this.opponent.isAi) {
            this.opponent.name = opp.name;
          }
          this.updatePlayerUI();
        }
      });

      this.socket.on('next_question', (data) => {
        // Hapus notice menunggu lawan
        const delayNotice = document.getElementById('battle-delay-notice');
        if (delayNotice) delayNotice.remove();
        
        this.nextQuestion();
      });

      this.socket.on('opponent_disconnected', (data) => {
        // Lawan keluar, otomatis menang
        const delayNotice = document.getElementById('battle-delay-notice');
        if (delayNotice) delayNotice.remove();
        
        // Buat score opponent kalah telak agar player menang
        this.opponentScore = -999;
        
        // Selesaikan battle
        this.finishBattle('disconnected');
      });
    }

    if (this.opponent.isAi) {
      this.setupAiOpponent();
    }
    
    this.startQuestion();
  }

  loadQuestionBank() {
    const subjectQuestions = {
      'Fisika': [
        { q: 'Berapakah percepatan gravitasi standar di bumi?', options: ['9.8 m/s²', '8.9 m/s²', '10.5 m/s²', '12 m/s²'], answer: 0, explanation: 'Percepatan gravitasi rata-rata di permukaan bumi didefinisikan secara internasional sebesar g = 9.80665 m/s² (biasa dibulatkan 9.8 m/s² atau 10 m/s²).' },
        { q: 'Hukum Newton II dirumuskan sebagai:', options: ['F = m / a', 'F = m × a', 'F = m + a', 'F = m² × a'], answer: 1, explanation: 'Hukum II Newton menyatakan bahwa percepatan sebanding dengan total gaya dan berbanding terbalik dengan massa: a = F / m -> F = m × a.' },
        { q: 'Satuan Standar Internasional (SI) untuk usaha adalah:', options: ['Watt', 'Pascal', 'Joule', 'Newton'], answer: 2, explanation: 'Usaha (W = F × s) diukur dalam satuan Joule (J) di mana 1 Joule = 1 Newton.meter.' },
        { q: 'Energi kinetik suatu benda bermassa m bergerak dengan kecepatan v adalah:', options: ['½ m v²', 'm v', 'm g h', '½ m² v'], answer: 0, explanation: 'Rumus energi kinetik benda bergerak: Ek = ½ m v².' },
        { q: 'Kecepatan cahaya di ruang hampa adalah sebesar:', options: ['3 × 10⁸ m/s', '3 × 10⁶ m/s', '1.5 × 10⁸ m/s', '3 × 10¹⁰ m/s'], answer: 0, explanation: 'Konstanta kecepatan cahaya c di hampa udara adalah tepat 299.792.458 m/s (~3 × 10⁸ m/s).' },
        { q: 'Bunyi merambat paling cepat pada medium:', options: ['Udara', 'Air', 'Padat (Besi)', 'Hampa Udara'], answer: 2, explanation: 'Gelombang bunyi merambat paling cepat dalam zat padat (besi ~5000 m/s) karena kerapatan partikel molekulnya sangat rapat.' },
        { q: 'Alat untuk mengukur arus listrik adalah:', options: ['Voltmeter', 'Ampermeter', 'Ohmmeter', 'Thermometer'], answer: 1, explanation: 'Ampermeter digunakan untuk mengukur kuat arus listrik (Ampere) dalam rangkaian.' },
        { q: 'Pernyataan bahwa tekanan berbanding terbalik dengan volume pada suhu tetap adalah:', options: ['Hukum Pascal', 'Hukum Archimedes', 'Hukum Boyle', 'Hukum Hooke'], answer: 2, explanation: 'Hukum Boyle: P × V = Konstan (bila temperatur konstan).' },
        { q: 'Lensa cembung bersifat:', options: ['Mengumpulkan cahaya (Konvergen)', 'Menyebarkan cahaya (Divergen)', 'Membiaskan lurus', 'Memantulkan sempurna'], answer: 0, explanation: 'Lensa cembung (konveks) bernilai positif dan bersifat mengumpulkan sinar (konvergen).' },
        { q: 'Besaran yang memiliki nilai dan arah disebut:', options: ['Besaran Skalar', 'Besaran Vektor', 'Besaran Turunan', 'Besaran Pokok'], answer: 1, explanation: 'Besaran Vektor memiliki magnitude (nilai) dan direction (arah), seperti kecepatan dan gaya.' }
      ],
      'Matematika': [
        { q: 'Turunan pertama dari f(x) = 3x² + 5x - 4 adalah:', options: ['6x + 5', '3x + 5', '6x² + 5', '6x - 4'], answer: 0, explanation: 'Aturan pangkat turunan: d/dx (axⁿ) = n·a·xⁿ⁻¹. f\'(x) = 2·3x²⁻¹ + 5 = 6x + 5.' },
        { q: 'Hasil dari ∫ (2x + 3) dx adalah:', options: ['x² + 3x + C', '2x² + 3x + C', 'x² + C', '3x² + C'], answer: 0, explanation: 'Integral tak tentu: ∫ 2x dx = x², ∫ 3 dx = 3x. Hasil = x² + 3x + C.' },
        { q: 'Jika sin(A) = 3/5 pada segitiga siku-siku, berapa nilai cos(A)?', options: ['4/5', '3/4', '5/4', '2/5'], answer: 0, explanation: 'Pada segitiga siku-siku 3-4-5: depan = 3, miring = 5, maka samping = √(5² - 3²) = 4. cos(A) = samping/miring = 4/5.' },
        { q: 'Akar-akar dari persamaan kuadrat x² - 5x + 6 = 0 adalah:', options: ['2 dan 3', '-2 dan -3', '1 dan 6', '-1 dan -6'], answer: 0, explanation: 'Faktorisasi: (x - 2)(x - 3) = 0 -> x = 2 atau x = 3.' },
        { q: 'Nilai dari log₁₀(1000) adalah:', options: ['3', '2', '10', '100'], answer: 0, explanation: '1000 = 10³, maka log₁₀(10³) = 3.' },
        { q: 'Suku ke-10 dari barisan aritmatika 2, 5, 8, 11... adalah:', options: ['29', '27', '31', '30'], answer: 0, explanation: 'a = 2, b = 3. U₁₀ = a + 9b = 2 + 9(3) = 2 + 27 = 29.' },
        { q: 'Determinant matriks [[2, 3], [1, 4]] adalah:', options: ['5', '8', '10', '11'], answer: 0, explanation: 'det([[a,b],[c,d]]) = ad - bc = (2)(4) - (3)(1) = 8 - 3 = 5.' },
        { q: 'Berapakah nilai dari 5! (5 faktorial)?', options: ['120', '100', '60', '24'], answer: 0, explanation: '5! = 5 × 4 × 3 × 2 × 1 = 120.' },
        { q: 'Persamaan lingkaran berpusat di (0,0) ber-jari-jari 5 adalah:', options: ['x² + y² = 25', 'x² + y² = 5', 'x + y = 25', 'x² - y² = 25'], answer: 0, explanation: 'Persamaan baku lingkaran pusat (0,0): x² + y² = r² = 5² = 25.' },
        { q: 'Luas segitiga dengan alas 10 cm dan tinggi 8 cm adalah:', options: ['40 cm²', '80 cm²', '20 cm²', '50 cm²'], answer: 0, explanation: 'Luas = ½ × alas × tinggi = ½ × 10 × 8 = 40 cm².' }
      ],
      'Bahasa Inggris': [
        { q: 'Choose the correct passive voice: "She reads a book."', options: ['A book is read by her.', 'A book was read by her.', 'A book is reading by her.', 'A book has read by her.'], answer: 0, explanation: 'Simple Present Passive pattern: Subject + is/am/are + V3 + by Object. "A book is read by her."' },
        { q: 'What is the synonym of "Vast"?', options: ['Huge', 'Small', 'Tiny', 'Narrow'], answer: 0, explanation: '"Vast" means immense or extremely large. Synonyms include Huge, Massive, or Enormous.' },
        { q: 'If I ___ rich, I would travel the world.', options: ['were', 'was', 'am', 'be'], answer: 0, explanation: 'Second Conditional (hypothetical present): If + Subject + WERE (subjunctive mood) + Subject + WOULD + V1.' },
        { q: 'Identify the noun in: "He runs quickly."', options: ['He', 'runs', 'quickly', 'None'], answer: 0, explanation: '"He" is a pronoun. "Runs" is a verb. "Quickly" is an adverb.' },
        { q: 'She has been working here ___ 2020.', options: ['since', 'for', 'during', 'by'], answer: 0, explanation: '"Since" indicates the starting point of time (since 2020), while "for" indicates duration.' },
        { q: 'What is the antonym of "Generous"?', options: ['Stingy', 'Kind', 'Polite', 'Brave'], answer: 0, explanation: '"Generous" means giving and liberal. The opposite (antonym) is "Stingy" (pelit/kikir).' },
        { q: 'They ___ to the cinema last night.', options: ['went', 'go', 'gone', 'going'], answer: 0, explanation: '"Last night" signals Simple Past Tense, requiring the V2 form "went".' },
        { q: 'The sun ___ in the east.', options: ['rises', 'rose', 'rising', 'is rise'], answer: 0, explanation: 'General truth / scientific fact uses Simple Present Tense (third person singular + s): "rises".' },
        { q: 'Which word is spelled correctly?', options: ['Necessary', 'Neccessary', 'Necesary', 'Nessessary'], answer: 0, explanation: 'The correct spelling has ONE \'c\' and TWO \'s\'s: N-E-C-E-S-S-A-R-Y.' },
        { q: 'Could you please ___ me the salt?', options: ['pass', 'passed', 'passing', 'passes'], answer: 0, explanation: 'Modal verbs (could, would, can) are followed by the base form of the verb (bare infinitive): "pass".' }
      ],
      'Informatika': [
        { q: 'Struktur data mana yang menggunakan prinsip LIFO (Last In First Out)?', options: ['Stack', 'Queue', 'Array', 'Linked List'], answer: 0, explanation: 'Stack (tumpukan) menerapkan LIFO: elemen terakhir yang masuk akan menjadi elemen pertama yang keluar.' },
        { q: 'Komponen hardware yang berfungsi sebagai otak utama pemrosesan instruksi adalah:', options: ['CPU', 'RAM', 'Harddisk', 'GPU'], answer: 0, explanation: 'CPU (Central Processing Unit) berfungsi mengeksekusi instruksi aritmatika dan logika utama komputer.' },
        { q: 'Bahasa pemrograman yang digunakan secara luas untuk logika interaktif di web browser adalah:', options: ['JavaScript', 'C++', 'Assembly', 'SQL'], answer: 0, explanation: 'JavaScript adalah bahasa pemrograman standar utama web browser untuk logika interaktif dinamis.' },
        { q: 'Protokol standar terenkripsi untuk enkripsi data web aman adalah:', options: ['HTTPS', 'HTTP', 'FTP', 'SMTP'], answer: 0, explanation: 'HTTPS (Hypertext Transfer Protocol Secure) menggunakan TLS/SSL untuk mengamankan komunikasi data.' },
        { q: 'Kompleksitas waktu pencarian (search) pada Binary Search Tree ideal adalah:', options: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'], answer: 0, explanation: 'Binary Search membagi ruang pencarian menjadi setengah pada setiap langkah, sehingga kompleksitasnya O(log n).' },
        { q: 'Perintah SQL untuk menambahkan record data baru ke dalam tabel adalah:', options: ['INSERT INTO', 'UPDATE', 'CREATE TABLE', 'SELECT'], answer: 0, explanation: 'Perintah Data Manipulation Language (DML) untuk menambah baris data baru adalah INSERT INTO.' },
        { q: 'Penulisan alamat IPv4 terdiri dari berapa bit?', options: ['32 bit', '64 bit', '128 bit', '16 bit'], answer: 0, explanation: 'IPv4 terdiri dari 32-bit bilangan biner yang dibagi menjadi 4 oktet (misal 192.168.1.1).' },
        { q: 'Prinsip OOP di mana satu class mewarisi atribut dari class induk disebut:', options: ['Inheritance', 'Encapsulation', 'Polymorphism', 'Abstraction'], answer: 0, explanation: 'Inheritance (pewarisan) memungkinkan sub-class mewarisi metode dan properti dari parent class.' },
        { q: 'Perangkat keras pengubah sinyal digital ke analog dan sebaliknya adalah:', options: ['Modem', 'Router', 'Switch', 'Hub'], answer: 0, explanation: 'Modem (Modulator Demodulator) mengubah sinyal digital menjadi analog dan sebaliknya.' },
        { q: 'Istilah untuk kesalahan dalam kode pemrograman yang menyebabkan bug/cacat adalah:', options: ['Bug', 'Glitch', 'Virus', 'Malware'], answer: 0, explanation: 'Bug merujuk pada kesalahan logika atau sintaksis dalam kode perangkat lunak.' }
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
    
    // Player 1
    this.p1NameEl = document.getElementById('p1-name');
    this.p1ScoreEl = document.getElementById('p1-score');
    
    // Player 2
    this.p2NameEl = document.getElementById('p2-name');
    this.p2ScoreEl = document.getElementById('p2-score');

    this.updatePlayerUI();
  }

  updatePlayerUI() {
    if (this.p1NameEl) this.p1NameEl.textContent = this.user.name || 'Kamu';
    if (this.p1ScoreEl) this.p1ScoreEl.textContent = `Skor: ${this.userScore} (Soal ${Math.min(10, this.currentQuestionIndex + 1)}/10)`;
    
    if (this.p2NameEl) this.p2NameEl.textContent = this.opponent.name || 'Lawan';
    const oppQ = this.opponentProgress ? ` • Soal ${this.opponentProgress}/10` : '';
    if (this.p2ScoreEl) this.p2ScoreEl.textContent = `Skor: ${this.opponentScore}${oppQ}`;
  }

  startQuestion() {
    if (this.nextQuestionInterval) clearInterval(this.nextQuestionInterval);
    if (this.nextQuestionTimeout) clearTimeout(this.nextQuestionTimeout);
    const existingNotice = document.getElementById('battle-delay-notice');
    if (existingNotice) existingNotice.remove();

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
      this.scheduleAiAnswer();
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
    
    // Smooth visual selection transition
    const btns = this.optionsContainerEl.querySelectorAll('.option-btn');
    btns.forEach((btn, idx) => {
      btn.classList.remove('border-primary', 'bg-surface-container-low', 'transform', '-translate-y-1', 'shadow-md');
      if (idx === selectedIdx) {
        btn.classList.add('border-primary', 'bg-surface-container-low', 'transform', '-translate-y-1', 'shadow-md');
      }
    });

    // Check if confirmation box already exists
    let confirmBox = document.getElementById('battle-confirm-box');
    if (!confirmBox) {
      confirmBox = document.createElement('div');
      confirmBox.id = 'battle-confirm-box';
      confirmBox.className = 'w-full mt-4 p-4 rounded-2xl bg-surface-container border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-2';
      if (this.optionsContainerEl && this.optionsContainerEl.parentNode) {
        this.optionsContainerEl.parentNode.insertBefore(confirmBox, this.optionsContainerEl.nextSibling);
      }
    }

    confirmBox.innerHTML = `
      <span class="font-bold text-on-surface">Yakin dengan jawaban ini?</span>
      <div class="flex gap-2 w-full md:w-auto">
        <button id="btn-confirm-no" class="flex-1 md:flex-none px-6 py-2 rounded-xl border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container-highest transition-all">Tidak</button>
        <button id="btn-confirm-yes" class="flex-1 md:flex-none px-6 py-2 rounded-xl bg-primary text-on-primary font-bold shadow-sm hover:bg-primary/90 transition-all">OK</button>
      </div>
    `;

    document.getElementById('btn-confirm-no').addEventListener('click', () => {
      confirmBox.remove();
      btns.forEach(btn => btn.classList.remove('border-primary', 'bg-surface-container-low', 'transform', '-translate-y-1', 'shadow-md'));
    });

    document.getElementById('btn-confirm-yes').addEventListener('click', () => {
      confirmBox.remove();
      this.lockAnswer(selectedIdx);
    });
  }

  lockAnswer(selectedIdx) {
    if (this.isAnswered) return;
    this.isAnswered = true;
    clearInterval(this.timer);

    const qData = this.questions[this.currentQuestionIndex];
    const isCorrect = selectedIdx === qData.answer;

    if (isCorrect) {
      this.userScore += 10;
    }

    // Push detailed record for result review
    this.userAnswersHistory.push({
      questionNum: this.currentQuestionIndex + 1,
      question: qData.q,
      options: qData.options,
      selectedIndex: selectedIdx,
      correctIndex: qData.answer,
      isCorrect: isCorrect,
      explanation: qData.explanation || 'Pembahasan terstandar Kurikulum Merdeka.'
    });

    this.updatePlayerUI();

    // Smooth visual feedback transitions (Green/Red)
    const btns = this.optionsContainerEl.querySelectorAll('.option-btn');
    btns.forEach((btn, idx) => {
      btn.disabled = true;
      btn.classList.add('transition-all', 'duration-300');
      btn.classList.remove('transform', '-translate-y-1'); // remove hover effect
      if (idx === qData.answer) {
        btn.className = 'option-btn w-full p-4 rounded-xl border-2 border-emerald-500 bg-emerald-500/20 text-emerald-800 font-bold transition-all duration-300 transform scale-[1.02] shadow-md flex items-center gap-3';
      } else if (idx === selectedIdx && !isCorrect) {
        btn.className = 'option-btn w-full p-4 rounded-xl border-2 border-rose-500 bg-rose-500/20 text-rose-800 font-bold transition-all duration-300 transform scale-[0.98] shadow-xs flex items-center gap-3';
      }
    });

    if (this.socket && this.roomId) {
      this.socket.emit('battle_answer', {
        roomId: this.roomId,
        score: this.userScore,
        questionIndex: this.currentQuestionIndex + 1
      });
      
      this.socket.emit('player_ready_next', {
        roomId: this.roomId,
        questionIndex: Number(this.currentQuestionIndex + 1)
      });
    }

    // Menunggu jawaban lawan notice
    let delayNotice = document.getElementById('battle-delay-notice');
    if (!delayNotice) {
      delayNotice = document.createElement('div');
      delayNotice.id = 'battle-delay-notice';
      delayNotice.className = 'w-full mt-4 p-3.5 rounded-2xl bg-secondary/10 border border-secondary/30 text-secondary font-bold text-center flex items-center justify-center gap-2 shadow-sm animate-pulse';
      if (this.optionsContainerEl && this.optionsContainerEl.parentNode) {
        this.optionsContainerEl.parentNode.insertBefore(delayNotice, this.optionsContainerEl.nextSibling);
      }
    }

    if (this.opponent.isAi) {
      delayNotice.innerHTML = `
        <span class="material-symbols-outlined text-xl animate-spin">hourglass_top</span>
        <span>Jawaban terkunci! Menunggu AI menjawab...</span>
      `;
      this.checkAiReady();
    } else {
      delayNotice.innerHTML = `
        <span class="material-symbols-outlined text-xl animate-spin">hourglass_top</span>
        <span>Jawaban terkunci! Menunggu lawan menjawab...</span>
      `;
    }
  }

  checkAiReady() {
    if ((this.opponentProgress || 0) >= this.currentQuestionIndex + 1) {
      const delayNotice = document.getElementById('battle-delay-notice');
      if (delayNotice) delayNotice.remove();
      setTimeout(() => this.nextQuestion(), 1000);
    } else {
      setTimeout(() => this.checkAiReady(), 500);
    }
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
      this.opponentProgress = this.currentQuestionIndex + 1; // Mark AI progress
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
          this.submitAnswer(-1); // Timeout
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
    let xpGained = 0;

    if (this.mode === 'ranked') {
      eloChange = isWin ? 15 : (isDraw ? 0 : -10);
      xpGained = isWin ? 50 : (isDraw ? 25 : 10);
    } else if (this.mode === 'classic') {
      eloChange = 0;
      xpGained = isWin ? 40 : (isDraw ? 20 : 10);
    } else {
      eloChange = 0;
      xpGained = 0;
    }

    if (this.token) {
      const resultType = isWin ? 'win' : (isDraw ? 'draw' : 'loss');
      const correctCount = this.userAnswersHistory.filter(a => a.isCorrect).length;
      const incorrectCount = this.userAnswersHistory.filter(a => !a.isCorrect).length;
      
      let opponentNameForDb = this.opponent.name || 'Lawan';
      if (this.opponent.isAi) {
        opponentNameForDb = `Bot - ${this.opponent.name}`;
      }

      try {
        const res = await fetch(getApiUrl('/api/battles/record'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({
            opponentName: opponentNameForDb,
            subjectId: this.subjectId || 1,
            result: resultType,
            eloChange,
            mode: this.mode,
            correctCount,
            incorrectCount
          })
        });

        const data = await res.json();
        if (data.success && data.user) {
          // Sync local storage & update Header UI immediately
          localStorage.setItem('edurank-user', JSON.stringify(data.user));
          if (window.headerComponent && typeof window.headerComponent.init === 'function') {
            window.headerComponent.user = data.user;
            window.headerComponent.updateUserInfo();
          }
        }
      } catch (err) {
        console.warn('Record battle API error:', err);
      }

      // Save local history fallback
      try {
        const rawHist = localStorage.getItem('edurank-battle-history') || '[]';
        const historyList = JSON.parse(rawHist);
        historyList.unshift({
          id: Date.now(),
          mode: this.mode,
          result: resultType,
          elo_change: eloChange,
          xp_change: xpGained,
          userScore: this.userScore,
          opponentScore: this.opponentScore,
          subject_name: this.subject || 'Fisika',
          opponent_name: this.opponent.name || 'Lawan EduBot',
          created_at: new Date().toISOString()
        });
        localStorage.setItem('edurank-battle-history', JSON.stringify(historyList.slice(0, 20)));
      } catch (e) {}
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
        xpGained,
        answersHistory: this.userAnswersHistory
      });
    }
  }
}

window.BattleEngine = BattleEngine;
