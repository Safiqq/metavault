import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import * as passkey from "react-native-passkeys";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LockIcon } from "@/assets/images/icons";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/AppConstants";
import { useAlert } from "@/contexts/AlertProvider";
import { useAppState } from "@/contexts/AppStateProvider";
import { useAuth } from "@/contexts/AuthProvider";
import { webStorage } from "@/lib/largeSecureStore";
import { supabase } from "@/lib/supabase";
import { AUTH_STATES, AUTH_L_STATES, AUTH_NL_STATES } from "@/lib/types";
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
import * as Network from "expo-network";
import {
  PublicKeyCredentialRequestOptionsJSON,
  AuthenticationResponseJSON,
} from "react-native-passkeys/src/ReactNativePasskeys.types";
import {
  getWebAuthnAuthenticateOptions,
  verifyWebAuthnAuthentication,
} from "@/lib/supabase/functions";

// LockedScreen: Handles unlocking the vault using passkey authentication and session renewal.
export default function LockedScreen() {
  const insets = useSafeAreaInsets();

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [userAgent, setUserAgent] = useState<string>("");
  const [ipAddress, setIpAddress] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string | null>(
    Platform.OS === "web" ? webStorage.getItem("device_id") : Device.osBuildId
  );

  const { state, setState } = useAppState();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  // On mount, fetch device/user info for authentication context
  useEffect(() => {
    const getData = async () => {
      setUserAgent((await Constants.getWebViewUserAgentAsync()) ?? "");
      setIpAddress(await Network.getIpAddressAsync());
    };

    if (!deviceId) {
      webStorage.setItem("device_id", Crypto.randomUUID());
      setDeviceId(webStorage.getItem("device_id"));
    }

    getData();
  }, [deviceId, showAlert]);

  // Handles passkey authentication and session renewal
  const handleUnlock = async () => {
    setIsProcessing(true);
    try {
      if (!userAgent || !ipAddress) {
        throw new Error("Unknown error.");
      }

      const passkeyRequest: PublicKeyCredentialRequestOptionsJSON =
        await getWebAuthnAuthenticateOptions();
      // [3] Use the server's challenge to prompt the user for their passkey.
      const result: AuthenticationResponseJSON | null = await passkey.get(
        passkeyRequest
      );

      if (!result) {
        throw new Error("Passkey authentication failed.");
      }

      // [4] Invoke the 'verify' function to have the server verify the result.
      const verification = await verifyWebAuthnAuthentication(result);

      // [5] If the server successfully verified the passkey, proceed.
      if (verification.status) {
        const now = Date.now();
        const lastVerification = new Date(
          state.lastMnemonicVerification
        ).getTime();
        const elapsedDays = (now - lastVerification) / (1000 * 60 * 60 * 24);

        setState({
          ...state,
          currentState:
            elapsedDays >= state.askMnemonicEvery
              ? AUTH_L_STATES.NEED_SEED_PHRASE_VERIFICATION
              : AUTH_L_STATES.IDLE,
          lastSessionRenewal: new Date().toISOString(),
        });

        await supabase.from("sessions").upsert({
          user_id: user?.id,
          device_id: deviceId,
          device_name: `${Device.osName} ${Device.osVersion}`,
          ip_address: ipAddress,
          user_agent: userAgent,
          last_active_at: new Date().toISOString(),
        });
        router.push(ROUTES.USER.MY_VAULT.INDEX);
      } else {
        throw new Error("Server could not verify the authentication.");
      }
    } catch (error: any) {
      showAlert(
        "Authentication Failed",
        error.message || "An unknown error occurred. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const logOut = async () => {
      await supabase.auth.signOut();
      router.push(ROUTES.ROOT);
    };

    if (
      state.authState === AUTH_STATES.NOT_LOGGED_IN &&
      state.currentState === AUTH_NL_STATES.NEED_CLEAR_STATE_AS_SIGNED_OUT
    ) {
      logOut();
    }
  }, [state.authState, state.currentState]);

  // Handles user logout and session revocation
  const handleLogOut = () => {
    showAlert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          setState({
            ...state,
            authState: AUTH_STATES.NOT_LOGGED_IN,
            currentState: AUTH_NL_STATES.NEED_CLEAR_STATE_AS_SIGNED_OUT,
          });
          await supabase
            .from("sessions")
            .update({
              revoked_at: new Date().toISOString(),
            })
            .match({ user_id: user?.id, device_id: deviceId });
        },
      },
    ]);
  };

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={`flex-1 w-full ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <View className="flex-1 px-12">
        <Spacer size={128} />
        <LockIcon width={60} height={60} />
        <Spacer size={16} />
        <ThemedText fontWeight={700} fontSize={28}>
          Your vault is locked
        </ThemedText>
        <Spacer size={16} />
        <ThemedText>{state.email}</ThemedText>
        <Spacer size={128} />
      </View>
      <View className="px-12 pb-8">
        <Button
          text={isProcessing ? "Preparing..." : "Unlock"}
          type="primary"
          onPress={handleUnlock}
          disabled={isProcessing}
          fontWeight={700}
        />
        <Spacer size={8} />
        <Button type="secondary" text="Log out" onPress={handleLogOut} />
      </View>
    </View>
  );
}
