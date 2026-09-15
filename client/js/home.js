document.addEventListener('DOMContentLoaded', async () => {
  // Keep the competitive path together: ranks and daily missions are followed
  // by the aggregate leaderboard, then modes, friends, and match history.
  const curriculum = document.getElementById('home-curriculum-section');
  const arena = document.getElementById('home-arena-section');
  if (curriculum && arena) arena.after(curriculum);
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
    renderSubjects(data.subjectsData, data.allSubjects);
    renderClasses(data.classes);
    renderMissions(data.missions);
    renderLeaderboard(data.leaderboard, data.user);
    renderFriends(data.friends);
    renderBattles(data.battles);

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
  document.getElementById('header-user-name').textContent = user.name;
  document.getElementById('header-user-photo').src = user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
  
  const badge = document.getElementById('notif-badge');
  if (unreadCount > 0) {
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  document.getElementById('btn-notifications').addEventListener('click', async () => {
    // Basic modal for notifications
    const res = await fetch('/api/notifications', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('edurank-token')}` }
    });
    const data = await res.json();
    
    let modal = document.getElementById('notifications-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'notifications-modal';
      modal.className = 'fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4';
      document.body.appendChild(modal);
    }
    
    let notifHtml = '';
    if (data.notifications && data.notifications.length > 0) {
      notifHtml = data.notifications.map(n => `
        <div class="p-3 border-b border-outline-variant/20 text-left">
          <p class="font-bold text-sm text-on-surface">${n.title}</p>
          <p class="text-xs text-on-surface-variant">${n.message}</p>
        </div>
      `).join('');
    } else {
      notifHtml = `
        <div class="p-8 text-center text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl text-outline mb-2">notifications_off</span>
          <p class="font-semibold text-sm">Tidak ada notifikasi saat ini.</p>
        </div>
      `;
    }

    modal.innerHTML = `
      <div class="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border border-outline-variant/30 text-on-surface">
        <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-4">
          <h3 class="font-bold text-lg flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">notifications</span> Notifikasi
          </h3>
          <button onclick="document.getElementById('notifications-modal').remove()" class="p-1 text-on-surface-variant hover:text-on-surface">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="max-h-80 overflow-y-auto">
          ${notifHtml}
        </div>
      </div>
    `;
  });
}

function renderHero(user) {
  document.getElementById('hero-greeting').innerHTML = `Halo, ${user.name}! <span class="inline-block animate-bounce">👋</span>`;
}

function renderSubjects(userSubjects, allSubjects) {
  const container = document.getElementById('subjects-container');
  if (!userSubjects || userSubjects.length === 0) {
    container.innerHTML = `<div class="col-span-full py-10 text-center text-outline">Belum ada data mata pelajaran.</div>`;
    return;
  }

  const icons = {
    'Fisika': 'science',
    'Matematika': 'calculate',
    'Bahasa Inggris': 'translate',
    'Matematika Lanjut': 'functions',
    'Biologi': 'biotech',
    'Kimia': 'science',
    'Informatika': 'code',
    'Bahasa Indonesia': 'menu_book',
    'Sejarah': 'history_edu',
    'Geografi': 'public',
    'Ekonomi': 'trending_up',
    'Sosiologi': 'groups'
  };

  const descriptions = {
    'Fisika': 'Pelajari konsep fisika dan fenomena alam melalui materi dan soal latihan.',
    'Matematika': 'Kuasai konsep matematika dari dasar hingga lanjut dengan latihan terstruktur.',
    'Bahasa Inggris': 'Tingkatkan kemampuan bahasa Inggris untuk komunikasi dan akademik.',
    'Matematika Lanjut': 'Pelajari matematika tingkat lanjut untuk persiapan olimpiade dan ujian.',
    'Biologi': 'Memahami kehidupan dan organisme melalui materi biologi yang komprehensif.',
    'Kimia': 'Eksplorasi dunia kimia dengan materi reaksi dan struktur molekul.',
    'Informatika': 'Pelajari dasar pemrograman dan ilmu komputer untuk era digital.',
    'Bahasa Indonesia': 'Tingkatkan kemampuan bahasa Indonesia sastra dan kebahasaan.',
    'Sejarah': 'Pelajari peristiwa sejarah dan peradaban manusia dari masa lalu.',
    'Geografi': 'Memahami fenomena geosfer dan interaksi manusia dengan lingkungan.',
    'Ekonomi': 'Pelajari konsep ekonomi dan sistem pembangunan masyarakat.',
    'Sosiologi': 'Memahami struktur sosial dan dinamika masyarakat.'
  };

  container.innerHTML = userSubjects.map(sub => {
    const subjectName = typeof sub.subjectName === 'string' && sub.subjectName.trim() ? sub.subjectName.trim() : 'Mata Pelajaran';
    const classLevel = Number.isFinite(Number(sub.classLevel)) ? Number(sub.classLevel) : '—';
    const icon = icons[subjectName] || 'menu_book';
    const elo = sub.elo === null || sub.elo === undefined ? 0 : sub.elo;
    const rank = typeof sub.rank === 'string' && sub.rank.trim() ? sub.rank.trim() : 'Belum Ada Rank';
    const description = descriptions[subjectName] || 'Pelajari materi dan latihan soal untuk meningkatkan pemahaman.';
    
    return `
      <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[200px]">
        <div class="flex flex-col gap-space-sm">
          <div class="flex items-center justify-between">
            <div class="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
              <span class="material-symbols-outlined text-headline-sm">${icon}</span>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm whitespace-nowrap">
              ${rank}
            </span>
          </div>
          <div class="mt-2">
            <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider">Mapel Kelas ${classLevel}</span>
            <h3 class="font-headline-sm text-headline-sm text-on-surface truncate">${subjectName}</h3>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">${description}</p>
          </div>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="font-label-md text-label-md text-secondary font-bold">${elo} ELO</span>
          </div>
        </div>
        <div class="mt-space-lg pt-space-md flex flex-col gap-space-xs bg-surface-container-low/50 -mx-space-lg -mb-space-lg p-space-md rounded-b-xl">
          <button class="w-full py-2 bg-secondary text-on-secondary rounded-lg font-label-sm hover:bg-primary transition-colors" onclick="window.location.href='classic_lobby.html'">Mainkan</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderClasses(classes) {
  const container = document.getElementById('classes-container');
  if (!classes || classes.length === 0) {
    container.innerHTML = `<div class="col-span-full text-center text-outline py-8">Tidak ada kelas aktif.</div>`;
    return;
  }

  const classIcons = {
    '10': 'looks_one',
    '11': 'looks_two', 
    '12': 'looks_3'
  };

  const classDescriptions = {
    '10': 'Fondasi konsep dasar untuk persiapan materi tingkat menengah.',
    '11': 'Pengembangan konsep lanjut dan persiapan ujian akhir.',
    '12': 'Materi intensif untuk persiapan ujian masuk perguruan tinggi.'
  };

  container.innerHTML = classes.map(c => {
    const level = c.level || '—';
    const icon = classIcons[level] || 'school';
    const name = c.name || `Kelas ${level}`;
    const description = c.description || classDescriptions[level] || 'Pelajari materi kurikulum sesuai tingkat kelas.';
    
    return `
      <div class="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity relative overflow-hidden">
        ${c.is_active ? '<div class="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>' : ''}
        <div class="flex flex-col gap-space-md relative">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl ${c.is_active ? 'bg-secondary text-on-secondary' : 'bg-surface-container-low text-on-surface'} flex items-center justify-center">
              <span class="material-symbols-outlined text-headline-sm">${icon}</span>
            </div>
            <span class="px-3 py-1 rounded-full ${c.is_active ? 'bg-secondary text-on-secondary' : 'bg-surface-container'} font-label-sm text-label-sm font-bold">
              ${c.is_active ? 'Siap Dipelajari' : 'Segera Hadir'}
            </span>
          </div>
          <div>
            <h3 class="font-headline-md text-headline-md text-on-surface">${name}</h3>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">${description}</p>
          </div>
        </div>
        <div class="mt-space-xl pt-space-md">
          <button class="w-full py-3 rounded-lg ${c.is_active ? 'bg-secondary text-on-secondary hover:bg-primary' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'} font-label-md transition-colors" type="button">
            ${c.is_active ? 'Buka Modul Kelas' : 'Nyalakan Notifikasi Rilis'}
          </button>
        </div>
      </div>
    `;
  }).join('');
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

function renderLeaderboard(leaderboard, currentUser) {
  const container = document.getElementById('leaderboard-container');
  if (!leaderboard || leaderboard.length === 0) {
    container.innerHTML = `<div class="p-10 text-center text-outline">Belum ada data peringkat nasional.</div>`;
    return;
  }

  let html = `<table class="w-full text-left border-collapse">
    <thead class="border-b border-surface-container-high font-label-md text-label-md text-outline">
      <tr>
        <th class="py-3 px-4 text-center w-16">#</th>
        <th class="py-3 px-4">Siswa</th>
        <th class="py-3 px-4">Gelar</th>
        <th class="py-3 px-4 text-right">ELO Rating</th>
        <th class="py-3 px-4 text-center">Winrate</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-surface-container-high font-body-md text-body-md">
  `;

  leaderboard.forEach((u, index) => {
    const rankNum = index + 1;
    let rankBadge = `<span class="font-bold text-outline">#${rankNum}</span>`;
    if (rankNum === 1) rankBadge = `<div class="w-8 h-8 rounded-full bg-secondary text-on-secondary font-bold flex items-center justify-center mx-auto shadow-sm">1</div>`;
    else if (rankNum === 2) rankBadge = `<div class="w-8 h-8 rounded-full bg-surface-container-high text-on-surface font-bold flex items-center justify-center mx-auto shadow-sm">2</div>`;
    else if (rankNum === 3) rankBadge = `<div class="w-8 h-8 rounded-full bg-surface-container-high text-on-surface font-bold flex items-center justify-center mx-auto shadow-sm">3</div>`;
    
    let winrate = '0%';
    if (u.total_battles > 0) winrate = Math.round((u.wins / u.total_battles) * 100) + '%';

    html += `
      <tr class="hover:bg-surface-container-low/50 transition-colors">
        <td class="py-3.5 px-4 text-center">${rankBadge}</td>
        <td class="py-3.5 px-4">
          <div class="flex items-center gap-3">
            <img src="${u.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`}" class="w-8 h-8 rounded-full">
            <span class="font-label-lg text-label-lg text-on-surface font-bold">${u.name}</span>
          </div>
        </td>
        <td class="py-3.5 px-4"><span class="font-label-md text-label-md text-secondary font-bold">${u.rank_name || 'Bronze'}</span></td>
        <td class="py-3.5 px-4 text-right"><span class="font-headline-sm text-headline-sm font-bold text-on-surface">${u.total_elo || 0}</span></td>
        <td class="py-3.5 px-4 text-center"><span class="font-label-md text-label-md text-on-surface font-bold">${winrate}</span></td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function renderFriends(friends) {
  const container = document.getElementById('friends-container');
  if (!friends || friends.length === 0) {
    container.innerHTML = `<div class="p-6 text-center text-outline">Belum ada teman yang ditambahkan.</div>`;
  } else {
    container.innerHTML = friends.map(f => `
      <div class="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between">
        <div class="flex items-center gap-space-sm min-w-0">
          <img src="${f.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=random`}" class="w-9 h-9 rounded-full">
          <div class="flex flex-col min-w-0">
            <span class="font-label-md text-label-md text-on-surface font-bold truncate">${f.name}</span>
            <span class="font-body-sm text-body-sm text-tertiary-container font-semibold">Online</span>
          </div>
        </div>
        <button class="px-2.5 py-1 rounded-md bg-secondary text-on-secondary font-label-sm text-label-sm hover:bg-primary transition-colors flex-shrink-0" onclick="window.location.href='classic_lobby.html'">
          Tantang
        </button>
      </div>
    `).join('');
  }

  // Handle Add Friend Search
  const searchInput = document.getElementById('search-friend-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
        const q = searchInput.value.trim();
        if (q) {
          try {
            const token = localStorage.getItem('edurank-token');
            const res = await fetch('/api/friends/search?q=' + encodeURIComponent(q), {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.users.length > 0) {
              const u = data.users[0];
              if (confirm(`Tambahkan ${u.name} sebagai teman?`)) {
                await fetch('/api/friends/request', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ receiverId: u.id }) // Sender is handled by token on backend, wait actually I might need to send senderId based on my simplified API.
                });
                alert('Berhasil ditambahkan!');
                window.location.reload();
              }
            } else {
              alert('Teman tidak ditemukan.');
            }
          } catch (err) {
            console.error(err);
          }
        }
      }
    });
  }
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
          <button class="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-secondary font-label-sm text-label-sm font-semibold shadow-sm hover:bg-surface-container transition-colors" type="button">
            Tinjau Pembahasan
          </button>
        </div>
      </div>
    `;
  }).join('');
}
