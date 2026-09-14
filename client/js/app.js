const APP_STORAGE_KEY = 'edurank-session';
const USERS_STORAGE_KEY = 'edurank-users';
const LEARNING_KEY = 'edurank-learning-style';
const DEFAULT_ELO = 100;

const PAGE_ROUTES = {
  home: 'home.html',
  materi: 'materi.html',
  battle: 'classic_lobby.html',
  leaderboard: 'leaderboard.html',
  feedback: 'feedback.html',
  profile: 'profile.html',
  login: 'login.html',
  register: 'register.html',
  learningStyle: 'learning-style.html'
};

const MATERI_DATA = [
  {
    id: 'matematika',
    name: 'Matematika',
    icon: 'calculate',
    color: 'bg-primary text-on-primary',
    desc: 'Aljabar, Matriks, Fungsi, Trigonometri & Kalkulus Dasar',
    subchapters: [
      {
        id: 'matriks',
        name: 'Matriks & SPL',
        desc: 'Konsep Ordo, Operasi Matriks, Determinan, Invers & SPL',
        topics: [
          { title: '1. Pengertian & Konsep Utama', content: 'Matriks adalah susunan bilangan dalam bentuk baris dan kolom yang diapit kurung siku. Matriks digunakan untuk mempermudah perhitungan aljabar linier dan sistem persamaan simultan.' },
          { title: '2. Rumus & Persamaan Kunci', content: 'Perkalian matriks A(m × k) × B(k × n) = C(m × n). Determinan det(A) = ad - bc untuk matriks ordo 2x2 [[a,b],[c,d]]. Invers A⁻¹ = (1/det(A)) * [[d,-b],[-c,a]].' },
          { title: '3. Contoh Soal Sederhana', content: 'Jika A = [[2, 1], [3, 4]], hitung determinan det(A)!\nPenyelesaian: det(A) = (2)(4) - (1)(3) = 8 - 3 = 5.' }
        ]
      },
      {
        id: 'fungsi',
        name: 'Fungsi & Grafik',
        desc: 'Fungsi Kuadrat, Eksponen, Logaritma & Komposisi Fungsi',
        topics: [
          { title: '1. Pengertian & Konsep Utama', content: 'Fungsi adalah relasi khas yang memetakan setiap anggota daerah asal (domain) tepat ke satu anggota daerah kawan (kodomain).' },
          { title: '2. Rumus & Persamaan Kunci', content: 'Fungsi Komposisi (f ∘ g)(x) = f(g(x)). Fungsi Invers f⁻¹(x) diperoleh dengan menukar variabel x dan y.' },
          { title: '3. Contoh Soal Sederhana', content: 'Jika f(x) = 2x + 3, hitung f(4)!\nPenyelesaian: f(4) = 2(4) + 3 = 8 + 3 = 11.' }
        ]
      },
      {
        id: 'statistika',
        name: 'Statistika Data',
        desc: 'Ukuran Pemusatan Data, Mean, Median, Modus & Simpangan Baku',
        topics: [
          { title: '1. Pengertian & Konsep Utama', content: 'Statistika mempelajari teknik pengumpulan, penyajian, pengolahan, dan penarikan kesimpulan dari data sampel.' },
          { title: '2. Rumus & Persamaan Kunci', content: 'Mean x̄ = (Σxᵢ) / n. Simpangan Baku S = √(Σ(xᵢ - x̄)² / n).' },
          { title: '3. Contoh Soal Sederhana', content: 'Data nilai: 4, 6, 8, 10. Hitung rata-rata (mean)!\nPenyelesaian: x̄ = (4 + 6 + 8 + 10) / 4 = 28 / 4 = 7.' }
        ]
      },
      {
        id: 'peluang',
        name: 'Peluang & Kombinatorika',
        desc: 'Kaidah Pencacahan, Permutasi, Kombinasi & Peluang Kejadian',
        topics: [
          { title: '1. Pengertian & Konsep Utama', content: 'Peluang menyatakan tingkat kepastian terjadinya suatu hasil/kejadian dalam percobaan acak.' },
          { title: '2. Rumus & Persamaan Kunci', content: 'P(A) = n(A) / n(S). Permutasi P(n,r) = n! / (n-r)!. Kombinasi C(n,r) = n! / (r! (n-r)!).' },
          { title: '3. Contoh Soal Sederhana', content: 'Peluang melempar 1 dadu bermata 6 dan muncul angka genap (2,4,6) adalah P(A) = 3/6 = 1/2.' }
        ]
      }
    ]
  },
  {
    id: 'matematika-lanjut',
    name: 'Matematika Tingkat Lanjut',
    icon: 'functions',
    color: 'bg-secondary text-on-secondary',
    desc: 'Kalkulus Tingkat Lanjut, Vektor, Geometri Analitik & Polinomial',
    subchapters: [
      {
        id: 'polinomial',
        name: 'Suku Banyak (Polinomial)',
        desc: 'Teorema Sisa, Teorema Faktor & Pembagian Polinomial',
        topics: [
          { title: '1. Pengertian & Konsep Utama', content: 'Polinomial adalah pernyataan matematika yang melibatkan penjumlahan perkalian pangkat dalam satu atau lebih variabel dengan koefisien.' },
          { title: '2. Rumus & Persamaan Kunci', content: 'F(x) = P(x) · H(x) + S(x). Teorema Sisa: Sisa pembagian F(x) oleh (x - a) adalah F(a).' },
          { title: '3. Contoh Soal Sederhana', content: 'Sisa F(x) = x³ - 2x + 4 dibagi (x - 2) adalah F(2) = 2³ - 2(2) + 4 = 8 - 4 + 4 = 8.' }
        ]
      },
      {
        id: 'vektor',
        name: 'Vektor di R² & R³',
        desc: 'Operasi Vektor, Panjang Vektor, Perkalian Titik (Dot Product)',
        topics: [
          { title: '1. Pengertian & Konsep Utama', content: 'Vektor adalah besaran geometri yang memiliki besar (panjang) dan arah.' },
          { title: '2. Rumus & Persamaan Kunci', content: 'Panjang vektor |u| = √(x² + y²). Dot Product u · v = |u||v| cos θ = u₁v₁ + u₂v₂.' },
          { title: '3. Contoh Soal Sederhana', content: 'Panjang vektor u = (3, 4) adalah |u| = √(3² + 4²) = √25 = 5.' }
        ]
      }
    ]
  },
  {
    id: 'fisika',
    name: 'Fisika',
    icon: 'science',
    color: 'bg-tertiary-container text-on-tertiary',
    desc: 'Mekanika Kuantum, Dinamika Gerak, Listrik Magnet & Termodinamika',
    subchapters: [
      {
        id: 'dinamika',
        name: 'Hukum Newton & Dinamika',
        desc: 'Hukum I, II, III Newton, Gaya Gesek & Kinematika',
        topics: [
          { title: '1. Pengertian & Konsep Utama', content: 'Dinamika gerak membahas pengaruh gaya terhadap perubahan keadaan gerak suatu benda.' },
          { title: '2. Rumus & Persamaan Kunci', content: 'Hukum II Newton: ΣF = m · a. Gaya Gesek fₖ = μₖ · N.' },
          { title: '3. Contoh Soal Sederhana', content: 'Gaya F = 20 N bekerja pada m = 4 kg. Percepatan a = F / m = 20 / 4 = 5 m/s².' }
        ]
      },
      {
        id: 'termodinamika',
        name: 'Termodinamika & Kalor',
        desc: 'Hukum Termodinamika, Usaha Gas & Efisiensi Mesin Carnot',
        topics: [
          { title: '1. Pengertian & Konsep Utama', content: 'Termodinamika adalah cabang fisika yang mempelajari energi, kalor, dan usaha mekanik.' },
          { title: '2. Rumus & Persamaan Kunci', content: 'Hukum I: Q = ΔU + W. Efisiensi Mesin Carnot η = (1 - T₂/T₁) × 100%.' },
          { title: '3. Contoh Soal Sederhana', content: 'Gas melakukan usaha W = 300 J dan menyerap kalor Q = 500 J. Perubahan energi dalam ΔU = Q - W = 200 J.' }
        ]
      }
    ]
  },
  {
    id: 'bahasa-inggris',
    name: 'Bahasa Inggris',
    icon: 'translate',
    color: 'bg-primary-fixed text-primary',
    desc: 'Reading Comprehension, Academic Grammar, Structure & Vocabulary',
    subchapters: [
      {
        id: 'grammar',
        name: 'Academic Tenses & Passive Voice',
        desc: 'Present Perfect, Past Perfect & Conditional Sentences',
        topics: [
          { title: '1. Pengertian & Konsep Utama', content: 'Passive Voice digunakan saat fokus kalimat ditekankan pada objek penerima aksi, bukan pelaku.' },
          { title: '2. Rumus & Persamaan Kunci', content: 'Passive Formula: Subject + Be + Past Participle (V3) + [by Agent].' },
          { title: '3. Contoh Soal Sederhana', content: 'Active: "The researcher solved the problem" → Passive: "The problem was solved by the researcher".' }
        ]
      }
    ]
  },
  {
    id: 'informatika',
    name: 'Informatika',
    icon: 'code',
    color: 'bg-secondary-container text-on-secondary-container',
    desc: 'Algoritma & Pemrograman, Struktur Data, Jaringan Komputer & AI',
    subchapters: [
      {
        id: 'algoritma',
        name: 'Struktur Data & Algoritma',
        desc: 'Array, Stack, Queue, Sorting & Searching Algorithms',
        topics: [
          { title: '1. Pengertian & Konsep Utama', content: 'Algoritma adalah deretan instruksi logis dan terstruktur untuk memecahkan masalah komputasi.' },
          { title: '2. Rumus & Persamaan Kunci', content: 'Binary Search: O(log n). Bubble Sort / Insertion Sort: O(n²).' },
          { title: '3. Contoh Soal Sederhana', content: 'Syarat utama penerapan Binary Search adalah array data harus terurut (sorted).' }
        ]
      }
    ]
  }
];

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    return value === null ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

