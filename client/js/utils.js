// Shared utility functions for EduRank Indonesia

// Escape HTML to prevent XSS
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ 
    '&': '&amp;', 
    '<': '&lt;', 
    '>': '&gt;', 
    "'": '&#39;', 
    '"': '&quot;' 
  })[char]);
}

// Format numbers with Indonesian locale
function formatNumber(num) {
  return Number(num || 0).toLocaleString('id-ID');
}

// Calculate win rate percentage
function calculateWinrate(wins, losses, draws) {
  const total = Math.max(0, Number(wins || 0)) + Math.max(0, Number(losses || 0)) + Math.max(0, Number(draws || 0));
  return total > 0 ? ((Math.max(0, Number(wins || 0)) / total) * 100).toFixed(1) : 0;
}

// Calculate level from XP
function calculateLevel(xp) {
  return Math.floor(Math.max(0, Number(xp || 0)) / 100) + 1;
}

// Subject icons mapping
const SUBJECT_ICONS = {
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

// Get subject icon
function getSubjectIcon(subjectName) {
  return SUBJECT_ICONS[subjectName] || 'menu_book';
}

// Subject descriptions mapping
const SUBJECT_DESCRIPTIONS = {
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

// Get subject description
function getSubjectDescription(subjectName) {
  return SUBJECT_DESCRIPTIONS[subjectName] || 'Pelajari materi dan latihan soal untuk meningkatkan pemahaman.';
}

// Check if user is authenticated
function isAuthenticated() {
  return !!localStorage.getItem('edurank-token');
}

// Get auth token
function getAuthToken() {
  return localStorage.getItem('edurank-token');
}

// Handle API errors consistently
function handleApiError(error, defaultMessage = 'Terjadi kesalahan. Silakan coba lagi.') {
  console.error('API Error:', error);
  return defaultMessage;
}

// Show loading state
function showLoading(container, message = 'Memuat...') {
  if (container) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center gap-2 p-8 text-center text-on-surface-variant">
        <span class="material-symbols-outlined text-4xl animate-pulse">hourglass_empty</span>
        <p class="font-semibold">${message}</p>
      </div>
    `;
  }
}

// Show error state
function showError(container, message = 'Terjadi kesalahan. Silakan coba lagi.') {
  if (container) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center gap-2 p-8 text-center text-error">
        <span class="material-symbols-outlined text-4xl">error</span>
        <p class="font-semibold">${message}</p>
        <button onclick="window.location.reload()" class="mt-4 px-space-lg py-2.5 rounded-lg bg-secondary text-on-secondary font-label-lg hover:bg-primary transition-colors">
          Coba Lagi
        </button>
      </div>
    `;
  }
}

// Show empty state
function showEmpty(container, message = 'Tidak ada data tersedia.') {
  if (container) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center gap-2 p-8 text-center text-outline">
        <span class="material-symbols-outlined text-4xl">inbox</span>
        <p class="font-semibold">${message}</p>
      </div>
    `;
  }
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    escapeHtml,
    formatNumber,
    calculateWinrate,
    calculateLevel,
    getSubjectIcon,
    getSubjectDescription,
    isAuthenticated,
    getAuthToken,
    handleApiError,
    showLoading,
    showError,
    showEmpty
  };
}