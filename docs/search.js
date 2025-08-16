// ----- Unicode constants -----
const CH = {
  // letters
  ALEF: "\u0627",
  ALEF_WITH_HAMZA_ABOVE: "\u0623",
  ALEF_WITH_HAMZA_BELOW: "\u0625",
  ALEF_WITH_MADDA_ABOVE: "\u0622",
  ALEF_WASLA: "\u0671",
  BEH: "\u0628",
  DOTLESS_BEH: "\u066E",
  TEH: "\u062A",
  THEH: "\u062B",
  JEEM: "\u062C",
  HAH: "\u062D",
  KHAH: "\u062E",
  DAL: "\u062F",
  THAL: "\u0630",
  REH: "\u0631",
  ZAIN: "\u0632",
  SEEN: "\u0633",
  SHEEN: "\u0634",
  SAD: "\u0635",
  DAD: "\u0636",
  TAH: "\u0637",
  ZAH: "\u0638",
  AIN: "\u0639",
  GHAIN: "\u063A",
  FEH: "\u0641",
  DOTLESS_FEH: "\u06A1",
  QAF: "\u0642",
  DOTLESS_QAF: "\u066F",
  KAF: "\u0643",
  LAM: "\u0644",
  MEEM: "\u0645",
  NOON: "\u0646",
  DOTLESS_NOON: "\u06BA",
  TEH_MARBUTA: "\u0629",
  HEH: "\u0647",
  WAW: "\u0648",
  WAW_WITH_HAMZA_ABOVE: "\u0624",
  YEH: "\u064A",
  YEH_WITH_HAMZA_ABOVE: "\u0626",
  DOTLESS_YEH: "\u0649",
  FARSI_YEH: "\u06CC",

  // small letters
  SMALL_YEH: "\u06E6",
  SMALL_WAW: "\u06E5",

  // symbols/marks
  HAMZA_BELOW: "\u0655",
  NARROW_NBSP: "\u202F",
  SUPERSCRIPT_ALEF: "\u0670",
  HAMZA: "\u0621",

  KASHIDA: "\u0640",
};

const DUAL_JOINING = new Set([
  CH.DOTLESS_BEH,
  CH.HAH,
  CH.SEEN,
  CH.SAD,
  CH.TAH,
  CH.AIN,
  CH.DOTLESS_FEH,
  CH.DOTLESS_QAF,
  CH.KAF,
  CH.LAM,
  CH.MEEM,
  CH.DOTLESS_NOON,
  CH.HEH,
  CH.DOTLESS_YEH,
  CH.KASHIDA,
]);
const RIGHT_JOINING_ONLY = new Set([CH.ALEF, CH.DAL, CH.REH, CH.WAW]);
const LEFT_JOINING = DUAL_JOINING;
const RIGHT_JOINING = new Set([...DUAL_JOINING, ...RIGHT_JOINING_ONLY]);

const DOTLESS_MAP = new Map([
  [CH.ALEF_WITH_HAMZA_ABOVE, CH.ALEF],
  [CH.ALEF_WITH_HAMZA_BELOW, CH.ALEF],
  [CH.ALEF_WITH_MADDA_ABOVE, CH.ALEF],
  [CH.ALEF_WASLA, CH.ALEF],
  [CH.BEH, CH.DOTLESS_BEH],
  [CH.TEH, CH.DOTLESS_BEH],
  [CH.THEH, CH.DOTLESS_BEH],
  [CH.JEEM, CH.HAH],
  [CH.KHAH, CH.HAH],
  [CH.THAL, CH.DAL],
  [CH.ZAIN, CH.REH],
  [CH.SHEEN, CH.SEEN],
  [CH.DAD, CH.SAD],
  [CH.ZAH, CH.TAH],
  [CH.GHAIN, CH.AIN],
  [CH.FEH, CH.DOTLESS_FEH],
  [CH.QAF, CH.DOTLESS_QAF],
  [CH.NOON, CH.DOTLESS_NOON],
  [CH.TEH_MARBUTA, CH.HEH], // Not ideal, but teh marbuta is always final
  [CH.WAW_WITH_HAMZA_ABOVE, CH.WAW],
  [CH.YEH_WITH_HAMZA_ABOVE, CH.DOTLESS_YEH],
  [CH.YEH, CH.DOTLESS_YEH],
  [CH.FARSI_YEH, CH.DOTLESS_YEH],
  [CH.HAMZA_BELOW, ""],
]);

