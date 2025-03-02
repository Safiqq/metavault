import React from "react";
import { View } from "react-native";

const Spacer = ({
  size,
  horizontal = false,
}: {
  size: number;
  horizontal?: boolean;
}) => {
  return (
    <View
      style={{
        width: horizontal ? size : "auto",
        height: !horizontal ? size : "auto",
      }}
    />
  );
};

export default Spacer;
