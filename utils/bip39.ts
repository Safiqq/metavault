import { BIP39_WORDLISTS } from "@/assets/wordlists";

// Cache the wordlist
let wordlistCache: string[] | null = null;

/**
 * Load BIP39 wordlist from assets
 */
export async function loadWordlist(): Promise<string[]> {
  if (wordlistCache) return wordlistCache;

  wordlistCache = BIP39_WORDLISTS;

  if (wordlistCache.length !== 2048) {
    console.warn(`Expected 2048 words, got ${wordlistCache.length}`);
  }

  return wordlistCache;
}

/**
 * Secure random bytes
 */
function getRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

/**
 * Convert bytes to binary string
 */
function bytesToBinary(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(2).padStart(8, "0")).join("");
}

/**
 * Calculate SHA-256 hash
 */
async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

/**
 * Generate mnemonic
 */
export async function generateMnemonic(wordCount = 12): Promise<string[]> {
  const validWordCounts = [12, 15, 18, 21, 24];
  if (!validWordCounts.includes(wordCount)) {
    throw new Error(`Invalid word count: ${wordCount}`);
  }

  const ENT = (wordCount / 3) * 32; // Entropy bits
  const CS = ENT / 32; // Checksum bits

  const entropy = getRandomBytes(ENT / 8); // Get entropy bytes
  const hash = await sha256(entropy);

  const entropyBits = bytesToBinary(entropy);
  const checksumBits = bytesToBinary(hash).slice(0, CS);

  const bits = entropyBits + checksumBits;

  const wordlist = await loadWordlist();
  const words: string[] = [];

  for (let i = 0; i < bits.length; i += 11) {
    const idx = parseInt(bits.slice(i, i + 11), 2);
    words.push(wordlist[idx]);
  }

  return words;
}

/**
 * Validate mnemonic checksum
 */
export async function validateMnemonic(words: string[]): Promise<boolean> {
  const wordlist = await loadWordlist();
  const wordCount = words.length;
  const validWordCounts = [12, 15, 18, 21, 24];

  if (!validWordCounts.includes(wordCount)) return false;

  // Check all words are in the wordlist
  for (const word of words) {
    if (!wordlist.includes(word)) return false;
  }

  const indexes = words.map(word => wordlist.indexOf(word));
  const bits = indexes.map(i => i.toString(2).padStart(11, "0")).join("");

  const ENT = Math.floor((wordCount * 11 * 32) / 33);
  const CS = wordCount * 11 - ENT;

  const entropyBits = bits.slice(0, ENT);
  const checksumBits = bits.slice(ENT);

  const entropyBytes = new Uint8Array(entropyBits.match(/.{1,8}/g)!.map(b => parseInt(b, 2)));
  const hash = await sha256(entropyBytes);
  const actualChecksumBits = bytesToBinary(hash).slice(0, CS);

  return actualChecksumBits === checksumBits;
}

/**
 * Convert mnemonic to seed using PBKDF2-HMAC-SHA512
 */
export async function mnemonicToSeed(
  words: string[],
  passphrase = ""
): Promise<Uint8Array> {
  const mnemonic = words.join(" ");
  const salt = "mnemonic" + passphrase;

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(mnemonic),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: 2048,
      hash: "SHA-512"
    },
    keyMaterial,
    512 // 64 bytes
  );

  return new Uint8Array(derivedBits);
}
