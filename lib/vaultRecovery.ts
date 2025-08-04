import { validateMnemonic, deriveVaultIdFromMasterKey, seedToMasterKeyForVaultId, mnemonicToSeed } from "@/lib/bip39";
import { recoverVaultByVaultId } from "@/lib/supabase/functions";

export interface VaultRecoveryResult {
  success: boolean;
  message: string;
  email?: string;
  vaultFound?: boolean;
  access_token?: string;
  refresh_token?: string;
}

/**
 * Recovers vault by validating seed phrase and getting session tokens
 * @param seedPhrase - The seed phrase as an array of words or string
 * @returns Promise<VaultRecoveryResult> - Result containing success status and tokens
 */
export async function recoverVault(
  seedPhrase: string[] | string
): Promise<VaultRecoveryResult> {
  try {
    // Handle both string and array input formats
    const mnemonicArray = Array.isArray(seedPhrase)
      ? seedPhrase
      : seedPhrase.trim().split(/\s+/);

    // Step 1: Validate the seed phrase format
    const isValidMnemonic = await validateMnemonic(mnemonicArray);

    if (!isValidMnemonic) {
      return {
        success: false,
        message: "Invalid seed phrase. Please check your words and try again.",
        vaultFound: false,
      };
    }

    // Step 2: Derive vault ID from the seed phrase
    const seed = await mnemonicToSeed(mnemonicArray);
    const vaultIdMasterKey = await seedToMasterKeyForVaultId(seed);
    const vaultId = await deriveVaultIdFromMasterKey(vaultIdMasterKey);

    // Step 3: Use edge function to search for vault with admin privileges
    const recoveryResult = await recoverVaultByVaultId(vaultId);

    if (!recoveryResult.success) {
      return {
        success: false,
        message:
          recoveryResult.error ||
          "No vault found with this seed phrase. Please verify your words and try again.",
        vaultFound: recoveryResult.found || false,
      };
    }

    // Step 4: Vault found successfully
    return {
      success: true,
      message: recoveryResult.message || "Vault found successfully!",
      email: recoveryResult.email,
      vaultFound: true,
      access_token: recoveryResult.access_token,
      refresh_token: recoveryResult.refresh_token,
    };
  } catch (error) {
    // Error already handled by the calling component
    console.log("error", error);
    return {
      success: false,
      message: "An error occurred during vault recovery. Please try again.",
      vaultFound: false,
    };
  }
}
