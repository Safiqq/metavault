import React, { useRef, useEffect, useState, useCallback } from "react";
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

interface Position {
  x: number;
  y: number;
  width: number;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  visible,
  handleOpen,
  handleClose,
  trigger,
  children,
  dropdownWidth = 300,
  pos = "center",
  maxHeight = 250,
}) => {
  const triggerRef = useRef<View>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0, width: 0 });

  const measureTrigger = useCallback(() => {
    if (!triggerRef.current || !visible) return;

    triggerRef.current.measure((fx, fy, width, height, px, py) => {
      const screenHeight = Dimensions.get("window").height;
      const spaceBelow = screenHeight - (py + height);
      const adjustedY =
        spaceBelow < maxHeight && py > maxHeight
          ? py - 3 * height // Show above if not enough space below
          : py + height; // Show below normally

      setPosition({
        x: px,
        y: adjustedY,
        width: width,
      });
    });
  }, [visible, maxHeight]);

  useEffect(() => {
    if (visible) {
      // Small delay to ensure component is mounted
      const timer = setTimeout(measureTrigger, 10);
      return () => clearTimeout(timer);
    }
  }, [visible, measureTrigger]);

  const getDropdownLeftPosition = () => {
    switch (pos) {
      case "center":
        return position.x + position.width / 2 - dropdownWidth / 2;
      case "right":
        return position.x + position.width - dropdownWidth;
      default:
        return position.x - position.width + dropdownWidth;
    }
  };

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
          statusBarTranslucent={true}
        >
          <TouchableWithoutFeedback onPress={handleClose}>
            <View className="flex-1">
              <View
                className="absolute bg-[#4B4B4B] rounded-xl px-4 py-2"
                style={{
                  top: position.y,
                  left: getDropdownLeftPosition(),
                  width: dropdownWidth,
                  maxHeight: maxHeight,
                }}
              >
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  bounces={false}
                >
                  <View className="gap-2">{children}</View>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};