const POSITIONAL_DOTLESS_FORM = new Set([
  CH.DOTLESS_NOON,
  CH.DOTLESS_YEH,
  CH.DOTLESS_QAF,
]);

/**
 * Loads all sura texts and meta info (names) from the quran directory.
 * Returns a Promise resolving to {suras: [string], suraNames: [string]}
 * @returns {Promise<{suras: string[], suraNames: string[]}>}
 */
export async function load() {
  let suraNames = [];
  try {
    const meta = await fetch("./quran/meta.txt").then((r) =>
      r.ok ? r.text() : ""
    );
    meta.split("\n").forEach((line) => {
      suraNames.push(line.split("\t")[0]);
    });
  } catch (err) {
    console.error("خطأ في تحميل أسماء السور:", err);
  }

  // Load all sura texts
  let suras = [];
  try {
    suras = await Promise.all(
      Array(114) // number of suras
        .fill(0)
        .map((_, i) => {
          const suraNum = String(i + 1).padStart(3, "0");
          return fetch(`./quran/${suraNum}.txt`).then((r) =>
            r.ok ? r.text() : ""
          );
        })
    );
  } catch (err) {
    console.error("خطأ في تحميل ملفات السور:", err);
  }
  return { suras, suraNames };
}

function normalizeDots(text) {
  return normalize(text, false, true).text;
}

function canJoin(prev, next) {
  return (
    LEFT_JOINING.has(prev) &&
    RIGHT_JOINING.has(next) &&
    !RIGHT_JOINING_ONLY.has(prev)
  );
}

/**
 * Determines if a character is in the initial position (starts a word).
 * @param {string} first - The first character of the sequence
 * @param {string} prev - The previous non-mark character
 * @param {string} last - The last character of the sequence
 * @param {string} next - The next non-mark character
 * @returns {boolean} True if the character is in initial position
 */
function isInitial(first, prev, last, next) {
  return !canJoin(prev, first) && canJoin(last, next);
}

/**
 * Determines if a character is in the medial position (middle of a word).
 * @param {string} first - The first character of the sequence
 * @param {string} prev - The previous non-mark character
 * @param {string} last - The last character of the sequence
 * @param {string} next - The next non-mark character
 * @returns {boolean} True if the character is in medial position
 */
function isMedial(first, prev, last, next) {
  return canJoin(prev, first) && canJoin(last, next);
}

/**
 * Determines if a character is in the final position (ends a word).
 * @param {string} first - The first character of the sequence
 * @param {string} prev - The previous non-mark character
 * @param {string} last - The last character of the sequence
 * @param {string} next - The next non-mark character
 * @returns {boolean} True if the character is in final position
 */
function isFinal(first, prev, last, next) {
  return canJoin(prev, first) && !canJoin(last, next);
}

/**
 * Determines if a character is in the isolated position (standalone).
 * @param {string} first - The first character of the sequence
 * @param {string} prev - The previous non-mark character
 * @param {string} last - The last character of the sequence
 * @param {string} next - The next non-mark character
 * @returns {boolean} True if the character is isolated
 */
function isIsolated(first, prev, last, next) {
  return !canJoin(prev, first) && !canJoin(last, next);
}

/**
 * Finds the previous non-mark character in the text relative to the given index.
 * @param {string|string[]} text - The text to search in (string or array of characters)
 * @param {number} index - The current index position
 * @returns {string} The previous non-mark character, or empty string if none found
 */
function previousNonMark(text, index) {
  if (index <= 0) return "";

  for (let i = index - 1; i >= 0; i--) {
    const char = text[i];
    if (!char.match(/\p{M}/u)) return char;
  }
  return "";
}

/**
 * Finds the next non-mark character in the text relative to the given index.
 * @param {string|string[]} text - The text to search in (string or array of characters)
 * @param {number} index - The current index position
 * @returns {string} The next non-mark character, or empty string if none found
 */
function nextNonMark(text, index) {
  if (index >= text.length - 1) return "";

  for (let i = index + 1; i < text.length; i++) {
    const char = text[i];
    if (!char.match(/\p{M}/u)) return char;
  }
  return "";
}

/**
 * Normalizes Arabic text by removing marks/diacritics and/or dots.
 * Returns both the processed text and a mapping from processed indices to original indices.
 * @param {string} text - The text to process
 * @param {boolean} marks - Whether to remove Arabic marks and diacritics (except Hamza below)
 * @param {boolean} dots - Whether to normalize dotted from Arabic letters into dotless ones
 * @returns {{text: string, indexMap: number[]}} Processed text and index mapping
 */
