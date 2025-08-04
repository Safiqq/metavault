import { ROUTES } from "@/constants/AppConstants";
import { useAppState } from "@/contexts/AppStateProvider";
import { useAuth } from "@/contexts/AuthProvider";
import { AUTH_L_STATES } from "@/lib/types";
import { router } from "expo-router";
import { useEffect } from "react";

/**
 * Hook to check if the seed phrase needs verification.
 * @param onVerificationNeeded - A function to call when verification is required.
 */
export const useMnemonicCheck = () => {
  const { user } = useAuth();
  const { state, setState } = useAppState();
  const { lastMnemonicVerification, askMnemonicEvery } = state;

  useEffect(() => {
    const onVerificationNeeded = () => {
      if (user) {
        setState({
          ...state,
          currentState: AUTH_L_STATES.NEED_SEED_PHRASE_VERIFICATION,
        });
        router.push(ROUTES.USER.SETTINGS);
      } else {
        
      }
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