function readSession() {
  return readJson(APP_STORAGE_KEY, {});
}

function writeSession(session) {
  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(session));
}

function readUsers() {
  const users = readJson(USERS_STORAGE_KEY, []);
  return Array.isArray(users) ? users : [];
}

function writeUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function sanitizeName(value) {
  return String(value || '').trim();
}

function makeUserId(email) {
  return `user-${String(email).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function calculateRank(elo) {
  const value = Math.max(0, Number(elo) || 0);
  if (value >= 1101) return 'Master';
  if (value >= 701) return 'Diamond';
  if (value >= 401) return 'Gold';
  if (value >= 201) return 'Silver';
  return 'Bronze';
}

function normalizeUser(user) {
  if (!user) return null;
  const wins = Math.max(0, Number(user.wins) || 0);
  const losses = Math.max(0, Number(user.losses) || 0);
  const draws = Math.max(0, Number(user.draws) || 0);
  const totalBattles = Math.max(wins + losses + draws, Math.max(0, Number(user.totalBattles) || 0));

  const normalized = {
    id: user.id || makeUserId(user.email || user.studentEmail),
    name: sanitizeName(user.name || user.fullName || 'Pelajar EduRank'),
    email: String(user.email || user.studentEmail || '').trim().toLowerCase(),
    password: String(user.password || ''),
    learningStyle: user.learningStyle || localStorage.getItem(LEARNING_KEY) || '',
    elo: typeof user.elo === 'number' ? Math.max(0, user.elo) : DEFAULT_ELO,
    xp: Math.max(0, Number(user.xp) || 0),
    wins: wins,
    losses: losses,
    draws: draws,
    totalBattles: totalBattles,
    correctAnswers: Math.max(0, Number(user.correctAnswers) || 0),
    incorrectAnswers: Math.max(0, Number(user.incorrectAnswers) || 0),
    friends: Array.isArray(user.friends) ? user.friends : [],
    notifications: Array.isArray(user.notifications) ? user.notifications : [],
    photo: user.photo || '',
    createdAt: user.createdAt || new Date().toISOString()
  };
  normalized.rank = calculateRank(normalized.elo);
  return normalized;
}

function getCurrentUser() {
  const session = readSession();
  const email = String(session.email || '').toLowerCase();
  if (!email) return null;
  const user = readUsers().find((item) => String(item.email || '').toLowerCase() === email);
  return user ? normalizeUser(user) : null;
}

function saveUser(user) {
  const users = readUsers();
  const normalized = normalizeUser(user);
  if (!normalized || !normalized.email) return null;
  const index = users.findIndex((item) => String(item.email || '').toLowerCase() === normalized.email);
  if (index === -1) {
    users.push(normalized);
  } else {
    users[index] = { ...users[index], ...normalized };
  }
  writeUsers(users);
  return normalized;
}

function setUserSession(user) {
  const normalized = normalizeUser(user);
  if (!normalized) return;
  writeSession({ loggedIn: true, email: normalized.email, userId: normalized.id, name: normalized.name });
}

function setNotice(message, isSuccess = false) {
  let notice = document.querySelector('.notice, [data-auth-notice], #auth-notice');
  if (!notice) {
    notice = document.createElement('div');
    notice.id = 'auth-notice';
    notice.className = 'w-full p-3 mb-4 rounded-xl text-sm font-semibold transition-all';
    const form = document.querySelector('#login-form, #register-form, #studentLoginForm, #studentRegistrationForm');
    if (form && form.parentNode) {
      form.parentNode.insertBefore(notice, form);
    }
  }
  if (notice) {
    notice.textContent = message;
    notice.hidden = false;
    notice.style.display = 'block';
    if (isSuccess) {
      notice.className = 'w-full p-3 mb-4 rounded-xl text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300';
    } else {
      notice.className = 'w-full p-3 mb-4 rounded-xl text-sm font-semibold bg-red-100 text-red-800 border border-red-300';
    }
  }
}

function redirectIfLoggedOut() {
  const file = window.location.pathname.split(/[\\/]/).pop() || 'home.html';
  const publicPages = ['index.html', 'login.html', 'register.html'];
  if (!publicPages.includes(file.toLowerCase())) {
    if (!getCurrentUser()) {
      window.location.href = 'login.html';
    }
  }
}

function initAuth() {
  const loginForm = document.querySelector('#studentLoginForm, #login-form');
  const registerForm = document.querySelector('#studentRegistrationForm, #register-form');

  if (registerForm) {
    const handleRegister = async (event) => {
      if (event) event.preventDefault();
      const data = new FormData(registerForm);
      const name = sanitizeName(data.get('fullName') || data.get('name') || document.querySelector('#fullName')?.value || document.querySelector('#name')?.value);
      const email = String(data.get('studentEmail') || data.get('email') || document.querySelector('#studentEmail')?.value || document.querySelector('#email')?.value || '').trim().toLowerCase();
      const password = String(data.get('password') || document.querySelector('#password')?.value || document.querySelector('#studentPassword')?.value || '');
      const confirmPassword = String(data.get('confirmPassword') || document.querySelector('#confirmPassword')?.value || document.querySelector('#studentConfirmPassword')?.value || '');
      const phoneNumber = String(data.get('phoneNumber') || document.querySelector('#phoneNumber')?.value || '').trim();

      if (!name) {
        setNotice('Nama lengkap wajib diisi.');
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setNotice('Format email tidak valid.');
        return;
      }
      if (!password || password.length < 6) {
        setNotice('Kata sandi minimal 6 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setNotice('Konfirmasi kata sandi tidak cocok.');
        return;
      }

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phoneNumber })
        });
        const result = await response.json().catch(() => null);
        if (response.ok && result && result.success && result.user) {
          saveUser(result.user);
          setUserSession(result.user);
          if (result.token) localStorage.setItem('edurank-token', result.token);
          window.location.href = 'learning-style.html';
          return;
        } else if (response.status === 400 && result && result.message) {
          setNotice(result.message);
          return;
        }
      } catch (err) {
        console.warn('API server connection offline, falling back to local mode:', err);
      }

      const existingUsers = readUsers();
      if (existingUsers.some((user) => String(user.email).toLowerCase() === email)) {
        setNotice('Email ini sudah terdaftar.');
        return;
      }
      const newUser = saveUser({
        id: makeUserId(email),
        name,
        email,
        password,
        learningStyle: '',
        elo: DEFAULT_ELO,
        xp: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        totalBattles: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        friends: [],
        notifications: []
      });
      setUserSession(newUser);
      window.location.href = 'learning-style.html';
    };

    registerForm.addEventListener('submit', handleRegister);
  }

  if (loginForm) {
    const handleLogin = async (event) => {
      if (event) event.preventDefault();
      const data = new FormData(loginForm);
      const email = String(data.get('email') || data.get('studentEmail') || document.querySelector('#studentEmail')?.value || document.querySelector('#email')?.value || '').trim().toLowerCase();
      const password = String(data.get('password') || document.querySelector('#studentPassword')?.value || document.querySelector('#password')?.value || '');

      if (!email || !password) {
        setNotice('Email dan kata sandi wajib diisi.');
        return;
      }

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const result = await response.json().catch(() => null);
        if (response.ok && result && result.success && result.user) {
          saveUser(result.user);
          setUserSession(result.user);
          if (result.token) localStorage.setItem('edurank-token', result.token);
          window.location.href = 'learning-style.html';
          return;
        } else if (response.status === 401 && result && result.message) {
          setNotice(result.message);
          return;
        }
      } catch (err) {
        console.warn('API server connection offline, falling back to local mode:', err);
      }

      const users = readUsers();
      const matchedUser = users.find((user) => String(user.email).toLowerCase() === email && user.password === password);
      if (!matchedUser) {
        setNotice('Email atau password salah.');
        return;
      }
      const normalized = normalizeUser(matchedUser);
      saveUser(normalized);
      setUserSession(normalized);
      window.location.href = 'learning-style.html';
    };

    loginForm.addEventListener('submit', handleLogin);
  }
}

function initLearningStyle() {
  const form = document.querySelector('#learning-style-form, #learning-form');
  if (!form) return;
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  if (user.learningStyle) {
    const matchingRadio = form.querySelector(`input[value="${user.learningStyle.toLowerCase()}"]`);
    if (matchingRadio) matchingRadio.checked = true;
  }

  let resultCard = document.getElementById('learning-style-result-card');
  if (!resultCard) {
    resultCard = document.createElement('div');
    resultCard.id = 'learning-style-result-card';
    resultCard.className = 'hidden p-5 mb-6 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 shadow-sm';
    const formTop = form.querySelector('.mb-6') || form.firstChild;
    if (formTop) formTop.after(resultCard);
  }

  const calculateResult = () => {
    const checkedRadios = Array.from(form.querySelectorAll('input[type="radio"]:checked'));
    const counts = {};
    checkedRadios.forEach((r) => {
      const val = r.value.toLowerCase();
      counts[val] = (counts[val] || 0) + 1;
    });

    let topVal = 'visual';
    let maxCount = -1;
    Object.entries(counts).forEach(([val, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topVal = val;
      }
    });

    let displayStyle = 'Visual';
    let description = 'Kamu paling efektif belajar melalui gambaran visual, diagram, warna, dan peta konsep.';
    if (topVal === 'kinestetik') {
      displayStyle = 'Kinestetik';
      description = 'Kamu paling efektif belajar melalui praktik langsung, eksperimen, dan gerakan interaktif.';
    } else if (topVal === 'readwrite' || topVal === 'membaca') {
      displayStyle = 'Membaca/Menulis';
      description = 'Kamu paling efektif belajar dengan membaca modul terstruktur, mencatat, dan merangkum.';
    } else if (topVal === 'auditori') {
      displayStyle = 'Auditori';
      description = 'Kamu paling efektif belajar melalui penjelasan lisan, diskusi, dan materi audio.';
    }

    return { displayStyle, description };
  };

  const showResultUI = () => {
    const { displayStyle, description } = calculateResult();
    resultCard.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shrink-0">🎯</div>
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-blue-700">Hasil Analisis Gaya Belajar Kamu</span>
          <h3 class="text-xl font-black text-blue-950 mt-0.5">Gaya Belajar: ${displayStyle}</h3>
          <p class="text-sm text-blue-800 mt-1 leading-relaxed">${description}</p>
        </div>
      </div>
    `;
    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  form.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener('change', showResultUI);
  });

  const handleSaveStyle = (event) => {
    if (event) event.preventDefault();
    const { displayStyle } = calculateResult();

    const updatedUser = { ...user, learningStyle: displayStyle };
    saveUser(updatedUser);
    localStorage.setItem(LEARNING_KEY, displayStyle);

    window.location.href = 'home.html';
  };

  form.addEventListener('submit', handleSaveStyle);

  // Enter key support: pressing Enter anywhere in the form triggers submit
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    }
  });
}

