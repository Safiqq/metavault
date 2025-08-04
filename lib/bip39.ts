import { BIP39_WORDLISTS } from "@/assets/wordlists";
import * as Crypto from "expo-crypto";
import { hmac } from "@noble/hashes/hmac";
import { hkdf } from "@noble/hashes/hkdf";
import { pbkdf2Async } from "@noble/hashes/pbkdf2";
import { sha256, sha512 } from "@noble/hashes/sha2";
import aesjs from "aes-js";
import { Buffer } from "buffer";

// =============================================================================
// GENERAL FUNCTIONS
// =============================================================================

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
    Array.from(data)
      .map((b) => String.fromCharCode(b))
      .join(""),
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  return new Uint8Array(Buffer.from(digest, "base64"));
}

/**
 * Generate secure random bytes
 */
function getRandomBytes(length: number): Uint8Array {
  return Crypto.getRandomValues(new Uint8Array(length));
}

// =============================================================================
// MNEMONIC GENERATION
// =============================================================================

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
  const length = ENT / 8; // Convert bits to bytes

  const entropy = getRandomBytes(length);
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

// =============================================================================
// MNEMONIC TO SEED
// =============================================================================

/**
 * Convert mnemonic to seed using PBKDF2-HMAC-SHA512 (BIP39 standard)
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
    c: 2048, // BIP39 standard iterations
    dkLen: 64, // 512 bits
  });
}

// =============================================================================
// SEED TO MASTER KEY
// =============================================================================

/**
 * Derive master key from seed using PBKDF2 for additional security
 * This adds an extra layer of protection specific to your password manager
 */
export async function seedToMasterKey(
  seed: Uint8Array,
  email: string
): Promise<Uint8Array> {
  // Create salt from user email
  const encoder = new TextEncoder();
  const salt = encoder.encode(`vault-salt-v1-${email}`);

  const masterKey = await pbkdf2Async(sha256, seed, salt, {
    c: 100000, // 100k default for mobile performance
    dkLen: 64, // 512 bits output
  });

  return masterKey;
}

/**
 * Derive master key from seed only (for vault ID generation)
 * This creates a consistent vault ID based only on the seed phrase
 */
export async function seedToMasterKeyForVaultId(
  seed: Uint8Array
): Promise<Uint8Array> {
  // Create salt without user email for consistent vault ID
  const encoder = new TextEncoder();
  const salt = encoder.encode(`vault-id-salt-v1`);

  const masterKey = await pbkdf2Async(sha256, seed, salt, {
    c: 100000, // 100k default for mobile performance
    dkLen: 64, // 512 bits output
  });

  return masterKey;
}

// =============================================================================
// MASTER KEY TO KEYS (ENCRYPTION, MAC, AND VAULTID)
// =============================================================================

/**
 * Derives encryption and MAC keys from the master key using HKDF
 * This provides cryptographic key separation
 */
export async function deriveKeysFromMasterKey(masterKey: Uint8Array): Promise<{
  encryptionKey: Uint8Array;
  macKey: Uint8Array;
}> {
  // Use HKDF for key derivation from master key
  const encryptionInfo = new TextEncoder().encode("vault-encryption-v1");
  const macInfo = new TextEncoder().encode("vault-mac-v1");
  const salt = new Uint8Array(); // Empty salt for HKDF

  // Derive separate keys for different purposes
  const encryptionKey = hkdf(sha256, masterKey, salt, encryptionInfo, 32);
  const macKey = hkdf(sha256, masterKey, salt, macInfo, 32);

  return {
    encryptionKey,
    macKey,
  };
}

/**
 * Derives vault ID using HKDF
 */
export async function deriveVaultIdFromMasterKey(
  masterKey: Uint8Array
): Promise<string> {
  // Use HKDF for key derivation from master key
  const vaultIdInfo = new TextEncoder().encode("vault-id-v1");
  const salt = new Uint8Array(); // Empty salt for HKDF

  // Derive vault ID for vault recovery
  const vaultIdSeed = hkdf(sha256, masterKey, salt, vaultIdInfo, 32);

  // Generate vault ID from seed
  const vaultIdHash = sha256(vaultIdSeed);
  const vaultId = Buffer.from(vaultIdHash)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return vaultId;
}

// =============================================================================
// DERIVE ALL KEYS
// =============================================================================

/**
 * Complete key derivation flow: mnemonic → seed → master key → keys
 */
