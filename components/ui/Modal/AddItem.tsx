import { AddCircleIcon } from "@/assets/images/icons";
import { Pressable } from "react-native";
import Spacer from "../../Spacer";
import { ThemedText } from "../../ThemedText";
import { DropdownMenu } from "../DropdownMenu";
import { Line } from "../Line";
import { MenuOption } from "../MenuOption";

interface AddItemProps {
  callback: (e: "login" | "ssh_key" | "folder") => void;
  dropdownVisible: boolean;
  setDropdownVisible?: (visible: boolean) => void;
  itemType?: "login" | "ssh_key" | "folder";
  onlyCredential?: boolean;
}

export const AddItem: React.FC<AddItemProps> = ({
  callback,
  dropdownVisible,
  setDropdownVisible,
  itemType,
  onlyCredential = false,
}) => {
  if (!setDropdownVisible) {
    if (itemType) {
      return (
        <Pressable onPress={() => callback(itemType)}>
          <AddCircleIcon width={52} height={52} />
        </Pressable>
      );
    }
    return;
  }

  return (
    <DropdownMenu
      visible={dropdownVisible}
      handleOpen={() => setDropdownVisible(true)}
      handleClose={() => setDropdownVisible(false)}
      trigger={
        <AddCircleIcon width={52} height={52} className="cursor-pointer" />
      }
      pos="right"
    >
      <MenuOption
        onSelect={() => {
          setDropdownVisible(false);
          callback("login");
        }}
      >
        <ThemedText fontSize={14} className="text-white">
          Login
        </ThemedText>
      </MenuOption>
      <MenuOption
        onSelect={() => {
          setDropdownVisible(false);
          callback("ssh_key");
        }}
      >
        <ThemedText fontSize={14} className="text-white">
          SSH key
        </ThemedText>
      </MenuOption>

      {!onlyCredential && (
        <>
          <Line />

          <MenuOption
            onSelect={() => {
              setDropdownVisible(false);
              callback("folder");
            }}
          >
            <ThemedText fontSize={14} className="text-white">
              Folder
            </ThemedText>
          </MenuOption>
        </>
      )}
    </DropdownMenu>
  );
};
