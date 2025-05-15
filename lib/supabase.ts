import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as aesjs from "aes-js";
import "react-native-get-random-values";
import { Platform } from "react-native";

// Safe web storage that checks for availability
const webStorage = {
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
class LargeSecureStore {
  private async _encrypt(key: string, value: string) {
    const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));

    const cipher = new aesjs.ModeOfOperation.ctr(
      encryptionKey,
      new aesjs.Counter(1)
    );
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

    if (Platform.OS === "web") {
      webStorage.setItem(
        `secure_${key}`,
        aesjs.utils.hex.fromBytes(encryptionKey)
      );
    } else {
      await SecureStore.setItemAsync(
        key,
        aesjs.utils.hex.fromBytes(encryptionKey)
      );
    }

    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private async _decrypt(key: string, value: string) {
    let encryptionKeyHex: string | null;

    if (Platform.OS === "web") {
      encryptionKeyHex = webStorage.getItem(`secure_${key}`);
    } else {
      encryptionKeyHex = await SecureStore.getItemAsync(key);
    }

    if (!encryptionKeyHex) {
      return null;
    }

    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(encryptionKeyHex),
      new aesjs.Counter(1)
    );
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));

    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string) {
    let encrypted: string | null;

    if (Platform.OS === "web") {
      encrypted = webStorage.getItem(key);
    } else {
      encrypted = await AsyncStorage.getItem(key);
    }

    if (!encrypted) {
      return encrypted;
    }

    return await this._decrypt(key, encrypted);
  }

  async removeItem(key: string) {
    if (Platform.OS === "web") {
      webStorage.removeItem(key);
      webStorage.removeItem(`secure_${key}`);
    } else {
      await AsyncStorage.removeItem(key);
      await SecureStore.deleteItemAsync(key);
    }
  }

  async setItem(key: string, value: string) {
    const encrypted = await this._encrypt(key, value);

    if (Platform.OS === "web") {
      webStorage.setItem(key, encrypted);
    } else {
      await AsyncStorage.setItem(key, encrypted);
    }
  }
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const largeSecureStore = new LargeSecureStore();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: largeSecureStore,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
