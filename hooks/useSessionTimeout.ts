import { useEffect, useState } from "react";
import { defaultState, useAppState } from "@/contexts/AppStateProvider";
import { APP_STATES, StoreStates } from "@/lib/types";
import { router } from "expo-router";
import { ROUTES } from "@/constants/AppConstants";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthProvider";
import { clearState } from "@/lib/appState";
import { Platform } from "react-native";
import { webStorage } from "@/lib/largeSecureStore";
import * as Device from "expo-device";

/**
 * Hook to manage session timeout based on user inactivity.
 * @param onTimeout - A function to call when the session times out.
 * It receives the action to perform ("Lock" or "Log out").
 */
export const useSessionTimeout = () => {
  const { user } = useAuth();
  const { state, setState } = useAppState();

  const [deviceId, setDeviceId] = useState<string | null>(
    Platform.OS === "web" ? webStorage.getItem("device_id") : Device.osBuildId
  );
  const { sessionTimeout, sessionTimeoutAction, lastSessionRenewal } = state;

  useEffect(() => {
    const interval = setInterval(async () => {
      const now = Date.now();
      const lastActivity = new Date(lastSessionRenewal || now).getTime();
      const elapsedSeconds = (now - lastActivity) / 1000;

      if (elapsedSeconds >= sessionTimeout) {
        if (sessionTimeoutAction === "Lock") {
          setState({
            ...state,
            currentState: APP_STATES.LOGGED_IN_NEED_SESSION_RENEWAL,
          });
          router.replace(ROUTES.USER.LOCKED);
        } else {
          await supabase
            .from("sessions")
            .update({
              revoked_at: new Date().toISOString(),
            })
            .match({ user_id: user?.id, device_id: deviceId });

          await supabase.auth.signOut();
          await clearState();
          setState(defaultState); // Reset context state to defaults
          router.replace(ROUTES.ROOT);
        }
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastSessionRenewal, sessionTimeout, sessionTimeoutAction]);

  const renewSession = () => {
    setState((prevState: StoreStates) => ({
      ...prevState,
      lastSessionRenewal: new Date().toISOString(),
    }));
  };

  return { renewSession };
};