function renderHeaderAndFooter() {
  const file = window.location.pathname.split(/[\\/]/).pop() || 'home.html';
  const current = file.toLowerCase().replace('.html', '');

  const nav = document.querySelector('header nav');
  if (nav) {
    nav.innerHTML = `
      <a href="home.html" data-path="home" class="px-space-md py-2 transition-colors rounded-lg font-label-lg text-label-lg ${current === 'home' ? 'bg-primary-container text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}">Home</a>
      <a href="materi.html" data-path="materi" class="px-space-md py-2 transition-colors rounded-lg font-label-lg text-label-lg ${current === 'materi' ? 'bg-primary-container text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}">Materi</a>
      <a href="classic_lobby.html" data-path="battle" class="px-space-md py-2 transition-colors rounded-lg font-label-lg text-label-lg ${current.includes('classic') || current.includes('custom') || current === 'battle' ? 'bg-primary-container text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}">Battle</a>
      <a href="leaderboard.html" data-path="leaderboard" class="px-space-md py-2 transition-colors rounded-lg font-label-lg text-label-lg ${current === 'leaderboard' ? 'bg-primary-container text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}">Leaderboard</a>
    `;
    const activeLink = nav.querySelector(`a[href="${file}"]`);
    if (activeLink) {
      activeLink.setAttribute('aria-current', 'page');
    }
  }

  document.querySelectorAll('header a[href="#"], header a.brand').forEach((link) => {
    if (/EduRank/i.test(link.textContent || '')) {
      link.href = 'home.html';
    }
  });

  document.querySelectorAll('img[alt="Profile"], .header-profile-avatar, [data-profile-link], header .w-8.h-8.rounded-full').forEach((el) => {
    const link = el.closest('a') || el;
    link.style.cursor = 'pointer';
    link.onclick = (e) => {
      if (link.tagName !== 'A') {
        e.preventDefault();
        window.location.href = 'profile.html';
      }
    };
  });

  document.querySelectorAll('button[aria-label="Notifications"], button:has(.material-symbols-outlined:contains("notifications"))').forEach((btn) => {
    btn.onclick = (e) => {
      e.preventDefault();
      let modal = document.getElementById('notifications-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'notifications-modal';
        modal.className = 'fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4';
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
            <div class="p-8 text-center text-on-surface-variant">
              <span class="material-symbols-outlined text-4xl text-outline mb-2">notifications_off</span>
              <p class="font-semibold text-sm">Tidak ada notifikasi saat ini.</p>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }
    };
  });

  const footer = document.querySelector('footer');
  if (footer) {
    footer.className = 'relative z-10 w-full bg-surface-container-lowest/80 backdrop-blur-md shadow-[0_-1px_6px_rgba(0,0,0,0.02)] py-6 mt-auto border-t border-outline-variant/20';
    footer.innerHTML = `
      <div class="w-full max-w-[1360px] mx-auto px-margin flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
          <span class="material-symbols-outlined text-primary text-[18px]">verified_user</span>
          <span>© 2025 EduRank Indonesia. All rights reserved.</span>
        </div>
        <div class="flex items-center gap-6 text-on-surface-variant font-label-sm text-label-sm">
          <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-tertiary">shield</span>Bebas Malware</span>
          <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-primary">verified</span>100% Bebas Iklan Komersial</span>
        </div>
      </div>
    `;
  }
}

