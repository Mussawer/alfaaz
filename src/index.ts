import { UNICODE_RANGES } from "./languages";

const CHINESE_MAX_CODE_POINT = 205743;
const CHINESE_MIN_CODE_POINT = 11904;
const BYTE_SIZE = 8;

// CHAR_MAP is used to determine whether a codepoint is a word boundary
// or not. Instead of taking 1 byte per codepoint, we divide each byte
// into 8 indices which reduces the memory footprint from 205.7 KB
// to 25.7 KB.
// The extra 1 byte at the end is required to insert the codepoint at the
// last index.
const BITMAP = new Uint8Array(CHINESE_MAX_CODE_POINT / BYTE_SIZE + 1);

function insertCharsIntoMap(...chars: string[]) {
  for (const char of chars) {
    const charCode = char.charCodeAt(0);
    const byteIndex = Math.floor(charCode / BYTE_SIZE);
    const bitIndex = charCode % BYTE_SIZE;
    BITMAP[byteIndex] = BITMAP[byteIndex] ^ (1 << bitIndex);
  }
}

function insertRangeIntoMap(from: number, to: number) {
  for (let i = from / BYTE_SIZE; i < Math.ceil(to / BYTE_SIZE); i++) {
    BITMAP[i] = 0b11111111;
  }
}

const NEWLINE = "\n";
insertCharsIntoMap(
  " ",
  "\n",
  "\t",
  "\v",
  "*",
  "/",
  "&",
  ":",
  ";",
  ".",
  ",",
  "?",
  "=",
  "\u0F0B", // Tibetan uses [U+0F0B TIBETAN MARK INTERSYLLABIC TSHEG] (pronounced tsek) to signal the end of a syllable.
  "\u1361", // Ethiopic text uses the traditional wordspace character [U+1361 ETHIOPIC WORDSPACE] to indicate word boundaries
  "\u200b" // ZERO-WIDTH-SPACE can also be considered a word boundary
);

for (const range of UNICODE_RANGES) {
  insertRangeIntoMap(range[0], range[1]);
}

// Removes emojis and symbols, adds spaces after any language characters, and normalizes whitespace
function removeEmojiAndSymbols(str: string): string {
  return str.replace(/\p{Emoji}|\p{Symbol}|[*&^%$#@!_+=\[\]{}|\\<>~]/gu, ' ')  // Remove emojis and symbols
            .replace(/(\p{Script=Han})/gu, '$1 ')  // Add space after each Chinese character
            .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
            .trim();  // Trim leading and trailing spaces
}

export function countWords(str: string) {
  // Preprocess the string
  const processedStr = removeEmojiAndSymbols(str);

  // Now count words as before
  let count = 0;
  let shouldCount = false;
  for (let i = 0; i < processedStr.length; i++) {
    const charCode = processedStr.charCodeAt(i);
    const byteIndex = Math.floor(charCode / BYTE_SIZE);
    const bitIndex = charCode % BYTE_SIZE;
    const byteAtIndex = BITMAP[byteIndex];
    const isMatch = ((byteAtIndex >> bitIndex) & 1) === 1;
    count += Number(isMatch && (shouldCount || byteAtIndex === 255));
    shouldCount = !isMatch;
  }
  count += Number(shouldCount);
  return count;
}

export function countLines(str: string) {
  let count = 0;
  for (
    let i = -1;
    (i = str.indexOf(NEWLINE, ++i)) !== -1 && i < str.length;
    count++
  );
  count++;
  return count;
}