import { supabase } from "../supabase";
import {
  FoldersInsert,
  FoldersRow,
  FoldersUpdate,
  SessionsInsert,
  SessionsRow,
  VaultsInsert,
  VaultsRow,
} from "../types";

// =============================================================================
// AUTH FUNCTIONS
// =============================================================================

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message || "Failed to get current user");
  }

  return data.user;
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message || "Failed to get session");
  }

  return data.session;
}

/**
 * Sign in with OTP (email)
 */
export async function signInWithOtp(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    throw new Error(error.message || "Failed to send OTP");
  }

  return data;
}

/**
 * Verify OTP
 */
export async function verifyOtp(
  email: string,
  token: string,
  type: "signup" | "email"
) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type,
  });

  if (error) {
    throw new Error(error.message || "Failed to verify OTP");
  }

  return data;
}

/**
 * Set session (for recovery)
 */
export async function setSession(accessToken: string, refreshToken: string) {
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw new Error(error.message || "Failed to set session");
  }

  return data;
}

/**
 * Refresh current session
 */
export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession();

  if (error) {
    throw new Error(error.message || "Failed to refresh session");
  }

  return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message || "Failed to sign out");
  }
}

// =============================================================================
// SESSIONS TABLE
// =============================================================================

/**
 * Upsert session record
 */
export async function upsertSession(sessionData: SessionsInsert) {
  const { data, error } = await supabase.from("sessions").upsert(sessionData);

  if (error) {
    throw new Error(error.message || "Failed to upsert session");
  }

  return data;
}

/**
 * Get all sessions for a user
 */
export async function getSessions(
  userId?: string
): Promise<Partial<SessionsRow>[]> {
  let query = supabase
    .from("sessions")
    .select(
      "device_id,device_name,ip_address,user_agent,last_active_at,revoked_at"
    );

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || "Failed to get sessions");
  }

  return data || [];
}

/**
 * Revoke session by updating revoked_at
 */
export async function revokeSession(userId: string, deviceId: string) {
  const { data, error } = await supabase
    .from("sessions")
    .update({
      revoked_at: new Date().toISOString(),
    })
    .match({ user_id: userId, device_id: deviceId });

  if (error) {
    throw new Error(error.message || "Failed to revoke session");
  }

  return data;
}

// =============================================================================
// FOLDERS TABLE
// =============================================================================

/**
 *
 * @param userId
 * @returns
 */
export async function getFolderName(folderId: string): Promise<string> {
  const { data, error } = await supabase
    .from("folders")
    .select("name")
    .eq("id", folderId)
    .single();

  if (error) {
    throw new Error(error.message || "Failed to get folder name");
  }

  return data.name || "";
}
/**
 * Get all folders for a user
 */
export async function getFolders(userId: string): Promise<FoldersRow[]> {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Failed to get folders");
  }

  return data || [];
}

/**
 * Insert a new folder
 */
export async function insertFolder(folderData: FoldersInsert) {
  const { data, error } = await supabase
    .from("folders")
    .insert(folderData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to create folder");
  }

  return data;
}

/**
 * Update a folder
 */
export async function updateFolder(folderId: string, updates: FoldersUpdate) {
  const { data, error } = await supabase
    .from("folders")
    .update(updates)
    .eq("id", folderId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to update folder");
  }

  return data;
}

/**
 * Delete a folder
 */
export async function deleteFolder(folderId: string) {
  const { data, error } = await supabase
    .from("folders")
    .delete()
    .eq("id", folderId);

  if (error) {
    throw new Error(error.message || "Failed to delete folder");
  }

  return data;
}

/**
 * Get folders for dropdown/select (returns simple data structure)
 */
export async function getFoldersForSelect(userId: string) {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message || "Failed to get folders");
  }

  return data || [];
}

// =============================================================================
// VAULTS TABLE
// =============================================================================

/**
 * Get vault by vault ID
 */
export async function getVault(
  userId: string,
  vaultId: string
): Promise<VaultsRow | null> {
  const { data, error } = await supabase
    .from("vaults")
    .select("*")
    .eq("user_id", userId)
    .eq("vault_id", vaultId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Failed to get vault");
  }

  return data;
}

/**
 * Upsert vault data
 */
export async function upsertVault(vaultData: VaultsInsert) {
  const { data, error } = await supabase
    .from("vaults")
    .upsert(vaultData, {
      onConflict: "vault_id",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to save vault");
  }

  return data;
}
