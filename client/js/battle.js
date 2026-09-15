// Battle Page JavaScript
class BattlePage {
  constructor() {
    this.selectedMode = null;
    this.selectedSubject = null;
    this.subjects = [];
    this.socket = null;
    this.init();
  }

  async init() {
    // Check authentication
    const token = localStorage.getItem('edurank-token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    // Load subjects
    await this.loadSubjects();

    // Attach event listeners
    this.attachEventListeners();

    // Initialize Socket.IO connection
    this.initSocket();
  }

  async loadSubjects() {
    try {
      const res = await fetch('/api/subjects');
      const data = await res.json();
      if (data.success) {
        this.subjects = data.subjects;
        this.renderSubjects();
      }
    } catch (err) {
      console.error('Error loading subjects:', err);
      this.showError('Gagal memuat mata pelajaran');
    }
  }

  renderSubjects() {
    const container = document.getElementById('subject-list');
    if (!container) return;

    if (!this.subjects || this.subjects.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl mb-2">school</span>
          <p>Belum ada mata pelajaran tersedia</p>
        </div>
      `;
      return;
    }

    // Deduplicate subjects by name
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
      'Matematika Lanjut': 'functions',
      'Informatika': 'code'
    };

    container.innerHTML = uniqueSubjects.map(subject => {
      const icon = icons[subject.name] || 'menu_book';
      return `
        <button class="subject-card p-space-md rounded-xl border-2 border-outline-variant/30 bg-surface-container-low hover:border-primary hover:bg-surface-container-lowest transition-all flex items-start gap-space-sm text-left" data-subject-id="${subject.id}" data-subject-name="${subject.name}">
          <div class="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[20px]">${icon}</span>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="font-title-md text-title-md font-semibold text-on-surface">${subject.name}</span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">Kelas ${subject.classLevel || '-'}</span>
          </div>
        </button>
      `;
    }).join('');

    // Attach click handlers
    container.querySelectorAll('.subject-card').forEach(card => {
      card.addEventListener('click', () => {
        // Remove active state from all cards
        container.querySelectorAll('.subject-card').forEach(c => {
          c.classList.remove('border-primary', 'bg-surface-container-lowest');
          c.classList.add('border-outline-variant/30', 'bg-surface-container-low');
        });
        
        // Add active state to selected card
        card.classList.remove('border-outline-variant/30', 'bg-surface-container-low');
        card.classList.add('border-primary', 'bg-surface-container-lowest');
        
        this.selectedSubject = {
          id: card.dataset.subjectId,
          name: card.dataset.subjectName
        };
      });
    });
  }

  attachEventListeners() {
    // Ranked mode button
    const rankedBtn = document.getElementById('btn-ranked');
    if (rankedBtn) {
      rankedBtn.addEventListener('click', () => {
        this.selectedMode = 'ranked';
        this.showSubjectModal();
      });
    }

    // Classic mode button
    const classicBtn = document.getElementById('btn-classic');
    if (classicBtn) {
      classicBtn.addEventListener('click', () => {
        this.selectedMode = 'classic';
        this.showSubjectModal();
      });
    }

    // Create room button
    const createRoomBtn = document.getElementById('btn-create-room');
    if (createRoomBtn) {
      createRoomBtn.addEventListener('click', () => {
        this.selectedMode = 'custom';
        this.showSubjectModal();
      });
    }

    // Join room button
    const joinRoomBtn = document.getElementById('btn-join-room');
    if (joinRoomBtn) {
      joinRoomBtn.addEventListener('click', () => {
        this.joinRoomByCode();
      });
    }

    // VS AI button
    const vsAiBtn = document.getElementById('btn-vs-ai');
    if (vsAiBtn) {
      vsAiBtn.addEventListener('click', () => {
        this.selectedMode = 'ai';
        this.showSubjectModal();
      });
    }

    // Close modal button
    const closeModalBtn = document.getElementById('close-subject-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        this.hideSubjectModal();
      });
    }

    // Close modal on backdrop click
    const modal = document.getElementById('subject-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideSubjectModal();
        }
      });
    }

    // Add confirm button to subject modal
    this.addSubjectConfirmButton();
  }

  addSubjectConfirmButton() {
    const modal = document.getElementById('subject-modal');
    if (!modal) return;

    // Create confirm button if it doesn't exist
    if (!document.getElementById('btn-confirm-subject')) {
      const confirmBtn = document.createElement('button');
      confirmBtn.id = 'btn-confirm-subject';
      confirmBtn.className = 'w-full py-3 rounded-lg bg-secondary text-on-secondary font-label-lg hover:bg-primary transition-colors mt-space-md';
      confirmBtn.textContent = 'Mulai Mencari Lawan';
      confirmBtn.addEventListener('click', () => this.startMatchmaking());
      
      const modalContent = modal.querySelector('.relative');
      if (modalContent) {
        modalContent.appendChild(confirmBtn);
      }
    }
  }

  showSubjectModal() {
    const modal = document.getElementById('subject-modal');
    const diffContainer = document.getElementById('difficulty-selector-container');
    if (diffContainer) {
      if (this.selectedMode === 'ai') {
        diffContainer.classList.remove('hidden');
        this.selectedDifficulty = 'medium'; // Default
        
        // Setup diff button listeners
        diffContainer.querySelectorAll('.ai-diff-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            diffContainer.querySelectorAll('.ai-diff-btn').forEach(b => {
              b.classList.remove('border-primary', 'bg-primary/10', 'text-primary');
              b.classList.add('border-outline-variant/30', 'bg-surface-container-low', 'text-on-surface-variant');
            });
            btn.classList.remove('border-outline-variant/30', 'bg-surface-container-low', 'text-on-surface-variant');
            btn.classList.add('border-primary', 'bg-primary/10', 'text-primary');
            this.selectedDifficulty = btn.dataset.difficulty;
          });
        });
      } else {
        diffContainer.classList.add('hidden');
      }
    }

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  hideSubjectModal() {
    const modal = document.getElementById('subject-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  async joinRoomByCode() {
    const roomCode = prompt('Masukkan kode room (misal: ROOM123):');
    if (!roomCode) return;

    sessionStorage.setItem('currentBattleRoom', JSON.stringify({
      roomId: roomCode,
      mode: 'custom',
      subject: 'Fisika'
    }));
    window.location.href = 'custom_lobby.html';
  }

  startMatchmaking() {
    if (!this.selectedSubject) {
      alert('Silakan pilih mata pelajaran terlebih dahulu.');
      return;
    }

    if (!this.selectedMode) {
      alert('Silakan pilih mode pertandingan terlebih dahulu.');
      return;
    }

    if (this.selectedMode === 'ai') {
      this.startAIBattle();
    } else if (this.selectedMode === 'custom') {
      this.createPrivateRoom();
    } else {
      this.startOnlineMatchmaking();
    }
  }

  startOnlineMatchmaking() {
    if (!this.socket) {
      alert('Koneksi ke server battle belum tersedia. Silakan coba lagi.');
      return;
    }

    this.showMatchmakingWaiting();
    this.socket.emit('queue_classic', { subject: this.selectedSubject.name });
  }

  createPrivateRoom() {
    const roomData = {
      roomId: `ROOM-${Math.floor(100000 + Math.random() * 900000)}`,
      mode: 'custom',
      subject: this.selectedSubject.name
    };
    sessionStorage.setItem('currentBattleRoom', JSON.stringify(roomData));
    window.location.href = 'custom_lobby.html';
  }

  startAIBattle() {
    const roomData = {
      roomId: `ai-battle-${Date.now()}`,
      mode: 'ai',
      difficulty: this.selectedDifficulty || 'medium',
      subject: this.selectedSubject.name,
      isAI: true
    };
    
    sessionStorage.setItem('currentBattleRoom', JSON.stringify(roomData));
    window.location.href = 'classic_battle.html';
  }

  initSocket() {
    try {
      const token = localStorage.getItem('edurank-token');
      this.socket = io({
        auth: { token },
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Connected to battle server');
      });

      this.socket.on('match_found', (data) => {
        console.log('Match found:', data);
        this.startBattle(data);
      });

      this.socket.on('matchmaking_waiting', (data) => {
        console.log('Matchmaking waiting:', data);
        this.showMatchmakingWaiting();
      });

      this.socket.on('lobby_update', (data) => {
        console.log('Lobby update:', data);
        if (this.selectedMode === 'custom') {
          // Show room code for private room
          this.showPrivateRoomLobby(data);
        }
      });

      this.socket.on('battle_error', (data) => {
        console.error('Battle error:', data);
        alert(data.message || 'Terjadi kesalahan dalam pertandingan');
        this.hideSubjectModal();
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from battle server');
      });

    } catch (err) {
      console.error('Error initializing socket:', err);
    }
  }

  showMatchmakingWaiting() {
    // Show loading state while waiting for match
    const modal = document.getElementById('subject-modal');
    if (modal) {
      modal.innerHTML = `
        <div class="p-space-lg text-center">
          <div class="flex flex-col items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span class="material-symbols-outlined text-4xl text-primary animate-spin">hourglass_empty</span>
            </div>
            <h3 class="font-headline-md text-headline-md text-on-surface">Mencari Lawan...</h3>
            <p class="font-body-md text-body-md text-on-surface-variant">Mohon tunggu sebentar, kami sedang mencari lawan yang sesuai untukmu.</p>
            <button onclick="window.location.reload()" class="px-space-lg py-2.5 rounded-lg bg-surface-container-low text-on-surface font-label-md hover:bg-surface-container transition-colors">
              Batal
            </button>
          </div>
        </div>
      `;
    }
  }

  showPrivateRoomLobby(roomData) {
    const modal = document.getElementById('subject-modal');
    if (modal) {
      modal.innerHTML = `
        <div class="p-space-lg text-center">
          <div class="flex flex-col items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-tertiary-container/10 flex items-center justify-center">
              <span class="material-symbols-outlined text-4xl text-tertiary-container">key</span>
            </div>
            <h3 class="font-headline-md text-headline-md text-on-surface">Room Berhasil Dibuat!</h3>
            <p class="font-body-md text-body-md text-on-surface-variant">Bagikan kode room ini ke temanmu:</p>
            <div class="bg-surface-container-low p-4 rounded-xl">
              <span class="font-headline-lg text-headline-lg text-secondary font-bold">${roomData.roomId}</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant">Menunggu pemain lain bergabung...</p>
            <div class="flex gap-2">
              <button onclick="window.location.reload()" class="px-space-lg py-2.5 rounded-lg bg-surface-container-low text-on-surface font-label-md hover:bg-surface-container transition-colors">
                Batal
              </button>
              <button onclick="window.location.href='custom_lobby.html'" class="px-space-lg py-2.5 rounded-lg bg-secondary text-on-secondary font-label-md hover:bg-primary transition-colors">
                Masuk Lobby
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }

  startBattle(roomData) {
    // Navigate to appropriate battle page based on mode
    let battlePage = 'classic_battle.html';
    
    if (this.selectedMode === 'ranked') {
      battlePage = 'ranked_battle.html';
    } else if (this.selectedMode === 'custom') {
      battlePage = 'custom_battle.html';
    }

    // Store room data for the battle page
    sessionStorage.setItem('currentBattleRoom', JSON.stringify(roomData));
    
    // Navigate to battle page
    window.location.href = battlePage;
  }

  showError(message) {
    const container = document.getElementById('subject-list');
    if (container) {
      container.innerHTML = `
        <div class="col-span-full text-center text-error">
          <span class="material-symbols-outlined text-4xl mb-2">error</span>
          <p class="font-semibold">${message}</p>
        </div>
      `;
    }
  }
}

// Initialize battle page on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.battlePage = new BattlePage();
});
