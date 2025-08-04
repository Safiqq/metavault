import { deriveVaultKeys, encryptVault, decryptVault } from "@/lib/bip39";
import { getCurrentUser, getVault, upsertVault } from "@/lib/supabase/database";
import { DecryptedVaultItem, VaultsInsert, VaultKeys } from "@/lib/types";
import { Json } from "@/database.types";
import * as Crypto from "expo-crypto";

interface EncryptionMetadata {
  algorithm: string;
  keyDerivation: string;
  iterations: number;
  version: number;
  timestamp?: number;
}

export class VaultManager {
  private static instance: VaultManager;
  private cachedKeys: VaultKeys | null = null;
  private cachedVaultData: DecryptedVaultItem[] | null = null;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): VaultManager {
    if (!VaultManager.instance) {
      VaultManager.instance = new VaultManager();
    }
    return VaultManager.instance;
  }

  /**
   * Initialize the vault manager with user credentials
   * This should be called once during login/recovery
   */
  async initialize(mnemonic: string[], email: string): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Validate inputs
      if (!Array.isArray(mnemonic) || mnemonic.length === 0) {
        throw new Error("Invalid mnemonic provided");
      }
      if (!email || typeof email !== "string" || !email.includes("@")) {
        throw new Error("Invalid email provided");
      }

      // Clear any existing state
      this.secureWipeCache();

      // Derive keys once and cache them
      const start = new Date();
      this.cachedKeys = await deriveVaultKeys(mnemonic, email);
      const end = new Date();
      console.log(Math.abs(end - start));

      // Load vault data from database
      await this.loadVaultFromDatabase();

      await this.saveVaultToDatabase(this.cachedVaultData || []);

      this.initialized = true;
    } catch (error) {
      // Ensure clean state on initialization failure
      this.secureWipeCache();
      console.log(error);
      throw new Error("Vault initialization failed");
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get cached vault data without re-deriving keys (excludes deleted items)
   */
  getCachedVaultData(): DecryptedVaultItem[] | null {
    return this.getActiveVaultData();
  }

  /**
   * Get all cached vault data including deleted items
   */
  getAllCachedVaultData(): DecryptedVaultItem[] | null {
    return this.cachedVaultData;
  }

  /**
   * Get cached keys without re-deriving
   */
  getCachedKeys(): VaultKeys | null {
    return this.cachedKeys;
  }

  /**
   * Load vault data from database and decrypt it
   */
  private async loadVaultFromDatabase(): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("User authentication failed");
      }

      // Get the latest vault from database
      const vault = await getVault(user.id, this.cachedKeys!.vaultId);

      if (vault) {
        // Validate encrypted blob before decryption
        if (!vault.encrypted_blob || typeof vault.encrypted_blob !== "string") {
          throw new Error("Invalid vault data structure");
        }

        // Decrypt the vault data with error handling
        const decryptedData = await decryptVault(
          vault.encrypted_blob,
          this.cachedKeys!
        );

        // Validate decrypted JSON before parsing
        if (!decryptedData || typeof decryptedData !== "string") {
          throw new Error("Decryption produced invalid data");
        }

        try {
          const parsedData = JSON.parse(decryptedData);
          if (!Array.isArray(parsedData)) {
            throw new Error("Vault data format invalid");
          }
          this.cachedVaultData = this.validateDecryptedVaultItems(parsedData);
        } catch (parseError) {
          throw new Error("Vault data parsing failed");
        }
      } else {
        // No vault exists yet, initialize with empty data
        this.cachedVaultData = [];
      }
      return;
    } catch (error) {
      this.secureWipeCache();
    }
  }

  /**
   * Save vault data to database
   */
  async saveVaultToDatabase(vaultData: DecryptedVaultItem[]): Promise<void> {
    // Validate input data
    if (!Array.isArray(vaultData)) {
      throw new Error("Invalid vault data: must be an array");
    }

    const validatedData = this.validateDecryptedVaultItems(vaultData);

    const user = await getCurrentUser();
    if (!user) {
      throw new Error("User authentication failed");
    }

    // Encrypt the vault data with input validation
    const dataToEncrypt = JSON.stringify(validatedData);
    if (dataToEncrypt.length > 10 * 1024 * 1024) {
      // 10MB limit
      throw new Error("Vault data too large");
    }

    const encryptedBlob = await encryptVault(dataToEncrypt, this.cachedKeys!);

    // Prepare metadata
    const metadata: EncryptionMetadata = {
      algorithm: "AES-256-CTR-HMAC-SHA256",
      keyDerivation: "PBKDF2-SHA256-100k",
      iterations: 100000,
      version: 1,
      timestamp: Date.now(),
    };

    const vaultInsert: VaultsInsert = {
      vault_id: this.cachedKeys!.vaultId,
      user_id: user.id,
      encrypted_blob: encryptedBlob,
      encryption_metadata: metadata as unknown as Json, // Type assertion for Supabase Json compatibility
    };

    // Insert or update the vault
    await upsertVault(vaultInsert);

    // Update cached data only after successful save
    this.cachedVaultData = validatedData;
    return;
  }

  /**
   * Add or update an item in the vault
   */
  async upsertVaultItem(item: DecryptedVaultItem): Promise<void> {
    if (!this.cachedVaultData) {
      throw new Error("Vault data not loaded");
    }

    // Item is already typed as DecryptedVaultItem, no need for additional validation

    const now = new Date().toISOString();
    const existingIndex = this.cachedVaultData.findIndex(
      (existingItem) =>
        existingItem.folder_id === item.folder_id &&
        existingItem.item_name === item.item_name
    );

    if (existingIndex >= 0) {
      // Update existing item
      const existingItem = this.cachedVaultData[existingIndex];
      if (existingItem) {
        this.cachedVaultData[existingIndex] = {
          ...item,
          id: existingItem.id, // Preserve existing ID
          created_at: existingItem.created_at || now,
          updated_at: now,
        };
      }
    } else {
      // Add new item with generated ID
      this.cachedVaultData.push({
        ...item,
        id: Crypto.randomUUID(),
        created_at: now,
        updated_at: now,
        deleted_at: null,
      });
    }

    // Save to database
    await this.saveVaultToDatabase(this.cachedVaultData);
  }

  /**
   * Remove an item from the vault (hard delete)
   */
  async removeVaultItem(folderId: string, itemName: string): Promise<void> {
    if (!this.cachedVaultData) {
      throw new Error("Vault data not loaded");
    }

    // Validate inputs
    if (!folderId || typeof folderId !== "string") {
      throw new Error("Invalid folder ID");
    }
    if (!itemName || typeof itemName !== "string") {
      throw new Error("Invalid item name");
    }

    const initialLength = this.cachedVaultData.length;
    this.cachedVaultData = this.cachedVaultData.filter(
      (item) => !(item.folder_id === folderId && item.item_name === itemName)
    );

    // Only save if something was actually removed
    if (this.cachedVaultData.length < initialLength) {
      await this.saveVaultToDatabase(this.cachedVaultData);
    }
  }

  /**
   * Soft delete an item by ID
   */
  async deleteVaultItem(itemId: string): Promise<void> {
    if (!this.cachedVaultData) {
      throw new Error("Vault data not loaded");
    }

    // Validate input
    if (!itemId || typeof itemId !== "string") {
      throw new Error("Invalid item ID");
    }

    const itemIndex = this.cachedVaultData.findIndex(
      (item) => item.id === itemId
    );

    if (itemIndex >= 0) {
      const item = this.cachedVaultData[itemIndex];
      if (item) {
        const now = new Date().toISOString();
        item.deleted_at = now;
        item.updated_at = now;

        // Save to database
        await this.saveVaultToDatabase(this.cachedVaultData);
      }
    } else {
      throw new Error("Item not found");
    }
  }

  /**
   * Update an existing vault item by ID
   */
  async updateVaultItem(
    itemId: string,
    updates: Partial<DecryptedVaultItem>
  ): Promise<void> {
    if (!this.cachedVaultData) {
      throw new Error("Vault data not loaded");
    }

    // Validate inputs
    if (!itemId || typeof itemId !== "string") {
      throw new Error("Invalid item ID");
    }
    if (!updates || typeof updates !== "object") {
      throw new Error("Invalid updates object");
    }

    const itemIndex = this.cachedVaultData.findIndex(
      (item) => item.id === itemId
    );

    if (itemIndex >= 0) {
      const existingItem = this.cachedVaultData[itemIndex];
      if (existingItem) {
        // Validate updates before applying
        const sanitizedUpdates =
          this.sanitizePartialDecryptedVaultItem(updates);

        // Prevent overwriting critical fields
        delete sanitizedUpdates.id;
        delete sanitizedUpdates.created_at;

        this.cachedVaultData[itemIndex] = {
          ...existingItem,
          ...sanitizedUpdates,
          updated_at: new Date().toISOString(),
        };

        // Save to database
        await this.saveVaultToDatabase(this.cachedVaultData);
      }
    } else {
      throw new Error("Item not found");
    }
  }

  /**
   * Permanently delete an item
   */
  async permanentlyDeleteVaultItem(itemId: string): Promise<void> {
    if (!this.cachedVaultData) {
      throw new Error("Vault data not loaded");
    }

    // Validate input
    if (!itemId || typeof itemId !== "string") {
      throw new Error("Invalid item ID");
    }

    const initialLength = this.cachedVaultData.length;
    this.cachedVaultData = this.cachedVaultData.filter(
      (item) => item.id !== itemId
    );

    // Only save if something was actually deleted
    if (this.cachedVaultData.length < initialLength) {
      await this.saveVaultToDatabase(this.cachedVaultData);
    } else {
      throw new Error("Item not found");
    }
  }

  /**
   * Get items for a specific folder (excludes deleted items)
   */
  getItemsForFolder(folderId: string): DecryptedVaultItem[] {
    if (!this.cachedVaultData) {
      return [];
    }

    // Validate input
    if (!folderId || typeof folderId !== "string") {
      throw new Error("Invalid folder ID");
    }

    return this.cachedVaultData.filter(
      (item) => item.folder_id === folderId && !item.deleted_at
    );
  }

  /**
   * Get deleted/trashed items
   */
  getTrashedItems(): DecryptedVaultItem[] {
    if (!this.cachedVaultData) {
      return [];
    }
    return this.cachedVaultData.filter((item) => item.deleted_at);
  }

  /**
   * Get active (non-deleted) vault data
   */
  getActiveVaultData(): DecryptedVaultItem[] {
    if (!this.initialized) {
      return [];
    }
    if (!this.cachedVaultData) {
      return [];
    }
    return this.cachedVaultData.filter((item) => !item.deleted_at);
  }

  /**
   * Get deleted vault items (trash)
   */
  getDeletedVaultData(): DecryptedVaultItem[] {
    if (!this.initialized) {
      return [];
    }
    if (!this.cachedVaultData) {
      return [];
    }
    return this.cachedVaultData.filter((item) => item.deleted_at);
  }

  /**
   * Search vault items (excludes deleted items by default)
   */
  searchVaultItems(
    query: string,
    includeDeleted = false
  ): DecryptedVaultItem[] {
    // Validate input
    if (typeof query !== "string") {
      throw new Error("Search query must be a string");
    }

    // Limit search query length to prevent DoS
    if (query.length > 1000) {
      throw new Error("Search query too long");
    }

    const dataToSearch = includeDeleted
      ? this.cachedVaultData || []
      : this.getActiveVaultData();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return dataToSearch;
    }

    // Escape special regex characters to prevent ReDoS attacks
    const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchTerm = escapedQuery.toLowerCase();

    return dataToSearch.filter(
      (item) =>
        item.item_name.toLowerCase().includes(searchTerm) ||
        (item.username && item.username.toLowerCase().includes(searchTerm)) ||
        item.folder_name.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Clear all cached data (for logout)
   */
  clearCache(): void {
    this.secureWipeCache();
  }

  /**
   * Securely wipe sensitive data from memory
   */
  private secureWipeCache(): void {
    // Zero out encryption keys if they exist
    if (this.cachedKeys) {
      if (this.cachedKeys.encryptionKey) {
        this.cachedKeys.encryptionKey.fill(0);
      }
      if (this.cachedKeys.macKey) {
        this.cachedKeys.macKey.fill(0);
      }
    }

    this.cachedKeys = null;
    this.cachedVaultData = null;
    this.initialized = false;
  }

  /**
   * Sleep utility for retry logic
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate an array of credential items
   */
  private validateDecryptedVaultItems(items: any[]): DecryptedVaultItem[] {
    if (!Array.isArray(items)) {
      throw new Error("Invalid credential items: must be an array");
    }

    return items.map((item, index) => {
      try {
        return item as DecryptedVaultItem;
      } catch (error) {
        throw new Error(
          `Invalid item at index ${index}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    });
  }

  /**
   * Sanitize partial credential item updates
   */
  private sanitizePartialDecryptedVaultItem(
    updates: Partial<DecryptedVaultItem>
  ): Partial<DecryptedVaultItem> {
    const sanitized: Partial<DecryptedVaultItem> = {};

    // Only allow specific fields to be updated
    const allowedFields: (keyof DecryptedVaultItem)[] = [
      "folder_id",
      "folder_name",
      "item_name",
      "item_type",
      "username",
      "password",
      "fingerprint",
      "public_key",
      "private_key",
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        // Basic type validation
        if (typeof updates[field] !== "string") {
          throw new Error(`${String(field)} must be a string`);
        }

        // Special validation for item_type
        if (field === "item_type") {
          const value = updates[field] as string;
          if (value !== "login" && value !== "ssh_key") {
            throw new Error('item_type must be either "login" or "ssh_key"');
          }
          sanitized[field] = value as "login" | "ssh_key";
        } else {
          sanitized[field] = updates[field] as string;
        }
      }
    }

    return sanitized;
  }
}

// Export singleton instance
export const vaultManager = VaultManager.getInstance();
