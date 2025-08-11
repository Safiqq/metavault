import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import { recoverVault } from "@/lib/vaultRecovery";
import {
  setSession,
  getCurrentUser,
  getVault,
  upsertSession,
} from "@/lib/supabase/database";
import {
  getWebAuthnAuthenticateOptions,
  verifyWebAuthnAuthentication,
} from "@/lib/supabase/functions";
import { deriveVaultKeys } from "@/lib/bip39";
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
import * as Network from "expo-network";
import {
  PublicKeyCredentialRequestOptionsJSON,
  AuthenticationResponseJSON,
} from "react-native-passkeys/src/ReactNativePasskeys.types";
import { Header } from "@/components/ui/Header";

// LoginScreen: Handles unlocking the vault using passkey authentication and session renewal.
export default function LoginScreen() {
  const insets = useSafeAreaInsets();

  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [isDerivingKeys, setIsDerivingKeys] = useState<boolean>(false);
  const [keysDerivationComplete, setKeysDerivationComplete] =
    useState<boolean>(false);
  const [vaultExists, setVaultExists] = useState<boolean | null>(null);
  const [derivedKeys, setDerivedKeys] = useState<any>(null);
  const [passkeyRequest, setPasskeyRequest] =
    useState<PublicKeyCredentialRequestOptionsJSON | null>(null);
  const [deviceInfo, setDeviceInfo] = useState({
    userAgent: "",
    ipAddress: "",
    deviceId:
      Platform.OS === "web"
        ? webStorage.getItem("device_id")
        : Device.osBuildId,
  });

  const { state, resetState } = useAppState();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const getDeviceData = useCallback(async () => {
    const userAgent = (await Constants.getWebViewUserAgentAsync()) ?? "";
    const ipAddress = await Network.getIpAddressAsync();
    return { userAgent, ipAddress };
  }, []);

  const fetchVerificationOptions = useCallback(async () => {
    try {
      const data = await getWebAuthnAuthenticateOptions();
      setPasskeyRequest(data);
    } catch {
      fetchVerificationOptions();
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const deriveKeysAndCheckVault = async () => {
    // Validate mnemonic exists in app state
    if (!state.mnemonic || state.mnemonic.length === 0) {
      showAlert(
        "Authentication Error",
        "No seed phrase found. Please use 'Recover Vault' to restore your vault.",
        [
          {
            text: "OK",
            onPress: () => router.push(ROUTES.GUEST.LANDING),
          },
        ]
      );
      return;
    }

    if (!state.email) {
      showAlert(
        "Authentication Error",
        "No email found. Please try logging in again.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
      return;
    }

    setIsDerivingKeys(true);
    try {
      // Step 1: Recover vault to get session tokens
      const recoveryResult = await recoverVault(state.mnemonic);
      if (
        !recoveryResult.success ||
        !recoveryResult.access_token ||
        !recoveryResult.refresh_token
      ) {
        console.log(recoveryResult);
        throw new Error(
          recoveryResult.message || "Failed to recover vault session"
        );
      }

      // Step 2: Establish session with recovered tokens
      await setSession(
        recoveryResult.access_token,
        recoveryResult.refresh_token
      );

      // Step 3: Now derive vault keys with recovered email
      const keys = await deriveVaultKeys(state.mnemonic, recoveryResult.email!);
      setDerivedKeys(keys);

      // Step 4: Get current user from established session
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error("User authentication failed after session recovery");
      }

      const vault = await getVault(currentUser.id, keys.vaultId);
      setVaultExists(vault !== null);

      if (vault) {
        // Vault exists, now fetch passkey verification options
        await fetchVerificationOptions();
      } else {
        // No vault found - clear all stored states
        resetState();

        showAlert(
          "No Vault Found",
          "No vault was found for this account. Please use 'Create Account' to set up a new vault.",
          [
            {
              text: "OK",
              onPress: () => router.push(ROUTES.GUEST.CREATE_ACCOUNT.INDEX),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Error deriving keys or checking vault:", error);

      // Clear stored states on error
      resetState();

      showAlert("Error", "Failed to prepare login. Please try again.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } finally {
      setIsDerivingKeys(false);
      setKeysDerivationComplete(true);
    }
  };

  // On mount, fetch device/user info for authentication context
  useEffect(() => {
    const initializeAuth = async () => {
      if (!deviceInfo.deviceId) {
        const newDeviceId = Crypto.randomUUID();
        webStorage.setItem("device_id", newDeviceId);
        setDeviceInfo((prev) => ({ ...prev, deviceId: newDeviceId }));
      }

      const deviceData = await getDeviceData();
      setDeviceInfo((prev) => ({ ...prev, ...deviceData }));

      // Derive keys and check vault existence first
      await deriveKeysAndCheckVault();
    };

    initializeAuth();
  }, []);

  // Handles passkey authentication and session renewal
  const handleUnlock = useCallback(async () => {
    if (!passkeyRequest) {
      showAlert(
        "Error",
        "Passkey verification options not loaded. Please wait or try again."
      );
      return;
    }

    if (!derivedKeys) {
      showAlert(
        "Error",
        "Keys not derived. Please wait for preparation to complete or try again."
      );
      return;
    }

    if (vaultExists === false) {
      showAlert(
        "No Vault Found",
        "No vault was found for this account. Please use 'Create Account' to set up a new vault.",
        [
          {
            text: "OK",
            onPress: () => router.push(ROUTES.GUEST.CREATE_ACCOUNT.INDEX),
          },
        ]
      );
      return;
    }

    setIsProcessing(true);
    try {
      if (!deviceInfo.userAgent || !deviceInfo.ipAddress) {
        throw new Error("Unknown error.");
      }

      // [3] Use the server's challenge to prompt the user for their passkey.
      const result: AuthenticationResponseJSON | null = await passkey.get(
        passkeyRequest
      );

      if (!result) {
        throw new Error("Passkey authentication failed.");
      }

      // [4] Verify the authentication result with the server
      const verification = await verifyWebAuthnAuthentication(result);

      // [5] If the server successfully verified the passkey, proceed.
      if (verification.status) {
        // Show alert and wait for user confirmation before initializing vault
        return new Promise<void>(async (resolve) => {
          const result = await recoverVault(state.mnemonic);

          if (result.success && result.access_token && result.refresh_token) {
            // Set the session using the tokens from vault recovery
            await setSession(result.access_token, result.refresh_token);
            await upsertSession({
              user_id: user?.id || "",
              device_id: deviceInfo.deviceId || "",
              device_name: `${Device.osName} ${Device.osVersion}`,
              ip_address: deviceInfo.ipAddress,
              user_agent: deviceInfo.userAgent,
              last_active_at: new Date().toISOString(),
            });
            router.push(ROUTES.USER.MY_VAULT.INDEX);
          } else {
            showAlert("Login Failed", result.message);
          }

          resolve();
        });
      } else {
        throw new Error("Server could not verify the authentication.");
      }
    } catch (error: any) {
      // Handle cancellation or device-side errors silently
      if (
        error.message.toLowerCase().includes("cancelled") ||
        error.message.toLowerCase().includes("failed on the device")
      ) {
        return;
      }
    } finally {
      setIsProcessing(false);
    }
  }, [
    passkeyRequest,
    showAlert,
    state,
    user,
    deviceInfo,
    derivedKeys,
    vaultExists,
  ]);

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={`flex-1 w-full ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <Header
        titleText="MetaVault"
        leftButtonText="Back"
        leftButtonBackImage={true}
        leftButtonTarget={ROUTES.GUEST.LANDING}
      />
      <View className="flex-1 px-12">
        <Spacer size={128} />
        <LockIcon width={60} height={60} />
        <Spacer size={16} />
        <ThemedText fontWeight={700} fontSize={28}>
          Get back to your vault
        </ThemedText>
        <Spacer size={16} />
        <ThemedText>{state.email}</ThemedText>
        <Spacer size={32} />
        {isDerivingKeys && (
          <ThemedText className="text-gray-600">
            Deriving your encryption keys from your seed phrase...
          </ThemedText>
        )}
        {!keysDerivationComplete && !isDerivingKeys && (
          <ThemedText className="text-gray-600">
            Preparing your login...
          </ThemedText>
        )}
        {keysDerivationComplete && vaultExists === true && !isProcessing && (
          <ThemedText className="text-gray-600">
            Vault found! Ready to authenticate with your passkey.
          </ThemedText>
        )}
        {keysDerivationComplete && vaultExists === false && (
          <ThemedText className="text-red-600">
            No vault found for this account. You may need to create a new vault.
          </ThemedText>
        )}
        <Spacer size={96} />
      </View>
      <View className="px-12 pb-8">
        <Button
          text={
            isDerivingKeys
              ? "Deriving Keys..."
              : !keysDerivationComplete
              ? "Preparing..."
              : vaultExists === false
              ? "No Vault Found"
              : isProcessing
              ? "Authenticating..."
              : "Unlock with Passkey"
          }
          type="primary"
          onPress={handleUnlock}
          disabled={
            isDerivingKeys ||
            !keysDerivationComplete ||
            vaultExists === false ||
            isProcessing
          }
          fontWeight={700}
        />
      </View>
    </View>
  );
}