function initMateriWorkspace() {
  const materiContainer = document.querySelector('main .max-w-\\[1440px\\], main .max-w-7xl');
  if (!materiContainer || !window.location.pathname.includes('materi.html')) return;

  let state = {
    selectedSubject: null,
    selectedSubchapter: null
  };

  const renderMateriUI = () => {
    if (!state.selectedSubject) {
      materiContainer.innerHTML = `
        <div class="flex flex-col gap-space-lg w-full py-4">
          <div class="bg-surface-container-lowest p-space-xl rounded-2xl shadow-sm border border-outline-variant/20">
            <h1 class="font-headline-lg text-display-lg font-bold text-on-surface tracking-tight mb-2">Pilih Mata Pelajaran</h1>
            <p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Pilih salah satu mata pelajaran terstandar Kurikulum Merdeka di bawah ini untuk membuka silabus dan topik materi lengkap.
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            ${MATERI_DATA.map((subject) => `
              <div class="materi-subject-card bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group" data-subject-id="${subject.id}">
                <div>
                  <div class="w-12 h-12 rounded-xl ${subject.color} flex items-center justify-center mb-space-md shadow-sm group-hover:scale-105 transition-transform">
                    <span class="material-symbols-outlined text-[26px]">${subject.icon}</span>
                  </div>
                  <h3 class="font-headline-md text-headline-md font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">${subject.name}</h3>
                  <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-4">${subject.desc}</p>
                </div>
                <div class="pt-space-sm border-t border-outline-variant/20 flex items-center justify-between text-primary font-label-md text-label-md font-bold">
                  <span>${subject.subchapters.length} Sub-Bab Materi</span>
                  <span class="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      materiContainer.querySelectorAll('.materi-subject-card').forEach((card) => {
        card.addEventListener('click', () => {
          const id = card.dataset.subjectId;
          state.selectedSubject = MATERI_DATA.find((s) => s.id === id);
          state.selectedSubchapter = null;
          renderMateriUI();
        });
      });
      return;
    }

    if (!state.selectedSubchapter) {
      const subject = state.selectedSubject;
      materiContainer.innerHTML = `
        <div class="flex flex-col gap-space-lg w-full py-4">
          <div class="flex items-center justify-between bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/20">
            <div>
              <button id="btn-back-subjects" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md font-bold mb-3 hover:bg-surface-container transition-colors">
                <span class="material-symbols-outlined text-[18px]">arrow_back</span> Kembali ke Mata Pelajaran
              </button>
              <h1 class="font-headline-lg text-display-lg font-bold text-on-surface tracking-tight">${subject.name}</h1>
              <p class="font-body-md text-body-md text-on-surface-variant">${subject.desc}</p>
            </div>
          </div>
          <h2 class="font-headline-md text-headline-md font-bold text-on-surface mt-2">Daftar Sub-Bab Silabus</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            ${subject.subchapters.map((sub) => `
              <div class="materi-sub-card bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group" data-sub-id="${sub.id}">
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <span class="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">Sub-Bab</span>
                    <h3 class="font-title-md text-title-md font-bold text-on-surface group-hover:text-primary transition-colors">${sub.name}</h3>
                  </div>
                  <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-4">${sub.desc}</p>
                </div>
                <div class="pt-space-sm border-t border-outline-variant/20 flex items-center justify-between text-primary font-label-md text-label-md font-bold">
                  <span>Pelajari Sub-Bab Ini</span>
                  <span class="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      document.getElementById('btn-back-subjects')?.addEventListener('click', () => {
        state.selectedSubject = null;
        state.selectedSubchapter = null;
        renderMateriUI();
      });

      materiContainer.querySelectorAll('.materi-sub-card').forEach((card) => {
        card.addEventListener('click', () => {
          const subId = card.dataset.subId;
          state.selectedSubchapter = subject.subchapters.find((sub) => sub.id === subId);
          renderMateriUI();
        });
      });
      return;
    }

    const subject = state.selectedSubject;
    const sub = state.selectedSubchapter;

    materiContainer.innerHTML = `
      <div class="flex flex-col gap-space-lg w-full py-4">
        <div class="flex flex-wrap items-center justify-between gap- space-md bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/20">
          <div class="flex items-center gap-2">
            <button id="btn-back-subchapters" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md font-bold hover:bg-surface-container transition-colors">
              <span class="material-symbols-outlined text-[18px]">arrow_back</span> Ke Sub-Bab
            </button>
            <button id="btn-back-subjects-root" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-colors">
              Mata Pelajaran: ${subject.name}
            </button>
          </div>
        </div>
        <div class="bg-surface-container-lowest p-space-xl rounded-2xl shadow-sm border border-outline-variant/20 space-y-space-lg">
          <div class="border-b border-outline-variant/20 pb-space-md">
            <span class="text-secondary font-label-md text-label-md font-bold uppercase tracking-wider">${subject.name} • Sub-Bab</span>
            <h1 class="font-headline-lg text-display-lg font-extrabold text-on-surface mt-1">${sub.name}</h1>
            <p class="font-body-md text-body-md text-on-surface-variant mt-1">${sub.desc}</p>
          </div>
          <div class="space-y-space-lg">
            ${sub.topics.map((t) => `
              <div class="p-space-lg rounded-xl bg-surface-container-low/60 border border-outline-variant/20 space-y-2">
                <h3 class="font-title-md text-title-md font-bold text-on-surface">${t.title}</h3>
                <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">${t.content}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-back-subchapters')?.addEventListener('click', () => {
      state.selectedSubchapter = null;
      renderMateriUI();
    });

    document.getElementById('btn-back-subjects-root')?.addEventListener('click', () => {
      state.selectedSubject = null;
      state.selectedSubchapter = null;
      renderMateriUI();
    });
  };

  renderMateriUI();
}

