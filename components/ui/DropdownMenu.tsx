import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView,
} from "react-native";

interface DropdownMenuProps {
  visible: boolean;
  handleClose: () => void;
  handleOpen: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  dropdownWidth?: number;
  pos?: string;
  maxHeight?: number;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  visible,
  handleOpen,
  handleClose,
  trigger,
  children,
  dropdownWidth = 300,
  pos = "center",
  maxHeight = 200,
}) => {
  const triggerRef = useRef<View>(null);
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0 });

  useEffect(() => {
    if (triggerRef.current && visible) {
      triggerRef.current.measure((fx, fy, width, height, px, py) => {
        const screenHeight = Dimensions.get("window").height;
        const spaceBelow = screenHeight - (py + height);
        const adjustedY =
          spaceBelow < maxHeight && py > maxHeight
            ? py - maxHeight // Show above if not enough space below
            : py + height; // Show below normally

        setPosition({
          x: px,
          y: adjustedY,
          width: width,
        });
      });
    }
  }, [visible, maxHeight]);

  return (
    <View>
      <TouchableWithoutFeedback onPress={handleOpen}>
        <View ref={triggerRef}>{trigger}</View>
      </TouchableWithoutFeedback>
      {visible && (
        <Modal
          transparent={true}
          visible={visible}
          animationType="fade"
          onRequestClose={handleClose}
        >
          <TouchableWithoutFeedback onPress={handleClose}>
            <View className="flex-1 justify-start items-start bg-transparent">
              <View
                className="absolute bg-[#4B4B4B] rounded-xl px-4 py-2"
                style={{
                  top: position.y,
                  left:
                    pos == "center"
                      ? position.x + position.width / 2 - dropdownWidth / 2
                      : pos == "right"
                      ? position.x + position.width - dropdownWidth
                      : position.x - position.width + dropdownWidth,
                  width: dropdownWidth,
                  maxHeight: maxHeight,
                }}
              >
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                  {children}
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};
