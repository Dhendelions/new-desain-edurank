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
  const container = document.getElementById('battle-history-container');
  if (!battles || battles.length === 0) {
    container.innerHTML = `<div class="p-10 text-center text-outline">Belum ada riwayat battle terbaru.</div>`;
    return;
  }

  container.innerHTML = battles.map(b => {
    const isWin = b.result === 'win';
    const bgClass = isWin ? 'bg-tertiary-container/10 text-tertiary-container' : 'bg-error-container text-on-error-container';
    const sign = isWin ? '+' : '-';
    return `
      <div class="p-space-md rounded-xl bg-surface-container-low flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md hover:bg-surface-container transition-colors">
        <div class="flex items-center gap-space-md">
          <div class="px-3 py-1.5 rounded-lg ${bgClass} font-label-md text-label-md font-bold whitespace-nowrap">
            ${isWin ? 'Menang' : 'Kalah'} (${sign}${Math.abs(b.elo_change)} ELO)
          </div>
          <div class="flex flex-col">
            <span class="font-label-md text-label-md text-on-surface font-bold">${b.subject_name || 'Mapel Umum'}</span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">Lawan: ${b.opponent_name || 'AI Bot'}</span>
          </div>
        </div>
        <div class="flex items-center gap-space-lg w-full md:w-auto justify-between md:justify-end">
          <button class="battle-review-btn px-3 py-1.5 rounded-lg bg-surface-container-lowest text-secondary font-label-sm text-label-sm font-semibold shadow-sm hover:bg-surface-container transition-colors" type="button" data-battle-id="${b.id}">
            Tinjau Pembahasan
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Add event listeners to review buttons
  container.querySelectorAll('.battle-review-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      alert('Fitur tinjau pembahasan akan segera tersedia.');
    });
  });
}

function renderSubjects(subjectsData) {
  const container = document.getElementById('subjects-grid-container');
  if (!container) return;

  const defaultSubjects = [
    { subjectName: 'Matematika', icon: 'calculate', color: 'bg-primary text-on-primary', desc: 'Aljabar, Matriks, Fungsi, Trigonometri & Kalkulus' },
    { subjectName: 'Fisika', icon: 'science', color: 'bg-tertiary-container text-on-tertiary', desc: 'Mekanika, Dinamika Gerak, Termodinamika & Magnet' },
    { subjectName: 'Bahasa Inggris', icon: 'translate', color: 'bg-primary-fixed text-primary', desc: 'Reading Comprehension, Grammar & Academic Structure' },
    { subjectName: 'Informatika', icon: 'code', color: 'bg-secondary-container text-on-secondary-container', desc: 'Algoritma, Pemrograman, Struktur Data & Komputasi' }
  ];

  const subjectsToDisplay = defaultSubjects.map(def => {
    const real = (subjectsData || []).find(s => s.subjectName && s.subjectName.toLowerCase() === def.subjectName.toLowerCase());
    return {
      name: def.subjectName,
      icon: def.icon,
      color: def.color,
      desc: def.desc,
      elo: real ? (real.elo || 0) : 100,
      rank: real ? (real.rank || 'Bronze') : 'Bronze'
    };
  });

  container.innerHTML = subjectsToDisplay.map(sub => `
    <div class="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30 hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between group">
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl ${sub.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span class="material-symbols-outlined text-[22px]">${sub.icon}</span>
          </div>
          <span class="font-label-sm text-label-sm font-bold px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary">
            ${sub.elo} ELO
          </span>
        </div>
        <h3 class="font-title-md text-title-md font-bold text-on-surface group-hover:text-primary transition-colors">${sub.name}</h3>
        <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mt-1 mb-4">${sub.desc}</p>
      </div>
      <div class="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
        <a href="materi.html" class="inline-flex items-center gap-1 text-primary font-label-md font-bold hover:underline">
          <span>Pelajari Materi</span>
          <span class="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
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
  if (!container) return;

  const list = Array.isArray(friends) ? friends : [];
  if (countBadge) countBadge.textContent = `${list.length} Teman`;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-on-surface-variant bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col items-center gap-2">
        <span class="material-symbols-outlined text-3xl text-outline">group_off</span>
        <p class="font-semibold text-body-sm text-on-surface">Belum ada teman aktif</p>
        <p class="font-body-sm text-outline text-xs">Ajak teman sekelasmu bergabung di EduRank untuk mulai bertanding bersama.</p>
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
        Ajak Main
      </button>
    </div>
  `).join('');
}
