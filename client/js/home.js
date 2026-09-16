document.addEventListener('DOMContentLoaded', async () => {
  // Keep the competitive path together: ranks and daily missions are followed
  // by battle history
  const token = localStorage.getItem('edurank-token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(getApiUrl('/api/home'), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.success) {
      if (res.status === 401 || res.status === 404 || !data.user) {
        localStorage.removeItem('edurank-token');
        localStorage.removeItem('edurank-user');
        window.location.href = 'login.html';
      } else {
        showError('Gagal memuat data. Silakan coba lagi.');
      }
      return;
    }

    renderHeader(data.user, data.unreadNotifications);
    renderHero(data.user);
    renderUserStats(data.user);
    renderSubjects(data.subjectsData);
    renderLeaderboardPreview(data.leaderboard, data.user);
    renderFriends(data.friends);
    renderMissions(data.missions);
    renderBattles(data.battles);
    renderQuickMatch(data.user);

    // Auto-scroll to section if hash is present (e.g., #home-curriculum-section or #home-arena-section)
    if (window.location.hash) {
      setTimeout(() => {
        const target = document.querySelector(window.location.hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    }

  } catch (err) {
    console.error('Error fetching home data:', err);
    showError('Gagal memuat data. Periksa koneksi internet Anda.');
  }
});

function showError(message) {
  const mainContent = document.querySelector('main');
  if (mainContent) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'max-w-[1360px] mx-auto px-margin py-space-xl';
    errorDiv.innerHTML = `
      <div class="bg-error-container/10 border border-error-container/30 rounded-2xl p-space-xl text-center">
        <span class="material-symbols-outlined text-4xl text-error mb-2">error</span>
        <h2 class="font-headline-lg text-headline-lg text-on-error-container mb-2">Terjadi Kesalahan</h2>
        <p class="font-body-md text-body-md text-on-error-container mb-4">${message}</p>
        <button onclick="window.location.reload()" class="px-space-lg py-2.5 rounded-lg bg-secondary text-on-secondary font-label-lg hover:bg-primary transition-colors">
          Coba Lagi
        </button>
      </div>
    `;
    mainContent.insertBefore(errorDiv, mainContent.firstChild);
  }
}

function renderHeader(user, unreadCount) {
  // Header is now handled by header.js, but we need to set the notification count
  if (window.headerComponent && typeof window.headerComponent.setUnreadCount === 'function') {
    window.headerComponent.setUnreadCount(unreadCount);
  }
}

function renderHero(user) {
  document.getElementById('hero-greeting').innerHTML = `Halo, ${user.name}! <span class="inline-block animate-bounce">👋</span>`;
}

function renderUserStats(user) {
  const container = document.getElementById('user-stats-container');
  if (!container) return;

  const xp = Math.max(0, Number(user.xp) || 0);
  const level = Math.floor(xp / 500) + 1;
  const elo = Math.max(0, Number(user.elo) || 0);
  const totalBattles = Math.max(0, Number(user.totalBattles) || 0);
  const wins = Math.max(0, Number(user.wins) || 0);
  const losses = Math.max(0, Number(user.losses) || 0);
  const draws = Math.max(0, Number(user.draws) || 0);
  const winrate = totalBattles > 0 ? ((wins / totalBattles) * 100).toFixed(1) : 0;

  container.innerHTML = `
    <div class="bg-surface-container-low p-space-md rounded-xl flex flex-col items-center justify-center gap-1">
      <span class="material-symbols-outlined text-secondary text-headline-sm">bolt</span>
      <span class="font-label-lg text-label-lg text-on-surface font-bold">${xp.toLocaleString('id-ID')}</span>
      <span class="font-label-sm text-label-sm text-on-surface-variant">Total XP</span>
    </div>
    <div class="bg-surface-container-low p-space-md rounded-xl flex flex-col items-center justify-center gap-1">
      <span class="material-symbols-outlined text-primary text-headline-sm">workspace_premium</span>
      <span class="font-label-lg text-label-lg text-on-surface font-bold">Level ${level}</span>
      <span class="font-label-sm text-label-sm text-on-surface-variant">Level Akun</span>
    </div>
    <div class="bg-surface-container-low p-space-md rounded-xl flex flex-col items-center justify-center gap-1">
      <span class="material-symbols-outlined text-tertiary-container text-headline-sm">military_tech</span>
      <span class="font-label-lg text-label-lg text-on-surface font-bold">${elo.toLocaleString('id-ID')}</span>
      <span class="font-label-sm text-label-sm text-on-surface-variant">Total ELO</span>
    </div>
    <div class="bg-surface-container-low p-space-md rounded-xl flex flex-col items-center justify-center gap-1">
      <span class="material-symbols-outlined text-secondary text-headline-sm">emoji_events</span>
      <span class="font-label-lg text-label-lg text-on-surface font-bold">${winrate}%</span>
      <span class="font-label-sm text-label-sm text-on-surface-variant">Win Rate</span>
    </div>
  `;
}

function renderQuickMatch(user) {
  // Add Quick Match button functionality to hero section
  const quickMatchBtn = document.getElementById('btn-quick-match');
  if (quickMatchBtn) {
    quickMatchBtn.addEventListener('click', () => {
      window.location.href = 'battle.html';
    });
  }
}



function renderMissions(missions) {
  const container = document.getElementById('missions-container');
  const reset = document.getElementById('missions-reset');
  const seconds = missions && missions[0] ? Number(missions[0].seconds_until_reset) : 0;
  if (reset && seconds > 0) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    reset.textContent = `Reset dalam ${hours}j ${minutes}m`;
  } else if (reset) reset.textContent = 'Reset mengikuti waktu server';
  if (!missions || missions.length === 0) {
    container.innerHTML = `<div class="text-outline col-span-full py-4 text-center">Belum ada misi harian yang aktif.</div>`;
    return;
  }

  container.innerHTML = missions.map(m => {
    const progress = Math.max(0, Number(m.progress) || 0);
    const target = Math.max(1, Number(m.target) || 1);
    const rewardXp = Math.max(0, Number(m.reward_xp) || 0);
    const title = typeof m.title === 'string' && m.title.trim() ? m.title.trim() : 'Misi Harian';
    const description = typeof m.description === 'string' ? m.description.trim() : 'Selesaikan aktivitas belajar untuk mendapatkan reward.';
    const missionIcon = ({ matches: 'sports_esports', wins: 'emoji_events', ranked_wins: 'military_tech', answers: 'quiz', accuracy: 'target' })[m.mission_type] || 'task_alt';
    const isCompleted = Boolean(m.completed) || progress >= target;
    const progressPercent = Math.min(100, Math.round((progress / target) * 100));
    return `
      <div class="bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between gap-2 min-h-[100px]">
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <span class="flex min-w-0 items-center gap-1.5 font-label-md text-label-md text-on-surface font-bold truncate"><span class="material-symbols-outlined text-[17px] text-secondary">${missionIcon}</span><span class="truncate">${title}</span></span>
            <span class="font-label-sm text-label-sm ${isCompleted ? 'text-tertiary-container' : 'text-secondary'} font-bold shrink-0 ml-2">
              ${isCompleted ? 'Selesai' : `${progress}/${target}`}
            </span>
          </div>
          <p class="font-body-sm text-on-surface-variant line-clamp-2">${description} · +${rewardXp} XP</p>
        </div>
        <div class="w-full bg-surface-container rounded-full h-2 mt-auto">
          <div class="${isCompleted ? 'bg-tertiary-container' : 'bg-secondary'} h-2 rounded-full transition-all duration-300" style="width: ${progressPercent}%"></div>
        </div>
      </div>
    `;
  }).join('');
}





