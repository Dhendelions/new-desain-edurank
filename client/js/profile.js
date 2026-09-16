document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('edurank-token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    // Fetch comprehensive user data from home API (includes subjects, ranks, etc.)
    const res = await fetch(getApiUrl('/api/home'), {
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
    profileBio.textContent = `Bergabung sejak ${user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 'belum diketahui'}.`;
  }

  const xp = Math.max(0, Number(user.xp) || 0);
  const level = Math.floor(xp / 500) + 1;
  const nextLevelXp = level * 500;
  const currentLevelXp = (level - 1) * 500;
  const progress = Math.min(100, Math.max(0, ((xp - currentLevelXp) / 500) * 100));

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

  // Winstreak Section
  renderWinStreak(user);

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
  const inputPhotoFile = document.getElementById('edit-input-photo-file');
  const imgPreview = document.getElementById('img-preview');
  
  let base64Photo = user.photo || '';

  if (btnEdit && editModal) {
    btnEdit.onclick = () => {
      if (inputName) inputName.value = user.name || '';
      if (imgPreview) imgPreview.src = user.photo || 'img/default-avatar.png';
      base64Photo = user.photo || '';
      if (inputPhotoFile) inputPhotoFile.value = '';
      
      document.body.style.overflow = 'hidden'; // block scrolling
      editModal.classList.remove('hidden');
    };
  }

  const closeEditModal = () => {
    if (editModal) {
      editModal.classList.add('hidden');
      document.body.style.overflow = ''; // restore scrolling
    }
  };

  if (btnCloseEdit) btnCloseEdit.onclick = closeEditModal;
  if (btnCancelEdit) btnCancelEdit.onclick = closeEditModal;
  if (editModal) {
    editModal.onclick = (e) => {
      if (e.target === editModal) closeEditModal();
    };
  }

  // Handle file preview and conversion to base64
  if (inputPhotoFile) {
    inputPhotoFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB!');
        inputPhotoFile.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        base64Photo = event.target.result;
        if (imgPreview) imgPreview.src = base64Photo;
      };
      reader.readAsDataURL(file);
    });
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

        const token = localStorage.getItem('edurank-token');
        const res = await fetch(getApiUrl('/api/user/update'), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            email: user.email,
            name: newName,
            photo: base64Photo
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
  // Current Winstreak
  const streakEl = document.getElementById('stat-learning-style');
  if (streakEl) {
    const streak = Number(user.currentStreak) || 0;
    streakEl.innerHTML = `${streak} 🔥`;
  }

  // Stat label - update parent label text if present
  const streakLabel = streakEl ? streakEl.closest('.flex.flex-col')?.querySelector('.font-label-sm.text-on-surface-variant') : null;
  if (streakLabel) streakLabel.textContent = 'Win Streak';
  const streakIcon = streakEl ? streakEl.closest('.flex.items-center')?.querySelector('.material-symbols-outlined') : null;
  if (streakIcon) streakIcon.textContent = 'local_fire_department';

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

function renderWinStreak(user) {
  const currentStreak = Number(user.currentStreak) || 0;
  const longestStreak = Number(user.longestStreak) || 0;

  // Find the LEARNING STYLE section in profile and replace its content with winstreak
  const section = document.querySelector('section.glass-card');
  if (!section) return;

  section.innerHTML = `
    <div class="flex items-center gap-space-xs">
      <span class="material-symbols-outlined text-orange-500 text-[22px]">local_fire_department</span>
      <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Win Streak</h3>
    </div>
    <div class="bg-surface-container-low/70 rounded-2xl p-space-md flex gap-space-md border border-outline-variant/20">
      <div class="flex-1 flex flex-col items-center justify-center gap-1 bg-surface-container-lowest rounded-xl p-space-md border border-outline-variant/20 shadow-xs">
        <span class="text-3xl font-black text-orange-500">${currentStreak} 🔥</span>
        <span class="font-label-md text-label-md text-on-surface-variant font-bold uppercase tracking-wider">Current Streak</span>
        <span class="font-body-sm text-body-sm text-on-surface-variant">Kemenangan beruntun saat ini</span>
      </div>
      <div class="flex-1 flex flex-col items-center justify-center gap-1 bg-surface-container-lowest rounded-xl p-space-md border border-outline-variant/20 shadow-xs">
        <span class="text-3xl font-black text-amber-500">${longestStreak} 🏆</span>
        <span class="font-label-md text-label-md text-on-surface-variant font-bold uppercase tracking-wider">Longest Streak</span>
        <span class="font-body-sm text-body-sm text-on-surface-variant">Rekor kemenangan beruntun terbaikmu</span>
      </div>
    </div>
  `;
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
            ${isWin ? 'Menang' : (isDraw ? 'Seri' : 'Kalah')} ${b.mode === 'ranked' ? `(${sign}${Math.abs(b.elo_change || 0)} ELO)` : ''}
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="font-title-md text-title-md font-bold text-on-surface">${b.subject_name || 'Pertandingan Umum'}</span>
              <span class="px-2 py-0.5 rounded-full border text-[10px] font-bold ${modeInfo.class}">${modeInfo.name}</span>
            </div>
            <span class="font-body-sm text-body-sm text-on-surface-variant">Lawan: ${b.opponent_name || 'Lawan'}</span>
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
