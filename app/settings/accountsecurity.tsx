import { Image, Platform, Pressable, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import { Switch } from "@/components/ui/Switch";
import { Line } from "@/components/ui/Line";
import Spacer from "@/components/Spacer";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { MenuOption } from "@/components/ui/MenuOption";

export default function AccountSecurityScreen() {
  const [accountSecurityStates, setAccountSecurityStates] = useState({
    unlockFingerprint: true,
    unlockFaceId: false,
    unlockSqrl: true,
    sessionTimeout: "15 minutes",
    sessionTimeoutAction: "Lock",
  });
  const [sessionTimeoutVisible, setSessionTimeoutVisible] = useState(false);
  const [sessionTimeoutActionVisible, setSessionTimeoutActionVisible] =
    useState(false);

  return (
    <SafeAreaView
      className={`flex-1 w-full px-12 ${Platform.OS == "web" && "max-w-2xl mx-auto"}`}
    >
      
      <View className="mx-6 my-5 gap-4">
        <View>
          <ThemedText fontSize={12} fontWeight={800}>
            UNLOCK OPTIONS
          </ThemedText>

          <Spacer size={4} />

          <View className="bg-[#EBEBEB] rounded-lg px-4 py-3">
            <View className="gap-2">
              <View className="flex flex-row items-center justify-between">
                <ThemedText fontSize={14}>Unlock with fingerprint</ThemedText>
                <Switch
                  state={accountSecurityStates.unlockFingerprint}
                  callback={() =>
                    setAccountSecurityStates({
                      ...accountSecurityStates,
                      unlockFingerprint:
                        !accountSecurityStates.unlockFingerprint,
                    })
                  }
                />
              </View>

              <Line />

              <View className="flex flex-row items-center justify-between">
                <ThemedText fontSize={14}>Unlock with FaceID</ThemedText>
                <Switch
                  state={accountSecurityStates.unlockFaceId}
                  callback={() =>
                    setAccountSecurityStates({
                      ...accountSecurityStates,
                      unlockFaceId: !accountSecurityStates.unlockFaceId,
                    })
                  }
                />
              </View>
            </View>
          </View>
        </View>
        <View>
          <ThemedText fontSize={12} fontWeight={800}>
            SESSION TIMEOUT
          </ThemedText>

          <Spacer size={4} />

          <View className="bg-[#EBEBEB] rounded-lg px-4 py-3">
            <View className="gap-2">
              <View>
                <ThemedText fontSize={12} fontWeight={800}>
                  Session timeout
                </ThemedText>
                <DropdownMenu
                  visible={sessionTimeoutVisible}
                  handleOpen={() => setSessionTimeoutVisible(true)}
                  handleClose={() => setSessionTimeoutVisible(false)}
                  trigger={
                    <View className="flex flex-row justify-between items-center">
                      <ThemedText fontSize={14}>
                        {accountSecurityStates.sessionTimeout}
                      </ThemedText>
                      <Image
                        className="max-w-4 max-h-4 -mt-1"
                        source={require("@/assets/images/arrow-down.png")}
                      />
                    </View>
                  }
                >
                  <MenuOption
                    onSelect={() => {
                      setSessionTimeoutVisible(false);
                      setAccountSecurityStates({
                        ...accountSecurityStates,
                        sessionTimeout: "Immediately",
                      });
                    }}
                  >
                    <ThemedText fontSize={14} className="text-white">
                      Immediately
                    </ThemedText>
                  </MenuOption>
                  <MenuOption
                    onSelect={() => {
                      setSessionTimeoutVisible(false);
                      setAccountSecurityStates({
                        ...accountSecurityStates,
                        sessionTimeout: "1 minute",
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
                      setAccountSecurityStates({
                        ...accountSecurityStates,
                        sessionTimeout: "5 minutes",
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
                      setAccountSecurityStates({
                        ...accountSecurityStates,
                        sessionTimeout: "15 minutes",
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
                      setAccountSecurityStates({
                        ...accountSecurityStates,
                        sessionTimeout: "30 minutes",
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
                      setAccountSecurityStates({
                        ...accountSecurityStates,
                        sessionTimeout: "1 hour",
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
                      setAccountSecurityStates({
                        ...accountSecurityStates,
                        sessionTimeout: "4 hours",
                      });
                    }}
                  >
                    <ThemedText fontSize={14} className="text-white">
                      4 hours
                    </ThemedText>
                  </MenuOption>
                  <MenuOption
                    onSelect={() => {
                      setSessionTimeoutVisible(false);
                      setAccountSecurityStates({
                        ...accountSecurityStates,
                        sessionTimeout: "On app restart",
                      });
                    }}
                  >
                    <ThemedText fontSize={14} className="text-white">
                      On app restart
                    </ThemedText>
                  </MenuOption>
                  <MenuOption
                    onSelect={() => {
                      setSessionTimeoutVisible(false);
                      setAccountSecurityStates({
                        ...accountSecurityStates,
                        sessionTimeout: "Never",
                      });
                    }}
                  >
                    <ThemedText fontSize={14} className="text-white">
                      Never
                    </ThemedText>
                  </MenuOption>
                </DropdownMenu>
              </View>

              <Line />

              <View>
                <ThemedText fontSize={12} fontWeight={800}>
                  Session timeout action
                </ThemedText>
                <DropdownMenu
                  visible={sessionTimeoutActionVisible}
                  handleOpen={() => setSessionTimeoutActionVisible(true)}
                  handleClose={() => setSessionTimeoutActionVisible(false)}
                  trigger={
                    <View className="flex flex-row justify-between items-center">
                      <ThemedText fontSize={14}>
                        {accountSecurityStates.sessionTimeoutAction}
                      </ThemedText>
                      <Image
                        className="max-w-4 max-h-4 -mt-1"
                        source={require("@/assets/images/arrow-down.png")}
                      />
                    </View>
                  }
                >
                  <MenuOption
                    onSelect={() => {
                      setSessionTimeoutActionVisible(false);
                      setAccountSecurityStates({
                        ...accountSecurityStates,
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
                      setAccountSecurityStates({
                        ...accountSecurityStates,
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

          <View className="bg-[#EBEBEB] rounded-lg px-4 py-3">
            <View className="gap-2">
              <ThemedText fontSize={14}>Devices</ThemedText>

              <Line />

              <ThemedText fontSize={14}>Lock now</ThemedText>

              <Line />

              <ThemedText fontSize={14}>Log out</ThemedText>

              <Line />

              <ThemedText fontSize={14}>Delete account</ThemedText>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
