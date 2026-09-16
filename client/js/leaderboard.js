document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('edurank-token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // State
  let currentSubjectId = null; // null = Semua Mapel
  let subjectsList = [];

  // Get current user info
  let currentUser = null;
  try {
    const meRes = await fetch('/api/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    if (meData.success) {
      currentUser = meData.user;
      renderHeader(currentUser);
    } else if (meRes.status === 401) {
      localStorage.removeItem('edurank-token');
      window.location.href = 'login.html';
      return;
    }
  } catch (err) {
    console.error('Error fetching user:', err);
  }

  // Load subjects for filter tabs
  try {
    const subRes = await fetch('/api/subjects');
    const subData = await subRes.json();
    if (subData.success) {
      subjectsList = subData.subjects;
      renderFilterTabs(subjectsList);
    }
  } catch (err) {
    console.error('Error fetching subjects:', err);
  }

  // Initial load — Semua Mapel
  await fetchAndRenderLeaderboard(null);
  initNotifications();

  // --- RENDER FUNCTIONS ---

  function renderHeader(user) {
    // Header is now handled by header.js, but we update the notification count if needed
    if (window.headerComponent && typeof window.headerComponent.setUnreadCount === 'function') {
      window.headerComponent.setUnreadCount(0); // Leaderboard doesn't have unread count
    }
  }

  function initNotifications() {
    const button = document.getElementById('btn-notifications');
    if (!button) return;
    button.addEventListener('click', async () => {
      const existing = document.getElementById('notifications-panel');
      if (existing) { existing.remove(); button.setAttribute('aria-expanded', 'false'); return; }
      const panel = document.createElement('div');
      panel.id = 'notifications-panel';
      panel.className = 'fixed right-4 top-20 z-[60] w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-xl';
      panel.innerHTML = '<div class="px-2 py-6 text-center text-on-surface-variant"><span class="material-symbols-outlined animate-pulse">hourglass_empty</span><p class="mt-2 text-sm">Memuat notifikasi...</p></div>';
      document.body.appendChild(panel);
      button.setAttribute('aria-expanded', 'true');
      try {
        const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        const notifications = Array.isArray(data.notifications) ? data.notifications : [];
        panel.innerHTML = notifications.length
          ? `<div class="max-h-80 overflow-y-auto">${notifications.map(n => `<article class="border-b border-outline-variant/20 px-2 py-3 last:border-0"><p class="font-label-md font-bold">${escapeHtml(n.title || 'Notifikasi')}</p><p class="mt-1 text-sm text-on-surface-variant">${escapeHtml(n.message || '')}</p></article>`).join('')}</div>`
          : '<div class="px-2 py-8 text-center text-on-surface-variant"><span class="material-symbols-outlined text-3xl">notifications_off</span><p class="mt-2 text-sm font-semibold">Belum ada notifikasi</p></div>';
      } catch (error) {
        panel.innerHTML = '<div class="px-3 py-6 text-center text-on-surface-variant"><span class="material-symbols-outlined text-3xl">wifi_off</span><p class="mt-2 text-sm">Notifikasi belum dapat dimuat.</p></div>';
      }
    });
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  }

  function renderFilterTabs(subjects) {
    const container = document.getElementById('subject-tabs');
    if (!container) return;

    // Deduplicate subjects by name (some subjects exist for multiple classes)
    const uniqueSubjects = [];
    const seen = new Set();
    subjects.forEach(s => {
      if (!seen.has(s.name)) {
        seen.add(s.name);
        uniqueSubjects.push(s);
      }
    });

    let html = `
      <button class="subject-tab active" data-subject-id="">
        <span class="material-symbols-outlined text-[16px]">public</span>
        Semua Mapel
      </button>
    `;

    const icons = {
      'Fisika': 'science',
      'Matematika': 'calculate',
      'Bahasa Inggris': 'translate',
      'Matematika Lanjut': 'functions',
      'Informatika': 'code'
    };

    uniqueSubjects.forEach(s => {
      const icon = icons[s.name] || 'menu_book';
      // Don't show Matematika Lanjut separately (merged with Matematika)
      if (s.name === 'Matematika Lanjut') return;
      html += `
        <button class="subject-tab" data-subject-id="${s.id}">
          <span class="material-symbols-outlined text-[16px]">${icon}</span>
          ${s.name}
        </button>
      `;
    });

    container.innerHTML = html;

    // Attach click handlers
    container.querySelectorAll('.subject-tab').forEach(tab => {
      tab.addEventListener('click', async () => {
        container.querySelectorAll('.subject-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const subjectId = tab.dataset.subjectId || null;
        currentSubjectId = subjectId;
        await fetchAndRenderLeaderboard(subjectId);
      });
    });
  }

  async function fetchAndRenderLeaderboard(subjectId) {
    const container = document.getElementById('leaderboard-table-container');
    if (!container) return;

    // Show loading state
    container.innerHTML = `
      <div class="leaderboard-loading">
        <div class="loading-skeleton"></div>
        <div class="loading-skeleton"></div>
        <div class="loading-skeleton"></div>
        <div class="loading-skeleton"></div>
        <div class="loading-skeleton"></div>
      </div>
    `;

    try {
      let url = '/api/leaderboard';
      if (subjectId) url += `?subject=${subjectId}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data.success) {
        container.innerHTML = `
          <div class="leaderboard-empty">
            <span class="material-symbols-outlined text-[48px]">error_outline</span>
            <p class="font-bold">Leaderboard belum dapat dimuat. Silakan coba lagi.</p>
          </div>
        `;
        return;
      }

      const leaderboard = Array.isArray(data.leaderboard) ? data.leaderboard : [];

      // Pad up to 10 rows if fewer users exist
      const displayRows = [...leaderboard];
      while (displayRows.length < 10) {
        displayRows.push({ isPlaceholder: true });
      }

      // Wire Rank Tier Modal events
      const rankModal = document.getElementById('rank-tiers-modal');
      const btnShowModal = document.getElementById('btn-show-rank-tiers');
      const btnCloseModal1 = document.getElementById('btn-close-rank-tiers');
      const btnCloseModal2 = document.getElementById('btn-close-rank-tiers-2');

      if (btnShowModal && rankModal) {
        btnShowModal.onclick = () => rankModal.classList.remove('hidden');
      }
      if (btnCloseModal1 && rankModal) {
        btnCloseModal1.onclick = () => rankModal.classList.add('hidden');
      }
      if (btnCloseModal2 && rankModal) {
        btnCloseModal2.onclick = () => rankModal.classList.add('hidden');
      }
      if (rankModal) {
        rankModal.onclick = (e) => {
          if (e.target === rankModal) rankModal.classList.add('hidden');
        };
      }

      // Render table for 10 entries (sorted by ELO LP)
      let tableHtml = `
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th class="text-center" style="width: 60px">#</th>
              <th>Siswa</th>
              <th>Rank Tier</th>
              <th class="text-right">Rating ELO (LP)</th>
            </tr>
          </thead>
          <tbody>
      `;

      displayRows.forEach((u, index) => {
        const rankNum = index + 1;
        let rankBadge = `<span class="rank-number">#${rankNum}</span>`;
        if (rankNum === 1) rankBadge = `<div class="rank-badge rank-1">1</div>`;
        else if (rankNum === 2) rankBadge = `<div class="rank-badge rank-2">2</div>`;
        else if (rankNum === 3) rankBadge = `<div class="rank-badge rank-3">3</div>`;

        if (u.isPlaceholder) {
          tableHtml += `
            <tr class="opacity-50">
              <td class="text-center">${rankBadge}</td>
              <td><span class="text-outline font-bold pl-2">-</span></td>
              <td><span class="text-outline font-bold">-</span></td>
              <td class="text-right"><span class="text-outline font-bold pr-2">-</span></td>
            </tr>
          `;
          return;
        }

        const userElo = Number(u.elo || u.total_elo || 400);
        const rankTier = u.rank_name || calculateRank(userElo);
        
        const rankClassMap = {
          'Bronze': 'rank-bronze',
          'Silver': 'rank-silver',
          'Gold': 'rank-gold',
          'Diamond': 'rank-diamond',
          'Master': 'rank-master',
          'Profesor': 'rank-profesor'
        };
        const badgeClass = rankClassMap[rankTier] || 'rank-silver';

        const isCurrentUser = currentUser && u.id === currentUser.id;
        const rowClass = isCurrentUser ? 'current-user-row' : '';

        tableHtml += `
          <tr class="${rowClass}">
            <td class="text-center">${rankBadge}</td>
            <td>
              <div class="user-cell">
                <img src="${u.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random&size=32`}" 
                     class="user-avatar" alt="${u.name}">
                <div class="flex min-w-0 flex-col">
                  <span class="user-name">${escapeHtml(u.name || 'Pelajar EduRank')}</span>
                </div>
              </div>
            </td>
            <td><span class="rank-label ${badgeClass}">${rankTier}</span></td>
            <td class="text-right"><span class="elo-value">${userElo.toLocaleString('id-ID')} LP</span></td>
          </tr>
        `;
      });

      tableHtml += '</tbody></table>';

      // Add user rank position if user is logged in
      let userRankHtml = '';
      if (currentUser) {
        const userRankIndex = leaderboard.findIndex(u => u.id === currentUser.id);
        const totalUserElo = Number(currentUser.elo) || 400;
        const userRankName = calculateRank(totalUserElo);

        if (userRankIndex !== -1) {
          const userRank = userRankIndex + 1;
          const userData = leaderboard[userRankIndex];
          userRankHtml = `
            <div class="mt-8 p-6 bg-surface-container-low rounded-2xl border border-surface-variant flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center text-2xl font-bold">
                  ${userRank}
                </div>
                <div>
                  <h3 class="font-headline-md text-headline-md text-on-surface font-semibold">Posisi Kamu</h3>
                  <p class="font-body-md text-body-md text-on-surface-variant">Kamu berada di peringkat ${userRank} nasional.</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <img src="${userData.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random&size=40`}" 
                     class="w-10 h-10 rounded-full object-cover border-2 border-surface-container-highest" alt="${userData.name}">
                <div class="text-right">
                  <div class="font-label-md text-label-md text-on-surface font-bold">${escapeHtml(userData.name)}</div>
                  <div class="font-body-sm text-body-sm text-on-surface-variant font-bold text-primary">${totalUserElo.toLocaleString('id-ID')} LP · Tier ${userRankName}</div>
                </div>
              </div>
            </div>
          `;
        } else {
          userRankHtml = `
            <div class="mt-8 p-6 bg-surface-container-low rounded-2xl border border-surface-variant flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <span class="material-symbols-outlined text-2xl">workspace_premium</span>
                </div>
                <div>
                  <h4 class="font-title-md font-bold text-on-surface">Statistik Poin Kamu</h4>
                  <p class="font-body-sm text-on-surface-variant">${totalUserElo.toLocaleString('id-ID')} LP · Tier ${userRankName}</p>
                </div>
              </div>
              <a href="battle.html" class="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-sm">Tanding untuk Naik Rank</a>
            </div>
          `;
        }
      }

      container.innerHTML = tableHtml + userRankHtml;

    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      container.innerHTML = `
        <div class="leaderboard-empty">
          <span class="material-symbols-outlined text-[48px]">wifi_off</span>
          <p class="font-bold">Leaderboard belum dapat dimuat. Silakan coba lagi.</p>
        </div>
      `;
    }
  }
});
