const APP_STORAGE_KEY = 'edurank-session';
const USERS_STORAGE_KEY = 'edurank-users';
const LEARNING_KEY = 'edurank-learning-style';
const DEFAULT_ELO = 400;

const PAGE_ROUTES = {
  home: 'home.html',
  materi: 'materi.html',
  battle: 'battle.html',
  leaderboard: 'leaderboard.html',
  feedback: 'feedback.html',
  profile: 'profile.html',
  login: 'login.html',
  register: 'register.html'
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

// Purge all per-user cached data from localStorage when a new user logs in/registers.
// This prevents stale data from a previous account showing up on the same device.
function clearStaleUserData() {
  const keysToRemove = [
    'edurank-user',
    'edurank-battle-history',
    LEARNING_KEY
  ];
  keysToRemove.forEach(k => localStorage.removeItem(k));
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
  if (value >= 1600) return 'Profesor';
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
  const hasToken = !!localStorage.getItem('edurank-token');
  const hasSession = !!getCurrentUser();

  if (!publicPages.includes(file.toLowerCase())) {
    if (!hasToken && !hasSession) {
      window.location.href = 'login.html';
    }
  } else if ((file.toLowerCase() === 'login.html' || file.toLowerCase() === 'register.html') && hasToken) {
    window.location.href = 'home.html';
  }
}

function initAuth() {
  const loginForm = document.querySelector('#studentLoginForm, #login-form');
  const registerForm = document.querySelector('#studentRegistrationForm, #register-form');

  if (registerForm) {
    let isSubmitting = false;
    
    const handleRegister = async (event) => {
      if (event) event.preventDefault();
      
      // Prevent double-submit
      if (isSubmitting) return;
      isSubmitting = true;
      
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Memproses...';
      }
      
      const resetFormState = () => {
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Daftar & Mulai Belajar Sekarang';
        }
      };
      
      let shouldRedirect = false;
      
      try {
        const data = new FormData(registerForm);
        const name = sanitizeName(data.get('fullName') || data.get('name') || document.querySelector('#fullName')?.value || document.querySelector('#name')?.value);
        const email = String(data.get('studentEmail') || data.get('email') || document.querySelector('#studentEmail')?.value || document.querySelector('#email')?.value || '').trim().toLowerCase();
        const password = String(data.get('password') || document.querySelector('#password')?.value || document.querySelector('#studentPassword')?.value || '');
        const confirmPassword = String(data.get('confirmPassword') || document.querySelector('#confirmPassword')?.value || document.querySelector('#studentConfirmPassword')?.value || '');
        const phoneNumber = String(data.get('phoneNumber') || document.querySelector('#phoneNumber')?.value || '').trim();
        const classLevel = Number(data.get('classLevel') || document.querySelector('#classLevel')?.value || 12);

        // Validation
        if (!name) {
          setNotice('Nama lengkap wajib diisi.');
          resetFormState();
          return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setNotice('Format email tidak valid.');
          resetFormState();
          return;
        }
        if (!password || password.length < 6) {
          setNotice('Kata sandi minimal 6 karakter.');
          resetFormState();
          return;
        }
        if (password !== confirmPassword) {
          setNotice('Konfirmasi kata sandi tidak cocok.');
          resetFormState();
          return;
        }

        try {
          const response = await fetch(getApiUrl('/api/register'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phoneNumber, classLevel })
          });
          const result = await response.json().catch(() => null);
          if (response.ok && result && result.success && result.user) {
            clearStaleUserData();
            saveUser(result.user);
            setUserSession(result.user);
            if (result.token) localStorage.setItem('edurank-token', result.token);
            if (result.user) localStorage.setItem('edurank-user', JSON.stringify(result.user));
            setNotice('Registrasi berhasil! Mengarahkan ke dashboard...', true);
            shouldRedirect = true;
            setTimeout(() => {
              window.location.href = 'home.html';
            }, 500);
            return;
          } else if (result && result.message) {
            setNotice(result.message);
            resetFormState();
            return;
          } else {
            setNotice(`Gagal melakukan registrasi (HTTP ${response.status}).`);
            resetFormState();
            return;
          }
        } catch (err) {
          console.warn('API server connection error:', err);
          if (window.location.protocol !== 'file:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            setNotice('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
            resetFormState();
            return;
          }
          console.warn('Falling back to local mode...');
        }

        const existingUsers = readUsers();
        if (existingUsers.some((user) => String(user.email).toLowerCase() === email)) {
          setNotice('Email ini sudah terdaftar.');
          resetFormState();
          return;
        }
        const newUser = saveUser({
          id: makeUserId(email),
          name,
          email,
          password,
          classLevel,
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
        setNotice('Registrasi berhasil (Local Mode)! Mengarahkan ke dashboard...', true);
        shouldRedirect = true;
        setTimeout(() => {
          window.location.href = 'home.html';
        }, 500);
      } catch (error) {
        console.error('Registration error:', error);
        setNotice('Terjadi kesalahan saat registrasi. Silakan coba lagi.');
        resetFormState();
      } finally {
        // Only reset if we're not about to redirect
        if (!shouldRedirect) {
          resetFormState();
        }
      }
    };

    registerForm.addEventListener('submit', handleRegister);
  }

  if (loginForm) {
    let isSubmitting = false;
    
    const handleLogin = async (event) => {
      if (event) event.preventDefault();
      
      // Prevent double-submit
      if (isSubmitting) return;
      isSubmitting = true;
      
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Memproses...';
      }
      
      const resetFormState = () => {
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Masuk ke Dashboard';
        }
      };
      
      let shouldRedirect = false;
      
      try {
        const data = new FormData(loginForm);
        const email = String(data.get('email') || data.get('studentEmail') || document.querySelector('#studentEmail')?.value || document.querySelector('#email')?.value || '').trim().toLowerCase();
        const password = String(data.get('password') || document.querySelector('#studentPassword')?.value || document.querySelector('#password')?.value || '');

        if (!email || !password) {
          setNotice('Email dan kata sandi wajib diisi.');
          resetFormState();
          return;
        }

        try {
          const response = await fetch(getApiUrl('/api/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const result = await response.json().catch(() => null);
          if (response.ok && result && result.success && result.user) {
            clearStaleUserData();
            saveUser(result.user);
            setUserSession(result.user);
            if (result.token) localStorage.setItem('edurank-token', result.token);
            if (result.user) localStorage.setItem('edurank-user', JSON.stringify(result.user));
            setNotice('Login berhasil! Mengarahkan ke dashboard...', true);
            // Go directly to home
            shouldRedirect = true;
            setTimeout(() => {
              window.location.href = 'home.html';
            }, 500);
            return;
          } else if (result && result.message) {
            setNotice(result.message);
            resetFormState();
            return;
          } else {
            setNotice(`Gagal melakukan login (HTTP ${response.status}).`);
            resetFormState();
            return;
          }
        } catch (err) {
          console.warn('API server connection error:', err);
          if (window.location.protocol !== 'file:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            setNotice('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
            resetFormState();
            return;
          }
          console.warn('Falling back to local mode...');
        }

        const users = readUsers();
        const matchedUser = users.find((user) => String(user.email).toLowerCase() === email && user.password === password);
        if (!matchedUser) {
          setNotice('Email atau password salah (Local Mode).');
          resetFormState();
          return;
        }
        const normalized = normalizeUser(matchedUser);
        saveUser(normalized);
        setUserSession(normalized);
        // Do NOT set a dummy JWT token, local mode doesn't use it
        setNotice('Login berhasil (Local Mode)! Mengarahkan...', true);
        shouldRedirect = true;
        setTimeout(() => {
          window.location.href = 'home.html';
        }, 500);
      } catch (error) {
        console.error('Login error:', error);
        setNotice('Terjadi kesalahan saat login. Silakan coba lagi.');
        resetFormState();
      } finally {
        // Only reset if we're not about to redirect
        if (!shouldRedirect) {
          resetFormState();
        }
      }
    };

    loginForm.addEventListener('submit', handleLogin);
  }
}

