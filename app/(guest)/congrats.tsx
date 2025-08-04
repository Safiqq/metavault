import { useNavigationState } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MedalStarIcon } from "@/assets/images/icons";
import { ProgressStepsHeader } from "@/components/ui/ProgressStepsHeader";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { ROUTES } from "@/constants/AppConstants";
import { useAppState } from "@/contexts/AppStateProvider";
import { useAuth } from "@/contexts/AuthProvider";

import type { NavigationState } from "@react-navigation/native";
import { AUTH_L_STATES, AUTH_STATES } from "@/lib/types";
import { upsertSession } from "@/lib/supabase/database";
import { webStorage } from "@/lib/largeSecureStore";
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
import * as Network from "expo-network";

/**
 * Congratulations screen component for Seed Phrase flow completion
 */
export default function CongratsScreen(): React.JSX.Element {
  const safeAreaInsets = useSafeAreaInsets();

  const { state, setState } = useAppState();
  const { user } = useAuth();

  const [deviceInfo, setDeviceInfo] = useState({
    userAgent: "",
    ipAddress: "",
    deviceId:
      Platform.OS === "web"
        ? webStorage.getItem("device_id")
        : Device.osBuildId,
  });

  const getDeviceData = useCallback(async () => {
    const userAgent = (await Constants.getWebViewUserAgentAsync()) ?? "";
    const ipAddress = await Network.getIpAddressAsync();
    return { userAgent, ipAddress };
  }, []);

  useEffect(() => {
    const initializeDeviceInfo = async () => {
      if (!deviceInfo.deviceId) {
        const newDeviceId = Crypto.randomUUID();
        if (Platform.OS === "web") {
          webStorage.setItem("device_id", newDeviceId);
        }
        setDeviceInfo((prev) => ({ ...prev, deviceId: newDeviceId }));
      }
      const deviceData = await getDeviceData();
      setDeviceInfo((prev) => ({ ...prev, ...deviceData }));
    };
    initializeDeviceInfo();
  }, [getDeviceData, deviceInfo.deviceId]);

  const navigationState = useNavigationState(
    (navState: NavigationState | undefined) => navState
  );

  const isFromRecoverVault = useMemo(() => {
    const navigationRoutes = navigationState?.routes ?? [];
    return navigationRoutes.some((route) =>
      route.name.includes("recovervault")
    );
  }, [navigationState?.routes]);

  const handleDonePress = useCallback(async () => {
    setState({
      ...state,
      authState: AUTH_STATES.LOGGED_IN,
      currentState: AUTH_L_STATES.IDLE,
    });
    // Upsert session after successful vault initialization
    await upsertSession({
      user_id: user?.id || "",
      device_id: deviceInfo.deviceId || "",
      device_name: `${Device.osName} ${Device.osVersion}`,
      ip_address: deviceInfo.ipAddress,
      user_agent: deviceInfo.userAgent,
      last_active_at: new Date().toISOString(),
    });

    router.push(ROUTES.USER.MY_VAULT.INDEX);
  }, [state, setState, user, deviceInfo]);

  return (
    <View
      style={{
        paddingTop: safeAreaInsets.top,
        paddingBottom: safeAreaInsets.bottom,
      }}
      className={`flex-1 w-full bg-white ${
        Platform.OS === "web" ? "max-w-2xl mx-auto" : ""
      }`}
    >
      {isFromRecoverVault ? (
        <Header titleText="MetaVault" />
      ) : (
        <ProgressStepsHeader currentStep={3} />
      )}
      <ScrollView
        className="flex-1 px-12"
        showsVerticalScrollIndicator={false}
      >
        <View
          className={`mb-10 items-center ${
            isFromRecoverVault ? "mt-10" : "mt-3"
          }`}
        >
          <ThemedText
            fontWeight={700}
            fontSize={24}
            className="text-center text-black"
          >
            Congratulations!
          </ThemedText>
          <Spacer size={16} />

          <MedalStarIcon
            width={160}
            height={160}
          />

          <Spacer size={16} />

          {isFromRecoverVault ? (
            <ThemedText
              className="text-center text-gray-700 px-4"
              fontSize={16}
            >
              Remember, if you lose your Seed Phrase, you lose access to your
              vault.
            </ThemedText>
          ) : (
            <View className="px-4">
              <ThemedText
                className="text-center text-gray-700"
                fontSize={16}
              >
                Your vault is protected and ready to use. You can find your Seed
                Phrase in{" "}
                <ThemedText fontWeight={700} className="text-black">
                  Settings → Security & Privacy.
                </ThemedText>
              </ThemedText>

              <Spacer size={16} />

              <ThemedText
                className="text-center text-gray-600"
                fontSize={14}
              >
                Keep a reminder of your Seed Phrase somewhere safe. If you lose
                it, no one can help you get it back. Even worse, you won&apos;t
                be able to access your wallet ever again.{" "}
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="px-12 pb-8">
        <Button
          text="Done"
          type="primary"
          onPress={handleDonePress}
          fontWeight={700}
        />
      </View>
    </View>
  );
}
