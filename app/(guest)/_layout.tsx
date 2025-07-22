// GuestLayout: Handles guest navigation and redirects based on app state.
import { ROUTES } from "@/constants/AppConstants";
import { useAppState } from "@/contexts/AppStateProvider";
import { APP_STATES } from "@/lib/types";
import { Href, router, Stack, usePathname } from "expo-router";
import React, { useEffect } from "react";

export default function GuestLayout() {
  const { state, isLoading } = useAppState();
  const currentPath = usePathname();

  // Redirects guest to the correct path if app state changes
  useEffect(() => {
    let targetPath: string | null = null;

    if (currentPath === "/") {
      targetPath = "/";
    } else {
      switch (state.currentState) {
        case APP_STATES.NOT_LOGGED_IN:
          if (
            currentPath !== ROUTES.GUEST.RECOVER_VAULT &&
            currentPath !== ROUTES.GUEST.CREATE_ACCOUNT.INDEX &&
            currentPath !== ROUTES.GUEST.CREATE_ACCOUNT.GET_STARTED
          ) {
            targetPath = ROUTES.GUEST.LANDING;
          }
          break;
        case APP_STATES.CREATE_ACCOUNT_WAIT_FOR_OTP:
          targetPath = ROUTES.GUEST.CREATE_ACCOUNT.OTP;
          break;
        case APP_STATES.CREATE_ACCOUNT_OTP_VERIFIED:
          targetPath = ROUTES.GUEST.CREATE_ACCOUNT.PASSKEY;
          break;
        case APP_STATES.CREATE_ACCOUNT_PASSKEY_VERIFIED:
          if (currentPath !== ROUTES.GUEST.CREATE_ACCOUNT.SEED_PHRASE.INDEX) {
            targetPath = ROUTES.GUEST.CREATE_ACCOUNT.SECURE_VAULT;
          }
          break;
        case APP_STATES.CREATE_ACCOUNT_SEED_PHRASE_GENERATED:
          targetPath = ROUTES.GUEST.CREATE_ACCOUNT.SEED_PHRASE.VERIFY;
          break;
        case APP_STATES.CREATE_ACCOUNT_SEED_PHRASE_VERIFIED:
          targetPath = ROUTES.GUEST.CREATE_ACCOUNT.CONGRATS;
          break;
        case APP_STATES.LOGGED_IN:
          targetPath = ROUTES.USER.MY_VAULT.INDEX;
          break;
        case APP_STATES.LOGGED_IN_NEED_SESSION_RENEWAL:
          targetPath = ROUTES.USER.LOCKED;
          break;
        case APP_STATES.LOGGED_IN_NEED_SEED_PHRASE_VERIFICATION:
          targetPath = ROUTES.USER.SETTINGS;
          break;
      }
    }

    if (targetPath && targetPath !== currentPath) {
      router.replace(targetPath as Href);
      router.dismissAll();
    }
  }, [isLoading, state.currentState, currentPath]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
      }}
    />
  );
}
