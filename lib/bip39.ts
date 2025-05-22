import { BIP39_WORDLISTS } from "@/assets/wordlists";
import * as Crypto from "expo-crypto";
import { hmac } from "@noble/hashes/hmac";
import { hkdf } from "@noble/hashes/hkdf";
import { pbkdf2Async } from "@noble/hashes/pbkdf2";
import { sha256, sha512 } from "@noble/hashes/sha2";
// import AesGcmCrypto, { EncryptedData } from "react-native-aes-gcm-crypto";
import aesjs from "aes-js";
import { Buffer } from "buffer";

// Cache the wordlist
let wordlistCache: string[] | null = null;

/**
 * Load BIP39 wordlist from assets
 */
export function loadWordlist(): string[] {
  if (wordlistCache) return wordlistCache;

  wordlistCache = BIP39_WORDLISTS;

  return wordlistCache;
}

/**
 * Secure random bytes
 */
function getRandomBytes(length: number): Uint8Array {
  return Crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Convert bytes to binary string
 */
function bytesToBinary(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, "0"))
    .join("");
}

/**
 * Calculate SHA-256 hash
 */
async function digestSha256(data: Uint8Array): Promise<Uint8Array> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Array.from(data).map(b => String.fromCharCode(b)).join(''),
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  return new Uint8Array(Buffer.from(digest, 'base64'));
}

/**
 * Generate mnemonic
 */
export async function generateMnemonic(entropyBits = 128): Promise<string[]> {
  const validEntropyBits = [128, 160, 192, 224, 256];
  if (!validEntropyBits.includes(entropyBits)) {
    throw new Error(`Invalid entropy bits: ${entropyBits}`);
  }

  const ENT = entropyBits;
  const CS = ENT / 32;

  const entropy = getRandomBytes(ENT / 8);
  const hash = await digestSha256(entropy);

  const entropyBinary = bytesToBinary(entropy);
  const checksumBits = bytesToBinary(hash).slice(0, CS);

  const bits = entropyBinary + checksumBits;
  const wordlist = loadWordlist();

  const words: string[] = [];
  for (let i = 0; i < bits.length; i += 11) {
    const idx = parseInt(bits.slice(i, i + 11), 2);
    const word = wordlist[idx];
    if (word) {
      words.push(word);
    }
  }

  return words;
}

/**
 * Validate mnemonic checksum
 */
export async function validateMnemonic(words: string[]): Promise<boolean> {
  if (!words || !Array.isArray(words)) return false;
  
  const wordlist = loadWordlist();
  const wordCount = words.length;
  const validWordCounts = [12, 15, 18, 21, 24];

  if (!validWordCounts.includes(wordCount)) return false;

  // Check all words are in the wordlist
  for (const word of words) {
    if (!wordlist.includes(word)) return false;
  }

  const indexes = words.map((word) => wordlist.indexOf(word));
  const bits = indexes.map((i) => i.toString(2).padStart(11, "0")).join("");

  const ENT = Math.floor((wordCount * 11 * 32) / 33);
  const CS = wordCount * 11 - ENT;

  const entropyBits = bits.slice(0, ENT);
  const checksumBits = bits.slice(ENT);

  const entropyByteMatches = entropyBits.match(/.{1,8}/g);
  if (!entropyByteMatches) {
    throw new Error("Invalid entropy bits format");
  }
  const entropyBytes = new Uint8Array(
    entropyByteMatches.map((b) => parseInt(b, 2))
  );
  const hash = await digestSha256(entropyBytes);
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
  const mnemonicBytes = encoder.encode(mnemonic);
  const saltBytes = encoder.encode(salt);

  return await pbkdf2Async(sha512, mnemonicBytes, saltBytes, {
    c: 2048,
    dkLen: 64,
  });
}

/**
 * Derives an encryption key from the master seed using HKDF from @noble/hashes.
 * Returns the raw key as a Uint8Array.
 */
export async function deriveKeys(
  seed: Uint8Array
): Promise<{ encryptionKey: Uint8Array; macKey: Uint8Array }> {
  const info = new TextEncoder().encode("vault-keys");
  const salt = new Uint8Array(); // Salt can be empty for HKDF

  // Derive 64 bytes in total: 32 for encryption, 32 for authentication
  const derivedKey = hkdf(sha256, seed, salt, info, 64); // 64 bytes = 512 bits

  return {
    encryptionKey: derivedKey.slice(0, 32),
    macKey: derivedKey.slice(32, 64),
  };
}

/**
 * Creates a SHA-256 hash of a key.
 */
export async function createHashedSecret(seed: Uint8Array): Promise<string> {
  const hashBuffer = await Crypto.digest(
    Crypto.CryptoDigestAlgorithm.SHA256,
    seed
  );
  return Buffer.from(hashBuffer).toString("hex");
}

export async function encryptVault(
  vaultData: string,
  keys: { encryptionKey: Uint8Array; macKey: Uint8Array }
): Promise<string> {
  const iv = getRandomBytes(16); // IV for CTR is typically the block size (16 bytes)
  const textBytes = aesjs.utils.utf8.toBytes(vaultData);

  const aesCtr = new aesjs.ModeOfOperation.ctr(
    keys.encryptionKey,
    new aesjs.Counter(iv)
  );
  const encryptedBytes = aesCtr.encrypt(textBytes);

  const dataToAuthenticate = Buffer.concat([
    Buffer.from(iv),
    Buffer.from(encryptedBytes),
  ]);
  const mac = hmac(sha256, keys.macKey, dataToAuthenticate);

  // Format: iv(hex) + ciphertext(hex) + mac(hex)
  const combined = Buffer.concat([
    Buffer.from(iv),
    Buffer.from(encryptedBytes),
    Buffer.from(mac),
  ]);

  return combined.toString("hex");
}

/**
 * Compares two Uint8Arrays in constant time to prevent timing attacks.
 */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    const aValue = a[i];
    const bValue = b[i];
    if (aValue !== undefined && bValue !== undefined) {
      diff |= aValue ^ bValue;
    }
  }

  return diff === 0;
}

/**
 * Decrypts the password vault using AES-CTR + HMAC-SHA256 (Encrypt-then-MAC).
 */
export async function decryptVault(
  encryptedHexString: string,
  keys: { encryptionKey: Uint8Array; macKey: Uint8Array }
): Promise<string> {
  const combined = Buffer.from(encryptedHexString, "hex");

  const iv = combined.slice(0, 16);
  const encryptedBytes = combined.slice(16, combined.length - 32);
  const receivedMac = combined.slice(combined.length - 32);

  const dataToAuthenticate = Buffer.concat([iv, encryptedBytes]);
  const expectedMac = hmac(sha256, keys.macKey, dataToAuthenticate);

  // Use a timing-safe comparison to prevent timing attacks
  const macIsValid = timingSafeEqual(receivedMac, expectedMac);

  if (!macIsValid) {
    throw new Error(
      "Decryption failed: Invalid MAC. The data has been tampered with or is corrupted."
    );
  }

  const aesCtr = new aesjs.ModeOfOperation.ctr(
    keys.encryptionKey,
    new aesjs.Counter(iv)
  );
  const decryptedBytes = aesCtr.decrypt(encryptedBytes);

  return aesjs.utils.utf8.fromBytes(decryptedBytes);
}
