const fs = require('fs/promises');
const path = require('path');
const mammoth = require('mammoth');
const { PDFParse } = require('pdf-parse');

const MATERIAL_ROOT = path.join(__dirname, '..', 'materi');
const allowed = new Set(['.pdf', '.docx']);
let cache = null;

function clean(value) {
  return String(value || '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
}

function beautifyName(name, subject, classLevel) {
  let str = String(name || '').trim();

  const topicMap = {
    'Fisika': {
      10: ['Bab 1: Hakikat Fisika & Besaran Vektor', 'Bab 2: Kinematika & Dinamika Gerak Lurus', 'Bab 3: Usaha, Energi & Daya Mekanik', 'Bab 4: Momentum, Impuls & Tumbukan', 'Bab 5: Pemanasan Global & Energi Terbarukan'],
      11: ['Bab 1: Dinamika Rotasi & Kesetimbangan Benda', 'Bab 2: Elastisitas & Hukum Hooke', 'Bab 3: Fluida Statis & Fluida Dinamis', 'Bab 4: Termodinamika & Kalor Gas Ideal', 'Bab 5: Gelombang Bunyi & Gelombang Cahaya'],
      12: ['Bab 1: Listrik Dinamis & Hukum Ohm', 'Bab 2: Listrik Statis & Medan Listrik', 'Bab 3: Medan Magnetik & Induksi Elektromagnetik', 'Bab 4: Rangkaian Arus Bolak-Balik (AC)', 'Bab 5: Gelombang Elektromagnetik & Alat Optik']
    },
    'Matematika': {
      10: ['Bab 1: Eksponen, Bentuk Akar & Logaritma', 'Bab 2: Persamaan & Pertidaksamaan Kuadrat', 'Bab 3: Sistem Persamaan Linier Tiga Variabel (SPLTV)', 'Bab 4: Barisan & Deret Aritmatika-Geometri', 'Bab 5: Trigonometri Dasar & Aturan Sinus-Kosinus'],
      11: ['Bab 1: Komposisi Fungsi & Fungsi Invers', 'Bab 2: Lingkaran & Persamaan Garis Singgung', 'Bab 3: Matriks, Determinan & Invers Ordo 2x2', 'Bab 4: Vektor pada Dimensi Dua & Tiga', 'Bab 5: Statistika Data Kelompok & Simpangan Baku'],
      12: ['Bab 1: Matriks Ordo 3x3 & Aplikasi SPL', 'Bab 2: Limit Fungsi Aljabar & Trigonometri', 'Bab 3: Turunan Fungsi & Aplikasi Garis Singgung', 'Bab 4: Integral Tentu-Tak Tentu & Luas Daerah', 'Bab 5: Peluang Kejadian Majemuk & Kombinatorika']
    },
    'Bahasa Inggris': {
      10: ['Bab 1: Narrative Text & Simple Past Tenses', 'Bab 2: Descriptive Text & Adjective Phrases', 'Bab 3: Announcement & Procedure Text', 'Bab 4: Recount Text & Personal Experience', 'Bab 5: Vocabulary & Basic Listening Comprehension'],
      11: ['Bab 1: Analytical Exposition Text & Arguments', 'Bab 2: Passive Voice & Academic Grammar', 'Bab 3: Hortatory Exposition Text', 'Bab 4: Personal Letter & Application Email', 'Bab 5: Expression of Opinion & Agreement'],
      12: ['Bab 1: Academic Reading Comprehension & Tenses', 'Bab 2: Grammar Structure & Passive Voice', 'Bab 3: Academic Essay & Report Text', 'Bab 4: Conditional Sentences & Modal Verbs', 'Bab 5: Discussion Text & Vocabulary Enrichment']
    },
    'Informatika': {
      10: ['Bab 1: Berpikir Komputasional & Dekomposisi', 'Bab 2: Teknologi Informasi & Komunikasi (TIK)', 'Bab 3: Sistem Komputer & Hardware-Software', 'Bab 4: Jaringan Komputer & Internet Dasar', 'Bab 5: Algoritma Pemrograman Block & Python'],
      11: ['Bab 1: Berpikir Komputasional Lanjut', 'Bab 2: Pemrograman Terstruktur C++/Python', 'Bab 3: Analisis Data & Visualisasi Tabel', 'Bab 4: Algoritma Sorting & Searching Data', 'Bab 5: Dampak Sosial Informatika & Etika Digital'],
      12: ['Bab 1: Algoritma & Pemrograman Dasar', 'Bab 2: Struktur Data (Stack, Queue & Array)', 'Bab 3: Pemrograman Web & HTML/CSS/JS', 'Bab 4: Jaringan Komputer & Protokol HTTPS', 'Bab 5: Basis Data SQL & Manajemen Server']
    }
  };

  const subjTopics = topicMap[subject]?.[classLevel || 12] || topicMap['Fisika'][12];

  // Match BAB X or Bagian X
  const babMatch = str.match(/(?:BAB|Bagian|Bab|Modul)\s*([1-5])/i);
  if (babMatch) {
    const idx = parseInt(babMatch[1], 10) - 1;
    if (subjTopics[idx]) return subjTopics[idx];
  }

  // If text is cipher or random string or generic
  if (/^([A-Z][a-z]{4,}\s+[A-Z][a-z]{3,}|BAB|Bagian|DOCX|PDF|FISIKA|MATEMATIKA|INGGRIS|INFORMATIKA)/i.test(str) && !str.includes(':')) {
    let charSum = 0;
    for (let i = 0; i < str.length; i++) charSum += str.charCodeAt(i);
    const idx = charSum % subjTopics.length;
    return subjTopics[idx];
  }

  return str;
}

function subjectFromPath(parts) {
  const found = parts.find((part) => /MATEMATIKA|FISIKA|INFORMATIKA|BAHASA INGGRIS/i.test(part)) || '';
  if (/MATEMATIKA/i.test(found)) return 'Matematika';
  if (/FISIKA/i.test(found)) return 'Fisika';
  if (/INFORMATIKA/i.test(found)) return 'Informatika';
  if (/BAHASA INGGRIS/i.test(found)) return 'Bahasa Inggris';
  return clean(found) || 'Fisika';
}

function classFromPath(parts) {
  const found = parts.find((part) => /kelas\s*(xii|xi|x|12|11|10)/i.test(part)) || '';
  const normalized = found.toUpperCase();
  if (/XII|12/.test(normalized)) return 12;
  if (/XI|11/.test(normalized)) return 11;
  if (/X|10/.test(normalized)) return 10;
  return 12;
}

async function walk(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) files.push(...await walk(full));
      else if (allowed.has(path.extname(entry.name).toLowerCase())) files.push(full);
    }
    return files;
  } catch (err) {
    console.warn('Walk error:', err.message);
    return [];
  }
}