function normalize(text, marks = false, dots = false) {
  if (!text) return { text: "", indexMap: [] };

  if (!marks && !dots) {
    // No processing needed, return original text with 1:1 mapping
    return {
      text,
      indexMap: Array.from({ length: text.length }, (_, i) => i),
    };
  }

  const chars = [...text];
  const processed = [];
  const indexMap = [];

  // Pre-compile regex for marks
  const markRe = /[\p{M}\u0640\u202F]/u;

  chars.forEach((char, i) => {
    let keep = true;

    // Remove marks (except hamza below, we consider it a dot)
    if (marks && markRe.test(char) && char !== CH.HAMZA_BELOW) {
      keep = false;
    }

    // Handle dot removal
    if (keep && dots) {
      const replacement = DOTLESS_MAP.get(char);
      if (replacement !== undefined) {
        char = replacement;
        if (char === "") keep = false;
      }
    }

    if (keep) {
      processed.push(char);
      indexMap.push(i);
    }
  });

  // Apply position-based replacements
  chars.forEach((char, i) => {
    if (POSITIONAL_DOTLESS_FORM.has(char)) {
      let prev = previousNonMark(text, i);
      let next = nextNonMark(text, i);

      // Only apply replacement if character is in initial or medial position
      if (
        isInitial(char, prev, char, next) ||
        isMedial(char, prev, char, next)
      ) {
        switch (char) {
          // Initial/Medial Noon or Yeh -> Beh
          case CH.DOTLESS_NOON:
          case CH.DOTLESS_YEH:
            char = CH.DOTLESS_BEH;
            break;
          // Initial/Medial Qaf -> Feh
          case CH.DOTLESS_QAF:
            char = CH.DOTLESS_FEH;
            break;
        }
      }
    }
  });

  return { text: processed.join(""), indexMap };
}

/**
 * Search for a term in a single ayah, optionally ignoring marks/dots and using position-aware regex.
 * Returns positions in the original text, not processed text.
 * @param {string} ayah - The single ayah to search in
 * @param {string} term - The search term to look for
 * @param {boolean} ignoreMarks - Whether to ignore Arabic marks and diacritics
 * @param {boolean} ignoreDots - Whether to ignore dots on Arabic letters
 * @param {string} position - Position constraint: "isolated", "initial", "final", "medial", or "any"
 * @returns {Array<{start: number, end: number}>|null} An array with matches in original text positions if found, null if not found
 */
function searchAyah(ayah, term, ignoreMarks, ignoreDots, position) {
  const { text: processedAyah, indexMap } = normalize(
    ayah,
    ignoreMarks,
    ignoreDots
  );
  const processedTerm = normalize(term, ignoreMarks, ignoreDots).text;

  const matches = [];
  let index = 0;
  while (index < processedAyah.length) {
    const pos = processedAyah.indexOf(processedTerm, index);
    if (pos === -1) break;

    let start = pos;
    let end = pos + processedTerm.length;

    let first = processedAyah[start];
    let last = processedAyah[end - 1];
    let prev = previousNonMark(processedAyah, start);
    let next = nextNonMark(processedAyah, end - 1);
    first = normalizeDots(first);
    last = normalizeDots(last);
    prev = normalizeDots(prev);
    next = normalizeDots(next);
    let found = false;
    switch (position) {
      case "initial":
        found = isInitial(first, prev, last, next);
        break;
      case "final":
        found = isFinal(first, prev, last, next);
        break;
      case "medial":
        found = isMedial(first, prev, last, next);
        break;
      case "isolated":
        found = isIsolated(first, prev, last, next);
        break;
      case "any":
        found = true;
        break;
    }

    if (found) {
      // Map processed positions back to original positions
      const originalStart = indexMap[start] || 0;
      const originalEnd = end < indexMap.length ? indexMap[end] : ayah.length;

      matches.push({ start: originalStart, end: originalEnd });
    }

    index = pos + 1;
  }

  return matches.length > 0 ? matches : null;
}

/**
 * Runs grouped search over all suras, returns formatted HTML results.
 * @param {string[]} suras - Array of sura texts to search through
 * @param {string[]} suraNames - Array of sura names corresponding to the suras
 * @param {string} term - The search term to look for
 * @param {boolean} ignoreMarks - Whether to ignore Arabic marks and diacritics during search
 * @param {boolean} ignoreDots - Whether to ignore dots on Arabic letters during search
 * @param {string} position - Position constraint: "isolated", "initial", "final", "medial", or "any"
 * @returns {string} HTML table body containing formatted results with highlighted search terms
 */
