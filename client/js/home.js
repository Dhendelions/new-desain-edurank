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
    renderMissions(data.missions);
    renderBattles(data.battles);
    renderQuickMatch(data.user);

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
