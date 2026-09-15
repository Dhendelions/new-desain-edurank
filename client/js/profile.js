document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('edurank-token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    // Fetch comprehensive user data from home API (includes subjects, ranks, etc.)
    const res = await fetch('/api/home', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    
    if (!data.success) {
      if (res.status === 401) {
        localStorage.removeItem('edurank-token');
        window.location.href = 'login.html';
      }
      showError('Gagal memuat data profil');
      return;
    }

    renderProfile(data.user, data.subjectsData, data.battles);
    renderHeader(data.user, data.unreadNotifications);
    
  } catch (err) {
    console.error('Error fetching profile data:', err);
    showError('Gagal memuat data profil. Silakan coba lagi.');
  }
});

function renderHeader(user, unreadCount) {
  // Header is now handled by header.js, but we need to set the notification count
  if (window.headerComponent && typeof window.headerComponent.setUnreadCount === 'function') {
    window.headerComponent.setUnreadCount(unreadCount);
  }
}

function renderProfile(user, subjectsData, battles) {
  // Profile Header Section
  const profileName = document.getElementById('profile-name');
  const profileUsername = document.getElementById('profile-username');
  const profilePhoto = document.getElementById('profile-photo');
  const profileBio = document.getElementById('profile-bio');
  const profileId = document.getElementById('profile-id');
  
  if (profileName) profileName.textContent = user.name || 'Belum ada nama';
  if (profileUsername) profileUsername.textContent = user.email ? `@${user.email.split('@')[0]}` : '@username';
  if (profilePhoto) {
    profilePhoto.src = user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&size=128`;
  }
  if (profileBio) {
    profileBio.textContent = user.learningStyle 
      ? `Gaya belajar: ${user.learningStyle}. Bergabung sejak ${user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 'belum diketahui'}.`
      : 'Belum ada bio. Selesaikan tes gaya belajar untuk melihat informasi gaya belajar kamu.';
  }
  if (profileId) profileId.textContent = user.id || 'Belum ada ID';

  const progressEl = document.getElementById('profile-xp-level');
  if (progressEl) {
    const xp = Math.max(0, Number(user.xp) || 0);
    const level = Math.floor(xp / 100) + 1;
    const nextLevelXp = level * 100;
    const currentLevelXp = (level - 1) * 100;
    const progress = Math.min(100, Math.max(0, ((xp - currentLevelXp) / 100) * 100));
    
    progressEl.innerHTML = `
      <div class="flex flex-col gap-1 w-full max-w-xs">
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 font-label-sm text-secondary">
            <span class="material-symbols-outlined text-[15px]">bolt</span>${xp.toLocaleString('id-ID')} XP
          </span>
          <span class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-label-sm text-primary">
            <span class="material-symbols-outlined text-[15px]">workspace_premium</span>Level ${level}
          </span>
        </div>
        <div class="w-full bg-surface-container rounded-full h-2">
          <div class="bg-secondary rounded-full h-2 transition-all" style="width: ${progress}%"></div>
        </div>
        <span class="text-xs text-on-surface-variant">${xp.toLocaleString('id-ID')} / ${nextLevelXp.toLocaleString('id-ID')} XP</span>
      </div>
    `;
  }

  // Quick Stats Pills
  updateQuickStats(user);

  // Subject Ranks Section
  renderSubjectRanks(subjectsData);

  // Learning Style Section
  renderLearningStyle(user);

  // Activity Timeline Section
  renderActivityTimeline(battles);

  // Logout functionality
  const logoutBtn = document.querySelector('[data-logout]');
  if (logoutBtn && !logoutBtn.dataset.bound) {
    logoutBtn.dataset.bound = 'true';
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('edurank-token');
      window.location.href = 'login.html';
    });
  }

  // Add functionality to action buttons in profile header
  const editBtn = document.querySelector('button:has(.material-symbols-outlined)');
  const allButtons = document.querySelectorAll('button');
  allButtons.forEach(btn => {
    if (btn.dataset.bound) return;
    const buttonText = btn.textContent.trim().toLowerCase();
    
    // Edit Profile button
    if (buttonText.includes('edit') && buttonText.includes('profil')) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', () => {
        alert('Fitur edit profil akan segera tersedia.');
      });
    }
    
    // Share Profile button
    if (buttonText.includes('bagikan') && buttonText.includes('profil')) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', () => {
        alert('Fitur bagikan profil akan segera tersedia.');
      });
    }
    
    // Retake Learning Style button
    if (buttonText.includes('tes') && buttonText.includes('ulang')) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', () => {
        window.location.href = 'learning-style.html';
      });
    }
  });
}

function updateQuickStats(user) {
  // Learning Style
  const learningStyleEl = document.getElementById('stat-learning-style');
  if (learningStyleEl) {
    learningStyleEl.innerHTML = user.learningStyle || 'Belum tersedia';
  }

  // Join Date
  const joinDateEl = document.getElementById('stat-join-date');
  if (joinDateEl && user.createdAt) {
    joinDateEl.innerHTML = new Date(user.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  } else if (joinDateEl) {
    joinDateEl.innerHTML = 'Belum tersedia';
  }

  // Total Battles
  const totalBattlesEl = document.getElementById('stat-total-battles');
  if (totalBattlesEl) {
    totalBattlesEl.innerHTML = `${user.totalBattles || 0} Pertandingan`;
  }

  // Winrate
  const winrateEl = document.getElementById('stat-winrate');
  if (winrateEl) {
    const total = Number(user.totalBattles) || 0;
    const wins = Number(user.wins) || 0;
    const losses = Number(user.losses) || 0;
    const winrate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0';
    winrateEl.innerHTML = `${winrate}% (${wins}W - ${losses}L)`;
  }
}

function renderSubjectRanks(subjectsData) {
  const container = document.getElementById('subjects-container');
  if (!container) return;

  if (!subjectsData || subjectsData.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-8 text-center text-outline">
        <span class="material-symbols-outlined text-4xl mb-2">school</span>
        <p class="font-semibold">Belum ada data mata pelajaran</p>
      </div>
    `;
    return;
  }

  const icons = {
    'Fisika': 'science',
    'Matematika': 'calculate',
    'Bahasa Inggris': 'public',
    'Matematika Lanjut': 'functions',
    'Biologi': 'biotech',
    'Kimia': 'science',
    'Informatika': 'code'
  };

  container.innerHTML = subjectsData.map(sub => {
    const icon = icons[sub.subjectName] || 'menu_book';
    const elo = sub.elo || 0;
    const rank = sub.rank || 'Belum Ada Rank';
    
    return `
      <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div class="flex flex-col gap-space-sm">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm font-bold uppercase tracking-wider text-secondary px-2.5 py-1 bg-secondary/10 rounded-full">
              ${sub.subjectName}
            </span>
            <span class="font-label-md text-label-md text-secondary font-bold">
              ${elo} ELO
            </span>
          </div>
          <div class="flex items-center gap-space-sm mt-1">
            <div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary shrink-0">
              <span class="material-symbols-outlined text-[28px]">${icon}</span>
            </div>
            <div class="flex flex-col">
              <div class="font-headline-sm text-headline-sm text-on-surface">${rank}</div>
              <span class="font-label-sm text-label-sm text-tertiary font-medium">Kelas ${sub.classLevel || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderLearningStyle(user) {
  const learningStyleEl = document.getElementById('learning-style-name');
  const learningStyleScore = document.getElementById('learning-style-score');
  const learningStyleDesc = document.getElementById('learning-style-desc');
  const learningStyleTips = document.getElementById('learning-style-tips');
  
  if (learningStyleEl) {
    learningStyleEl.innerHTML = user.learningStyle || 'Belum ditentukan';
  }
  if (learningStyleScore) {
    learningStyleScore.textContent = user.learningStyle ? 'Tersedia' : 'Belum ada';
  }
  if (learningStyleDesc) {
    learningStyleDesc.innerHTML = user.learningStyle
      ? `Gaya belajar kamu adalah ${user.learningStyle}. Pelajari materi dengan cara yang paling efektif untukmu.`
      : 'Selesaikan tes gaya belajar untuk mengetahui metode belajar yang paling cocok untukmu.';
  }
  if (learningStyleTips) {
    learningStyleTips.textContent = user.learningStyle
      ? `Gunakan metode ${user.learningStyle} untuk hasil belajar yang optimal.`
      : 'Ikuti tes gaya belajar untuk mendapatkan tips personal.';
  }
}

function renderActivityTimeline(battles) {
  const container = document.getElementById('profile-activity-container');
  if (!container) return;

  const list = Array.isArray(battles) ? battles : [];
  if (list.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-on-surface-variant bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col items-center gap-2">
        <span class="material-symbols-outlined text-3xl text-outline">history_toggle_off</span>
        <p class="font-semibold text-body-sm text-on-surface">Belum ada riwayat aktivitas</p>
        <p class="font-body-sm text-outline text-xs">Mulai ikuti pertandingan atau pelajari materi untuk melihat riwayat aktivitas di sini.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(b => {
    const isWin = b.result === 'win';
    const bgClass = isWin ? 'bg-tertiary-container/15 text-tertiary-container border-tertiary-container/30' : 'bg-error-container/20 text-on-error-container border-error-container/40';
    const sign = isWin ? '+' : '-';
    const dateStr = b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Baru saja';

    return `
      <div class="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:bg-surface-container transition-colors">
        <div class="flex items-center gap-3">
          <div class="px-2.5 py-1 rounded-lg border font-label-sm text-label-sm font-bold ${bgClass}">
            ${isWin ? 'Menang' : 'Kalah'} (${sign}${Math.abs(b.elo_change || 0)} LP)
          </div>
          <div class="flex flex-col">
            <span class="font-title-md text-title-md font-bold text-on-surface">${b.subject_name || 'Pertandingan Umum'}</span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">Lawan: ${b.opponent_name || 'AI Bot'}</span>
          </div>
        </div>
        <span class="font-label-sm text-label-sm text-outline shrink-0">${dateStr}</span>
      </div>
    `;
  }).join('');
}

function showError(message) {
  const mainContent = document.querySelector('main');
  if (mainContent) {
    mainContent.innerHTML = `
      <div class="max-w-[1360px] mx-auto px-margin py-space-xl">
        <div class="bg-error-container/10 border border-error-container/30 rounded-2xl p-space-xl text-center">
          <span class="material-symbols-outlined text-4xl text-error mb-2">error</span>
          <h2 class="font-headline-lg text-headline-lg text-on-error-container mb-2">Terjadi Kesalahan</h2>
          <p class="font-body-md text-body-md text-on-error-container mb-4">${message}</p>
          <button onclick="window.location.reload()" class="px-space-lg py-2.5 rounded-lg bg-secondary text-on-secondary font-label-lg hover:bg-primary transition-colors">
            Coba Lagi
          </button>
        </div>
      </div>
    `;
  }
}
