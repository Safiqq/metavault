import { StoreStates } from "@/lib/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LargeSecureStore } from "./largeSecureStore";

const appStateStore = new LargeSecureStore();

const SENSITIVE_STATE_KEY = "SENSITIVE_APP_STATE";
const NON_SENSITIVE_STATE_KEY = "NON_SENSITIVE_APP_STATE";

/**
 * Saves the application state to the appropriate device storage.
 * @param state The complete application state.
 */
export const saveState = async (state: Partial<StoreStates>): Promise<void> => {
  try {
    const sensitiveState: Partial<StoreStates> = {
      authState: state.authState,
      currentState: state.currentState,

      email: state.email,
      mnemonic: state.mnemonic,

      generatorData: state.generatorData,
    };

    const nonSensitiveState: Partial<StoreStates> = {
      lastMnemonicVerification: state.lastMnemonicVerification,
      lastSessionRenewal: state.lastSessionRenewal,

      askMnemonicEvery: state.askMnemonicEvery,
      sessionTimeout: state.sessionTimeout,
      sessionTimeoutAction: state.sessionTimeoutAction,
    };

    const sensitiveStateString = JSON.stringify(sensitiveState);
    await appStateStore.setItem(SENSITIVE_STATE_KEY, sensitiveStateString);

    const nonSensitiveStateString = JSON.stringify(nonSensitiveState);
    await AsyncStorage.setItem(
      NON_SENSITIVE_STATE_KEY,
      nonSensitiveStateString
    );
  } catch (error) {}
};

/**
 * Loads the application state from device storage.
 * @returns The merged application state, or null if no state is found.
 */
export const loadState = async (): Promise<Partial<StoreStates> | null> => {
  try {
    const [sensitiveStateString, nonSensitiveStateString] = await Promise.all([
      appStateStore.getItem(SENSITIVE_STATE_KEY),
      AsyncStorage.getItem(NON_SENSITIVE_STATE_KEY),
    ]);

    // If there's no state at all, return null
    if (!sensitiveStateString && !nonSensitiveStateString) {
      return null;
    }

    const sensitiveState = sensitiveStateString
      ? JSON.parse(sensitiveStateString)
      : {};
    const nonSensitiveState = nonSensitiveStateString
      ? JSON.parse(nonSensitiveStateString)
      : {};

    return { ...sensitiveState, ...nonSensitiveState };
  } catch (error) {
    return null;
  }
};

/**
 * Clears all persisted application state.
 */
export const clearState = async (): Promise<void> => {
  try {
    await Promise.all([
      appStateStore.removeItem(SENSITIVE_STATE_KEY),
      AsyncStorage.removeItem(NON_SENSITIVE_STATE_KEY),
    ]);
  } catch (error) {}
};
