document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('edurank-token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // State
  let currentSubjectId = null; // null = Semua Mapel
  let currentClassLevel = null; // null = Semua Kelas
  let subjectsList = [];

  // Get current user info
  let currentUser = null;
  try {
    const meRes = await fetch(getApiUrl('/api/me'), {
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
    const subRes = await fetch(getApiUrl('/api/subjects'));
    const subData = await subRes.json();
    if (subData.success) {
      subjectsList = subData.subjects;
      renderClassTabs();
      renderFilterTabs(subjectsList);
    }
  } catch (err) {
    console.error('Error fetching subjects:', err);
  }

  // Initial load — Semua Mapel
  await fetchAndRenderLeaderboard(null);

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  }

  function renderClassTabs() {
    const container = document.getElementById('class-tabs');
    if (!container) return;
    
    const classes = [
      { id: null, name: 'Semua Kelas', icon: 'school' },
      { id: '10', name: 'Kelas X', icon: 'looks_one' },
      { id: '11', name: 'Kelas XI', icon: 'looks_two' },
      { id: '12', name: 'Kelas XII', icon: 'looks_3' }
    ];

    container.innerHTML = classes.map(c => `
      <button class="subject-tab ${c.id === null ? 'active' : ''}" data-class-level="${c.id || ''}">
        <span class="material-symbols-outlined text-[16px]">${c.icon}</span>
        ${c.name}
      </button>
    `).join('');

    container.querySelectorAll('.subject-tab').forEach(tab => {
      tab.addEventListener('click', async () => {
        container.querySelectorAll('.subject-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const classLevel = tab.dataset.classLevel || null;
        currentClassLevel = classLevel;
        await fetchAndRenderLeaderboard(currentSubjectId, currentClassLevel);
      });
    });
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
        await fetchAndRenderLeaderboard(currentSubjectId, currentClassLevel);
      });
    });
  }

  async function fetchAndRenderLeaderboard(subjectId, classLevel = null) {
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
      const params = new URLSearchParams();
      if (subjectId) params.append('subject', subjectId);
      if (classLevel) params.append('classLevel', classLevel);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const res = await fetch(getApiUrl(url));
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

      // Render table for 10 entries (sorted by ELO ELO)
      let tableHtml = `
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th class="text-center" style="width: 60px">#</th>
              <th>Siswa</th>
              <th>Rank Tier</th>
              <th class="text-right">Rating ELO</th>
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
            <td class="text-right"><span class="elo-value">${userElo.toLocaleString('id-ID')} ELO</span></td>
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
                  <div class="font-body-sm text-body-sm text-on-surface-variant font-bold text-primary">${totalUserElo.toLocaleString('id-ID')} ELO · Tier ${userRankName}</div>
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
                  <p class="font-body-sm text-on-surface-variant">${totalUserElo.toLocaleString('id-ID')} ELO · Tier ${userRankName}</p>
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