export async function deriveVaultKeys(
  words: string[],
  email: string,
  passphrase = ""
): Promise<{
  encryptionKey: Uint8Array;
  macKey: Uint8Array;
  vaultId: string;
}> {
  // Step 1: Mnemonic to seed (BIP39)
  const seed = await mnemonicToSeed(words, passphrase);

  // Step 2: Seed to master key (App-specific PBKDF2) - still uses email for encryption keys
  const masterKey = await seedToMasterKey(seed, email);
  // Step 3: Seed to vault ID master key (seed-only for consistent vault ID)
  const vaultIdMasterKey = await seedToMasterKeyForVaultId(seed);

  // Step 4: Master key to functional keys (HKDF)
  const encryptionMacKeys = await deriveKeysFromMasterKey(masterKey);
  // Step 5: Vault ID master key to vault ID (HKDF)
  const vaultId = await deriveVaultIdFromMasterKey(vaultIdMasterKey);

  return {
    encryptionKey: encryptionMacKeys.encryptionKey,
    macKey: encryptionMacKeys.macKey,
    vaultId: vaultId,
  };
}

// =============================================================================
// ENCRYPTION AND DECRYPTION
// =============================================================================

/**
 * Encrypt vault data using AES-CTR + HMAC-SHA256 (Encrypt-then-MAC)
 */
export async function encryptVault(
  vaultData: string,
  keys: { encryptionKey: Uint8Array; macKey: Uint8Array }
): Promise<string> {
  const iv = getRandomBytes(16); // 128-bit IV for CTR mode
  const textBytes = aesjs.utils.utf8.toBytes(vaultData);

  // Encrypt with AES-CTR
  const aesCtr = new aesjs.ModeOfOperation.ctr(
    keys.encryptionKey,
    new aesjs.Counter(iv)
  );
  const encryptedBytes = aesCtr.encrypt(textBytes);

  // Create MAC over IV + ciphertext
  const dataToAuthenticate = Buffer.concat([
    Buffer.from(iv),
    Buffer.from(encryptedBytes),
  ]);
  const mac = hmac(sha256, keys.macKey, dataToAuthenticate);

  // Combine: IV + Ciphertext + MAC
  const combined = Buffer.concat([
    Buffer.from(iv),
    Buffer.from(encryptedBytes),
    Buffer.from(mac),
  ]);

  return combined.toString("hex");
}

/**
 * Decrypt the password vault using AES-CTR + HMAC-SHA256
 */
export async function decryptVault(
  encryptedHexString: string,
  keys: { encryptionKey: Uint8Array; macKey: Uint8Array }
): Promise<string> {
  const combined = Buffer.from(encryptedHexString, "hex");

  // Extract components
  const iv = combined.slice(0, 16);
  const encryptedBytes = combined.slice(16, combined.length - 32);
  const receivedMac = combined.slice(combined.length - 32);

  // Verify MAC
  const dataToAuthenticate = Buffer.concat([iv, encryptedBytes]);
  const expectedMac = hmac(sha256, keys.macKey, dataToAuthenticate);

  // Timing-safe MAC comparison
  const macIsValid = timingSafeEqual(receivedMac, expectedMac);

  if (!macIsValid) {
    throw new Error(
      "Decryption failed: Invalid MAC. The data has been tampered with or is corrupted."
    );
  }

  // Decrypt with AES-CTR
  const aesCtr = new aesjs.ModeOfOperation.ctr(
    keys.encryptionKey,
    new aesjs.Counter(iv)
  );
  const decryptedBytes = aesCtr.decrypt(encryptedBytes);

  return aesjs.utils.utf8.fromBytes(decryptedBytes);
}

/**
 * Compares two Uint8Arrays in constant time to prevent timing attacks
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
 * Example usage flow (development only)
 */
// export async function exampleUsage() {
//   // 1. Generate mnemonic
//   const words = await generateMnemonic(128); // 12 words

//   // 2. Validate mnemonic
//   const isValid = await validateMnemonic(words);

//   // 3. Derive all keys
//   const email = "user@example.com";
//   const keys = await deriveVaultKeys(words, email);

//   // 4. Encrypt data
//   const passwords = JSON.stringify({
//     "gmail.com": { username: "user", password: "pass123" },
//     "facebook.com": { username: "user", password: "pass456" },
//   });

//   const encrypted = await encryptVault(passwords, keys);

//   // 5. Decrypt data
//   const decrypted = await decryptVault(encrypted, keys);
// }
