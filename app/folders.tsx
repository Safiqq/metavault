import { Image, Platform, Pressable, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import { Line } from "@/components/ui/Line";
import { EditFolder } from "@/components/ui/Modal/EditFolder";

export default function FoldersScreen() {
  const [editFolderVisible, setEditFolderVisible] = useState(false);
  const [folderName, setFolderName] = useState("");

  return (
    <SafeAreaView
      className={`flex-1 w-full ${Platform.OS == "web" && "max-w-2xl mx-auto"}`}
    >
      {editFolderVisible && (
        <>
          <EditFolder
            folderName={folderName}
            callback={() => setEditFolderVisible(false)}
          />
          <View className="bg-black/50 absolute w-full h-full z-10" />
        </>
      )}
      <View className="p-6 border-b border-[#EBEBEB] flex flex-row items-center">
        <View className="flex-1">
          <Pressable
            className="flex flex-row items-center"
            onPress={() => {
              // return to Vault
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
              Vault
            </ThemedText>
          </Pressable>
        </View>
        <View className="flex-1">
          <ThemedText fontSize={20} fontWeight={700} className="text-center">
            Folders
          </ThemedText>
        </View>
        <View className="flex-1" />
      </View>
      <View className="mx-6 my-5 gap-4">
        <View className="bg-[#EBEBEB] rounded-lg px-4 py-3">
          <View className="gap-2">
            <Pressable
              onPress={() => {
                setEditFolderVisible(true);
                setFolderName("Academic");
              }}
            >
              <ThemedText fontSize={14}>Academic</ThemedText>
            </Pressable>

            <Line />

            <Pressable
              onPress={() => {
                setEditFolderVisible(true);
                setFolderName("Games");
              }}
            >
              <ThemedText fontSize={14}>Games</ThemedText>
            </Pressable>

            <Line />

            <Pressable
              onPress={() => {
                setEditFolderVisible(true);
                setFolderName("Social media");
              }}
            >
              <ThemedText fontSize={14}>Social media</ThemedText>
            </Pressable>

            <Line />

            <Pressable
              onPress={() => {
                setEditFolderVisible(true);
                setFolderName("No folder");
              }}
            >
              <ThemedText fontSize={14}>No folder</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
