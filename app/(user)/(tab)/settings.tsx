import { Platform, Pressable, ScrollView, View } from "react-native";

import { ArrowDownIcon } from "@/assets/images/icons";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Line } from "@/components/ui/Line";
import { MenuOption } from "@/components/ui/MenuOption";
import { ViewPasskey } from "@/components/ui/Modal/ViewPasskeys";
import { SecurityQuiz } from "@/components/ui/Modal/SecurityQuiz";
import { SeedPhrase } from "@/components/ui/Modal/SeedPhrase";
import { Sessions } from "@/components/ui/Modal/Sessions";
import { VerifySeedPhrase } from "@/components/ui/Modal/VerifySeedPhrase";
import { APP_CONSTANTS, ROUTES } from "@/constants/AppConstants";
import { useAlert } from "@/contexts/AlertProvider";
import { defaultState, useAppState } from "@/contexts/AppStateProvider";
import { useAuth } from "@/contexts/AuthProvider";
import { webStorage } from "@/lib/largeSecureStore";
import { supabase } from "@/lib/supabase";
import { APP_STATES } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import ReactNativeModal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// AccountSecurityScreen: Settings for security, session, Seed Phrase, and account management.
export default function AccountSecurityScreen() {
  const insets = useSafeAreaInsets();

  const { state, setState } = useAppState();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [securityQuizVisible, setSecurityQuizVisible] =
    useState<boolean>(false);
  const [verifySeedPhraseVisible, setVerifySeedPhraseVisible] =
    useState<boolean>(
      state.currentState === APP_STATES.LOGGED_IN_NEED_SEED_PHRASE_VERIFICATION
    );
  const [passkeysVisible, setPasskeysVisible] = useState<boolean>(false);
  const [sessionsVisible, setSessionsVisible] = useState<boolean>(false);
  const [seedPhraseVisible, setSeedPhraseVisible] = useState<boolean>(false);

  const [askMnemonicVisible, setAskMnemonicVisible] = useState<boolean>(false);
  const [sessionTimeoutVisible, setSessionTimeoutVisible] =
    useState<boolean>(false);
  const [sessionTimeoutActionVisible, setSessionTimeoutActionVisible] =
    useState<boolean>(false);

  const [deviceId, setDeviceId] = useState<string | null>(
    Platform.OS === "web" ? webStorage.getItem("device_id") : Device.osBuildId
  );

  // On mount, ensure deviceId is set for session management
  useEffect(() => {
    if (!deviceId) {
      webStorage.setItem("device_id", Crypto.randomUUID());
      setDeviceId(webStorage.getItem("device_id"));
    }
  }, [deviceId]);

  // Handles locking the vault immediately
  const handleLockNow = async () => {
    setState({
      ...state,
      currentState: APP_STATES.LOGGED_IN_NEED_SESSION_RENEWAL,
    });
    router.replace(ROUTES.USER.SETTINGS);
    router.dismissAll();
  };

  // Handles user logout and session revocation
  const handleLogOut = async () => {
    showAlert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          const { error: revokeError } = await supabase
            .from("sessions")
            .update({
              revoked_at: new Date().toISOString(),
            })
            .match({ user_id: user?.id, device_id: deviceId });

          if (revokeError) {
            console.error("Failed to revoke session:", revokeError);
          }

          await supabase.auth.signOut();
          setState(defaultState);

          router.replace(ROUTES.ROOT);
          router.dismissAll();
        },
      },
    ]);
  };

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: "white",
      }}
      className={`flex-1 w-full ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ReactNativeModal
        isVisible={securityQuizVisible}
        onSwipeComplete={async () => {
          setSecurityQuizVisible(false);
        }}
        swipeDirection={["down"]}
        onBackdropPress={async () => {
          setSecurityQuizVisible(false);
        }}
        style={{ margin: 0 }}
        animationInTiming={300}
        animationOutTiming={300}
      >
        <SecurityQuiz
          onClose={() => setSecurityQuizVisible(false)}
          onContinue={() => setSeedPhraseVisible(true)}
        />
      </ReactNativeModal>

      <ReactNativeModal
        isVisible={seedPhraseVisible}
        onSwipeComplete={async () => {
          setSeedPhraseVisible(false);
        }}
        swipeDirection={["down"]}
        onBackdropPress={async () => {
          setSeedPhraseVisible(false);
        }}
        style={{ margin: 0 }}
        animationInTiming={300}
        animationOutTiming={300}
      >
        <SeedPhrase onClose={() => setSeedPhraseVisible(false)} />
      </ReactNativeModal>

      <ReactNativeModal
        isVisible={verifySeedPhraseVisible}
        onSwipeComplete={() => {
          if (
            state.currentState !==
            APP_STATES.LOGGED_IN_NEED_SEED_PHRASE_VERIFICATION
          )
            setVerifySeedPhraseVisible(false);
        }}
        swipeDirection={["down"]}
        onBackdropPress={() => {
          if (
            state.currentState !==
            APP_STATES.LOGGED_IN_NEED_SEED_PHRASE_VERIFICATION
          )
            setVerifySeedPhraseVisible(false);
        }}
        style={{ margin: 0 }}
        animationInTiming={300}
        animationOutTiming={300}
      >
        <VerifySeedPhrase
          onClose={() => {
            setVerifySeedPhraseVisible(false);
            setState({
              ...state,
              lastMnemonicVerification: new Date().toISOString(),
            });
          }}
        />
      </ReactNativeModal>

      <ReactNativeModal
        isVisible={passkeysVisible}
        onSwipeComplete={async () => {
          setPasskeysVisible(false);
        }}
        swipeDirection={["down"]}
        onBackdropPress={async () => {
          setPasskeysVisible(false);
        }}
        style={{ margin: 0 }}
        animationInTiming={300}
        animationOutTiming={300}
      >
        <ViewPasskey onClose={() => setPasskeysVisible(false)} />
      </ReactNativeModal>

      <ReactNativeModal
        isVisible={sessionsVisible}
        onSwipeComplete={async () => {
          setSessionsVisible(false);
        }}
        swipeDirection={["down"]}
        onBackdropPress={async () => {
          setSessionsVisible(false);
        }}
        style={{ margin: 0 }}
        animationInTiming={300}
        animationOutTiming={300}
      >
        <Sessions onClose={() => setSessionsVisible(false)} />
      </ReactNativeModal>

      <View className="p-6 pb-5 border-b border-[#EBEBEB]">
        <View className="flex flex-row justify-between">
          <View className="w-8 h-8 bg-black rounded-full" />
        </View>

        <Spacer size={16} />

        <ThemedText fontSize={20} fontWeight={700}>
          Settings
        </ThemedText>

        <Spacer size={16} />
      </View>

      <ScrollView>
        <View className="mx-6 gap-4">
          <Spacer size={20} />
          <View>
            <ThemedText fontSize={12} fontWeight={800}>
              SEED PHRASE
            </ThemedText>

            <Spacer size={4} />

            <ThemedText fontSize={14}>
              Protect your vault by saving your Seed Phrase in a place only you
              can access and that you will not forget. Be sure to keep it
              offline for optimal safety.
            </ThemedText>
            <Spacer size={8} />
            <Button
              text="Reveal Seed Phrase"
              type="primary-rounded"
              onPress={() => setSecurityQuizVisible(true)}
            />
            <Spacer size={8} />
            <Button
              text="Verify Seed Phrase"
              type="secondary-rounded"
              onPress={() => setVerifySeedPhraseVisible(true)}
            />
            <Spacer size={12} />
            <ThemedText fontSize={14}>
              Last asked:{" "}
              {state.lastMnemonicVerification
                ? formatDate(state.lastMnemonicVerification)
                : "-"}
            </ThemedText>
            <Spacer size={12} />

            <View className="bg-[#EBEBEB] rounded-lg px-4 py-4">
              <View className="gap-2">
                <ThemedText fontSize={12} fontWeight={800}>
                  Ask Seed Phrase
                </ThemedText>
                <DropdownMenu
                  visible={askMnemonicVisible}
                  handleOpen={() => setAskMnemonicVisible(true)}
                  handleClose={() => setAskMnemonicVisible(false)}
                  trigger={
                    <View className="flex flex-row justify-between items-center cursor-pointer">
                      <ThemedText fontSize={14}>
                        {state.askMnemonicEvery === 7
                          ? "every week"
                          : state.askMnemonicEvery === 14
                          ? "every 2 weeks"
                          : "every month"}
                      </ThemedText>
                      <ArrowDownIcon width={16} height={16} />
                    </View>
                  }
                >
                  <MenuOption
                    onSelect={() => {
                      setAskMnemonicVisible(false);
                      setState({
                        ...state,
                        askMnemonicEvery: 7,
                      });
                    }}
                  >
                    <ThemedText fontSize={14} className="text-white">
                      every week
                    </ThemedText>
                  </MenuOption>
                  <MenuOption
                    onSelect={() => {
                      setAskMnemonicVisible(false);
                      setState({
                        ...state,
                        askMnemonicEvery: 14,
                      });
                    }}
                  >
                    <ThemedText fontSize={14} className="text-white">
                      every 2 weeks
                    </ThemedText>
                  </MenuOption>
                  <MenuOption
                    onSelect={() => {
                      setAskMnemonicVisible(false);
                      setState({
                        ...state,
                        askMnemonicEvery: 30,
                      });
                    }}
                  >
                    <ThemedText fontSize={14} className="text-white">
                      every month
                    </ThemedText>
                  </MenuOption>
                </DropdownMenu>
              </View>
            </View>
          </View>

          <View>
            <ThemedText fontSize={12} fontWeight={800}>
              SESSION TIMEOUT
            </ThemedText>

            <Spacer size={4} />

            <View className="bg-[#EBEBEB] rounded-lg px-4 py-4">
              <View className="gap-3">
                <View className="gap-2">
                  <ThemedText fontSize={12} fontWeight={800}>
                    Session timeout
                  </ThemedText>
                  <DropdownMenu
                    visible={sessionTimeoutVisible}
                    handleOpen={() => setSessionTimeoutVisible(true)}
                    handleClose={() => setSessionTimeoutVisible(false)}
                    trigger={
                      <View className="flex flex-row justify-between items-center cursor-pointer">
                        <ThemedText fontSize={14}>
                          {state.sessionTimeout >= 60 * 60
                            ? `${state.sessionTimeout / (60 * 60)} hour${
                                state.sessionTimeout / (60 * 60) > 1 ? "s" : ""
                              }`
                            : `${state.sessionTimeout / 60} minute${
                                state.sessionTimeout / 60 > 1 ? "s" : ""
                              }`}
                        </ThemedText>
                        <ArrowDownIcon width={16} height={16} />
                      </View>
                    }
                  >
                    <MenuOption
                      onSelect={() => {
                        setSessionTimeoutVisible(false);
                        setState({
                          ...state,
                          sessionTimeout: 1 * 60,
                        });
                      }}
                    >
                      <ThemedText fontSize={14} className="text-white">
                        1 minute
                      </ThemedText>
                    </MenuOption>
                    <MenuOption
                      onSelect={() => {
                        setSessionTimeoutVisible(false);
                        setState({
                          ...state,
                          sessionTimeout: 5 * 60,
                        });
                      }}
                    >
                      <ThemedText fontSize={14} className="text-white">
                        5 minutes
                      </ThemedText>
                    </MenuOption>
                    <MenuOption
                      onSelect={() => {
                        setSessionTimeoutVisible(false);
                        setState({
                          ...state,
                          sessionTimeout: 15 * 60,
                        });
                      }}
                    >
                      <ThemedText fontSize={14} className="text-white">
                        15 minutes
                      </ThemedText>
                    </MenuOption>
                    <MenuOption
                      onSelect={() => {
                        setSessionTimeoutVisible(false);
                        setState({
                          ...state,
                          sessionTimeout: 30 * 60,
                        });
                      }}
                    >
                      <ThemedText fontSize={14} className="text-white">
                        30 minutes
                      </ThemedText>
                    </MenuOption>
                    <MenuOption
                      onSelect={() => {
                        setSessionTimeoutVisible(false);
                        setState({
                          ...state,
                          sessionTimeout: 1 * 60 * 60,
                        });
                      }}
                    >
                      <ThemedText fontSize={14} className="text-white">
                        1 hour
                      </ThemedText>
                    </MenuOption>
                    <MenuOption
                      onSelect={() => {
                        setSessionTimeoutVisible(false);
                        setState({
                          ...state,
                          sessionTimeout: 4 * 60 * 60,
                        });
                      }}
                    >
                      <ThemedText fontSize={14} className="text-white">
                        4 hours
                      </ThemedText>
                    </MenuOption>
                  </DropdownMenu>
                </View>

                <Line />

                <View className="gap-2">
                  <ThemedText fontSize={12} fontWeight={800}>
                    Session timeout action
                  </ThemedText>
                  <DropdownMenu
                    visible={sessionTimeoutActionVisible}
                    handleOpen={() => setSessionTimeoutActionVisible(true)}
                    handleClose={() => setSessionTimeoutActionVisible(false)}
                    trigger={
                      <View className="flex flex-row justify-between items-center cursor-pointer">
                        <ThemedText fontSize={14}>
                          {state.sessionTimeoutAction}
                        </ThemedText>
                        <ArrowDownIcon width={16} height={16} />
                      </View>
                    }
                  >
                    <MenuOption
                      onSelect={() => {
                        setSessionTimeoutActionVisible(false);
                        setState({
                          ...state,
                          sessionTimeoutAction: "Lock",
                        });
                      }}
                    >
                      <ThemedText fontSize={14} className="text-white">
                        Lock
                      </ThemedText>
                    </MenuOption>
                    <MenuOption
                      onSelect={() => {
                        setSessionTimeoutActionVisible(false);
                        setState({
                          ...state,
                          sessionTimeoutAction: "Log out",
                        });
                      }}
                    >
                      <ThemedText fontSize={14} className="text-white">
                        Log out
                      </ThemedText>
                    </MenuOption>
                  </DropdownMenu>
                </View>
              </View>
            </View>
          </View>
          <View>
            <ThemedText fontSize={12} fontWeight={800}>
              OTHER
            </ThemedText>

            <Spacer size={4} />

            <View className="bg-[#EBEBEB] rounded-lg px-4 py-4">
              <View className="gap-3">
                <Pressable onPress={() => setPasskeysVisible(true)}>
                  <ThemedText fontSize={14}>Passkeys</ThemedText>
                </Pressable>

                <Line />

                <Pressable onPress={() => setSessionsVisible(true)}>
                  <ThemedText fontSize={14}>Sessions</ThemedText>
                </Pressable>

                <Line />

                <Pressable onPress={handleLockNow}>
                  <ThemedText fontSize={14}>Lock now</ThemedText>
                </Pressable>

                <Line />

                <Pressable onPress={handleLogOut}>
                  <ThemedText fontSize={14}>Log out</ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
          <Spacer size={20} />
        </View>
      </ScrollView>
    </View>
  );
}