function initClassicLobbyWorkspace() {
  if (!window.location.pathname.includes('classic_lobby.html')) return;
  const user = getCurrentUser();
  if (!user) return;

  const friendsContainer = document.querySelector('[data-friends-list], .friends-list-container');
  if (friendsContainer) {
    if (!user.friends || user.friends.length === 0) {
      friendsContainer.innerHTML = `
        <div class="p-6 text-center text-on-surface-variant bg-surface-container-low rounded-xl border border-outline-variant/30">
          <span class="material-symbols-outlined text-3xl text-outline mb-1">group_off</span>
          <p class="font-semibold text-body-sm">Belum ada teman untuk diajak bermain.</p>
        </div>
      `;
    }
  }

  document.querySelectorAll('button, a').forEach((el) => {
    const text = el.textContent.trim().toLowerCase();
    if (/quick match|mulai match|cari lawan|solo quickmatch/.test(text)) {
      el.onclick = (e) => {
        e.preventDefault();
        window.location.href = 'classic_battle.html';
      };
    } else if (/teman|friend|undang teman|ajak main/.test(text)) {
      el.onclick = (e) => {
        e.preventDefault();
        if (!user.friends || user.friends.length === 0) {
          alert('Belum ada teman untuk diajak bermain.');
        }
      };
    }
  });
}

