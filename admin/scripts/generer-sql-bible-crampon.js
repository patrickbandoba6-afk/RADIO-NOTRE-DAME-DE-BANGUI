// Génère des fichiers .sql (livres + versets, Crampon 1923) à coller dans
// l'éditeur SQL Supabase, découpés en morceaux gérables. Ne touche pas
// Supabase lui-même — pure génération de fichiers locaux.
// Usage : node generer-sql-bible-crampon.js <chemin-vers-FreCrampon.json> <dossier-sortie>
const fs = require("fs");
const path = require("path");

const CHEMIN_JSON = process.argv[2];
const DOSSIER_SORTIE = process.argv[3];
if (!CHEMIN_JSON || !DOSSIER_SORTIE) {
  console.error("Usage : node generer-sql-bible-crampon.js <FreCrampon.json> <dossier-sortie>");
  process.exit(1);
}
fs.mkdirSync(DOSSIER_SORTIE, { recursive: true });

const LIVRES = [
  ["Genesis", "gn", "Genèse", "ancien", "commun"],
  ["Exodus", "ex", "Exode", "ancien", "commun"],
  ["Leviticus", "lv", "Lévitique", "ancien", "commun"],
  ["Numbers", "nb", "Nombres", "ancien", "commun"],
  ["Deuteronomy", "dt", "Deutéronome", "ancien", "commun"],
  ["Joshua", "jos", "Josué", "ancien", "commun"],
  ["Judges", "jg", "Juges", "ancien", "commun"],
  ["Ruth", "rt", "Ruth", "ancien", "commun"],
  ["I Samuel", "1s", "1 Samuel", "ancien", "commun"],
  ["II Samuel", "2s", "2 Samuel", "ancien", "commun"],
  ["I Kings", "1r", "1 Rois", "ancien", "commun"],
  ["II Kings", "2r", "2 Rois", "ancien", "commun"],
  ["I Chronicles", "1ch", "1 Chroniques", "ancien", "commun"],
  ["II Chronicles", "2ch", "2 Chroniques", "ancien", "commun"],
  ["Ezra", "esd", "Esdras", "ancien", "commun"],
  ["Nehemiah", "ne", "Néhémie", "ancien", "commun"],
  ["Tobit", "tb", "Tobie", "ancien", "deuterocanonique"],
  ["Judith", "jdt", "Judith", "ancien", "deuterocanonique"],
  ["Esther", "est", "Esther", "ancien", "commun"],
  ["I Maccabees", "1m", "1 Maccabées", "ancien", "deuterocanonique"],
  ["II Maccabees", "2m", "2 Maccabées", "ancien", "deuterocanonique"],
  ["Job", "jb", "Job", "ancien", "commun"],
  ["Psalms", "ps", "Psaumes", "ancien", "commun"],
  ["Proverbs", "pr", "Proverbes", "ancien", "commun"],
  ["Ecclesiastes", "qo", "Ecclésiaste", "ancien", "commun"],
  ["Song of Solomon", "ct", "Cantique des cantiques", "ancien", "commun"],
  ["Wisdom", "sg", "Sagesse", "ancien", "deuterocanonique"],
  ["Sirach", "si", "Siracide (Ecclésiastique)", "ancien", "deuterocanonique"],
  ["Isaiah", "is", "Isaïe", "ancien", "commun"],
  ["Jeremiah", "jr", "Jérémie", "ancien", "commun"],
  ["Lamentations", "lm", "Lamentations", "ancien", "commun"],
  ["Baruch", "ba", "Baruch", "ancien", "deuterocanonique"],
  ["Ezekiel", "ez", "Ézéchiel", "ancien", "commun"],
  ["Daniel", "dn", "Daniel", "ancien", "commun"],
  ["Hosea", "os", "Osée", "ancien", "commun"],
  ["Joel", "jl", "Joël", "ancien", "commun"],
  ["Amos", "am", "Amos", "ancien", "commun"],
  ["Obadiah", "ab", "Abdias", "ancien", "commun"],
  ["Jonah", "jon", "Jonas", "ancien", "commun"],
  ["Micah", "mi", "Michée", "ancien", "commun"],
  ["Nahum", "na", "Nahum", "ancien", "commun"],
  ["Habakkuk", "ha", "Habacuc", "ancien", "commun"],
  ["Zephaniah", "so", "Sophonie", "ancien", "commun"],
  ["Haggai", "ag", "Aggée", "ancien", "commun"],
  ["Zechariah", "za", "Zacharie", "ancien", "commun"],
  ["Malachi", "ml", "Malachie", "ancien", "commun"],
  ["Matthew", "mt", "Matthieu", "nouveau", "commun"],
  ["Mark", "mc", "Marc", "nouveau", "commun"],
  ["Luke", "lc", "Luc", "nouveau", "commun"],
  ["John", "jn", "Jean", "nouveau", "commun"],
  ["Acts", "ac", "Actes des Apôtres", "nouveau", "commun"],
  ["Romans", "rm", "Romains", "nouveau", "commun"],
  ["I Corinthians", "1co", "1 Corinthiens", "nouveau", "commun"],
  ["II Corinthians", "2co", "2 Corinthiens", "nouveau", "commun"],
  ["Galatians", "ga", "Galates", "nouveau", "commun"],
  ["Ephesians", "ep", "Éphésiens", "nouveau", "commun"],
  ["Philippians", "ph", "Philippiens", "nouveau", "commun"],
  ["Colossians", "col", "Colossiens", "nouveau", "commun"],
  ["I Thessalonians", "1th", "1 Thessaloniciens", "nouveau", "commun"],
  ["II Thessalonians", "2th", "2 Thessaloniciens", "nouveau", "commun"],
  ["I Timothy", "1tm", "1 Timothée", "nouveau", "commun"],
  ["II Timothy", "2tm", "2 Timothée", "nouveau", "commun"],
  ["Titus", "tt", "Tite", "nouveau", "commun"],
  ["Philemon", "phm", "Philémon", "nouveau", "commun"],
  ["Hebrews", "he", "Hébreux", "nouveau", "commun"],
  ["James", "jc", "Jacques", "nouveau", "commun"],
  ["I Peter", "1p", "1 Pierre", "nouveau", "commun"],
  ["II Peter", "2p", "2 Pierre", "nouveau", "commun"],
  ["I John", "1jn", "1 Jean", "nouveau", "commun"],
  ["II John", "2jn", "2 Jean", "nouveau", "commun"],
  ["III John", "3jn", "3 Jean", "nouveau", "commun"],
  ["Jude", "jude", "Jude", "nouveau", "commun"],
  ["Revelation of John", "ap", "Apocalypse", "nouveau", "commun"],
];