function renderBattles(battles) {
  const container = document.getElementById('home-battle-history-container') || document.getElementById('battle-history-container');
  if (!container) return;

  // Combine DB battles and local history cache fallback
  let list = Array.isArray(battles) ? battles : [];
  if (list.length === 0) {
    try {
      const localHist = JSON.parse(localStorage.getItem('edurank-battle-history') || '[]');
      list = localHist;
    } catch (e) {}
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col items-center justify-center gap-2">
        <span class="material-symbols-outlined text-3xl text-outline">sports_esports</span>
        <p class="font-bold text-on-surface">Belum ada riwayat pertandingan terbaru.</p>
        <p class="text-body-sm text-outline">Mainkan Ranked, Classic, atau Custom match untuk mencatat riwayat di sini!</p>
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
      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' 
      : (isDraw ? 'bg-amber-500/10 text-amber-700 border-amber-500/30' : 'bg-rose-500/10 text-rose-700 border-rose-500/30');
    
    const sign = isWin ? '+' : (isDraw ? '' : '-');
    const modeInfo = modeBadgeMap[b.mode] || { name: 'Battle', class: 'bg-surface-container text-on-surface' };
    const dateStr = b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Baru saja';

    return `
      <div class="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-surface-container transition-colors shadow-xs">
        <div class="flex items-center gap-3">
          <div class="px-3 py-1.5 rounded-xl border font-label-md text-label-md font-bold whitespace-nowrap ${bgClass}">
            ${isWin ? 'Menang' : (isDraw ? 'Seri' : 'Kalah')} ${b.mode === 'ranked' ? `(${sign}${Math.abs(b.elo_change || 0)} LP)` : ''}
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="font-title-md text-title-md font-bold text-on-surface">${b.subject_name || 'Pertandingan Umum'}</span>
              <span class="px-2 py-0.5 rounded-full border text-[11px] font-bold ${modeInfo.class}">${modeInfo.name}</span>
            </div>
            <span class="font-body-sm text-body-sm text-on-surface-variant">Lawan: ${b.opponent_name || 'Lawan EduBot'}</span>
          </div>
        </div>
        <div class="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-outline-variant/10">
          <span class="font-label-sm text-label-sm text-outline shrink-0">${dateStr}</span>
          <button class="battle-review-btn px-3 py-1.5 rounded-xl bg-surface-container-lowest text-primary hover:bg-primary hover:text-on-primary font-label-sm font-bold border border-outline-variant/30 transition-all shadow-xs" type="button" data-battle-id="${b.id || ''}">
            Tinjau Pembahasan
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.battle-review-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      alert('Fitur tinjau pembahasan lengkap tersedia saat membuka statistik battle arena.');
    });
  });
}

function renderSubjects() {
  const container = document.getElementById('subjects-grid-container');
  if (!container) return;

  const classesToDisplay = [
    {
      level: '10',
      title: 'Kelas 10 (Fase E)',
      badge: 'Fase E',
      icon: 'school',
      iconBg: 'bg-primary/10 text-primary',
      badgeBg: 'bg-primary/10 text-primary',
      desc: 'Fondasi utama Kurikulum Merdeka: Aljabar Dasar, Vektor, Fisika Dasar, Bahasa Inggris & Pengenalan Informatika.'
    },
    {
      level: '11',
      title: 'Kelas 11 (Fase F)',
      badge: 'Fase F',
      icon: 'menu_book',
      iconBg: 'bg-secondary/10 text-secondary',
      badgeBg: 'bg-secondary/10 text-secondary',
      desc: 'Pendalaman Kompetensi: Matriks, Fungsi Kuadrat, Dinamika Gerak, Grammar Lanjut & Pemrograman Algoritma.'
    },
    {
      level: '12',
      title: 'Kelas 12 (Fase F Lanjut)',
      badge: 'Fase F Lanjut',
      icon: 'workspace_premium',
      iconBg: 'bg-tertiary-container/15 text-tertiary-container',
      badgeBg: 'bg-tertiary-container/15 text-tertiary-container',
      desc: 'Persiapan Ujian & SNBT: Kalkulus, Trigonometri, Termodinamika, Academic Writing & Struktur Data Komputasi.'
    }
  ];

  container.innerHTML = classesToDisplay.map(cls => `
    <div class="bg-surface-container-lowest p-space-lg rounded-3xl shadow-sm border border-outline-variant/30 hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between group relative overflow-hidden">
      <div>
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 rounded-2xl ${cls.iconBg} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span class="material-symbols-outlined text-[26px]">${cls.icon}</span>
          </div>
          <span class="font-label-sm text-label-sm font-extrabold px-3 py-1 rounded-full ${cls.badgeBg}">
            ${cls.badge}
          </span>
        </div>
        <h3 class="font-headline-sm text-headline-sm font-extrabold text-on-surface group-hover:text-primary transition-colors">${cls.title}</h3>
        <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mt-2 mb-4">${cls.desc}</p>
      </div>
      <div class="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
        <a href="materi.html?level=Kelas%20${cls.level}" class="w-full py-2.5 rounded-xl bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary font-label-md text-label-md font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-sm">
          <span>Jelajahi Materi Kelas ${cls.level}</span>
          <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </a>
      </div>
    </div>
  `).join('');
}

function renderLeaderboardPreview(leaderboard, currentUser) {
  const container = document.getElementById('home-leaderboard-container');
  if (!container) return;

  const rawList = Array.isArray(leaderboard) ? leaderboard : [];
  const displayRows = [...rawList.slice(0, 10)];
  while (displayRows.length < 10) {
    displayRows.push({ isPlaceholder: true });
  }

  const rankClassMap = {
    'Bronze': 'bg-amber-900/10 text-amber-900 border-amber-800/20',
    'Silver': 'bg-slate-400/15 text-slate-800 border-slate-500/20',
    'Gold': 'bg-amber-400/15 text-amber-800 border-amber-500/30',
    'Diamond': 'bg-sky-400/15 text-sky-800 border-sky-500/30',
    'Master': 'bg-purple-400/15 text-purple-900 border-purple-500/30',
    'Profesor': 'bg-rose-400/15 text-rose-900 border-rose-500/30'
  };

  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left font-body-md border-collapse">
        <thead>
          <tr class="border-b border-outline-variant/20 text-on-surface-variant font-label-sm uppercase tracking-wider">
            <th class="py-3 px-4 text-center w-12">#</th>
            <th class="py-3 px-4">Siswa</th>
            <th class="py-3 px-4 text-center">Rank Tier</th>
            <th class="py-3 px-4 text-right">Rating ELO (LP)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant/10">
          ${displayRows.map((u, i) => {
            const rankNum = i + 1;
            let badge = `<span class="font-bold text-on-surface-variant">#${rankNum}</span>`;
            if (rankNum === 1) badge = `<span class="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-extrabold flex items-center justify-center text-xs mx-auto shadow-xs">1</span>`;
            else if (rankNum === 2) badge = `<span class="w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-extrabold flex items-center justify-center text-xs mx-auto shadow-xs">2</span>`;
            else if (rankNum === 3) badge = `<span class="w-7 h-7 rounded-full bg-amber-600 text-white font-extrabold flex items-center justify-center text-xs mx-auto shadow-xs">3</span>`;

            if (u.isPlaceholder) {
              return `
                <tr class="opacity-50">
                  <td class="py-3 px-4 text-center">${badge}</td>
                  <td class="py-3 px-4"><span class="text-outline font-bold pl-2">-</span></td>
                  <td class="py-3 px-4 text-center"><span class="text-outline font-bold">-</span></td>
                  <td class="py-3 px-4 text-right"><span class="text-outline font-bold pr-2">-</span></td>
                </tr>
              `;
            }

            const isMe = currentUser && u.id === currentUser.id;
            const eloVal = Number(u.total_elo || u.elo || 400);
            const rankName = u.rank_name || calculateRank(eloVal);
            const badgeStyle = rankClassMap[rankName] || 'bg-surface-container-low text-on-surface';

            return `
              <tr class="${isMe ? 'bg-primary-container/10 font-bold' : 'hover:bg-surface-container-low'} transition-colors">
                <td class="py-3 px-4 text-center">${badge}</td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <img src="${u.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=random`}" class="w-8 h-8 rounded-full object-cover shrink-0" alt="${u.name}">
                    <span class="font-title-md text-title-md text-on-surface truncate">${escapeHtml(u.name || 'Pelajar EduRank')}</span>
                    ${isMe ? '<span class="px-2 py-0.5 text-[10px] bg-primary text-on-primary rounded font-bold">Kamu</span>' : ''}
                  </div>
                </td>
                <td class="py-3 px-4 text-center">
                  <span class="px-3 py-1 rounded-full border text-xs font-bold ${badgeStyle}">${rankName}</span>
                </td>
                <td class="py-3 px-4 text-right font-bold text-on-surface">
                  ${eloVal.toLocaleString('id-ID')} LP
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderFriends(friends) {
  const container = document.getElementById('home-friends-container');
  const countBadge = document.getElementById('friends-count');
  const addBtn = document.getElementById('btn-add-friend');
  if (!container) return;

  const list = Array.isArray(friends) ? friends : [];
  if (countBadge) countBadge.textContent = `${list.length} Teman`;

  if (addBtn && !addBtn.dataset.bound) {
    addBtn.dataset.bound = 'true';
    addBtn.addEventListener('click', () => {
      showSearchFriendModal();
    });
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="p-5 text-center text-on-surface-variant bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col items-center gap-1.5">
        <span class="material-symbols-outlined text-2xl text-outline">group_off</span>
        <p class="font-bold text-xs text-on-surface">Belum ada teman aktif</p>
        <p class="text-outline text-[11px]">Klik + Cari untuk menambah teman baru.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(f => {
    const friendName = f.name || 'Teman EduRank';
    const photoUrl = f.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(friendName)}&background=random`;

    return `
      <div class="flex items-center justify-between p-2 px-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/40 transition-all shadow-xs">
        <div class="flex items-center gap-2 min-w-0">
          <div class="relative shrink-0">
            <img src="${photoUrl}" class="w-7 h-7 rounded-full object-cover ring-1 ring-outline-variant/30" alt="${friendName}">
            <span class="w-2 h-2 rounded-full bg-tertiary-container absolute bottom-0 right-0 border border-white"></span>
          </div>
          <span class="font-bold text-xs text-on-surface truncate max-w-[100px] sm:max-w-[130px]">${friendName}</span>
        </div>
        
        <div class="flex items-center gap-1 shrink-0">
          <button onclick="showFriendProfileModal('${f.id}')" title="Lihat Profil" class="p-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors">
            <span class="material-symbols-outlined text-[16px]">account_circle</span>
          </button>
          <button onclick="inviteFriendDuel('${f.id}')" title="Undang Duel" class="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-colors">
            <span class="material-symbols-outlined text-[16px]">swords</span>
          </button>
          <button onclick="showWhisperModal('${f.id}', '${encodeURIComponent(friendName)}')" title="Kirim Whisper" class="p-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary hover:text-on-secondary transition-colors">
            <span class="material-symbols-outlined text-[16px]">chat</span>
          </button>
          <button onclick="unfriendFriend('${f.id}', '${encodeURIComponent(friendName)}')" title="Hapus Teman" class="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors">
            <span class="material-symbols-outlined text-[16px]">person_remove</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Global modal handlers for Friend actions
window.showFriendProfileModal = async function(friendId) {
  let modal = document.getElementById('friend-profile-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'friend-profile-modal';
    modal.className = 'fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="w-full max-w-xs bg-surface-container-lowest rounded-2xl p-5 shadow-2xl border border-outline-variant/30 text-on-surface text-center animate-in fade-in zoom-in-95 duration-150">
      <div class="flex justify-end">
        <button onclick="document.getElementById('friend-profile-modal').remove()" class="w-6 h-6 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container flex items-center justify-center">
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
      <div id="friend-profile-content" class="py-2 flex flex-col items-center gap-2">
        <span class="material-symbols-outlined text-2xl text-outline animate-spin">progress_activity</span>
        <p class="text-xs text-outline font-medium">Memuat data profil teman...</p>
      </div>
    </div>
  `;

  try {
    const res = await fetch(getApiUrl(`/api/user/profile/${friendId}`));
    const data = await res.json();
    if (data.success && data.user) {
      const u = data.user;
      const total = Number(u.totalBattles) || 0;
      const wins = Number(u.wins) || 0;
      const winrate = total > 0 ? ((wins / total) * 100).toFixed(0) : '0';

      document.getElementById('friend-profile-content').innerHTML = `
        <img src="${u.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`}" class="w-16 h-16 rounded-full object-cover ring-4 ring-primary/10 mb-1">
        <h4 class="font-extrabold text-sm text-on-surface">${u.name}</h4>
        <span class="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-[11px] font-bold border border-secondary/20">${u.rank || 'Silver'} • ${u.elo || 400} ELO</span>
        
        <div class="grid grid-cols-2 gap-2 w-full mt-3 pt-3 border-t border-outline-variant/20 text-xs">
          <div class="bg-surface-container-low p-2 rounded-xl flex flex-col">
            <span class="text-outline text-[10px] font-bold uppercase">Total Battle</span>
            <span class="font-extrabold text-on-surface">${u.totalBattles || 0} Match</span>
          </div>
          <div class="bg-surface-container-low p-2 rounded-xl flex flex-col">
            <span class="text-outline text-[10px] font-bold uppercase">Winrate</span>
            <span class="font-extrabold text-emerald-600">${winrate}% (${u.wins || 0}W)</span>
          </div>
        </div>
      `;
    }
  } catch (e) {
    document.getElementById('friend-profile-content').innerHTML = '<p class="text-xs text-error">Gagal memuat statistik teman.</p>';
  }
};

window.inviteFriendDuel = async function(friendId) {
  const token = localStorage.getItem('edurank-token');
  try {
    const res = await fetch(getApiUrl('/api/friends/invite-duel'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ friendId, mode: 'custom' })
    });
    const data = await res.json();
    if (data.success) {
      showToastModal('Tantangan Duel Dikirim! ⚔️', `Kode Room: ${data.roomCode}. Mengarahkan ke lobby duel...`, () => {
        window.location.href = 'battle.html?mode=custom';
      });
    } else {
      showToastModal('Gagal Mengundang', data.message || 'Gagal mengirim tantangan.');
    }
  } catch (e) {
    showToastModal('Gagal Mengundang', 'Periksa koneksi internet kamu.');
  }
};

window.showWhisperModal = function(friendId, encodedName) {
  const name = decodeURIComponent(encodedName);
  let modal = document.getElementById('whisper-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'whisper-modal';
    modal.className = 'fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="w-full max-w-xs bg-surface-container-lowest rounded-2xl p-5 shadow-2xl border border-outline-variant/30 text-on-surface space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-outline-variant/20">
        <h4 class="font-bold text-xs flex items-center gap-1.5">
          <span class="material-symbols-outlined text-secondary text-sm">chat</span>
          <span>Whisper ke ${name}</span>
        </h4>
        <button onclick="document.getElementById('whisper-modal').remove()" class="w-6 h-6 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center">
          <span class="material-symbols-outlined text-xs">close</span>
        </button>
      </div>
      <textarea id="whisper-input-text" rows="3" class="w-full p-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-xs font-medium focus:outline-none focus:border-secondary" placeholder="Ketik pesan rahasia..."></textarea>
      <div class="flex justify-end gap-2">
        <button onclick="document.getElementById('whisper-modal').remove()" class="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-bold text-xs">Batal</button>
        <button id="btn-send-whisper" class="px-4 py-1.5 rounded-lg bg-secondary hover:bg-primary text-on-secondary font-bold text-xs transition-colors">Kirim</button>
      </div>
    </div>
  `;

  document.getElementById('btn-send-whisper').onclick = async () => {
    const text = document.getElementById('whisper-input-text').value.trim();
    if (!text) return;
    const token = localStorage.getItem('edurank-token');
    try {
      const res = await fetch(getApiUrl('/api/friends/whisper'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ friendId, message: text })
      });
      const data = await res.json();
      modal.remove();
      showToastModal('Whisper Terkirim 💬', `Pesan berhasil dikirim ke ${name}.`);
    } catch (e) {
      modal.remove();
      showToastModal('Gagal', 'Pesan tidak dapat terkirim.');
    }
  };
};

window.unfriendFriend = function(friendId, encodedName) {
  const name = decodeURIComponent(encodedName);
  let modal = document.getElementById('unfriend-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'unfriend-modal';
    modal.className = 'fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="w-full max-w-xs bg-surface-container-lowest rounded-2xl p-5 shadow-2xl border border-outline-variant/30 text-on-surface space-y-3 text-center">
      <div class="w-10 h-10 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
        <span class="material-symbols-outlined text-xl">person_remove</span>
      </div>
      <h4 class="font-extrabold text-sm text-on-surface">Hapus Pertemanan?</h4>
      <p class="text-xs text-on-surface-variant">Apakah kamu yakin ingin menghapus <b>${name}</b> dari daftar teman?</p>
      <div class="flex justify-center gap-2 pt-2 border-t border-outline-variant/20">
        <button onclick="document.getElementById('unfriend-modal').remove()" class="px-4 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-bold text-xs">Batal</button>
        <button id="btn-confirm-unfriend" class="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors">Hapus</button>
      </div>
    </div>
  `;

  document.getElementById('btn-confirm-unfriend').onclick = async () => {
    const token = localStorage.getItem('edurank-token');
    try {
      await fetch(getApiUrl('/api/friends/unfriend'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ friendId })
      });
      modal.remove();
      window.location.reload();
    } catch (e) {
      modal.remove();
    }
  };
};

function showToastModal(title, msg, onOk) {
  let modal = document.getElementById('toast-popup-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'toast-popup-modal';
    modal.className = 'fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="w-full max-w-xs bg-surface-container-lowest rounded-2xl p-5 shadow-2xl border border-outline-variant/30 text-on-surface space-y-3 text-center animate-in fade-in zoom-in-95 duration-150">
      <h4 class="font-extrabold text-sm text-on-surface">${title}</h4>
      <p class="text-xs text-on-surface-variant leading-relaxed">${msg}</p>
      <div class="pt-2 border-t border-outline-variant/15 flex justify-center">
        <button id="btn-toast-ok" class="px-5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-xs transition-all shadow-xs">OK</button>
      </div>
    </div>
  `;

  document.getElementById('btn-toast-ok').onclick = () => {
    modal.remove();
    if (typeof onOk === 'function') onOk();
  };
}

function showSearchFriendModal() {
  let modal = document.getElementById('search-friend-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'search-friend-modal';
    modal.className = 'fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="w-full max-w-xs bg-surface-container-lowest rounded-2xl p-5 shadow-2xl border border-outline-variant/30 text-on-surface space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-outline-variant/20">
        <h3 class="font-bold text-xs flex items-center gap-1.5">
          <span class="material-symbols-outlined text-primary text-base">person_search</span> Cari Teman
        </h3>
        <button onclick="document.getElementById('search-friend-modal').remove()" class="w-6 h-6 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center">
          <span class="material-symbols-outlined text-xs">close</span>
        </button>
      </div>
      <div class="flex gap-1.5">
        <input id="friend-search-input" type="text" placeholder="Nama teman..." class="flex-1 px-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs font-medium focus:outline-none focus:border-primary">
        <button id="btn-do-search-friend" class="px-3 py-1.5 bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-primary-container transition-colors">
          Cari
        </button>
      </div>
      <div id="friend-search-results" class="max-h-56 overflow-y-auto flex flex-col gap-1.5 pt-1">
        <p class="text-center text-outline py-3 text-[11px]">Ketik nama untuk mencari teman baru.</p>
      </div>
    </div>
  `;

  const input = document.getElementById('friend-search-input');
  const searchBtn = document.getElementById('btn-do-search-friend');
  const resultsContainer = document.getElementById('friend-search-results');

  const doSearch = async () => {
    const q = input.value.trim();
    if (!q) return;

    resultsContainer.innerHTML = '<p class="text-center text-outline py-3 text-[11px] animate-pulse">Mencari...</p>';
    try {
      const res = await fetch(getApiUrl(`/api/friends/search?q=${encodeURIComponent(q)}`));
      const data = await res.json();

      if (!data.users || data.users.length === 0) {
        resultsContainer.innerHTML = '<p class="text-center text-outline py-3 text-[11px]">Teman tidak ditemukan.</p>';
        return;
      }

      const token = localStorage.getItem('edurank-token');

      resultsContainer.innerHTML = data.users.map(u => `
        <div class="flex items-center justify-between p-2 rounded-xl bg-surface-container-low border border-outline-variant/20">
          <div class="flex items-center gap-2 min-w-0">
            <img src="${u.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`}" class="w-6 h-6 rounded-full shrink-0">
            <span class="font-bold text-xs text-on-surface truncate">${u.name}</span>
          </div>
          <button data-user-id="${u.id}" class="btn-add-friend-action px-2.5 py-1 rounded-lg bg-secondary text-on-secondary font-bold text-[11px] hover:bg-primary transition-colors shrink-0">
            + Tambah
          </button>
        </div>
      `).join('');

      resultsContainer.querySelectorAll('.btn-add-friend-action').forEach(b => {
        b.addEventListener('click', async () => {
          const receiverId = b.dataset.userId;
          try {
            const addRes = await fetch(getApiUrl('/api/friends/request'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ receiverId })
            });
            const addData = await addRes.json();
            modal.remove();
            showToastModal('Permintaan Pertemanan Terkirim! 📩', addData.message || 'Permintaan pertemanan berhasil dikirim.');
          } catch (e) {
            modal.remove();
            showToastModal('Gagal', 'Gagal mengirim permintaan pertemanan.');
          }
        });
      });

    } catch (err) {
      resultsContainer.innerHTML = '<p class="text-center text-error py-3 text-[11px]">Terjadi kesalahan pencarian.</p>';
    }
  };

  searchBtn.addEventListener('click', doSearch);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doSearch();
  });
}
