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
        const res = await fetch('/api/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          this.user = data.user;
        }
      } catch (err) {
        console.error('Error loading user for header:', err);
      }
    }

    // Render header
    this.render();
    this.attachEventListeners();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split(/[\\/]/).pop() || 'home.html';
    return filename.toLowerCase().replace('.html', '');
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
    const header = document.querySelector('header nav');
    if (!header) return;

    // Navigation items - Feedback removed from main menu
    const navItems = [
      { path: 'home', label: 'Home', href: 'home.html' },
      { path: 'materi', label: 'Materi', href: 'materi.html' },
      { path: 'battle', label: 'Battle', href: 'battle.html' },
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
    const userRankEl = document.getElementById('header-user-rank');

    if (this.user) {
      if (userNameEl) userNameEl.textContent = this.user.name || 'Memuat...';
      if (userPhotoEl) {
        userPhotoEl.src = this.user.photo || 
          `https://ui-avatars.com/api/?name=${encodeURIComponent(this.user.name || 'User')}&background=random`;
      }
      if (userRankEl) userRankEl.textContent = this.user.rank || '-';
    }
  }

  updateNotificationBadge() {
    const badge = document.getElementById('notif-badge');
    if (badge) {
      if (this.unreadCount > 0) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  attachEventListeners() {
    // Notification button
    const notifBtn = document.getElementById('btn-notifications');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => this.showNotifications());
    }

    // Profile avatar click
    const profileLink = document.querySelector('header a[href="profile.html"]');
    if (profileLink) {
      profileLink.addEventListener('click', (e) => {
        // Navigate to profile page
        window.location.href = 'profile.html';
      });
    }

    // Update navigation on popstate (browser back/forward)
    window.addEventListener('popstate', () => {
      this.currentPage = this.getCurrentPage();
      this.updateActiveNavigation();
    });

    // Update navigation on hash change
    window.addEventListener('hashchange', () => {
      this.currentPage = this.getCurrentPage();
      this.updateActiveNavigation();
    });
  }

  async showNotifications() {
    const token = localStorage.getItem('edurank-token');
    if (!token) return;

    let modal = document.getElementById('notifications-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'notifications-modal';
      modal.className = 'fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4';
      document.body.appendChild(modal);
    }

    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
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
    } catch (err) {
      modal.innerHTML = `
        <div class="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border border-outline-variant/30 text-on-surface">
          <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-4">
            <h3 class="font-bold text-lg">Notifikasi</h3>
            <button onclick="document.getElementById('notifications-modal').remove()" class="p-1 text-on-surface-variant hover:text-on-surface">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="p-8 text-center text-on-surface-variant">
            <span class="material-symbols-outlined text-4xl text-outline mb-2">wifi_off</span>
            <p class="font-semibold text-sm">Gagal memuat notifikasi</p>
          </div>
        </div>
      `;
    }
  }

  setUnreadCount(count) {
    this.unreadCount = count;
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
