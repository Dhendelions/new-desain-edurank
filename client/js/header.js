// Reusable Header Component
class Header {
  constructor() {
    this.user = null;
    this.unreadCount = 0;
    this.init();
  }

  async init() {
    // Get current page
    this.currentPage = this.getCurrentPage();
    
    // Load user data if authenticated
    const token = localStorage.getItem('edurank-token');
    if (token) {
      try {
        const res = await fetch(getApiUrl('/api/me'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          this.user = data.user;
        } else if (res.status === 401 || res.status === 404) {
          localStorage.removeItem('edurank-token');
          localStorage.removeItem('edurank-user');
        }
      } catch (err) {
        console.error('Error loading user for header:', err);
      }
    }

    // Render header
    this.render();
    this.attachEventListeners();
  }

  attachEventListeners() {
    const notifBtn = document.getElementById('btn-notifications');
    if (notifBtn) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showNotifications();
      });
    }
  }

  getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split(/[\\/]/).pop() || 'home.html';
    let page = filename.toLowerCase().replace('.html', '');
    if (!page || page === 'index') page = 'home';

    const battlePages = [
      'battle', 'classic_lobby', 'custom_lobby', 'ranked_lobby',
      'classic_battle', 'ranked_battle', 'custom_battle',
      'classic_kalah', 'classic_menang', 'ranked_kalah', 'ranked_menang', 'custom_kalah', 'custom_menang'
    ];
    if (battlePages.includes(page)) return 'battle';

    const hash = window.location.hash;
    if (page === 'home' && hash) {
      if (hash.includes('curriculum') || hash.includes('materi')) return 'materi';
      if (hash.includes('arena') || hash.includes('battle')) return 'battle';
    }

    return page;
  }

  updateActiveNavigation() {
    const currentPage = this.getCurrentPage();
    const navLinks = document.querySelectorAll('header nav a');
    
    navLinks.forEach(link => {
      const linkPath = link.getAttribute('data-path');
      if (linkPath) {
        const isActive = currentPage === linkPath;
        if (isActive) {
          link.classList.add('bg-primary-container', 'text-on-primary', 'font-bold', 'shadow-sm');
          link.classList.remove('text-on-surface-variant', 'hover:text-on-surface');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('bg-primary-container', 'text-on-primary', 'font-bold', 'shadow-sm');
          link.classList.add('text-on-surface-variant', 'hover:text-on-surface');
          link.removeAttribute('aria-current');
        }
      }
    });
  }

  render() {
    const header = document.querySelector('header nav') || document.querySelector('#main-nav');
    if (!header) return;

    // Direct page navigation items
    const navItems = [
      { path: 'home', label: 'Home', href: 'home.html' },
      { path: 'materi', label: 'Materi', href: 'home.html#home-curriculum-section' },
      { path: 'battle', label: 'Battle', href: 'home.html#home-arena-section' },
      { path: 'leaderboard', label: 'Leaderboard', href: 'leaderboard.html' }
    ];

    header.innerHTML = navItems.map(item => {
      const isActive = this.currentPage === item.path;
      const activeClass = isActive 
        ? 'bg-primary-container text-on-primary font-bold shadow-sm' 
        : 'text-on-surface-variant hover:text-on-surface';
      
      return `
        <a href="${item.href}" 
           data-path="${item.path}" 
           class="px-space-md py-2 transition-colors rounded-lg font-label-lg text-label-lg ${activeClass}"
           ${isActive ? 'aria-current="page"' : ''}>
          ${item.label}
        </a>
      `;
    }).join('');

    // Update user info in header
    this.updateUserInfo();
    
    // Update notification badge
    this.updateNotificationBadge();
  }

  updateUserInfo() {
    const userNameEl = document.getElementById('header-user-name');
    const userPhotoEl = document.getElementById('header-user-photo');
    let userRankEl = document.getElementById('header-user-rank');

    if (this.user) {
      if (userNameEl) {
        userNameEl.textContent = this.user.name || 'User';
        // Auto-inject rank span if missing under name
        if (!userRankEl && userNameEl.parentElement) {
          userRankEl = document.createElement('span');
          userRankEl.id = 'header-user-rank';
          userRankEl.className = 'font-label-sm text-label-sm text-secondary font-bold';
          userNameEl.parentElement.appendChild(userRankEl);
        }
      }
      if (userPhotoEl) {
        userPhotoEl.src = this.user.photo || 
          `https://ui-avatars.com/api/?name=${encodeURIComponent(this.user.name || 'User')}&background=random`;
      }
      if (userRankEl) {
        const rankName = this.user.rank || 'Silver';
        const elo = this.user.elo !== undefined ? this.user.elo : 400;
        userRankEl.textContent = `${rankName} • ${elo} ELO`;
      }
    }
  }

  updateNotificationBadge() {
    const badge = document.getElementById('notif-badge');
    const isReadLocal = localStorage.getItem('edurank-notifs-read') === 'true';
    if (badge) {
      if (this.unreadCount > 0 && !isReadLocal) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  async showNotifications() {
    const token = localStorage.getItem('edurank-token');
    if (!token) return;

    // Toggle dropdown panel if already open
    let panel = document.getElementById('notifications-dropdown-panel');
    if (panel) {
      panel.remove();
      return;
    }

    // Mark as read locally and remotely
    localStorage.setItem('edurank-notifs-read', 'true');
    this.unreadCount = 0;
    this.updateNotificationBadge();

    // Create dropdown panel under notification icon
    panel = document.createElement('div');
    panel.id = 'notifications-dropdown-panel';
    panel.className = 'fixed right-4 sm:right-12 top-20 z-[100] w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-2xl text-on-surface space-y-3';
    panel.innerHTML = '<div class="px-2 py-6 text-center text-on-surface-variant"><span class="material-symbols-outlined animate-pulse text-2xl">hourglass_empty</span><p class="mt-2 text-xs">Memuat notifikasi...</p></div>';
    document.body.appendChild(panel);

    // Close on outside click
    const handleOutsideClick = (e) => {
      const btn = document.getElementById('btn-notifications');
      if (panel && !panel.contains(e.target) && btn && !btn.contains(e.target)) {
        panel.remove();
        document.removeEventListener('click', handleOutsideClick);
      }
    };
    setTimeout(() => document.addEventListener('click', handleOutsideClick), 50);

    // Send mark-read request in background
    fetch(getApiUrl('/api/notifications/read-all'), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(() => {});

    try {
      const res = await fetch(getApiUrl('/api/notifications'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      let notifHtml = '';
      if (data.notifications && data.notifications.length > 0) {
        notifHtml = data.notifications.map(n => {
          const isFriendRequest = n.title && n.title.includes('Permintaan Pertemanan') && !n.title.includes('Diterima');
          const isDuelInvite = n.title && n.title.includes('Tantangan Duel');
          const isMission = n.title && n.title.includes('Misi');

          // Extract sender ID if present
          let senderIdMatch = n.message ? n.message.match(/ID:\s*([a-zA-Z0-9_-]+)/) : null;
          let senderId = senderIdMatch ? senderIdMatch[1] : '';

          let actionButtons = '';
          if (isFriendRequest) {
            actionButtons = `
              <div class="flex items-center gap-2 mt-2">
                <button onclick="window.headerComponent.acceptFriendRequest('${senderId}', ${n.id})" class="px-3 py-1 rounded-lg bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all">
                  Terima
                </button>
                <button onclick="window.headerComponent.declineFriendRequest(${n.id})" class="px-3 py-1 rounded-lg bg-surface-container text-on-surface-variant font-bold text-xs hover:bg-surface-container-high transition-all">
                  Tolak
                </button>
              </div>
            `;
          } else if (isDuelInvite) {
            actionButtons = `
              <div class="flex items-center gap-2 mt-2">
                <button onclick="window.location.href='battle.html?mode=custom'" class="px-3 py-1 rounded-lg bg-tertiary-container text-on-tertiary font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">swords</span>
                  <span>Join Arena</span>
                </button>
              </div>
            `;
          }

          const iconName = isFriendRequest ? 'person_add' : (isDuelInvite ? 'swords' : (isMission ? 'task_alt' : 'notifications'));
          const iconColor = isFriendRequest ? 'text-primary' : (isDuelInvite ? 'text-amber-600' : (isMission ? 'text-tertiary-container' : 'text-secondary'));

          const readClass = n.is_read ? 'opacity-70' : 'bg-primary/5';
          let clickTarget = '';
          if (isMission) {
            clickTarget = 'home.html#home-missions-section';
          } else if (isDuelInvite) {
            clickTarget = 'battle.html?mode=custom';
          } else if (isFriendRequest) {
            clickTarget = '';
          } else {
            clickTarget = 'home.html';
          }

          return `
            <div class="p-3 border-b border-outline-variant/15 text-left hover:bg-surface-container-low transition-colors rounded-xl mb-1 ${readClass} ${clickTarget ? 'cursor-pointer' : ''}" ${clickTarget ? `data-notif-link="${clickTarget}"` : ''}>
              <div class="flex items-start justify-between">
                <p class="font-bold text-xs text-on-surface flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm ${iconColor}">
                    ${iconName}
                  </span>
                  <span>${n.title}</span>
                </p>
                <span class="text-[10px] text-outline shrink-0">${n.created_at ? new Date(n.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
              </div>
              <p class="text-xs text-on-surface-variant mt-1 font-medium leading-relaxed">${n.message}</p>
              ${actionButtons}
            </div>
          `;
        }).join('');
      } else {
        notifHtml = `
          <div class="p-6 text-center text-on-surface-variant">
            <span class="material-symbols-outlined text-3xl text-outline mb-1">notifications_off</span>
            <p class="font-semibold text-xs">Belum ada notifikasi baru.</p>
          </div>
        `;
      }

      panel.innerHTML = `
        <div class="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <h3 class="font-bold text-sm flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-lg">notifications</span> Notifikasi
          </h3>
          <button onclick="document.getElementById('notifications-dropdown-panel')?.remove()" class="w-6 h-6 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container flex items-center justify-center transition-colors">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        <div class="max-h-80 overflow-y-auto pr-1">
          ${notifHtml}
        </div>
      `;

      // Attach click handlers for notification items with links
      panel.querySelectorAll('[data-notif-link]').forEach(el => {
        el.addEventListener('click', (e) => {
          // Don't navigate if user clicked a button inside
          if (e.target.closest('button')) return;
          const link = el.getAttribute('data-notif-link');
          if (link) window.location.href = link;
        });
      });
    } catch (err) {
      panel.innerHTML = `
        <div class="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <h3 class="font-bold text-sm">Notifikasi</h3>
          <button onclick="document.getElementById('notifications-dropdown-panel')?.remove()" class="w-6 h-6 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container flex items-center justify-center">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        <div class="p-4 text-center text-on-surface-variant text-xs">
          <span class="material-symbols-outlined text-2xl text-outline mb-1">wifi_off</span>
          <p class="font-semibold">Gagal memuat notifikasi</p>
        </div>
      `;
    }
  }

  async acceptFriendRequest(senderId, notificationId) {
    const token = localStorage.getItem('edurank-token');
    try {
      const res = await fetch(getApiUrl('/api/friends/accept'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ senderId, notificationId })
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById('notifications-dropdown-panel')?.remove();
        alert('✅ ' + data.message);
        window.location.reload();
      }
    } catch (e) {}
  }

  async declineFriendRequest(notificationId) {
    const token = localStorage.getItem('edurank-token');
    try {
      await fetch(getApiUrl('/api/friends/decline'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ notificationId })
      });
      document.getElementById('notifications-dropdown-panel')?.remove();
    } catch (e) {}
  }

  setUnreadCount(count) {
    // If local notifications have been marked read, don't re-show red dot unless new ones arrive
    const isReadLocal = localStorage.getItem('edurank-notifs-read') === 'true';
    if (!isReadLocal) {
      this.unreadCount = count;
    } else {
      this.unreadCount = 0;
    }
    this.updateNotificationBadge();
  }
}

// Initialize header on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.headerComponent = new Header();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Header;
}
