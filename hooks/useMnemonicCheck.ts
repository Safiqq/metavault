import { ROUTES } from "@/constants/AppConstants";
import { useAppState } from "@/contexts/AppStateProvider";
import { APP_STATES } from "@/lib/types";
import { router } from "expo-router";
import { useEffect } from "react";

/**
 * Hook to check if the seed phrase needs verification.
 * @param onVerificationNeeded - A function to call when verification is required.
 */
export const useMnemonicCheck = () => {
  const { state, setState } = useAppState();
  const { lastMnemonicVerification, askMnemonicEvery } = state;

  useEffect(() => {
    const onVerificationNeeded = () => {
      setState({
        ...state,
        currentState: APP_STATES.LOGGED_IN_NEED_SEED_PHRASE_VERIFICATION,
      });
      router.replace(ROUTES.USER.SETTINGS);
    };

    if (!lastMnemonicVerification) {
      onVerificationNeeded();
      return;
    }

    const now = Date.now();
    const lastVerification = new Date(lastMnemonicVerification).getTime();
    const elapsedDays = (now - lastVerification) / (1000 * 60 * 60 * 24);

    if (elapsedDays >= askMnemonicEvery) {
      onVerificationNeeded();
    }
  }, [lastMnemonicVerification, askMnemonicEvery]);
};
