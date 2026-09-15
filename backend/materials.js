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
function subjectFromPath(parts) {
  const found = parts.find((part) => /MATEMATIKA|FISIKA|INFORMATIKA|BAHASA INGGRIS/i.test(part)) || '';
  // Merge all Matematika variants into Matematika (Matematika Lanjut, Matematika Wajib, etc.)
  // This is applied to the subject name before it reaches the catalog
  if (/MATEMATIKA/i.test(found)) return 'Matematika';
  if (/FISIKA/i.test(found)) return 'Fisika';
  if (/INFORMATIKA/i.test(found)) return 'Informatika';
  if (/BAHASA INGGRIS/i.test(found)) return 'Bahasa Inggris';
  return clean(found);
}
function classFromPath(parts) {
  const found = parts.find((part) => /kelas\s*(xii|xi|x|12|11|10)/i.test(part)) || '';
  const normalized = found.toUpperCase();
  if (/XII|12/.test(normalized)) return 12;
  if (/XI|11/.test(normalized)) return 11;
  if (/X|10/.test(normalized)) return 10;
  return null;
}
async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (allowed.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
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
    // internalCategory is stored for metadata but subjectFromPath already merges Matematika variants
    const internalCategory = folderParts.find((part) => /matematika\s+(tingkat\s+)?lanjut/i.test(part)) ? 'Matematika Lanjut' : '';
    const leaf = clean(path.basename(file, path.extname(file)));
    let subchapter = clean(folderParts[folderParts.length - 1]);
    if (subchapter.match(/^Kelas\s/i)) {
      subchapter = leaf;
    } else {
      // Clean up Matematika variants in subchapter names
      subchapter = subchapter.replace(/Matematika\s+(Tingkat\s+)?Lanjut|Wajib/gi, 'Matematika');
    }
    catalog.push({
      id: Buffer.from(relative).toString('base64url'), classLevel, subject,
      subchapter: subchapter || leaf, title: leaf, type: path.extname(file).slice(1).toUpperCase(),
      internalCategory, relative, text: await extract(file)
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