function hydrateUser() {
  const user = getCurrentUser();
  if (!user) return;

  const name = user.name || 'Pelajar EduRank';
  const totalBattles = user.wins + user.losses + user.draws;
  const accuracyTotal = user.correctAnswers + user.incorrectAnswers;
  const accuracyText = accuracyTotal ? `${Math.round((user.correctAnswers / accuracyTotal) * 100)}%` : '0%';
  const learningStyleText = user.learningStyle || 'Belum dipilih';
  const rankText = calculateRank(user.elo);

  document.querySelectorAll('[data-user-name]').forEach((el) => { el.textContent = name; });
  document.querySelectorAll('[data-user-email]').forEach((el) => { el.textContent = user.email; });
  document.querySelectorAll('[data-user-elo]').forEach((el) => { el.textContent = user.elo.toLocaleString('id-ID'); });
  document.querySelectorAll('[data-user-rank]').forEach((el) => { el.textContent = rankText; });
  document.querySelectorAll('[data-user-learning-style]').forEach((el) => { el.textContent = learningStyleText; });

  const textReplacements = new Map([
    ['Arga Pratama', name],
    ['Ahmad Rizky', name],
    ['1,420 LP', `${user.elo.toLocaleString('id-ID')} LP`],
    ['2,480 LP', `${user.elo.toLocaleString('id-ID')} LP`],
    ['Tier Platinum', `Tier ${rankText}`],
    ['Platinum III', rankText]
  ]);

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const val = node.nodeValue.trim();
    if (textReplacements.has(val)) {
      node.nodeValue = node.nodeValue.replace(val, textReplacements.get(val));
    }
  });

  const userRow = document.querySelector('tr.bg-primary-fixed\\/20, tr[data-user-row]');
  if (userRow) {
    const nameEl = userRow.querySelector('.font-bold.text-primary, td:nth-child(2) .font-title-md');
    if (nameEl) nameEl.textContent = name;

    const eloEl = userRow.querySelector('td:nth-child(5)');
    if (eloEl) eloEl.textContent = `${user.elo.toLocaleString('id-ID')} LP`;

    const rankTierEl = userRow.querySelector('td:nth-child(4) span');
    if (rankTierEl) rankTierEl.textContent = rankText;

    const statsEl = userRow.querySelector('td:nth-child(6)');
    if (statsEl) {
      statsEl.innerHTML = `<span class="font-bold text-on-surface">${user.wins} Menang</span><span class="text-on-surface-variant text-[12px] block">${totalBattles ? Math.round((user.wins / totalBattles) * 100) : 0}% Win Rate</span>`;
    }

    const accuracyEl = userRow.querySelector('td:nth-child(7)');
    if (accuracyEl) accuracyEl.textContent = accuracyText;
  }

  document.querySelectorAll('[data-logout], [title*="Keluar"]').forEach((button) => {
    button.onclick = (e) => {
      e.preventDefault();
      localStorage.removeItem(APP_STORAGE_KEY);
      window.location.href = 'login.html';
    };
  });
}