function echapper(texte) {
  return texte.replace(/'/g, "''");
}

const data = JSON.parse(fs.readFileSync(CHEMIN_JSON, "utf8"));
const parNom = new Map(data.books.map((b) => [b.name, b]));

// --- Fichier 1 : les livres ---
let sqlLivres = `-- Livres de la Bible (Crampon 1923 — canon catholique complet), à coller après schema_bible.sql\n`;
sqlLivres += `insert into bible_livres (code, nom, testament, canon, ordre, nombre_chapitres) values\n`;
const lignesLivres = LIVRES.map(([nomAnglais, code, nom, testament, canon], index) => {
  const livre = parNom.get(nomAnglais);
  if (!livre) throw new Error(`Livre introuvable : ${nomAnglais}`);
  return `  ('${code}', '${echapper(nom)}', '${testament}', '${canon}', ${index + 1}, ${livre.chapters.length})`;
});
sqlLivres += lignesLivres.join(",\n") + "\non conflict (code) do nothing;\n";
fs.writeFileSync(path.join(DOSSIER_SORTIE, "00_bible_livres.sql"), sqlLivres, "utf8");

// --- Fichiers versets, en morceaux ---
const tousLesVersets = [];
for (const [nomAnglais, code] of LIVRES) {
  const livre = parNom.get(nomAnglais);
  for (const chapitre of livre.chapters) {
    for (const verset of chapitre.verses) {
      tousLesVersets.push(
        `('${code}',${chapitre.chapter},${verset.verse},'crampon1923','${echapper(verset.text)}')`
      );
    }
  }
}

console.log(`Total versets : ${tousLesVersets.length}`);

const VERSETS_PAR_FICHIER = 4000;
const LIGNES_PAR_INSERT = 500;
let numeroFichier = 1;
for (let debut = 0; debut < tousLesVersets.length; debut += VERSETS_PAR_FICHIER) {
  const morceau = tousLesVersets.slice(debut, debut + VERSETS_PAR_FICHIER);
  let sql = `-- Versets Crampon 1923 — fichier ${numeroFichier}, à coller après 00_bible_livres.sql\n`;
  for (let i = 0; i < morceau.length; i += LIGNES_PAR_INSERT) {
    const lot = morceau.slice(i, i + LIGNES_PAR_INSERT);
    sql += `insert into bible_versets (livre_code, chapitre, verset, traduction, texte) values\n`;
    sql += lot.join(",\n") + "\non conflict (livre_code, chapitre, verset, traduction) do nothing;\n\n";
  }
  const nomFichier = `${String(numeroFichier).padStart(2, "0")}_bible_versets.sql`;
  fs.writeFileSync(path.join(DOSSIER_SORTIE, nomFichier), sql, "utf8");
  console.log(`Écrit : ${nomFichier} (${morceau.length} versets)`);
  numeroFichier += 1;
}

console.log("Terminé.");
