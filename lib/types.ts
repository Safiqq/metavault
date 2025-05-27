import { Database } from "@/database.types";

type Folders = Database["public"]["Tables"]["folders"];
type Logins = Database["public"]["Tables"]["logins"];
type SshKeys = Database["public"]["Tables"]["ssh_keys"];
type Emails = Database["public"]["Tables"]["emails"];
type Secrets = Database["public"]["Tables"]["secrets"];

export type FoldersRow = Folders["Row"];
export type LoginsRow = Logins["Row"];
export type SshKeysRow = SshKeys["Row"];
export type EmailsRow = Emails["Row"];
export type SecretsRow = Secrets["Row"];

export type FoldersInsert = Folders["Insert"];
export type LoginsInsert = Logins["Insert"];
export type SshKeysInsert = SshKeys["Insert"];
export type EmailsInsert = Emails["Insert"];
export type SecretsInsert = Secrets["Insert"];

export type FoldersUpdate = Folders["Update"];
export type LoginsUpdate = Logins["Update"];
export type SshKeysUpdate = SshKeys["Update"];
export type EmailsUpdate = Emails["Update"];
export type SecretsUpdate = Secrets["Update"];

type CredentialRow =
  | (LoginsRow & { item_type: "login"; folder_name: string })
  | (SshKeysRow & { item_type: "ssh_key"; folder_name: string });

export interface DecryptedLoginItem extends LoginsInsert {
  item_name: string;
  username: string;
  password: string;
  website?: string;
}

export interface DecryptedSSHKeyItem extends SshKeysInsert {
  item_name: string;
  public_key: string;
  private_key: string;
}

export interface CredentialItem {
  folder_id: string;
  folder_name: string;
  item_name: string;

  username: string;
  password: string;
  website: string;

  fingerprint: string;
  public_key: string;
  private_key: string;
}

export enum APP_STATES {
  NOT_LOGGED_IN = 0,
  LOGGED_IN = 1,
  CREATE_ACCOUNT_WAIT_FOR_OTP = 2,
  CREATE_ACCOUNT_OTP_VERIFIED = 3,
  CREATE_ACCOUNT_PASSKEY_VERIFIED = 4,
  CREATE_ACCOUNT_SEED_PHRASE_GENERATED = 5,
  CREATE_ACCOUNT_SEED_PHRASE_VERIFIED = 6,
  CREATE_ACCOUNT_SUCCEED = 7,
  LOGGED_IN_NEED_SESSION_RENEWAL = 8,
  LOGGED_IN_NEED_SEED_PHRASE_VERIFICATION = 9,
}

interface GeneratorRow {
  text: string;
  createdAt: string;
}

export interface StoreStates {
  currentState: APP_STATES;

  email: string;
  emailVerified: boolean;
  name: string;
  mnemonic: string[];
  mnemonicVerified: boolean;
  passkeyVerified: boolean;

  generatorData: GeneratorRow[];
  vaultData: CredentialRow[];

  lastMnemonicVerification: string;
  lastSessionRenewal: string;

  askMnemonicEvery: number; // in days
  sessionTimeout: number; // in seconds
  sessionTimeoutAction: "Lock" | "Log out";
}
