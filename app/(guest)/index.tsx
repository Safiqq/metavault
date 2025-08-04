import { FullScreenLoadingOverlay } from "@/components/ui/FullScreenLoadingOverlay";
import { ROUTES } from "@/constants/AppConstants";
import { useAppState } from "@/contexts/AppStateProvider";
import { AUTH_L_STATES, AUTH_NL_STATES } from "@/lib/types";
import { Href, router } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";

const ROUTE_MAP: Record<AUTH_L_STATES | AUTH_NL_STATES, string> = {
  [AUTH_NL_STATES.IDLE]: ROUTES.GUEST.LANDING,
  [AUTH_NL_STATES.WAIT_FOR_OTP]: ROUTES.GUEST.CREATE_ACCOUNT.OTP,
  [AUTH_NL_STATES.OTP_VERIFIED]: ROUTES.GUEST.CREATE_ACCOUNT.PASSKEY,
  [AUTH_NL_STATES.PASSKEY_VERIFIED]: ROUTES.GUEST.CREATE_ACCOUNT.SECURE_VAULT,
  [AUTH_NL_STATES.SEED_PHRASE_GENERATED]:
    ROUTES.GUEST.CREATE_ACCOUNT.SEED_PHRASE.VERIFY,
  [AUTH_NL_STATES.SEED_PHRASE_VERIFIED]: ROUTES.GUEST.CONGRATS,
  [AUTH_NL_STATES.NEED_CLEAR_STATE_AS_SIGNED_OUT]: ROUTES.GUEST.LANDING,
  [AUTH_L_STATES.IDLE]: ROUTES.USER.MY_VAULT.INDEX,
  [AUTH_L_STATES.NEED_SESSION_RENEWAL]: ROUTES.USER.LOCKED,
  [AUTH_L_STATES.NEED_SEED_PHRASE_VERIFICATION]: ROUTES.USER.SETTINGS,
} as const;

export default function DispatcherScreen(): React.JSX.Element {
  const { state, isLoading } = useAppState();

  useEffect(() => {
      if (isLoading) return;

      const targetRoute = ROUTE_MAP[state.currentState] || ROUTES.GUEST.LANDING;
      router.replace(targetRoute as Href);
    }, [isLoading, state.currentState]);

  return <View style={{ flex: 1, backgroundColor: "white" }}>
    <FullScreenLoadingOverlay visible/>
  </View>;
}
