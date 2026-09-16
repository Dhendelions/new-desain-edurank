// EduRank Battle Page Logic
class BattlePageManager {
  constructor() {
    this.selectedMode = 'ranked'; // default mode
    this.selectedSubject = { id: 1, name: 'Fisika' };
    this.selectedAiDifficulty = 'medium';
    this.subjects = [];
    this.battleEngine = null;
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

    await this.loadSubjects();
    this.setupTabs();
    this.setupEventListeners();
    this.setupResultCallbacks();
  }

  async loadSubjects() {
    try {
      const res = await fetch('/api/subjects');
      const data = await res.json();
      if (data.success && data.subjects) {
        // Filter out Matematika Lanjut
        this.subjects = data.subjects.filter(s => s.name !== 'Matematika Lanjut' && s.name !== 'Matematika Tingkat Lanjut');
        this.renderSubjects();
      }
    } catch (err) {
      console.error('Error loading subjects:', err);
      // Fallback subjects
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

    // Attach click listener
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

    // Trigger current initial mode
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

  setupEventListeners() {
    // Ranked Start
    const btnStartRanked = document.getElementById('btn-start-ranked');
    const matchmakingBox = document.getElementById('matchmaking-box');
    const btnCancelMatchmaking = document.getElementById('btn-cancel-matchmaking');

    if (btnStartRanked) {
      btnStartRanked.addEventListener('click', () => {
        if (matchmakingBox) matchmakingBox.classList.remove('hidden');
        btnStartRanked.classList.add('hidden');

        setTimeout(() => {
          if (matchmakingBox) matchmakingBox.classList.add('hidden');
          btnStartRanked.classList.remove('hidden');
          this.startBattle('ranked', { isAi: true, name: 'Opponent Ranked #402', accuracy: 0.7, delayRange: [3000, 7000] });
        }, 2000);
      });
    }

    if (btnCancelMatchmaking) {
      btnCancelMatchmaking.addEventListener('click', () => {
        if (matchmakingBox) matchmakingBox.classList.add('hidden');
        if (btnStartRanked) btnStartRanked.classList.remove('hidden');
      });
    }

    // Classic Start
    const btnStartClassic = document.getElementById('btn-start-classic');
    if (btnStartClassic) {
      btnStartClassic.addEventListener('click', () => {
        this.startBattle('classic', { isAi: true, name: 'Lawan Classic', accuracy: 0.6, delayRange: [3500, 8000] });
      });
    }

    // Custom Room Create
    const btnCreateRoom = document.getElementById('btn-create-custom-room');
    if (btnCreateRoom) {
      btnCreateRoom.addEventListener('click', () => {
        const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
        alert(`Room berhasil dibuat! Kode Room kamu: ${randomCode}\nBagikan kode ini ke temanmu.`);
        this.startBattle('custom', { isAi: true, name: 'Teman Duel', accuracy: 0.65, delayRange: [3000, 7000] });
      });
    }

    // Custom Room Join
    const btnJoinRoom = document.getElementById('btn-join-custom-room');
    const inputRoomCode = document.getElementById('input-room-code');
    if (btnJoinRoom && inputRoomCode) {
      btnJoinRoom.addEventListener('click', () => {
        const code = inputRoomCode.value.trim();
        if (code.length !== 6) {
          alert('Masukkan 6 digit kode room yang valid.');
          return;
        }
        this.startBattle('custom', { isAi: true, name: `Player (Room #${code})`, accuracy: 0.7, delayRange: [3000, 7000] });
      });
    }

    // Start VS AI
    const btnStartAi = document.getElementById('btn-start-ai');
    if (btnStartAi) {
      btnStartAi.addEventListener('click', () => {
        this.startBattle('ai', { isAi: true });
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
      opponent: opponentConfig
    });
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
      if (resXpGained) resXpGained.textContent = `+${resultData.xpGained} XP`;

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
        if (resSubtitle) resSubtitle.textContent = 'Jangan berkecil hati. Evaluasi jawabanmu dan coba lagi!';
        if (resIcon) resIcon.textContent = 'sentiment_dissatisfied';
        if (resIconBox) resIconBox.className = 'w-20 h-20 rounded-3xl bg-error-container/20 text-error flex items-center justify-center shadow-inner';
      }
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.battlePageManager = new BattlePageManager();
});
