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

  // If text is scrambled cipher (e.g. Cpggxpikt Itmi, Giftuvliv Kvok, Ljxhwnyaj, Rtgtyr, Xqikxllbgz)
  if (/^[A-Z][a-z]{5,}\s+[A-Z][a-z]{3,}/.test(str) && !/(matematika|fisika|inggris|informatika|aljabar|matriks|vektor|listrik|kinematika|dinamika|optik|termodinamika|gelombang|grammar|reading|struktur|algoritma|pemrograman|database|hukum|teorema|bab|bagian)/i.test(str)) {
    if (subject === 'Fisika') {
      return classLevel === 10 ? 'Pengukuran & Besaran Vektor' : (classLevel === 11 ? 'Dinamika Rotasi & Kesetimbangan' : 'Listrik Dinamis & Hukum Ohm');
    } else if (subject === 'Matematika') {
      return classLevel === 10 ? 'Eksponen & Logaritma' : (classLevel === 11 ? 'Fungsi Kuadrat & Komposisi' : 'Matriks & Sistem Persamaan');
    } else if (subject === 'Bahasa Inggris') {
      return classLevel === 10 ? 'Narrative Text & Simple Present' : (classLevel === 11 ? 'Analytical Exposition & Passive' : 'Academic Writing & Conditionals');
    } else if (subject === 'Informatika') {
      return classLevel === 10 ? 'Berpikir Komputasional' : (classLevel === 11 ? 'Struktur Data Stack & Queue' : 'Pemrograman Web & SQL Database');
    }
  }

  // Replace BAB 1, Bagian 1, etc with descriptive topic titles
  if (/^BAB\s*1$/i.test(str) || /^Bagian\s*1$/i.test(str)) {
    return subject === 'Fisika' ? 'Bab 1: Listrik Dinamis & Hukum Ohm' : (subject === 'Matematika' ? 'Bab 1: Matriks & Sistem Persamaan Linier' : (subject === 'Informatika' ? 'Bab 1: Algoritma & Pemrograman Dasar' : 'Bab 1: Reading Comprehension & Tenses'));
  }
  if (/^BAB\s*2$/i.test(str) || /^Bagian\s*2$/i.test(str)) {
    return subject === 'Fisika' ? 'Bab 2: Listrik Statis & Medan Listrik' : (subject === 'Matematika' ? 'Bab 2: Fungsi Kuadrat & Grafiknya' : (subject === 'Informatika' ? 'Bab 2: Struktur Data (Stack, Queue & Array)' : 'Bab 2: Grammar Structure & Passive Voice'));
  }
  if (/^BAB\s*3$/i.test(str) || /^Bagian\s*3$/i.test(str)) {
    return subject === 'Fisika' ? 'Bab 3: Medan Magnetik & Induksi Elektromagnetik' : (subject === 'Matematika' ? 'Bab 3: Trigonometri & Identitas Sudut' : (subject === 'Informatika' ? 'Bab 3: Pemrograman Web & HTML/CSS/JS' : 'Bab 3: Academic Essay & Report Text'));
  }
  if (/^BAB\s*4$/i.test(str) || /^Bagian\s*4$/i.test(str)) {
    return subject === 'Fisika' ? 'Bab 4: Rangkaian Arus Bolak-Balik (AC)' : (subject === 'Matematika' ? 'Bab 4: Statistika & Simpangan Baku' : (subject === 'Informatika' ? 'Bab 4: Jaringan Komputer & Protokol HTTPS' : 'Bab 4: Conditional Sentences & Modal Verbs'));
  }
  if (/^BAB\s*5$/i.test(str) || /^Bagian\s*5$/i.test(str)) {
    return subject === 'Fisika' ? 'Bab 5: Gelombang Elektromagnetik & Alat Optik' : (subject === 'Matematika' ? 'Bab 5: Peluang & Kombinatorika' : (subject === 'Informatika' ? 'Bab 5: Basis Data SQL & Manajemen Server' : 'Bab 5: Discussion Text & Vocabulary Enrichment'));
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
