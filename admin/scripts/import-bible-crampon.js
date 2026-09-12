// Import ponctuel de la Bible Crampon 1923 (domaine public) dans Supabase.
// Source verbatim : scrollmapper/bible_databases (formats/json/FreCrampon.json).
// Usage : node scripts/import-bible-crampon.js
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const env = {};
fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8")
  .split(/\r?\n/)
  .forEach((line) => {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  });

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const CHEMIN_JSON = process.argv[2];
if (!CHEMIN_JSON) {
  console.error("Usage : node import-bible-crampon.js <chemin-vers-FreCrampon.json>");
  process.exit(1);
}

// [nomAnglaisDansLeFichier, code, nomFrancais, testament, canon]
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

async function inserer(table, lignes) {
  const TAILLE_LOT = 500;
  for (let i = 0; i < lignes.length; i += TAILLE_LOT) {
    const lot = lignes.slice(i, i + TAILLE_LOT);
    const { error } = await admin.from(table).upsert(lot, { onConflict: table === "bible_livres" ? "code" : "livre_code,chapitre,verset,traduction" });
    if (error) {
      console.error(`Échec sur le lot ${i}-${i + lot.length} de ${table} :`, error.message);
      process.exit(1);
    }
    process.stdout.write(`\r${table} : ${Math.min(i + TAILLE_LOT, lignes.length)}/${lignes.length}`);
  }
  console.log();
}

async function main() {
  const data = JSON.parse(fs.readFileSync(CHEMIN_JSON, "utf8"));
  const parNom = new Map(data.books.map((b) => [b.name, b]));

  const livresAInserer = LIVRES.map(([nomAnglais, code, nom, testament, canon], index) => {
    const livre = parNom.get(nomAnglais);
    if (!livre) throw new Error(`Livre introuvable dans le JSON source : ${nomAnglais}`);
    return { code, nom, testament, canon, ordre: index + 1, nombre_chapitres: livre.chapters.length };
  });
  await inserer("bible_livres", livresAInserer);

  const versets = [];
  for (const [nomAnglais, code] of LIVRES) {
    const livre = parNom.get(nomAnglais);
    for (const chapitre of livre.chapters) {
      for (const verset of chapitre.verses) {
        versets.push({
          livre_code: code,
          chapitre: chapitre.chapter,
          verset: verset.verse,
          traduction: "crampon1923",
          texte: verset.text,
        });
      }
    }
  }
  console.log(`Total versets à insérer : ${versets.length}`);
  await inserer("bible_versets", versets);
  console.log("Import Crampon 1923 terminé.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
