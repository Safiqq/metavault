import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { DropdownMenu } from "../DropdownMenu";
import { MenuOption } from "../MenuOption";
import { Line } from "../Line";

interface ImportDataProps {
  callback: () => void;
}

export const ImportData: React.FC<ImportDataProps> = ({ callback }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [destinationVault, setDestinationVault] = useState("My vault");
  const [destinationFolder, setDestinationFolder] = useState("Academic");
  const [fileFormat, setFileFormat] = useState("Bitwarden (json)");
  const [uploadFile, setUploadFile] = useState("Upload file");

  const [destinationVaultVisible, setDestinationVaultVisible] = useState(false);
  const [destinationFolderVisible, setDestinationFolderVisible] =
    useState(false);
  const [fileFormatVisible, setFileFormatVisible] = useState(false);
  const [uploadFileVisible, setUploadFileVisible] = useState(false);

  const FILE_FORMATS = [
    "Bitwarden (json)",
    "Bitwarden (csv)",
    "Chrome (csv)",
    "Dashlane (csv)",
    "Firefox (csv)",
    "KeePass 2 (xml)",
    "LastPass",
    "Safari and macOS (csv)",
    "1Password (1pux/json)",
    "1Password (1pif)",
    "1Password 6 and 7 Mac (csv)",
    "1Password 6 and 7 Windows (csv)",
    "Ascendo DataVault (csv)",
    "Avast Passwords (csv)",
    "Avast Passwords (json)",
    "Avira (csv)",
    "BlackBerry Password Keeper (csv)",
    "Blur (csv)",
    "Buttercup (csv)",
    "Clipperz (html)",
    "Codebook (csv)",
    "Dashlane (json)",
    "Edge (csv)",
    "Encryptr (csv)",
    "Enpass (csv)",
    "Enpass (json)",
    "F-Secure KEY (fsk)",
    "GNOME Passwords and Keys/Seahorse (json)",
    "Kaspersky Password Manager (txt)",
    "KeePassX (csv)",
    "Keeper (csv)",
    "LogMeOnce (csv)",
    "Meldium (csv)",
    "mSecure (csv)",
    "Myki (csv)",
    "Netwrix Password Secure (csv)",
    "Nordpass (csv)",
    "Opera (csv)",
    "Padlock (csv)",
    "Passbolt (csv)",
    "PassKeep (csv)",
    "Passky (json)",
    "Passman (json)",
    "Passpack (csv)",
    "Psasword Agent (csv)",
    "Password Boss (json)",
    "Password Dragon (xml)",
    "Password Safe - pwsafe.org (xml)",
    "Password XP (csv)",
    "PasswordWallet (txt)",
    "ProtonPass (zip/json)",
    "Psono (json)",
    "RememBear (csv)",
    "RoboForm (csv)",
    "SafeInCloud (xml)",
    "SaferPass (csv)",
    "SecureSafe (csv)",
    "SplashID (csv)",
    "Sticky Password (xml)",
    "True Key (csv)",
    "Universal Password Manager (csv)",
    "Vivaldi (csv)",
    "Yoti (csv)",
    "Zoho Vault (csv)",
  ];

  return (
    <View className="absolute bg-white w-full z-20 bottom-0 rounded-t-lg h-3/4">
      <View className="rounded-t-lg bg-[#EBEBEB] flex flex-row justify-between py-3 px-6">
        <View className="flex-1">
          <Pressable onPress={callback}>
            <ThemedText fontSize={14} className="text-[#0099FF]">
              Cancel
            </ThemedText>
          </Pressable>
        </View>
        <View className="flex-1">
          <ThemedText
            fontSize={14}
            fontWeight={700}
            className="absolute w-full text-center"
          >
            Import data
          </ThemedText>
        </View>
        <View className="flex-1">
          <Pressable onPress={callback}>
            <ThemedText fontSize={14} className="text-[#0099FF] text-end">
              Import
            </ThemedText>
          </Pressable>
        </View>
      </View>
      <View className="mx-6 my-5 gap-2">
        <View className="bg-[#EBEBEB] px-4 py-3 rounded-lg gap-2">
          <View>
            <ThemedText fontSize={12} fontWeight={800}>
              Destination vault
            </ThemedText>
            <DropdownMenu
              visible={destinationVaultVisible}
              handleOpen={() => setDestinationVaultVisible(true)}
              handleClose={() => setDestinationVaultVisible(false)}
              trigger={
                <View className="flex flex-row justify-between items-center">
                  <ThemedText fontSize={14}>{destinationVault}</ThemedText>
                  <Image
                    className="max-w-4 max-h-4 -mt-1"
                    source={require("@/assets/images/arrow-down.png")}
                  />
                </View>
              }
            >
              <MenuOption
                onSelect={() => {
                  setDestinationVaultVisible(false);
                  setDestinationVault("My vault");
                }}
              >
                <ThemedText fontSize={14} className="text-white">
                  My vault
                </ThemedText>
              </MenuOption>
            </DropdownMenu>
          </View>

          <Line />

          <View>
            <ThemedText fontSize={12} fontWeight={800}>
              Destination folder
            </ThemedText>
            <DropdownMenu
              visible={destinationFolderVisible}
              handleOpen={() => setDestinationFolderVisible(true)}
              handleClose={() => setDestinationFolderVisible(false)}
              trigger={
                <View className="flex flex-row justify-between items-center">
                  <ThemedText fontSize={14}>{destinationFolder}</ThemedText>
                  <Image
                    className="max-w-4 max-h-4 -mt-1"
                    source={require("@/assets/images/arrow-down.png")}
                  />
                </View>
              }
            >
              <MenuOption
                onSelect={() => {
                  setDestinationFolderVisible(false);
                  setDestinationFolder("Academic");
                }}
              >
                <ThemedText fontSize={14} className="text-white">
                  Academic
                </ThemedText>
              </MenuOption>
              <MenuOption
                onSelect={() => {
                  setDestinationFolderVisible(false);
                  setDestinationFolder("Games");
                }}
              >
                <ThemedText fontSize={14} className="text-white">
                  Games
                </ThemedText>
              </MenuOption>
              <MenuOption
                onSelect={() => {
                  setDestinationFolderVisible(false);
                  setDestinationFolder("Social media");
                }}
              >
                <ThemedText fontSize={14} className="text-white">
                  Social media
                </ThemedText>
              </MenuOption>
              <MenuOption
                onSelect={() => {
                  setDestinationFolderVisible(false);
                  setDestinationFolder("No folder");
                }}
              >
                <ThemedText fontSize={14} className="text-white">
                  No folder
                </ThemedText>
              </MenuOption>
            </DropdownMenu>
          </View>
        </View>

        <View className="bg-[#EBEBEB] px-4 py-3 rounded-lg gap-2">
          <View>
            <ThemedText fontSize={12} fontWeight={800}>
              File format
            </ThemedText>
            <DropdownMenu
              visible={fileFormatVisible}
              handleOpen={() => setFileFormatVisible(true)}
              handleClose={() => setFileFormatVisible(false)}
              trigger={
                <View className="flex flex-row justify-between items-center">
                  <ThemedText fontSize={14}>{fileFormat}</ThemedText>
                  <Image
                    className="max-w-4 max-h-4 -mt-1"
                    source={require("@/assets/images/arrow-down.png")}
                  />
                </View>
              }
            >
              {FILE_FORMATS.map((format, index) => (
                <MenuOption
                  key={index}
                  onSelect={() => {
                    setFileFormat(format);
                  }}
                >
                  <ThemedText fontSize={14} className="text-white">
                    {format}
                  </ThemedText>
                </MenuOption>
              ))}
            </DropdownMenu>
          </View>

          <Line />

          <View>
            <ThemedText fontSize={12} fontWeight={800}>
              Select the import file
            </ThemedText>
            <DropdownMenu
              visible={uploadFileVisible}
              handleOpen={() => setUploadFileVisible(true)}
              handleClose={() => setUploadFileVisible(false)}
              trigger={
                <View className="flex flex-row gap-2 items-center">
                    <Image
                      className="max-w-5 max-h-5"
                      source={require("@/assets/images/document-upload.png")}
                    />
                    <ThemedText fontSize={14}>{uploadFile}</ThemedText>
                </View>
              }
            >
              <MenuOption
                onSelect={() => {
                  setUploadFileVisible(false);
                  setUploadFile("123.jpg");
                }}
              >
                <ThemedText fontSize={14} className="text-white">
                  123.jpg
                </ThemedText>
              </MenuOption>
            </DropdownMenu>
          </View>
        </View>
      </View>
    </View>
  );
};
