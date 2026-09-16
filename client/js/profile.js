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

  const xp = Math.max(0, Number(user.xp) || 0);
  const level = Math.floor(xp / 100) + 1;
  const nextLevelXp = level * 100;
  const currentLevelXp = (level - 1) * 100;
  const progress = Math.min(100, Math.max(0, ((xp - currentLevelXp) / 100) * 100));

  const valXp = document.getElementById('val-user-xp');
  const valLevel = document.getElementById('val-user-level');
  const valNationalRank = document.getElementById('val-user-national-rank');
  const progressBar = document.getElementById('profile-progress-bar');
  const progressText = document.getElementById('profile-xp-text');

  if (valXp) valXp.textContent = `${xp.toLocaleString('id-ID')} XP`;
  if (valLevel) valLevel.textContent = `Level ${level}`;
  if (valNationalRank) valNationalRank.textContent = `#${user.nationalRank || 1} Nasional`;
  if (progressBar) progressBar.style.width = `${progress}%`;
  if (progressText) progressText.textContent = `${xp.toLocaleString('id-ID')} / ${nextLevelXp.toLocaleString('id-ID')} XP`;

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

  // Edit Profile modal setup
  const editModal = document.getElementById('edit-profile-modal');
  const btnEdit = document.getElementById('btn-edit-profile');
  const btnCloseEdit = document.getElementById('btn-close-edit-modal');
  const btnCancelEdit = document.getElementById('btn-cancel-edit-modal');
  const editForm = document.getElementById('edit-profile-form');
  const inputName = document.getElementById('edit-input-name');
  const inputEmail = document.getElementById('edit-input-email');
  const inputPhoto = document.getElementById('edit-input-photo');

  if (btnEdit && editModal) {
    btnEdit.onclick = () => {
      if (inputName) inputName.value = user.name || '';
      if (inputEmail) inputEmail.value = user.email || '';
      if (inputPhoto) inputPhoto.value = user.photo || '';
      editModal.classList.remove('hidden');
    };
  }

  const closeEditModal = () => {
    if (editModal) editModal.classList.add('hidden');
  };

  if (btnCloseEdit) btnCloseEdit.onclick = closeEditModal;
  if (btnCancelEdit) btnCancelEdit.onclick = closeEditModal;
  if (editModal) {
    editModal.onclick = (e) => {
      if (e.target === editModal) closeEditModal();
    };
  }

  if (editForm) {
    editForm.onsubmit = async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save-edit-profile');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Menyimpan...';
      }

      try {
        const newName = inputName.value.trim();
        const newEmailVal = inputEmail.value.trim().toLowerCase();
        const newPhotoVal = inputPhoto.value.trim();

        const token = localStorage.getItem('edurank-token');
        const res = await fetch('/api/user/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            email: user.email,
            name: newName,
            newEmail: newEmailVal,
            photo: newPhotoVal
          })
        });

        const resData = await res.json();
        if (resData.success && resData.user) {
          localStorage.setItem('edurank-user', JSON.stringify(resData.user));
          if (resData.user.email !== user.email && resData.token) {
            localStorage.setItem('edurank-token', resData.token);
          }
          if (window.headerComponent && typeof window.headerComponent.init === 'function') {
            window.headerComponent.user = resData.user;
            window.headerComponent.updateUserInfo();
          }
          alert('✅ Profil berhasil diperbarui!');
          closeEditModal();
          window.location.reload();
        } else {
          alert(resData.message || 'Gagal memperbarui profil.');
        }
      } catch (err) {
        console.error('Error updating profile:', err);
        alert('Gagal memperbarui profil. Periksa koneksi internet kamu.');
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Simpan Perubahan';
        }
      }
    };
  }

  // Add functionality to other action buttons in profile header
  const btnShare = document.getElementById('btn-share-profile');
  if (btnShare) {
    btnShare.onclick = () => {
      navigator.clipboard.writeText(window.location.href);
      alert('🔗 Link profil EduRank berhasil disalin ke clipboard!');
    };
  }
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

  // Filter out Matematika Lanjut
  const filtered = subjectsData.filter(s => s.subjectName !== 'Matematika Lanjut' && s.subjectName !== 'Matematika Tingkat Lanjut');

  const subjectConfig = {
    'Fisika': { icon: 'science', colorBg: 'bg-indigo-500/10', colorText: 'text-indigo-600', badgeBg: 'bg-indigo-500', barColor: 'bg-indigo-500' },
    'Matematika': { icon: 'calculate', colorBg: 'bg-blue-500/10', colorText: 'text-blue-600', badgeBg: 'bg-blue-500', barColor: 'bg-blue-500' },
    'Bahasa Inggris': { icon: 'translate', colorBg: 'bg-emerald-500/10', colorText: 'text-emerald-600', badgeBg: 'bg-emerald-500', barColor: 'bg-emerald-500' },
    'Informatika': { icon: 'code', colorBg: 'bg-amber-500/10', colorText: 'text-amber-600', badgeBg: 'bg-amber-500', barColor: 'bg-amber-500' }
  };

  container.innerHTML = filtered.map(sub => {
    const cfg = subjectConfig[sub.subjectName] || { icon: 'school', colorBg: 'bg-primary/10', colorText: 'text-primary', badgeBg: 'bg-primary', barColor: 'bg-primary' };
    const elo = sub.elo !== null && sub.elo !== undefined ? sub.elo : 100;
    
    let rankName = sub.rank;
    if (!rankName || rankName === 'Belum Ada Rank') {
      if (elo >= 1600) rankName = 'Profesor';
      else if (elo >= 1101) rankName = 'Master';
      else if (elo >= 701) rankName = 'Diamond';
      else if (elo >= 401) rankName = 'Gold';
      else if (elo >= 201) rankName = 'Silver';
      else rankName = 'Bronze';
    }

    // ELO progress towards next tier (tier max: 400 for silver, 700 gold, etc.)
    const progressPercent = Math.min(100, Math.max(15, (elo / 400) * 100));

    return `
      <div class="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-outline-variant/20 flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden">
        <div class="flex flex-col gap-space-md">
          
          <!-- Top Row: Name & ELO -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-xl ${cfg.colorBg} ${cfg.colorText} flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[22px]">${cfg.icon}</span>
              </div>
              <div>
                <h3 class="font-title-md text-title-md font-bold text-on-surface group-hover:text-primary transition-colors">${sub.subjectName}</h3>
                <span class="font-label-sm text-label-sm text-outline">Kelas ${sub.classLevel || 12}</span>
              </div>
            </div>
            
            <div class="flex flex-col items-end">
              <span class="font-headline-sm text-headline-sm font-black ${cfg.colorText}">${elo}</span>
              <span class="font-label-sm text-label-sm font-bold text-outline">ELO Rating</span>
            </div>
          </div>

          <!-- Bottom Row: Rank Badge & Progress Bar -->
          <div class="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
            <div class="flex items-center justify-between">
              <span class="font-label-sm text-label-sm font-bold uppercase tracking-wider text-outline">Peringkat Subjek</span>
              <div class="flex items-center gap-1.5">
                <span class="font-label-sm text-label-sm font-extrabold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md shadow-xs">${sub.rankPos || '#1'}</span>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${cfg.colorBg} ${cfg.colorText} font-label-sm text-label-sm font-bold">
                  <span class="material-symbols-outlined text-[14px]">military_tech</span>
                  ${rankName}
                </span>
              </div>
            </div>

            <!-- ELO Bar -->
            <div class="w-full bg-surface-container-low rounded-full h-2 overflow-hidden mt-1">
              <div class="${cfg.barColor} h-2 rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
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

  let list = Array.isArray(battles) ? battles : [];
  if (list.length === 0) {
    try {
      const localHist = JSON.parse(localStorage.getItem('edurank-battle-history') || '[]');
      list = localHist;
    } catch (e) {}
  }

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

  const modeBadgeMap = {
    'ranked': { name: 'Ranked', class: 'bg-secondary/10 text-secondary border-secondary/30' },
    'classic': { name: 'Classic', class: 'bg-primary/10 text-primary border-primary/30' },
    'custom': { name: 'Custom', class: 'bg-tertiary-container/15 text-tertiary border-tertiary/30' }
  };

  container.innerHTML = list.map(b => {
    const isWin = b.result === 'win';
    const isDraw = b.result === 'draw';
    const bgClass = isWin 
      ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' 
      : (isDraw ? 'bg-amber-500/15 text-amber-700 border-amber-500/30' : 'bg-rose-500/15 text-rose-700 border-rose-500/30');
    
    const sign = isWin ? '+' : (isDraw ? '' : '-');
    const modeInfo = modeBadgeMap[b.mode] || { name: 'Battle', class: 'bg-surface-container text-on-surface' };
    const dateStr = b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Baru saja';

    return `
      <div class="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:bg-surface-container transition-colors">
        <div class="flex items-center gap-3">
          <div class="px-2.5 py-1 rounded-lg border font-label-sm text-label-sm font-bold ${bgClass}">
            ${isWin ? 'Menang' : (isDraw ? 'Seri' : 'Kalah')} ${b.mode === 'ranked' ? `(${sign}${Math.abs(b.elo_change || 0)} LP)` : ''}
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="font-title-md text-title-md font-bold text-on-surface">${b.subject_name || 'Pertandingan Umum'}</span>
              <span class="px-2 py-0.5 rounded-full border text-[10px] font-bold ${modeInfo.class}">${modeInfo.name}</span>
            </div>
            <span class="font-body-sm text-body-sm text-on-surface-variant">Lawan: ${b.opponent_name || 'Lawan EduBot'}</span>
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
