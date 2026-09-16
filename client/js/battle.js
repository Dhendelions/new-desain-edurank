// EduRank Battle Page Logic v3.0
class BattlePageManager {
  constructor() {
    this.selectedMode = 'ranked';
    this.selectedSubject = { id: 1, name: 'Fisika' };
    this.selectedAiDifficulty = 'medium';
    this.subjects = [];
    this.battleEngine = null;
    this.socket = null;
    this.activeRoomCode = null;
    this.init();
  }

  async init() {
    const token = localStorage.getItem('edurank-token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    // Read initial mode from URL param
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    if (modeParam && ['ranked', 'classic', 'custom'].includes(modeParam.toLowerCase())) {
      this.selectedMode = modeParam.toLowerCase();
    }

    this.initSocket(token);
    await this.loadSubjects();
    this.setupTabs();
    this.setupEventListeners();
    this.setupResultCallbacks();
  }

  initSocket(token) {
    if (typeof io === 'undefined') return;
    try {
      const serverUrl = typeof getApiUrl === 'function' ? getApiUrl('') : undefined;
      this.socket = io(serverUrl, { auth: { token } });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected to Battle server.');
      });

      this.socket.on('room_created', (room) => {
        this.activeRoomCode = room.roomCode || room.roomId;
        this.showCreatedRoomUI(this.activeRoomCode);
      });

      this.socket.on('match_found', (room) => {
        this.hideLobbyLoaders();
        this.startBattle(room.mode || this.selectedMode, {
          isAi: false,
          name: room.players.find(p => p.id !== (window.headerComponent?.user?.id))?.name || 'Lawan Real-Time'
        });
      });

      this.socket.on('battle_error', (data) => {
        this.hideLobbyLoaders();
        alert(data.message || 'Terjadi kesalahan saat memproses battle.');
      });
    } catch (err) {
      console.warn('Socket connection failed, using local match engine:', err);
    }
  }

  async loadSubjects() {
    try {
      const res = await fetch(getApiUrl('/api/subjects'));
      const data = await res.json();
      if (data.success && data.subjects) {
        this.subjects = data.subjects.filter(s => s.name !== 'Matematika Lanjut' && s.name !== 'Matematika Tingkat Lanjut');
        this.renderSubjects();
      }
    } catch (err) {
      this.subjects = [
        { id: 1, name: 'Fisika', classLevel: 12 },
        { id: 2, name: 'Matematika', classLevel: 12 },
        { id: 3, name: 'Bahasa Inggris', classLevel: 12 },
        { id: 4, name: 'Informatika', classLevel: 12 }
      ];
      this.renderSubjects();
    }
  }

  renderSubjects() {
    const container = document.getElementById('subject-list');
    if (!container) return;

    const uniqueSubjects = [];
    const seen = new Set();
    this.subjects.forEach(s => {
      if (!seen.has(s.name)) {
        seen.add(s.name);
        uniqueSubjects.push(s);
      }
    });

    const icons = {
      'Fisika': 'science',
      'Matematika': 'calculate',
      'Bahasa Inggris': 'translate',
      'Informatika': 'code'
    };

    container.innerHTML = uniqueSubjects.map((subject, index) => {
      const icon = icons[subject.name] || 'menu_book';
      const isSelected = index === 0;
      if (isSelected) {
        this.selectedSubject = { id: subject.id, name: subject.name };
      }

      return `
        <button class="subject-card p-space-md rounded-2xl border-2 transition-all flex items-start gap-space-sm text-left ${isSelected ? 'border-primary bg-surface-container-lowest shadow-sm' : 'border-outline-variant/30 bg-surface-container-low hover:border-primary/50'}" data-subject-id="${subject.id}" data-subject-name="${subject.name}">
          <div class="w-10 h-10 rounded-xl ${isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-primary'} flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[22px]">${icon}</span>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="font-title-md text-title-md font-bold text-on-surface">${subject.name}</span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">Kurikulum Merdeka • Kelas ${subject.class_level || subject.classLevel || 12}</span>
          </div>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.subject-card').forEach(card => {
      card.addEventListener('click', () => {
        container.querySelectorAll('.subject-card').forEach(c => {
          c.classList.remove('border-primary', 'bg-surface-container-lowest', 'shadow-sm');
          c.classList.add('border-outline-variant/30', 'bg-surface-container-low');
          const iconBox = c.querySelector('div');
          if (iconBox) {
            iconBox.classList.remove('bg-primary', 'text-on-primary');
            iconBox.classList.add('bg-surface-container', 'text-primary');
          }
        });

        card.classList.remove('border-outline-variant/30', 'bg-surface-container-low');
        card.classList.add('border-primary', 'bg-surface-container-lowest', 'shadow-sm');
        const iconBox = card.querySelector('div');
        if (iconBox) {
          iconBox.classList.remove('bg-surface-container', 'text-primary');
          iconBox.classList.add('bg-primary', 'text-on-primary');
        }

        this.selectedSubject = {
          id: card.dataset.subjectId,
          name: card.dataset.subjectName
        };
      });
    });
  }

  setupTabs() {
    const tabRanked = document.getElementById('tab-ranked');
    const tabClassic = document.getElementById('tab-classic');
    const tabCustom = document.getElementById('tab-custom');

    const panelRanked = document.getElementById('panel-ranked');
    const panelClassic = document.getElementById('panel-classic');
    const panelCustom = document.getElementById('panel-custom');

    const activateTab = (activeTab, activePanel, modeName) => {
      [tabRanked, tabClassic, tabCustom].forEach(t => {
        if (t) {
          t.className = 'flex-1 md:flex-initial px-5 py-2.5 rounded-xl font-label-lg text-label-lg font-bold transition-all text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-2';
        }
      });
      [panelRanked, panelClassic, panelCustom].forEach(p => {
        if (p) p.classList.add('hidden');
      });

      if (activeTab) {
        const bgClass = modeName === 'ranked' ? 'bg-secondary text-on-secondary' : (modeName === 'classic' ? 'bg-primary text-on-primary' : 'bg-tertiary-container text-on-tertiary');
        activeTab.className = `flex-1 md:flex-initial px-5 py-2.5 rounded-xl font-label-lg text-label-lg font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${bgClass}`;
      }
      if (activePanel) activePanel.classList.remove('hidden');
      this.selectedMode = modeName;
    };

    if (tabRanked) tabRanked.addEventListener('click', () => activateTab(tabRanked, panelRanked, 'ranked'));
    if (tabClassic) tabClassic.addEventListener('click', () => activateTab(tabClassic, panelClassic, 'classic'));
    if (tabCustom) tabCustom.addEventListener('click', () => activateTab(tabCustom, panelCustom, 'custom'));

    if (this.selectedMode === 'classic') activateTab(tabClassic, panelClassic, 'classic');
    else if (this.selectedMode === 'custom') activateTab(tabCustom, panelCustom, 'custom');
    else activateTab(tabRanked, panelRanked, 'ranked');

    // Custom sub-tabs
    const subRoom = document.getElementById('custom-sub-room');
    const subAi = document.getElementById('custom-sub-ai');
    const secRoom = document.getElementById('custom-room-section');
    const secAi = document.getElementById('custom-ai-section');

    if (subRoom && subAi && secRoom && secAi) {
      subRoom.addEventListener('click', () => {
        subRoom.className = 'py-2 rounded-lg font-label-md text-label-md font-bold bg-surface-container-lowest text-primary shadow-sm';
        subAi.className = 'py-2 rounded-lg font-label-md text-label-md font-bold text-on-surface-variant hover:text-on-surface';
        secRoom.classList.remove('hidden');
        secAi.classList.add('hidden');
      });

      subAi.addEventListener('click', () => {
        subAi.className = 'py-2 rounded-lg font-label-md text-label-md font-bold bg-surface-container-lowest text-primary shadow-sm';
        subRoom.className = 'py-2 rounded-lg font-label-md text-label-md font-bold text-on-surface-variant hover:text-on-surface';
        secAi.classList.remove('hidden');
        secRoom.classList.add('hidden');
      });
    }

    // AI Difficulty Buttons
    document.querySelectorAll('.ai-diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ai-diff-btn').forEach(b => {
          b.className = 'ai-diff-btn py-2 px-3 rounded-xl border border-outline-variant/40 font-label-sm text-label-sm font-bold text-on-surface hover:border-primary transition-all';
        });
        btn.className = 'ai-diff-btn py-2 px-3 rounded-xl border-2 border-primary bg-primary/10 font-label-sm text-label-sm font-bold text-primary transition-all';
        this.selectedAiDifficulty = btn.dataset.difficulty || 'medium';
      });
    });
  }

  showCreatedRoomUI(code) {
    const roomBox = document.getElementById('created-room-box');
    const inputGroup = document.getElementById('room-input-group');
    const codeSpan = document.getElementById('created-room-code');

    if (codeSpan) codeSpan.textContent = code;
    if (roomBox) roomBox.classList.remove('hidden');
    if (inputGroup) inputGroup.classList.add('hidden');
  }

  hideCreatedRoomUI() {
    const roomBox = document.getElementById('created-room-box');
    const inputGroup = document.getElementById('room-input-group');
    if (roomBox) roomBox.classList.add('hidden');
    if (inputGroup) inputGroup.classList.remove('hidden');
    this.activeRoomCode = null;
  }

  hideLobbyLoaders() {
    const matchmakingBox = document.getElementById('matchmaking-box');
    const matchmakingBoxClassic = document.getElementById('matchmaking-box-classic');
    const btnStartRanked = document.getElementById('btn-start-ranked');
    const btnStartClassic = document.getElementById('btn-start-classic');
    if (matchmakingBox) matchmakingBox.classList.add('hidden');
    if (matchmakingBoxClassic) matchmakingBoxClassic.classList.add('hidden');
    if (btnStartRanked) btnStartRanked.classList.remove('hidden');
    if (btnStartClassic) btnStartClassic.classList.remove('hidden');
    this.hideCreatedRoomUI();
  }

  setupEventListeners() {
    // Ranked Matchmaking
    const btnStartRanked = document.getElementById('btn-start-ranked');
    const matchmakingBox = document.getElementById('matchmaking-box');
    const btnCancelMatchmaking = document.getElementById('btn-cancel-matchmaking');

    if (btnStartRanked) {
      btnStartRanked.addEventListener('click', () => {
        if (matchmakingBox) matchmakingBox.classList.remove('hidden');
        btnStartRanked.classList.add('hidden');

        if (this.socket) {
          this.socket.emit('queue_ranked', { subject: this.selectedSubject.name });
        }
      });
    }

    if (btnCancelMatchmaking) {
      btnCancelMatchmaking.addEventListener('click', () => {
        if (this.socket) this.socket.emit('cancel_queue');
        this.hideLobbyLoaders();
      });
    }

    // Classic Matchmaking
    const btnStartClassic = document.getElementById('btn-start-classic');
    const matchmakingBoxClassic = document.getElementById('matchmaking-box-classic');
    const btnCancelMatchmakingClassic = document.getElementById('btn-cancel-matchmaking-classic');

    if (btnStartClassic) {
      btnStartClassic.addEventListener('click', () => {
        if (matchmakingBoxClassic) matchmakingBoxClassic.classList.remove('hidden');
        btnStartClassic.classList.add('hidden');
        if (this.socket) {
          this.socket.emit('queue_classic', { subject: this.selectedSubject.name });
        }
      });
    }

    if (btnCancelMatchmakingClassic) {
      btnCancelMatchmakingClassic.addEventListener('click', () => {
        if (this.socket) this.socket.emit('cancel_queue');
        this.hideLobbyLoaders();
      });
    }

    // Custom Room Create (No alert popups - Styled Inline Room Box)
    const btnCreateRoom = document.getElementById('btn-create-custom-room');
    if (btnCreateRoom) {
      btnCreateRoom.addEventListener('click', () => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        this.showCreatedRoomUI(code);
        const customClassSelect = document.getElementById('custom-class-select');
        const cLevel = customClassSelect ? Number(customClassSelect.value) : 12;
        if (this.socket) {
          this.socket.emit('create_room', { subject: this.selectedSubject.name, classLevel: cLevel, roomCode: code });
        }
      });
    }

    // Copy Room Code Button
    const btnCopyCode = document.getElementById('btn-copy-room-code');
    if (btnCopyCode) {
      btnCopyCode.addEventListener('click', () => {
        const codeSpan = document.getElementById('created-room-code');
        if (codeSpan && codeSpan.textContent) {
          navigator.clipboard.writeText(codeSpan.textContent);
          btnCopyCode.innerHTML = `<span class="material-symbols-outlined text-[16px]">check</span> <span>Tersalin!</span>`;
          setTimeout(() => {
            btnCopyCode.innerHTML = `<span class="material-symbols-outlined text-[16px]">content_copy</span>`;
          }, 2000);
        }
      });
    }

    // Cancel Room Button
    const btnCancelRoom = document.getElementById('btn-cancel-room');
    if (btnCancelRoom) {
      btnCancelRoom.addEventListener('click', () => {
        this.hideCreatedRoomUI();
      });
    }

    // Custom Room Join (Realtime Socket without AI fallback)
    const btnJoinRoom = document.getElementById('btn-join-custom-room');
    const inputRoomCode = document.getElementById('input-room-code');
    if (btnJoinRoom && inputRoomCode) {
      btnJoinRoom.addEventListener('click', () => {
        const code = inputRoomCode.value.trim();
        if (code.length !== 6) {
          const errBox = document.getElementById('room-error-msg');
          if (errBox) {
            errBox.textContent = 'Masukkan 6 digit kode room yang valid.';
            errBox.classList.remove('hidden');
          } else {
            alert('Masukkan 6 digit kode room yang valid.');
          }
          return;
        }
        if (this.socket) {
          this.socket.emit('join_room', { roomCode: code });
        }
      });
    }

    // Start VS AI (explicit button)
    const btnStartAi = document.getElementById('btn-start-ai');
    if (btnStartAi) {
      btnStartAi.addEventListener('click', () => {
        const customClassSelect = document.getElementById('custom-class-select');
        const cLevel = customClassSelect ? Number(customClassSelect.value) : 12;
        this.startBattle('custom', { isAi: true, name: 'EduBot AI PRO', classLevel: cLevel });
      });
    }

    // Result Buttons
    const btnPlayAgain = document.getElementById('btn-result-play-again');
    if (btnPlayAgain) {
      btnPlayAgain.addEventListener('click', () => {
        document.getElementById('battle-result-view').classList.add('hidden');
        document.getElementById('battle-lobby-view').classList.remove('hidden');
      });
    }

    const btnHome = document.getElementById('btn-result-home');
    if (btnHome) {
      btnHome.addEventListener('click', () => {
        window.location.href = 'home.html';
      });
    }

    // Review Modal Buttons
    const btnTinjau = document.getElementById('btn-tinjau-pembahasan');
    const btnCloseReview = document.getElementById('btn-close-review-modal');
    const reviewModal = document.getElementById('review-modal');

    if (btnTinjau && reviewModal) {
      btnTinjau.addEventListener('click', () => {
        reviewModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      });
    }

    if (btnCloseReview && reviewModal) {
      btnCloseReview.addEventListener('click', () => {
        reviewModal.classList.add('hidden');
        document.body.style.overflow = '';
      });
    }

    if (reviewModal) {
      reviewModal.addEventListener('click', (e) => {
        if (e.target === reviewModal) {
          reviewModal.classList.add('hidden');
          document.body.style.overflow = '';
        }
      });
    }
  }

  startBattle(mode, opponentConfig = {}) {
    const lobbyView = document.getElementById('battle-lobby-view');
    const arenaView = document.getElementById('battle-arena-view');
    const resultView = document.getElementById('battle-result-view');

    if (lobbyView) lobbyView.classList.add('hidden');
    if (resultView) resultView.classList.add('hidden');
    if (arenaView) {
      arenaView.classList.remove('hidden');
      arenaView.classList.add('flex');
    }

    const arenaSubjectTag = document.getElementById('arena-subject-tag');
    if (arenaSubjectTag) {
      arenaSubjectTag.textContent = `Mata Pelajaran: ${this.selectedSubject.name}`;
    }

    this.battleEngine = new BattleEngine({
      mode: mode,
      difficulty: this.selectedAiDifficulty,
      subject: this.selectedSubject.name,
      subjectId: this.selectedSubject.id,
      socket: this.socket,
      opponent: opponentConfig
    });
  }

  renderAccuracyChart(accuracyPercent) {
    const canvas = document.getElementById('accuracy-chart-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 55;
    const lineWidth = 12;

    ctx.clearRect(0, 0, width, height);

    // Background track
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#e2e7ff';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Progress arc
    const startAngle = -0.5 * Math.PI;
    const endAngle = startAngle + (accuracyPercent / 100) * (2 * Math.PI);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = accuracyPercent >= 70 ? '#10b981' : (accuracyPercent >= 40 ? '#3525cd' : '#f43f5e');
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  renderPembahasanSoal(answersHistory) {
    const container = document.getElementById('pembahasan-list-container');
    if (!container) return;

    if (!answersHistory || answersHistory.length === 0) {
      container.innerHTML = '<p class="text-outline text-center py-4">Belum ada resume soal untuk ditampilkan.</p>';
      return;
    }

    const labels = ['A', 'B', 'C', 'D'];

    container.innerHTML = answersHistory.map(item => {
      const isCorrect = item.isCorrect;
      const userSelectedLabel = item.selectedIndex >= 0 ? labels[item.selectedIndex] : 'Waktu Habis';
      const userSelectedText = item.selectedIndex >= 0 ? item.options[item.selectedIndex] : 'Tidak Menjawab';
      const correctLabel = labels[item.correctIndex];
      const correctText = item.options[item.correctIndex];

      return `
        <div class="p-space-lg rounded-2xl ${isCorrect ? 'bg-emerald-500/5 border border-emerald-500/30' : 'bg-rose-500/5 border border-rose-500/30'} flex flex-col gap-3">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'} font-bold text-xs flex items-center justify-center shrink-0">
                ${item.questionNum}
              </span>
              <h4 class="font-title-md font-bold text-on-surface leading-snug">${item.question}</h4>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${isCorrect ? 'bg-emerald-500/20 text-emerald-700' : 'bg-rose-500/20 text-rose-700'}">
              ${isCorrect ? 'Benar (+10 Skor)' : 'Salah'}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-body-sm pt-1">
            <div class="p-3 rounded-xl ${isCorrect ? 'bg-emerald-100/60 text-emerald-900' : 'bg-rose-100/60 text-rose-900'}">
              <span class="text-xs font-bold uppercase block opacity-75">Jawaban Kamu:</span>
              <span class="font-semibold">${userSelectedLabel}. ${userSelectedText}</span>
            </div>

            <div class="p-3 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface">
              <span class="text-xs font-bold uppercase text-emerald-600 block">Jawaban Benar:</span>
              <span class="font-semibold">${correctLabel}. ${correctText}</span>
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 text-body-sm leading-relaxed">
            <span class="font-bold text-secondary text-xs uppercase tracking-wider block mb-1">📐 Pembahasan &amp; Cara:</span>
            <p class="text-on-surface font-medium">${item.explanation}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  setupResultCallbacks() {
    window.onBattleFinished = (resultData) => {
      const arenaView = document.getElementById('battle-arena-view');
      const resultView = document.getElementById('battle-result-view');

      if (arenaView) {
        arenaView.classList.add('hidden');
        arenaView.classList.remove('flex');
      }
      if (resultView) {
        resultView.classList.remove('hidden');
        resultView.classList.add('flex');
      }

      const resTitle = document.getElementById('result-title');
      const resSubtitle = document.getElementById('result-subtitle');
      const resIcon = document.getElementById('result-icon');
      const resIconBox = document.getElementById('result-icon-box');
      const resUserScore = document.getElementById('res-user-score');
      const resEloChange = document.getElementById('res-elo-change');
      const resXpGained = document.getElementById('res-xp-gained');

      if (resUserScore) resUserScore.textContent = resultData.userScore;

      // Handle Per-Mode Reward Display
      // Ranked: +XP & +/- ELO
      // Classic: +XP & 0 ELO
      // Custom: 0 XP & 0 ELO
      if (resultData.mode === 'ranked') {
        if (resEloChange) {
          if (resultData.eloChange > 0) {
            resEloChange.textContent = `+${resultData.eloChange}`;
            resEloChange.className = 'font-headline-md text-headline-md font-extrabold text-tertiary';
          } else if (resultData.eloChange < 0) {
            resEloChange.textContent = `${resultData.eloChange}`;
            resEloChange.className = 'font-headline-md text-headline-md font-extrabold text-error';
          } else {
            resEloChange.textContent = `0`;
            resEloChange.className = 'font-headline-md text-headline-md font-extrabold text-on-surface';
          }
        }
        if (resXpGained) resXpGained.textContent = `+${resultData.xpGained} XP`;
      } else if (resultData.mode === 'classic') {
        if (resEloChange) {
          resEloChange.textContent = `0 (Classic)`;
          resEloChange.className = 'font-headline-md text-headline-md font-extrabold text-outline';
        }
        if (resXpGained) resXpGained.textContent = `+${resultData.xpGained} XP`;
      } else {
        // Custom Mode
        if (resEloChange) {
          resEloChange.textContent = `0 (Custom)`;
          resEloChange.className = 'font-headline-md text-headline-md font-extrabold text-outline';
        }
        if (resXpGained) resXpGained.textContent = `0 XP (Custom)`;
      }

      if (resultData.isWin) {
        if (resTitle) resTitle.textContent = 'KEMENANGAN!';
        if (resSubtitle) resSubtitle.textContent = `Luar biasa! Kamu berhasil mengalahkan ${resultData.opponentName}!`;
        if (resIcon) resIcon.textContent = 'emoji_events';
        if (resIconBox) resIconBox.className = 'w-20 h-20 rounded-3xl bg-tertiary-container/20 text-tertiary-container flex items-center justify-center shadow-inner';
      } else if (resultData.isDraw) {
        if (resTitle) resTitle.textContent = 'HASIL SERI!';
        if (resSubtitle) resSubtitle.textContent = 'Pertandingan yang sengit! Skor akhir sama seimbang.';
        if (resIcon) resIcon.textContent = 'handshake';
        if (resIconBox) resIconBox.className = 'w-20 h-20 rounded-3xl bg-secondary/20 text-secondary flex items-center justify-center shadow-inner';
      } else {
        if (resTitle) resTitle.textContent = 'KEKALAHAN!';
        if (resSubtitle) resSubtitle.textContent = 'Jangan berkecil hati. Evaluasi resume soal dan pelajari pembahasannya!';
        if (resIcon) resIcon.textContent = 'sentiment_dissatisfied';
        if (resIconBox) resIconBox.className = 'w-20 h-20 rounded-3xl bg-error-container/20 text-error flex items-center justify-center shadow-inner';
      }

      // Render Visual Performance Chart
      const answersHistory = resultData.answersHistory || [];
      const correctCount = answersHistory.filter(a => a.isCorrect).length;
      const totalQuestions = answersHistory.length || 10;
      const accuracyPercent = Math.round((correctCount / totalQuestions) * 100);

      const chartAccuracyNum = document.getElementById('chart-accuracy-num');
      const badgeAccuracy = document.getElementById('res-accuracy-badge');
      const chartCorrectCount = document.getElementById('chart-correct-count');
      const chartIncorrectCount = document.getElementById('chart-incorrect-count');
      const barCorrect = document.getElementById('bar-correct');
      const barIncorrect = document.getElementById('bar-incorrect');

      if (chartAccuracyNum) chartAccuracyNum.textContent = `${accuracyPercent}%`;
      if (badgeAccuracy) badgeAccuracy.textContent = `Akurasi: ${accuracyPercent}%`;
      if (chartCorrectCount) chartCorrectCount.textContent = `${correctCount} / ${totalQuestions} Soal`;
      if (chartIncorrectCount) chartIncorrectCount.textContent = `${totalQuestions - correctCount} / ${totalQuestions} Soal`;
      if (barCorrect) barCorrect.style.width = `${accuracyPercent}%`;
      if (barIncorrect) barIncorrect.style.width = `${100 - accuracyPercent}%`;

      this.renderAccuracyChart(accuracyPercent);

      // Render Detailed Pembahasan Soal
      this.renderPembahasanSoal(answersHistory);
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.battlePageManager = new BattlePageManager();
});
