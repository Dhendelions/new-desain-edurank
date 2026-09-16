document.addEventListener('DOMContentLoaded', async () => {
  // Keep the competitive path together: ranks and daily missions are followed
  // by battle history
  const token = localStorage.getItem('edurank-token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch('/api/home', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.success) {
      if (res.status === 401) {
        localStorage.removeItem('edurank-token');
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
  const level = Math.floor(xp / 100) + 1;
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

  if (!leaderboard || leaderboard.length === 0) {
    container.innerHTML = `<div class="p-8 text-center text-on-surface-variant font-body-sm">Belum ada data peringkat nasional.</div>`;
    return;
  }

  const topRankers = leaderboard.slice(0, 5);

  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left font-body-md border-collapse">
        <thead>
          <tr class="border-b border-outline-variant/20 text-on-surface-variant font-label-sm uppercase tracking-wider">
            <th class="py-3 px-4 text-center w-12">#</th>
            <th class="py-3 px-4">Pelajar</th>
            <th class="py-3 px-4 text-center">Rank</th>
            <th class="py-3 px-4 text-right">Accumulative LP</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant/10">
          ${topRankers.map((u, i) => {
            const rankNum = i + 1;
            const isMe = currentUser && u.id === currentUser.id;
            let badge = `<span class="font-bold text-on-surface-variant">#${rankNum}</span>`;
            if (rankNum === 1) badge = `<span class="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-extrabold flex items-center justify-center text-xs mx-auto shadow-sm">1</span>`;
            else if (rankNum === 2) badge = `<span class="w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-extrabold flex items-center justify-center text-xs mx-auto shadow-sm">2</span>`;
            else if (rankNum === 3) badge = `<span class="w-7 h-7 rounded-full bg-amber-600 text-white font-extrabold flex items-center justify-center text-xs mx-auto shadow-sm">3</span>`;

            return `
              <tr class="${isMe ? 'bg-primary-container/10 font-bold' : 'hover:bg-surface-container-low'} transition-colors">
                <td class="py-3 px-4 text-center">${badge}</td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <img src="${u.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=random`}" class="w-8 h-8 rounded-full object-cover shrink-0" alt="${u.name}">
                    <span class="font-title-md text-title-md text-on-surface truncate">${u.name || 'Pelajar EduRank'}</span>
                    ${isMe ? '<span class="px-2 py-0.5 text-[10px] bg-primary text-on-primary rounded font-bold">Kamu</span>' : ''}
                  </div>
                </td>
                <td class="py-3 px-4 text-center">
                  <span class="px-2.5 py-0.5 rounded-full bg-surface-container-low text-secondary font-label-sm font-semibold">${u.rank_name || 'Bronze'}</span>
                </td>
                <td class="py-3 px-4 text-right font-bold text-secondary">
                  ${(Number(u.total_elo) || 0).toLocaleString('id-ID')} LP
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
      <div class="p-6 text-center text-on-surface-variant bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col items-center gap-2">
        <span class="material-symbols-outlined text-3xl text-outline">group_off</span>
        <p class="font-semibold text-body-sm text-on-surface">Belum ada teman aktif</p>
        <p class="font-body-sm text-outline text-xs">Klik tombol Cari untuk menemukan dan menambahkan teman baru.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(f => `
    <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:bg-surface-container transition-colors">
      <div class="flex items-center gap-2.5">
        <div class="relative">
          <img src="${f.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name || 'Friend')}&background=random`}" class="w-8 h-8 rounded-full object-cover" alt="${f.name}">
          <span class="w-2.5 h-2.5 rounded-full bg-tertiary-container absolute bottom-0 right-0 border border-white"></span>
        </div>
        <span class="font-title-md text-title-md text-on-surface font-semibold truncate">${f.name || 'Teman EduRank'}</span>
      </div>
      <button onclick="window.location.href='battle.html'" class="px-2.5 py-1 rounded-lg bg-secondary text-on-secondary font-label-sm hover:bg-primary transition-colors text-xs font-bold">
        Ajak Duel
      </button>
    </div>
  `).join('');
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
    <div class="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border border-outline-variant/30 text-on-surface">
      <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-4">
        <h3 class="font-bold text-lg flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">person_search</span> Cari & Tambah Teman
        </h3>
        <button onclick="document.getElementById('search-friend-modal').remove()" class="p-1 text-on-surface-variant hover:text-on-surface">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="flex gap-2 mb-4">
        <input id="friend-search-input" type="text" placeholder="Ketik nama teman..." class="flex-1 px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md focus:outline-none focus:border-primary">
        <button id="btn-do-search-friend" class="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-container transition-colors">
          Cari
        </button>
      </div>
      <div id="friend-search-results" class="max-h-64 overflow-y-auto flex flex-col gap-2">
        <p class="text-center text-outline py-4 text-xs">Masukkan nama untuk mencari teman baru.</p>
      </div>
    </div>
  `;

  const input = document.getElementById('friend-search-input');
  const searchBtn = document.getElementById('btn-do-search-friend');
  const resultsContainer = document.getElementById('friend-search-results');

  const doSearch = async () => {
    const q = input.value.trim();
    if (!q) return;

    resultsContainer.innerHTML = '<p class="text-center text-outline py-4 text-xs animate-pulse">Mencari...</p>';
    try {
      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (!data.users || data.users.length === 0) {
        resultsContainer.innerHTML = '<p class="text-center text-outline py-4 text-xs">Teman tidak ditemukan.</p>';
        return;
      }

      const token = localStorage.getItem('edurank-token');

      resultsContainer.innerHTML = data.users.map(u => `
        <div class="flex items-center justify-between p-2 rounded-xl bg-surface-container-low border border-outline-variant/20">
          <div class="flex items-center gap-2">
            <img src="${u.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`}" class="w-8 h-8 rounded-full">
            <span class="font-bold text-sm text-on-surface">${u.name}</span>
          </div>
          <button data-user-id="${u.id}" class="btn-add-friend-action px-3 py-1 rounded-lg bg-secondary text-on-secondary font-bold text-xs hover:bg-primary transition-colors">
            + Tambah
          </button>
        </div>
      `).join('');

      resultsContainer.querySelectorAll('.btn-add-friend-action').forEach(b => {
        b.addEventListener('click', async () => {
          const receiverId = b.dataset.userId;
          try {
            const addRes = await fetch('/api/friends/request', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ receiverId })
            });
            const addData = await addRes.json();
            alert(addData.message || 'Berhasil menambahkan teman!');
            window.location.reload();
          } catch (e) {
            alert('Gagal menambahkan teman.');
          }
        });
      });

    } catch (err) {
      resultsContainer.innerHTML = '<p class="text-center text-error py-4 text-xs">Terjadi kesalahan pencarian.</p>';
    }
  };

  searchBtn.addEventListener('click', doSearch);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doSearch();
  });
}
