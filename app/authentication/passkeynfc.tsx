import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  View,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { ProgressSteps } from "@/components/ProgressSteps";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { largeSecureStore, supabase } from "@/lib/supabase";
import * as Crypto from "expo-crypto";
import React from "react";
import { useAlert } from "@/contexts/AlertContext";

import NfcManager, { NfcTech, Ndef } from "react-native-nfc-manager";

// Initialize NFC Manager
if (Platform.OS === "android" || Platform.OS === "ios") {
  NfcManager.start();
}

// WebAuthn/FIDO2 compatible credential creation options
interface PasskeyCredentialCreationOptions {
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  challenge: string;
  pubKeyCredParams: Array<{
    type: "public-key";
    alg: number;
  }>;
  timeout: number;
  authenticatorSelection: {
    authenticatorAttachment?: "cross-platform" | "platform";
    userVerification: "required" | "preferred" | "discouraged";
    requireResidentKey: boolean;
  };
  attestation: "none" | "indirect" | "direct";
}

interface PasskeyCredential {
  id: string;
  rawId: string;
  type: "public-key";
  response: {
    attestationObject: string;
    clientDataJSON: string;
  };
}

export default function PasskeyNFCScreen() {
  const { availableAuthMethods, email, name } = useLocalSearchParams();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [passkeyCredential, setPasskeyCredential] = useState<PasskeyCredential | null>(null);
  const router = useRouter();
  const { alert } = useAlert();

  useEffect(() => {
    checkNFCSupport();
    return () => {
      // Cleanup NFC when component unmounts
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  const checkNFCSupport = async () => {
    try {
      const supported = await NfcManager.isSupported();
      setNfcSupported(supported);
      
      if (!supported) {
        alert(
          "NFC Not Supported",
          "This device doesn't support NFC. You can still use platform authenticators like Face ID, Touch ID, or Windows Hello."
        );
      }
    } catch (error) {
      console.warn("Error checking NFC support:", error);
      setNfcSupported(false);
    }
  };

  const generateChallenge = async (): Promise<string> => {
    // Generate a cryptographically secure random challenge
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const createPasskeyCredentialOptions = async (): Promise<PasskeyCredentialCreationOptions> => {
    const challenge = await generateChallenge();
    const userId = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      email as string
    );

    return {
      rp: {
        name: "MetaVault",
        id: "metavault.app", // Your domain
      },
      user: {
        id: userId,
        name: email as string,
        displayName: name as string || email as string,
      },
      challenge,
      pubKeyCredParams: [
        { type: "public-key", alg: -7 }, // ES256
        { type: "public-key", alg: -257 }, // RS256
      ],
      timeout: 60000,
      authenticatorSelection: {
        authenticatorAttachment: "cross-platform", // For external devices like YubiKey
        userVerification: "preferred",
        requireResidentKey: true,
      },
      attestation: "direct",
    };
  };

  const scanNFCPasskey = async () => {
    if (!nfcSupported) {
      alert("NFC Not Available", "NFC is not supported on this device.");
      return;
    }

    try {
      setIsScanning(true);
      
      // Request NFC technology
      await NfcManager.requestTechnology([NfcTech.IsoDep, NfcTech.NfcA]);
      
      alert(
        "Ready to Scan",
        "Hold your YubiKey or compatible NFC security key near your device.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              NfcManager.cancelTechnologyRequest();
              setIsScanning(false);
            }
          }
        ]
      );

      // Wait for NFC tag detection
      const tag = await NfcManager.getTag();
      
      if (tag) {
        console.log("NFC Security Key detected:", tag);
        
        // Now initiate WebAuthn/FIDO2 credential creation
        await createPasskeyWithNFC(tag);
      }
      
    } catch (error) {
      console.warn("NFC Scan Error:", error);
      alert(
        "Scan Failed", 
        "Failed to scan NFC security key. Make sure your key supports FIDO2/WebAuthn and try again."
      );
    } finally {
      setIsScanning(false);
      NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  };

  const createPasskeyWithNFC = async (nfcTag: any) => {
    try {
      setIsSettingUp(true);
      
      const credentialOptions = await createPasskeyCredentialOptions();
      
      // In a real implementation, you would:
      // 1. Send FIDO2 commands via NFC to the security key
      // 2. Handle the authentication ceremony
      // 3. Process the attestation response
      
      // For this example, we'll simulate the credential creation
      const mockCredential: PasskeyCredential = {
        id: await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `${nfcTag.id}-${Date.now()}`
        ),
        rawId: nfcTag.id || "mock-raw-id",
        type: "public-key",
        response: {
          attestationObject: "mock-attestation-object",
          clientDataJSON: JSON.stringify({
            type: "webauthn.create",
            challenge: credentialOptions.challenge,
            origin: "https://metavault.app",
          }),
        },
      };

      setPasskeyCredential(mockCredential);
      
      // Save passkey configuration
      await savePasskeyPreference(true, mockCredential, nfcTag);
      await registerPasskeyDevice(mockCredential, email as string, nfcTag);

      alert(
        "Success",
        "Passkey authentication with NFC security key has been set up successfully!",
        [
          {
            text: "OK",
            style: "default",
            onPress: () => router.push("/securevault"),
          },
        ]
      );
      
    } catch (error) {
      console.error("Passkey creation error:", error);
      alert("Error", "Failed to create passkey. Please try again.");
    } finally {
      setIsSettingUp(false);
    }
  };

  const createPlatformPasskey = async () => {
    try {
      setIsSettingUp(true);
      
      const credentialOptions = await createPasskeyCredentialOptions();
      
      // For platform authenticators (Face ID, Touch ID, Windows Hello)
      credentialOptions.authenticatorSelection.authenticatorAttachment = "platform";
      
      // In a real React Native app, you'd use a WebAuthn library like:
      // - @react-native-async-storage/async-storage for credential storage
      // - react-native-biometrics for biometric authentication
      // - A WebAuthn bridge to native iOS/Android WebAuthn APIs
      
      const mockCredential: PasskeyCredential = {
        id: await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `platform-${Platform.OS}-${Date.now()}`
        ),
        rawId: `platform-${Platform.OS}`,
        type: "public-key",
        response: {
          attestationObject: "mock-platform-attestation",
          clientDataJSON: JSON.stringify({
            type: "webauthn.create",
            challenge: credentialOptions.challenge,
            origin: "https://metavault.app",
          }),
        },
      };

      setPasskeyCredential(mockCredential);
      
      await savePasskeyPreference(true, mockCredential);
      await registerPasskeyDevice(mockCredential, email as string);

      alert(
        "Success",
        "Platform passkey has been created successfully!",
        [
          {
            text: "OK",
            style: "default",
            onPress: () => router.push("/securevault"),
          },
        ]
      );
      
    } catch (error) {
      console.error("Platform passkey creation error:", error);
      alert("Error", "Failed to create platform passkey. Please try again.");
    } finally {
      setIsSettingUp(false);
    }
  };

  const savePasskeyPreference = async (
    enabled: boolean,
    credential: PasskeyCredential,
    nfcTag?: any
  ) => {
    try {
      await largeSecureStore.setItem(
        "passkeyAuthEnabled",
        JSON.stringify({
          enabled,
          credentialId: credential.id,
          credentialType: nfcTag ? "nfc-security-key" : "platform",
          nfcTagId: nfcTag?.id,
          timestamp: Date.now(),
          platform: Platform.OS,
          email: email,
          userHandle: credential.response.clientDataJSON,
        })
      );
    } catch (error) {
      throw error;
    }
  };

  const registerPasskeyDevice = async (
    credential: PasskeyCredential,
    userEmail: string,
    nfcTag?: any
  ) => {
    try {
      const { data, error } = await supabase
        .from("passkey_devices")
        .insert({
          email: userEmail,
          credential_id: credential.id,
          credential_type: nfcTag ? "nfc-security-key" : "platform",
          platform: Platform.OS,
          nfc_tag_id: nfcTag?.id,
          public_key_credential: JSON.stringify(credential),
          created_at: new Date().toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to register passkey device: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 w-full px-12 ${Platform.OS === "web" && "max-w-2xl mx-auto"}`}
    >
      <ScrollView className="flex-1 px-12">
        <ProgressSteps currentStep={2} />
        <View className="mt-10">
          <Image
            className="max-w-15 max-h-15"
            source={require("@/assets/images/scan.png")}
          />

          <Spacer size={16} />

          <ThemedText fontWeight={700} fontSize={24}>
            Set up Passkey Authentication
          </ThemedText>

          <Spacer size={16} />

          <ThemedText>
            Use a security key like YubiKey with NFC, or your device's built-in 
            biometric authentication for secure, passwordless login to MetaVault.
          </ThemedText>

          <Spacer size={16} />

          {passkeyCredential && (
            <View className="bg-green-100 p-4 rounded-lg">
              <ThemedText fontSize={14} className="text-green-800">
                ✓ Passkey Created: {passkeyCredential.id.substring(0, 16)}...
              </ThemedText>
            </View>
          )}

          {isScanning && (
            <View className="flex-row items-center justify-center bg-blue-100 p-4 rounded-lg">
              <ActivityIndicator size="small" color="#0066CC" />
              <Spacer size={8} />
              <ThemedText fontSize={14} className="text-blue-800">
                Hold your security key near the device...
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="mb-8 px-12 space-y-3">
        {nfcSupported && (
          <Pressable
            className={`w-full py-3 rounded-xl ${
              isSettingUp || isScanning ? "bg-[#BBBBBB]" : "bg-blue-600"
            }`}
            onPress={scanNFCPasskey}
            disabled={isSettingUp || isScanning}
          >
            <ThemedText fontWeight={700} className="text-white text-center">
              {isScanning ? "Scanning..." : "🔑 Use NFC Security Key"}
            </ThemedText>
          </Pressable>
        )}

        <Pressable
          className={`w-full py-3 rounded-xl ${
            isSettingUp ? "bg-[#BBBBBB]" : "bg-black"
          }`}
          onPress={createPlatformPasskey}
          disabled={isSettingUp}
        >
          <ThemedText fontWeight={700} className="text-white text-center">
            {isSettingUp ? "Creating Passkey..." : "📱 Use Device Biometrics"}
          </ThemedText>
        </Pressable>

        <Link href="/securevault" asChild>
          <Pressable className="w-full py-3">
            <ThemedText className="text-gray-600 text-center">
              Skip for now
            </ThemedText>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}