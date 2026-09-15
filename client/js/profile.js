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

    renderProfile(data.user, data.subjectsData);
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

function renderProfile(user, subjectsData) {
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
      : 'Belum ada bio';
  }
  if (profileId) profileId.textContent = user.id || 'Belum ada ID';

  const progressEl = document.getElementById('profile-xp-level');
  if (progressEl) {
    const xp = Math.max(0, Number(user.xp) || 0);
    const level = Math.floor(xp / 100) + 1;
    progressEl.innerHTML = `
      <span class="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 font-label-sm text-secondary">
        <span class="material-symbols-outlined text-[15px]">bolt</span>${xp.toLocaleString('id-ID')} XP
      </span>
      <span class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-label-sm text-primary">
        <span class="material-symbols-outlined text-[15px]">workspace_premium</span>Level ${level}
      </span>`;
  }

  // Quick Stats Pills
  updateQuickStats(user);

  // Subject Ranks Section
  renderSubjectRanks(subjectsData);

  // Learning Style Section
  renderLearningStyle(user);

  // Logout functionality
  const logoutBtn = document.querySelector('[data-logout]');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('edurank-token');
      window.location.href = 'login.html';
    });
  }

  // Add functionality to all buttons in profile page
  const allButtons = document.querySelectorAll('button');
  allButtons.forEach(btn => {
    const buttonText = btn.textContent.trim().toLowerCase();
    
    // Edit Profile button
    if (buttonText.includes('edit') && buttonText.includes('profil')) {
      btn.addEventListener('click', () => {
        alert('Fitur edit profil akan segera tersedia.');
      });
    }
    
    // Share Profile button
    if (buttonText.includes('bagikan') && buttonText.includes('profil')) {
      btn.addEventListener('click', () => {
        alert('Fitur bagikan profil akan segera tersedia.');
      });
    }
    
    // Retake Learning Style button
    if (buttonText.includes('tes') && buttonText.includes('ulang')) {
      btn.addEventListener('click', () => {
        window.location.href = 'learning-style.html';
      });
    }
    
    // Play buttons in subject ranks
    if (buttonText.includes('mainkan')) {
      btn.addEventListener('click', () => {
        window.location.href = 'battle.html';
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
    const winrate = user.totalBattles > 0 
      ? ((user.wins / user.totalBattles) * 100).toFixed(1) 
      : 0;
    winrateEl.innerHTML = `${winrate}% (${user.wins || 0}W - ${user.losses || 0}L)`;
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
        <div class="mt-space-lg pt-space-md flex flex-col gap-space-xs bg-surface-container-low/50 -mx-space-md -mb-space-md p-space-md rounded-b-xl">
          <button class="w-full py-2 bg-secondary text-on-secondary rounded-lg font-label-sm hover:bg-primary transition-colors" onclick="window.location.href='classic_lobby.html'">
            Mainkan
          </button>
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
