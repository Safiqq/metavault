import { Image, Platform, Pressable, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import { Line } from "@/components/ui/Line";
import { ExportVault } from "@/components/ui/Modal/ExportVault";
import { ImportData } from "@/components/ui/Modal/ImportData";

export default function VaultScreen() {
  const [exportVaultVisible, setExportVaultVisible] = useState(false);
  const [importDataVisible, setImportDataVisible] = useState(false);

  return (
    <SafeAreaView
      className={`flex-1 w-full px-12 ${Platform.OS == "web" && "max-w-2xl mx-auto"}`}
    >
      {exportVaultVisible && (
        <ExportVault callback={() => setExportVaultVisible(false)} />
      )}
      {importDataVisible && (
        <ImportData callback={() => setImportDataVisible(false)} />
      )}
      {(exportVaultVisible || importDataVisible) && (
        <View className="bg-black/50 absolute w-full h-full z-10" />
      )}
      <View className="p-6 border-b border-[#EBEBEB] flex flex-row items-center">
        <View className="flex-1">
          <Pressable
            className="flex flex-row items-center"
            onPress={() => {
              // return to Settings
            }}
          >
            <Image
              className="max-w-6 max-h-6"
              source={require("@/assets/images/arrow-left.png")}
            />
            <ThemedText
              fontSize={10}
              fontWeight={600}
              className="text-[#0099FF] -ml-1"
            >
              Settings
            </ThemedText>
          </Pressable>
        </View>
        <View className="flex-1">
          <ThemedText fontSize={20} fontWeight={700} className="text-center">
            Vault
          </ThemedText>
        </View>
        <View className="flex-1" />
      </View>
      <View className="mx-6 my-5 gap-4">
        <View className="bg-[#EBEBEB] rounded-lg px-4 py-3">
          <View className="gap-2">
            <ThemedText fontSize={14}>Folders</ThemedText>

            <Line />

            <Pressable onPress={() => setExportVaultVisible(true)}>
              <ThemedText fontSize={14}>Export vault</ThemedText>
            </Pressable>

            <Line />

            <Pressable onPress={() => setImportDataVisible(true)}>
              <ThemedText fontSize={14}>Import data</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
