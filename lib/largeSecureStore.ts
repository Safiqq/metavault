import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as aesjs from "aes-js";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

// Safe web storage that checks for availability
export const webStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(key);
    }
  },
};

// As Expo's SecureStore does not support values larger than 2048
// bytes, an AES-256 key is generated and stored in SecureStore, while
// it is used to encrypt/decrypt values stored in AsyncStorage.
export class LargeSecureStore {
  // Generates and stores an encryption key if it doesn't exist.
  // Returns the encryption key in Uint8Array format.
  private async _getOrCreateEncryptionKey(key: string): Promise<Uint8Array> {
    const keyName = `encryption_key_${key}`;
    let encryptionKeyHex: string | null;

    if (Platform.OS === "web") {
      encryptionKeyHex = webStorage.getItem(keyName);
    } else {
      encryptionKeyHex = await SecureStore.getItemAsync(keyName);
    }

    if (encryptionKeyHex) {
      // Key already exists, convert it from hex and return
      return aesjs.utils.hex.toBytes(encryptionKeyHex);
    }

    // Key doesn't exist, create a new one
    const newEncryptionKey = Crypto.getRandomValues(new Uint8Array(32)); // 256 / 8 = 32
    const newEncryptionKeyHex = aesjs.utils.hex.fromBytes(newEncryptionKey);

    if (Platform.OS === "web") {
      webStorage.setItem(keyName, newEncryptionKeyHex);
    } else {
      await SecureStore.setItemAsync(keyName, newEncryptionKeyHex);
    }

    return newEncryptionKey;
  }

  private _encrypt(key: Uint8Array, value: string) {
    const cipher = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(1));
    const valueBytes = aesjs.utils.utf8.toBytes(value);
    const encryptedBytes = cipher.encrypt(valueBytes);
    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private _decrypt(key: Uint8Array, value: string): string | null {
    try {
      const cipher = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(1));
      const encryptedBytes = aesjs.utils.hex.toBytes(value);
      const decryptedBytes = cipher.decrypt(encryptedBytes);
      return aesjs.utils.utf8.fromBytes(decryptedBytes);
    } catch (error) {
      return null;
    }
  }

  async getItem(key: string): Promise<string | null> {
    const encryptedData =
      Platform.OS === "web"
        ? webStorage.getItem(key)
        : await AsyncStorage.getItem(key);

    if (!encryptedData) {
      return null;
    }

    // To decrypt, we first need the key
    const encryptionKey = await this._getOrCreateEncryptionKey(key);
    if (!encryptionKey) {
      // This case should ideally not happen if data exists, but as a safeguard:
      return null;
    }

    return this._decrypt(encryptionKey, encryptedData);
  }

  async setItem(key: string, value: string): Promise<void> {
    // Ensure an encryption key exists before encrypting the data
    const encryptionKey = await this._getOrCreateEncryptionKey(key);
    const encryptedValue = this._encrypt(encryptionKey, value);

    if (Platform.OS === "web") {
      webStorage.setItem(key, encryptedValue);
    } else {
      await AsyncStorage.setItem(key, encryptedValue);
    }
  }

  async removeItem(key: string): Promise<void> {
    const keyName = `encryption_key_${key}`;
    if (Platform.OS === "web") {
      webStorage.removeItem(key);
      webStorage.removeItem(keyName);
    } else {
      await AsyncStorage.removeItem(key);
      await SecureStore.deleteItemAsync(keyName);
    }
  }
}