function processBattleResults() {
  const file = window.location.pathname.split(/[\\/]/).pop() || '';
  const current = file.toLowerCase();
  const user = getCurrentUser();
  if (!user) return;

  const matchKey = `edurank-match-${current}`;
  if (sessionStorage.getItem(matchKey)) return;

  if (current.includes('menang')) {
    sessionStorage.setItem(matchKey, 'true');
    saveUser({
      ...user,
      wins: user.wins + 1,
      totalBattles: user.totalBattles + 1,
      elo: user.elo + 25,
      xp: user.xp + 50,
      correctAnswers: user.correctAnswers + 8,
      incorrectAnswers: user.incorrectAnswers + 2
    });
  } else if (current.includes('kalah')) {
    sessionStorage.setItem(matchKey, 'true');
    saveUser({
      ...user,
      losses: user.losses + 1,
      totalBattles: user.totalBattles + 1,
      elo: Math.max(0, user.elo - 15),
      xp: user.xp + 15,
      correctAnswers: user.correctAnswers + 4,
      incorrectAnswers: user.incorrectAnswers + 6
    });
  }
}

function initGameInteractions() {
  document.querySelectorAll('button, a').forEach((element) => {
    if (element.dataset.routeBound === 'true') return;
    const label = element.textContent.trim().toLowerCase();
    let route = '';

    if (/daftar akun baru|buat akun|register/.test(label)) {
      route = 'register.html';
    } else if (/edit profil|gaya belajar/.test(label)) {
      route = 'learning-style.html';
    } else if (/masuk.*login|sudah punya akun|login di sini/.test(label)) {
      route = 'login.html';
    } else if (/buat room|custom scrim|custom room/.test(label)) {
      route = 'custom_lobby.html';
    } else if (/quick match|mulai match|cari lawan|mulai mode ranked|classic mode/.test(label)) {
      route = 'classic_lobby.html';
    } else if (/kembali ke home|dashboard/.test(label)) {
      route = 'home.html';
    } else if (/kembali ke classic|kembali ke custom/.test(label)) {
      route = label.includes('custom') ? 'custom_lobby.html' : 'classic_lobby.html';
    } else if (/main lagi|coba lagi/.test(label)) {
      route = window.location.pathname.toLowerCase().includes('custom') ? 'custom_battle.html' : 'classic_battle.html';
    }

    if (route) {
      element.dataset.routeBound = 'true';
      element.addEventListener('click', (event) => {
        if (element.tagName === 'A' && element.getAttribute('href') && element.getAttribute('href') !== '#') return;
        event.preventDefault();
        window.location.href = route;
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  redirectIfLoggedOut();
  initAuth();
  initLearningStyle();
  renderHeaderAndFooter();
  initMateriWorkspace();
  initClassicLobbyWorkspace();
  processBattleResults();
  hydrateUser();
  initGameInteractions();
});

window.EduRank = { calculateRank, getCurrentUser, saveUser, setUserSession };