function initLearningStyle() {
  const form = document.querySelector('#learning-style-form, #learning-form');
  if (!form) return;

  // Check auth: accept either localStorage session OR JWT token
  const user = getCurrentUser();
  const hasToken = !!localStorage.getItem('edurank-token');
  if (!user && !hasToken) {
    window.location.href = 'login.html';
    return;
  }

  // If user already has learning style and arrived here from normal navigation (not register),
  // let them stay to view/update their learning style (don't force redirect)
  if (user && user.learningStyle) {
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

  const handleSaveStyle = async (event) => {
    if (event) event.preventDefault();
    const { displayStyle } = calculateResult();

    // Save locally
    if (user) {
      const updatedUser = { ...user, learningStyle: displayStyle };
      saveUser(updatedUser);
    }
    localStorage.setItem(LEARNING_KEY, displayStyle);

    // Also save to backend API so database persists the learning style
    try {
      const email = user ? user.email : '';
      if (email) {
        await fetch(getApiUrl('/api/user/update'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, learningStyle: displayStyle })
        });
      }
    } catch (err) {
      console.warn('Could not save learning style to API:', err);
    }

    window.location.href = 'home.html';
  };

  form.addEventListener('submit', handleSaveStyle);
}

function renderHeaderAndFooter() {
  // Header is now handled by header.js, so we skip this
  // Footer is still rendered here for pages that don't have their own footer
  
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

// Update header on hash change for Materi/Battle navigation - REMOVED (no longer needed)
// window.addEventListener('hashchange', () => {
//   renderHeaderAndFooter();
// });

// Update header on popstate (back/forward browser buttons) - REMOVED (no longer needed)
// window.addEventListener('popstate', () => {
//   renderHeaderAndFooter();
// });

function initMateriWorkspace() {
  // Deprecated in favor of initPdfMaterialBrowser which connects directly to /api/materials
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

// Real material browser powered by /api/materials catalog built from materi/ directory.
async function initPdfMaterialBrowser() {
  if (!window.location.pathname.includes('materi.html')) return;
  const host = document.getElementById('materi-container');
  if (!host) return;

  const escapeHtml = (val) => String(val || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let catalog;
  try {
    const response = await fetch(getApiUrl('/api/materials'));
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error();
    catalog = data.materials || {};
  } catch {
    host.innerHTML = `
      <div class="p-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
        <span class="material-symbols-outlined text-4xl text-outline mb-2">cloud_off</span>
        <h3 class="font-title-md font-bold text-on-surface">Materi Belum Dapat Dimuat</h3>
        <p class="text-body-sm text-on-surface-variant mt-1">Pastikan koneksi terhubung dan coba muat ulang halaman.</p>
      </div>
    `;
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const paramLevel = urlParams.get('level');
  
  let level = paramLevel || null, subject = null, subchapter = null;

  const getSubjectIcon = (name) => {
    if (/fisika/i.test(name)) return 'science';
    if (/matematika/i.test(name)) return 'calculate';
    if (/inggris/i.test(name)) return 'translate';
    if (/informatika/i.test(name)) return 'code';
    return 'menu_book';
  };

  const getCardColor = (name) => {
    if (/fisika/i.test(name)) return 'bg-tertiary-container text-on-tertiary';
    if (/matematika/i.test(name)) return 'bg-primary text-on-primary';
    if (/inggris/i.test(name)) return 'bg-primary-fixed text-primary';
    if (/informatika/i.test(name)) return 'bg-secondary-container text-on-secondary-container';
    return 'bg-surface-container-high text-on-surface';
  };

  function cleanLatexString(str) {
    if (!str) return '';
    let clean = str;
    clean = clean.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1 / $2)');
    clean = clean.replace(/\\text\{([^{}]+)\}/g, '$1');
    clean = clean.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');
    clean = clean.replace(/\\quad/g, ' ');
    clean = clean.replace(/\\cdot/g, '·');
    clean = clean.replace(/\\times/g, '×');
    clean = clean.replace(/\\pm/g, '±');
    clean = clean.replace(/\\Delta/g, 'Δ');
    clean = clean.replace(/\\theta/g, 'θ');
    clean = clean.replace(/\\pi/g, 'π');
    clean = clean.replace(/\\sigma/g, 'σ');
    clean = clean.replace(/\\omega/g, 'ω');
    clean = clean.replace(/\\mu/g, 'μ');
    clean = clean.replace(/\^\{([^{}]+)\}/g, '^$1');
    clean = clean.replace(/\$\$|\$/g, '');
    clean = clean.replace(/\\([a-zA-Z]+)/g, '$1');
    return clean.trim();
  }

  const formatRichMaterialContent = (rawText) => {
    if (!rawText) return '<p class="text-outline">Konten materi belum tersedia.</p>';
    
    const lines = rawText.split('\n');
    let html = '';
    let inList = false;

    lines.forEach((line) => {
      const cleaned = cleanLatexString(line);
      if (!cleaned) {
        if (inList) { html += '</ul>'; inList = false; }
        return;
      }

      // Check for Major Section Headings (Bab, 1. , Pengertian, Rumus)
      if (/^([0-9]+\.|BAB|RUMUS|PENGERTIAN|TEOREMA)/i.test(cleaned)) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `
          <div class="mt-8 mb-4 p-3 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent border-l-4 border-primary flex items-center gap-3">
            <span class="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shrink-0 shadow-xs">
              <span class="material-symbols-outlined text-lg">auto_stories</span>
            </span>
            <h3 class="font-headline-sm text-headline-sm font-extrabold text-on-surface tracking-tight">${escapeHtml(cleaned)}</h3>
          </div>
        `;
      } 
      // Check for Contoh Soal / Soal Latihan
      else if (/(CONTOH SOAL|PEMBAHASAN SOAL|SOAL LATIHAN|CONTOH:)/i.test(cleaned)) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `
          <div class="my-6 p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-surface-container-lowest border-2 border-amber-500/30 shadow-md">
            <div class="flex items-center gap-2 mb-3 text-amber-900 font-bold uppercase tracking-wider text-xs font-mono">
              <span class="material-symbols-outlined text-amber-600 text-lg">psychology</span>
              <span>💡 Contoh Soal & Pembahasan Terstruktur</span>
            </div>
            <p class="font-body-lg font-bold text-on-surface leading-relaxed">${escapeHtml(cleaned.replace(/^(CONTOH SOAL|PEMBAHASAN SOAL|SOAL LATIHAN|CONTOH:)\s*/i, ''))}</p>
          </div>
        `;
      }
      // Check for Formula / Rumus Kunci
      else if (/^(=|>|RUMUS KUNCI:|FORMULA:|PERSAMAAN:)/i.test(cleaned)) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `
          <div class="my-5 p-5 rounded-2xl bg-secondary/10 border-l-4 border-secondary text-on-surface font-mono text-sm leading-relaxed shadow-sm">
            <span class="font-bold text-secondary uppercase font-sans text-xs tracking-wider block mb-1">📐 Formula & Persamaan Kunci</span>
            <div class="font-bold text-base text-secondary-container">${escapeHtml(cleaned.replace(/^(=|>|RUMUS KUNCI:|FORMULA:|PERSAMAAN:)\s*/i, ''))}</div>
          </div>
        `;
      }
      // Check for List Items
      else if (cleaned.startsWith('-') || cleaned.startsWith('•') || cleaned.startsWith('*')) {
        if (!inList) { html += '<ul class="space-y-2.5 my-4 pl-4 list-disc marker:text-primary marker:text-lg">'; inList = true; }
        html += `<li class="font-body-md text-on-surface leading-relaxed font-medium">${escapeHtml(cleaned.replace(/^[-•*]\s*/, ''))}</li>`;
      } 
      // Regular Paragraphs
      else {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<p class="font-body-lg text-body-lg text-on-surface leading-relaxed mb-4">${escapeHtml(cleaned)}</p>`;
      }
    });

    if (inList) html += '</ul>';
    return html;
  };

  const render = async (materialId) => {
    if (materialId) {
      host.innerHTML = `
        <div class="p-16 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3">
          <div class="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p class="font-bold text-primary">Memuat Pembahasan Materi...</p>
        </div>
      `;
      try {
        const response = await fetch(getApiUrl(`/api/materials/${encodeURIComponent(materialId)}`));
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error();
        const m = data.material;
        
        const formattedContent = formatRichMaterialContent(m.content);

        // Check if material already completed
        const completedArr = JSON.parse(localStorage.getItem('edurank-completed-materials') || '[]');
        const isAlreadyDone = completedArr.includes(m.id || m.title);

        host.innerHTML = `
          <section class="max-w-[1000px] mx-auto space-y-space-lg">
            
            <!-- Sticky Action Toolbar -->
            <div class="sticky top-24 z-40 bg-surface-container-lowest/90 backdrop-blur-xl p-4 rounded-2xl shadow-md border border-outline-variant/30 flex items-center justify-between gap-4">
              <button id="material-back" type="button" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low text-primary font-label-lg font-bold hover:bg-primary hover:text-on-primary transition-all">
                <span class="material-symbols-outlined text-[20px]">arrow_back</span>
                <span>Kembali ke Katalog</span>
              </button>

              <div class="flex items-center gap-3">
                <span class="px-3 py-1 rounded-full bg-secondary/10 text-secondary font-label-sm font-bold uppercase tracking-wider">
                  Kelas ${m.classLevel} • ${escapeHtml(m.subject)}
                </span>
                <button id="btn-mark-complete" type="button" ${isAlreadyDone ? 'disabled' : ''} class="px-4 py-2 rounded-xl ${isAlreadyDone ? 'bg-surface-container text-tertiary opacity-80' : 'bg-tertiary-container hover:bg-tertiary text-on-tertiary'} font-label-md font-bold transition-all flex items-center gap-1.5 shadow-sm">
                  <span class="material-symbols-outlined text-[18px]">${isAlreadyDone ? 'verified' : 'check_circle'}</span>
                  <span>${isAlreadyDone ? 'Selesai Dibaca!' : 'Tandai Selesai (+30 XP)'}</span>
                </button>
              </div>
            </div>

            <!-- Main Reading Article -->
            <article class="bg-surface-container-lowest p-space-xl md:p-10 rounded-3xl shadow-lg border border-outline-variant/30 space-y- space-lg relative overflow-hidden">
              <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
              
              <!-- Document Header Banner -->
              <div class="border-b border-outline-variant/20 pb-space-lg">
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <span class="px-3 py-1 rounded-full bg-primary text-on-primary font-label-sm font-bold uppercase">${escapeHtml(m.type || 'Dokumen Standar')}</span>
                  <span class="font-label-sm text-outline font-semibold">Sub-Bab: ${escapeHtml(m.subchapter)}</span>
                </div>
                <h1 class="font-headline-xl text-headline-xl font-black text-on-surface tracking-tight leading-tight">${escapeHtml(m.title)}</h1>
                <p class="mt-2 font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  Modul Pembahasan Terstruktur Kurikulum Merdeka - Diperbarui Real-Time oleh EduRank Indonesia.
                </p>
              </div>

              <!-- Styled Scrollable Content Viewer -->
              <div class="pt-4 max-h-[70vh] overflow-y-auto pr-3 space-y-4 custom-materi-scroll">
                ${formattedContent}
              </div>

              <!-- Bottom Footer Action Card -->
              <div class="mt-8 pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low/60 p-6 rounded-2xl">
                <div>
                  <h4 class="font-title-md font-bold text-on-surface">Sudah Paham Pembahasan Ini?</h4>
                  <p class="font-body-sm text-on-surface-variant">Uji wawasanmu langsung di Battle Arena lawan pemain lain!</p>
                </div>
                <a href="battle.html" class="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap">
                  <span class="material-symbols-outlined">swords</span>
                  <span>Tanding di Battle Arena</span>
                </a>
              </div>

            </article>

          </section>
        `;

        document.getElementById('material-back').onclick = () => render();
        
        const btnComplete = document.getElementById('btn-mark-complete');
        if (btnComplete && !isAlreadyDone) {
          btnComplete.onclick = async () => {
            btnComplete.disabled = true;
            btnComplete.className = 'px-4 py-2 rounded-xl bg-surface-container text-tertiary font-label-md font-bold flex items-center gap-1.5 opacity-80';
            btnComplete.innerHTML = `<span class="material-symbols-outlined text-[18px]">verified</span> <span>Selesai Dibaca!</span>`;

            // Save completion status
            const completed = JSON.parse(localStorage.getItem('edurank-completed-materials') || '[]');
            if (!completed.includes(m.id || m.title)) {
              completed.push(m.id || m.title);
              localStorage.setItem('edurank-completed-materials', JSON.stringify(completed));
            }

            // Sync XP to database
            const user = getCurrentUser();
            const token = localStorage.getItem('edurank-token');
            if (user && user.email && token) {
              try {
                const newXp = (Number(user.xp) || 0) + 30;
                const updateRes = await fetch(getApiUrl('/api/user/update'), {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    email: user.email,
                    xp: newXp
                  })
                });
                const data = await updateRes.json();
                if (data.success && data.user) {
                  saveUser(data.user);
                  if (window.headerComponent && typeof window.headerComponent.init === 'function') {
                    window.headerComponent.user = data.user;
                    window.headerComponent.updateUserInfo();
                  }
                }
              } catch (e) {
                console.warn('XP update error:', e);
              }
            }

            alert('🎉 Selamat! Kamu mendapatkan +30 XP atas penyelesaian modul pembelajaran ini.');
          };
        }

      } catch {
        host.innerHTML = `
          <div class="p-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm max-w-md mx-auto">
            <span class="material-symbols-outlined text-5xl text-error mb-2">error</span>
            <p class="font-bold text-on-surface text-headline-sm">Materi Belum Dapat Dibuka</p>
            <p class="text-body-sm text-outline mt-1 mb-6">Dokumen materi tidak tersedia atau mengalami gangguan koneksi.</p>
            <button id="material-error-back" class="w-full py-3 rounded-xl bg-primary text-on-primary font-label-lg font-bold">Kembali ke Katalog</button>
          </div>
        `;
        document.getElementById('material-error-back').onclick = () => render();
      }
      return;
    }

    let heading = 'Pilih Kelas';
    let description = 'Pilih tingkat kelas Kurikulum Merdeka untuk mempelajari materi terstandar dan menguji kemampuan.';
    let items = Object.keys(catalog).sort();

    if (level && !subject) {
      heading = `Mata Pelajaran ${level}`;
      description = `Pilih mata pelajaran untuk ${level}.`;
      items = Object.keys(catalog[level] || {});
    } else if (level && subject && !subchapter) {
      heading = `Sub-Bab ${subject}`;
      description = `${level} • ${subject}`;
      items = Object.keys(catalog[level]?.[subject] || {});
    } else if (level && subject && subchapter) {
      heading = `Daftar Dokumen Materi`;
      description = `${level} • ${subject} • ${subchapter}`;
      items = catalog[level]?.[subject]?.[subchapter] || [];
    }

    const breadcrumbs = [];
    breadcrumbs.push(`<button type="button" class="text-primary font-bold hover:underline" data-crumb="root">Kelas</button>`);
    if (level) breadcrumbs.push(`<span class="text-outline">/</span> <button type="button" class="text-primary font-bold hover:underline" data-crumb="level">${escapeHtml(level)}</button>`);
    if (subject) breadcrumbs.push(`<span class="text-outline">/</span> <button type="button" class="text-primary font-bold hover:underline" data-crumb="subject">${escapeHtml(subject)}</button>`);
    if (subchapter) breadcrumbs.push(`<span class="text-outline">/</span> <span class="text-on-surface font-semibold">${escapeHtml(subchapter)}</span>`);

    let contentCardsHtml = '';
    if (!items.length) {
      contentCardsHtml = '<p class="text-on-surface-variant col-span-full text-center py-10">Materi belum tersedia untuk kategori ini.</p>';
    } else {
      contentCardsHtml = items.map((item) => {
        if (typeof item === 'string') {
          const icon = getSubjectIcon(item);
          const iconBg = getCardColor(item);
          return `
            <button type="button" data-choice="${escapeHtml(item)}" class="text-left bg-surface-container-lowest p-space-lg rounded-3xl shadow-sm border border-outline-variant/30 hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between group relative overflow-hidden">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <div class="w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <span class="material-symbols-outlined text-[24px]">${icon}</span>
                  </div>
                  <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 font-label-sm font-bold border border-emerald-500/20 flex items-center gap-1 shadow-xs">
                    <span class="material-symbols-outlined text-[14px]">bolt</span>
                    +30 XP per Modul
                  </span>
                </div>
                <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors">${escapeHtml(item)}</h3>
                <p class="mt-1 font-body-sm text-body-sm text-on-surface-variant">Klik untuk membuka silabus dan modul dokumen materi terstruktur</p>
              </div>
              <div class="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-primary font-label-md font-bold">
                <span>Pilih Modul</span>
                <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </button>
          `;
        } else {
          return `
            <button type="button" data-material="${item.id}" class="text-left bg-surface-container-lowest p-space-lg rounded-3xl shadow-sm border border-outline-variant/30 hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between group">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm font-bold uppercase">${escapeHtml(item.type || 'Dokumen')}</span>
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-label-sm font-bold border border-emerald-500/20 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[12px]">bolt</span>
                    +30 XP
                  </span>
                </div>
                <h3 class="font-title-md text-title-md font-bold text-on-surface group-hover:text-primary transition-colors">${escapeHtml(item.title)}</h3>
              </div>
              <div class="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-primary font-label-md font-bold">
                <span>Baca Pembahasan</span>
                <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </button>
          `;
        }
      }).join('');
    }

    host.innerHTML = `
      <section class="space-y-space-lg">
        <div class="bg-surface-container-lowest p-space-xl rounded-3xl shadow-sm border border-outline-variant/20 space-y-2">
          <div class="flex items-center gap-2 text-body-sm font-body-sm mb-1">
            ${breadcrumbs.join(' ')}
          </div>
          <h1 class="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight">${escapeHtml(heading)}</h1>
          <p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">${escapeHtml(description)}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          ${contentCardsHtml}
        </div>
      </section>
    `;

    host.querySelectorAll('[data-crumb]').forEach((el) => {
      el.onclick = () => {
        const crumb = el.dataset.crumb;
        if (crumb === 'root') { level = null; subject = null; subchapter = null; }
        else if (crumb === 'level') { subject = null; subchapter = null; }
        else if (crumb === 'subject') { subchapter = null; }
        render();
      };
    });

    host.querySelectorAll('[data-choice]').forEach((el) => {
      el.onclick = () => {
        const val = el.dataset.choice;
        if (!level) level = val;
        else if (!subject) subject = val;
        else subchapter = val;
        render();
      };
    });

    host.querySelectorAll('[data-material]').forEach((el) => {
      el.onclick = () => render(el.dataset.material);
    });
  };

  render();
}

function initRealtimeBattle() {
  const file = window.location.pathname.toLowerCase();
  if (!/classic_lobby|custom_lobby/.test(file) || !window.io) return;
  const token = localStorage.getItem('edurank-token');
  if (!token) return;
  const socketUrl = typeof getApiUrl === 'function' ? getApiUrl('') : undefined;
  const socket = window.io(socketUrl, { auth: { token }, transports: ['websocket', 'polling'] });
  const notice = document.createElement('div'); notice.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-lg bg-surface-container-lowest shadow-lg border border-outline-variant text-on-surface text-sm'; document.body.append(notice);
  const say = (text) => { notice.textContent = text; };
  socket.on('connect', () => say('Terhubung ke Battle.'));
  socket.on('connect_error', () => say('Koneksi terputus. Mencoba menghubungkan kembali...'));
  socket.on('matchmaking_waiting', () => say('Mencari lawan… Menunggu pemain lain untuk bergabung.'));
  socket.on('match_found', (room) => { sessionStorage.setItem('edurank-room', room.roomId); say('Lawan ditemukan. Siapkan diri di lobi.'); });
  socket.on('lobby_update', (room) => { sessionStorage.setItem('edurank-room', room.roomId); say(`Custom Lobby · ${room.subject} · ${room.players.length}/2 pemain`); });
  socket.on('battle_start', (room) => { sessionStorage.setItem('edurank-room', room.roomId); window.location.href = file.includes('custom') ? 'custom_battle.html' : 'classic_battle.html'; });
  socket.on('opponent_disconnected', () => say('Lawan terputus.'));
  socket.on('battle_error', (data) => say(data.message || 'Battle belum dapat diproses.'));
  window.startClassicMatch = () => { const selected = document.querySelector('.subject-card.border-primary h3, .subject-card.is-selected h3, .subject-card h3'); socket.emit('queue_classic', { subject: selected?.textContent?.trim() || '' }); };
  if (file.includes('custom')) {
    const start = document.getElementById('start-battle-btn');
    if (start) start.onclick = () => { const selected = document.querySelector('.subject-card.is-selected h4, .subject-card h4'); socket.emit('create_room', { subject: selected?.textContent?.trim() || '' }); say('Custom Lobby dibuat. Undang teman dan tunggu mereka bergabung.'); };
  }
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

  // Update header user data
  const headerUserName = document.getElementById('header-user-name');
  const headerUserPhoto = document.getElementById('header-user-photo');
  const headerUserRank = document.getElementById('header-user-rank');
  
  if (headerUserName) headerUserName.textContent = name;
  if (headerUserPhoto) {
    headerUserPhoto.src = user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  }
  if (headerUserRank) headerUserRank.textContent = rankText;

  document.querySelectorAll('[data-user-name]').forEach((el) => { el.textContent = name; });
  document.querySelectorAll('[data-user-email]').forEach((el) => { el.textContent = user.email; });
  document.querySelectorAll('[data-user-elo]').forEach((el) => { el.textContent = user.elo.toLocaleString('id-ID'); });
  document.querySelectorAll('[data-user-rank]').forEach((el) => { el.textContent = rankText; });
  document.querySelectorAll('[data-user-learning-style]').forEach((el) => { el.textContent = learningStyleText; });

  const textReplacements = new Map([
    ['Arga Pratama', name],
    ['Ahmad Rizky', name],
    ['1,420 ELO', `${user.elo.toLocaleString('id-ID')} ELO`],
    ['2,480 ELO', `${user.elo.toLocaleString('id-ID')} ELO`],
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
    if (eloEl) eloEl.textContent = `${user.elo.toLocaleString('id-ID')} ELO`;

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

// Load user data from API for authenticated pages
async function loadUserData() {
  const token = localStorage.getItem('edurank-token');
  if (!token) return null;

  try {
    const response = await fetch(getApiUrl('/api/me'), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (data.success && data.user) {
      // Update local storage with fresh data
      saveUser(data.user);
      return data.user;
    }
  } catch (err) {
    console.warn('Failed to load user data from API:', err);
  }
  
  // Fallback to local storage
  return getCurrentUser();
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
  // Never hijack buttons on battle.html or materi.html
  const path = window.location.pathname.toLowerCase();
  if (path.includes('battle.html') || path.includes('materi.html')) return;

  document.querySelectorAll('button, a').forEach((element) => {
    if (element.dataset.routeBound === 'true') return;
    const label = element.textContent.trim().toLowerCase();
    let route = '';

    if (/daftar akun baru|buat akun|register/.test(label)) {
      route = 'register.html';
    } else if (/masuk.*login|sudah punya akun|login di sini/.test(label)) {
      route = 'login.html';
    } else if (/buat room|custom scrim|custom room|quick match|mulai match|cari lawan|mulai mode ranked|classic mode/.test(label)) {
      route = 'battle.html';
    } else if (/kembali ke home|dashboard/.test(label)) {
      route = 'home.html';
    }

    if (route) {
      element.dataset.routeBound = 'true';
      element.addEventListener('click', (event) => {
        if (element.tagName === 'A' && element.getAttribute('href') && element.getAttribute('href') !== '#' && !element.getAttribute('href').startsWith('javascript')) return;
        event.preventDefault();
        window.location.href = route;
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  redirectIfLoggedOut();
  initAuth();
  initLearningStyle();
  
  // Load user data before rendering header
  await loadUserData();
  
  renderHeaderAndFooter();
  initMateriWorkspace();
  initPdfMaterialBrowser();
  initClassicLobbyWorkspace();
  initRealtimeBattle();
  processBattleResults();
  hydrateUser();
  initGameInteractions();
});

window.EduRank = { calculateRank, getCurrentUser, saveUser, setUserSession };
