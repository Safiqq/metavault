// DispatcherScreen: Redirects user to the correct route based on app state.

import { ROUTES } from "@/constants/AppConstants";
import { useAppState } from "@/contexts/AppStateProvider";
import { APP_STATES } from "@/lib/types";
import { Href, router } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { View } from "react-native";

// Route mapping for better maintainability
const ROUTE_MAP: Record<APP_STATES, string> = {
  [APP_STATES.CREATE_ACCOUNT_WAIT_FOR_OTP]: ROUTES.GUEST.CREATE_ACCOUNT.OTP,
  [APP_STATES.CREATE_ACCOUNT_OTP_VERIFIED]: ROUTES.GUEST.CREATE_ACCOUNT.PASSKEY,
  [APP_STATES.CREATE_ACCOUNT_PASSKEY_VERIFIED]: ROUTES.GUEST.CREATE_ACCOUNT.SECURE_VAULT,
  [APP_STATES.CREATE_ACCOUNT_SEED_PHRASE_GENERATED]: ROUTES.GUEST.CREATE_ACCOUNT.SEED_PHRASE.VERIFY,
  [APP_STATES.CREATE_ACCOUNT_SEED_PHRASE_VERIFIED]: ROUTES.GUEST.CREATE_ACCOUNT.CONGRATS,
  [APP_STATES.LOGGED_IN]: ROUTES.USER.MY_VAULT.INDEX,
  [APP_STATES.LOGGED_IN_NEED_SESSION_RENEWAL]: ROUTES.USER.LOCKED,
  [APP_STATES.LOGGED_IN_NEED_SEED_PHRASE_VERIFICATION]: ROUTES.USER.SETTINGS,
  [APP_STATES.NOT_LOGGED_IN]: ROUTES.GUEST.LANDING,
  [APP_STATES.CREATE_ACCOUNT_SUCCEED]: ROUTES.USER.MY_VAULT.INDEX, // Assuming this should go to myvault
} as const;

export default function DispatcherScreen(): React.JSX.Element {
  const { state, isLoading } = useAppState();

  const navigateToRoute = useCallback((targetRoute: string) => {
    try {
      router.replace(targetRoute as Href);
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback to landing page if navigation fails
      router.replace(ROUTES.GUEST.LANDING);
    }
  }, []);

  // When app state changes, navigate to the appropriate route
  useEffect(() => {
    if (isLoading) {
      return;
    }

    const targetRoute = ROUTE_MAP[state.currentState] || ROUTES.GUEST.LANDING;
    navigateToRoute(targetRoute);
  }, [isLoading, state.currentState, navigateToRoute]);

  return <View style={{ flex: 1, backgroundColor: "white" }} />;
}