export function search({
  suras,
  suraNames,
  term,
  ignoreMarks,
  ignoreDots,
  position,
}) {
  let results = [];
  suras.forEach((suraText, i) => {
    const ayat = [];
    suraText.split("\n").forEach((ayah, j) => {
      const matches = searchAyah(ayah, term, ignoreMarks, ignoreDots, position);
      if (matches) {
        ayat.push({
          ayah: j + 1,
          text: ayah,
          matches: matches,
        });
      }
    });
    if (ayat.length) {
      results.push({
        sura: i + 1,
        name: suraNames[i],
        ayat: ayat,
      });
    }
  });

  return formatResults(results);
}

/**
 * Highlights text using match positions.
 * @param {string} text - Original text to highlight
 * @param {Array<{start: number, end: number}>} positions - Positions to highlight
 * @returns {string} Text with highlighted portions
 */
function highlight(text, positions) {
  if (!positions || positions.length === 0) return text;

  // Sort positions by start index in reverse order to preserve indices when inserting
  const sortedPositions = [...positions].sort((a, b) => b.start - a.start);

  let result = text;
  for (const pos of sortedPositions) {
    if (pos.start >= 0 && pos.end <= result.length && pos.start < pos.end) {
      result =
        result.slice(0, pos.start) +
        "<mark>" +
        result.slice(pos.start, pos.end) +
        "</mark>" +
        result.slice(pos.end);
    }
  }

  return result;
}

/**
 * Formats grouped search results as HTML table with highlighting.
 * @param {Array<{sura:number, name:string, ayat:Array<{ayah:number, text:string, matches:Array<{start: number, end: number}>}>}>} results - Array of search results grouped by sura
 * @returns {string} HTML table body containing formatted results with highlighted search terms
 */
function formatResults(results) {
  let out = "<tbody>";

  if (!results.length) {
    out += `
    <tr>
      <td colspan="2" class="search-count";">
         لا نتائج
      </td>
    </tr>`;
  } else {
    const arabicDigits = new Intl.NumberFormat("ar-EG", { useGrouping: false });
    const pluralRules = new Intl.PluralRules("ar-EG");

    // Result Count
    const totalCount = results.reduce(
      (sum, sura) => sum + sura.ayat.reduce((s, a) => s + a.matches.length, 0),
      0
    );
    const totalCountAr = arabicDigits.format(totalCount);
    const ayatCount = results.reduce((sum, sura) => sum + sura.ayat.length, 0);
    const ayatCountAr = arabicDigits.format(ayatCount);
    const surasCount = results.length;
    const surasCountAr = arabicDigits.format(surasCount);

    // Proper Arabic plurals
    const ayatCountStr = {
      zero: "آية",
      one: "آية واحدة",
      two: "آيتين",
      few: `${ayatCountAr} آيات`,
      many: `${ayatCountAr} آية`,
      other: `${ayatCountAr} آية`,
    }[pluralRules.select(ayatCount)];

    const surasCountStr = {
      zero: "سورة",
      one: "سورة واحدة",
      two: "سورتين",
      few: `${surasCountAr} سور`,
      many: `${surasCountAr} سورة`,
      other: `${surasCountAr} سورة`,
    }[pluralRules.select(surasCount)];

    const totalCountStr = {
      zero: "لا نتائج",
      one: "مرة واحدة",
      two: "مرتين",
      few: `${totalCountAr} مرات`,
      many: `${totalCountAr} مرة`,
      other: `${totalCountAr} مرة`,
    }[pluralRules.select(totalCount)];

    // Add count row
    out += `
    <tr>
      <td colspan="2" class="search-count";">
        عبارة البحث موجودة ${totalCountStr} في ${ayatCountStr} في ${surasCountStr}
      </td>
    </tr>`;

    for (const group of results) {
      const suraNumber = arabicDigits.format(group.sura);
      out += `
      <tr>
        <td colspan="2" class="sura-header">سورة ${group.name} (${suraNumber})</td>
      </tr>`;

      for (const ayah of group.ayat) {
        let displayText = ayah.text;

        // Apply highlighting if we have highlight data
        if (ayah.matches.length > 0) {
          displayText = highlight(ayah.text, ayah.matches);
        }

        out += `
      <tr>
        <td class="ayah-number">${arabicDigits.format(ayah.ayah)}</td>
        <td class="ayah-text">${displayText}</td>
      </tr>`;
      }
    }
  }

  out += "</tbody>";

  return out;
}
