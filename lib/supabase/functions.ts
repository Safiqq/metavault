import {
  PublicKeyCredentialRequestOptionsJSON,
  PublicKeyCredentialCreationOptionsJSON,
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "react-native-passkeys/src/ReactNativePasskeys.types";
import { supabase } from "../supabase";

// =============================================================================
// SUPABASE EDGE FUNCTIONS
// =============================================================================

/**
 * Validates if an email is already used
 */
export async function isEmailUsed(email: string) {
  const { data, error } = await supabase.functions.invoke("is-email-used", {
    body: { email },
  });

  if (error) {
    throw new Error(error.message || "Failed to validate email");
  }

  return data;
}

// =============================================================================
// WEBAUTHN FUNCTIONS
// =============================================================================

/**
 * Get WebAuthn registration options for creating a new passkey
 */
export async function getWebAuthnRegisterOptions(): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const { data, error } = await supabase.functions.invoke(
    "webauthn-register-options"
  );

  if (error) {
    throw new Error(error.message || "Failed to get registration options");
  }

  return data;
}

/**
 * Verify WebAuthn registration response
 */
export async function verifyWebAuthnRegistration(
  registrationData: RegistrationResponseJSON
) {
  const { data, error } = await supabase.functions.invoke(
    "webauthn-verify-registration",
    {
      body: { data: registrationData },
    }
  );

  if (error) {
    throw new Error(error.message || "Failed to verify registration");
  }

  return data;
}

/**
 * Get WebAuthn authentication options for logging in with passkey
 */
export async function getWebAuthnAuthenticateOptions(): Promise<PublicKeyCredentialRequestOptionsJSON> {
  const { data, error } = await supabase.functions.invoke(
    "webauthn-authenticate-options"
  );

  if (error) {
    throw new Error(error.message || "Failed to get authentication options");
  }

  return data;
}

/**
 * Verify WebAuthn authentication response
 */
export async function verifyWebAuthnAuthentication(
  authenticationData: AuthenticationResponseJSON
) {
  const { data, error } = await supabase.functions.invoke(
    "webauthn-verify-authentication",
    {
      body: { data: authenticationData },
    }
  );

  if (error) {
    throw new Error(error.message || "Failed to verify authentication");
  }

  return data;
}

/**
 * Recover vault using vault ID (uses admin privileges to access vault data)
 */
export async function recoverVaultByVaultId(vaultId: string) {
  try {
    console.log("vauldId", vaultId);
    const { data, error } = await supabase.functions.invoke("vault-recovery", {
      body: { vault_id: vaultId },
    });

    // If there's an error, it means the Edge Function returned a non-2xx status
    // But the response body may still contain valid structured error information
    if (error) {
      // For vault recovery, a 404 or 400 response is expected when vault is not found
      // Return a structured error response instead of throwing
      return {
        success: false,
        error: "No vault found with this vault ID",
        found: false,
      };
    }

    return data;
  } catch (networkError) {
    // Handle network errors or other critical failures
    console.error("Network error in vault recovery:", networkError);
    return {
      success: false,
      error: "Network error occurred during vault recovery",
      found: false,
    };
  }
}
