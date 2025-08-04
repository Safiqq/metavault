// TabLayout: Main tab navigation for authenticated users. Handles session timeout and mnemonic verification.
import {
  ProgrammingArrowsIcon,
  SettingIcon,
  StrongboxIcon,
} from "@/assets/images/icons";
import { useMnemonicCheck } from "@/hooks/useMnemonicCheck";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";

export default function TabLayout() {
  // Setup session timeout and mnemonic check hooks
  const { renewSession } = useSessionTimeout();
  useMnemonicCheck();

  return (
    <View
      className={`flex-1 w-full ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
      onStartShouldSetResponder={() => {
        renewSession();
        return false;
      }}
    >
      <Tabs
        screenOptions={{
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: "PlusJakartaSans_600SemiBold",
          },
          tabBarActiveTintColor: "#000000",
          tabBarInactiveTintColor: "#BBBBBB",

          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="myvault"
          options={{
            title: "My Vault",
            tabBarIcon: ({ size, color }) => (
              <StrongboxIcon width={size} height={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="generator"
          options={{
            title: "Generator",
            tabBarIcon: ({ size, color }) => (
              <ProgrammingArrowsIcon width={size} height={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ size, color }) => (
              <SettingIcon width={size} height={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
