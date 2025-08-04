import { Database } from "@/database.types";

type Folders = Database["public"]["Tables"]["folders"];
type Vaults = Database["public"]["Tables"]["vaults"];
type Passkeys = Database["public"]["Tables"]["passkeys"];
type Sessions = Database["public"]["Tables"]["sessions"];

export type FoldersRow = Folders["Row"];
export type VaultsRow = Vaults["Row"];
export type PasskeysRow = Passkeys["Row"];
export type SessionsRow = Sessions["Row"];

export type FoldersInsert = Folders["Insert"];
export type VaultsInsert = Vaults["Insert"];
export type SessionsInsert = Sessions["Insert"];

export type FoldersUpdate = Folders["Update"];

export enum AUTH_STATES {
  NOT_LOGGED_IN = 0,
  LOGGED_IN = 1,
}

export enum AUTH_NL_STATES {
  IDLE = 0,
  WAIT_FOR_OTP = 1,
  OTP_VERIFIED = 2,
  PASSKEY_VERIFIED = 3,
  SEED_PHRASE_GENERATED = 4,
  SEED_PHRASE_VERIFIED = 5,
  NEED_CLEAR_STATE_AS_SIGNED_OUT = 6,
}

export enum AUTH_L_STATES {
  IDLE = 7,
  NEED_SESSION_RENEWAL = 8,
  NEED_SEED_PHRASE_VERIFICATION = 9,
}

interface GeneratorRow {
  text: string;
  createdAt: string;
}

export interface VaultKeys {
  encryptionKey: Uint8Array;
  macKey: Uint8Array;
  vaultId: string;
}

export interface DecryptedVaultItem {
  id?: string;
  folder_id: string;
  folder_name: string;
  item_name: string;
  item_type: "login" | "ssh_key";

  // Login credentials (only for login type)
  username?: string;
  password?: string;

  // SSH key data (only for ssh_key type)
  fingerprint?: string;
  public_key?: string;
  private_key?: string;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface StoreStates {
  authState: AUTH_STATES;
  currentState: AUTH_NL_STATES | AUTH_L_STATES;

  email: string;
  mnemonic: string[];

  generatorData: GeneratorRow[];

  lastMnemonicVerification: string;
  lastSessionRenewal: string;

  askMnemonicEvery: number; // in days
  sessionTimeout: number; // in seconds
  sessionTimeoutAction: "Lock" | "Log out";
}