async function extract(file) {
  try {
    if (path.extname(file).toLowerCase() === '.pdf') {
      const parser = new PDFParse({ data: await fs.readFile(file) });
      const result = await parser.getText();
      await parser.destroy();
      return String(result.text || '').trim();
    }
    const result = await mammoth.extractRawText({ path: file });
    return String(result.value || '').trim();
  } catch (error) {
    console.warn(`Materi tidak dapat diekstrak: ${path.basename(file)} (${error.message})`);
    return '';
  }
}

async function buildCatalog() {
  const files = await walk(MATERIAL_ROOT);
  const catalog = [];
  for (const file of files) {
    const relative = path.relative(MATERIAL_ROOT, file);
    const parts = relative.split(path.sep);
    const subject = subjectFromPath(parts);
    const classLevel = classFromPath(parts);
    if (!subject || !classLevel) continue;

    const folderParts = parts.slice(0, -1);
    const internalCategory = folderParts.find((part) => /matematika\s+(tingkat\s+)?lanjut/i.test(part)) ? 'Matematika Lanjut' : '';
    const rawLeaf = clean(path.basename(file, path.extname(file)));
    let rawSubchapter = clean(folderParts[folderParts.length - 1]);

    if (rawSubchapter.match(/^Kelas\s/i)) {
      rawSubchapter = rawLeaf;
    }

    const subchapter = beautifyName(rawSubchapter, subject, classLevel);
    const title = beautifyName(rawLeaf, subject, classLevel);

    catalog.push({
      id: Buffer.from(relative).toString('base64url'),
      classLevel,
      subject,
      subchapter: subchapter || title,
      title: title || subchapter,
      type: path.extname(file).slice(1).toUpperCase(),
      internalCategory,
      relative,
      text: await extract(file)
    });
  }
  return catalog;
}

async function getCatalog() {
  if (!cache) cache = await buildCatalog();
  return cache;
}

async function getMaterial(id) {
  return (await getCatalog()).find((item) => item.id === id) || null;
}

module.exports = { getCatalog, getMaterial };
