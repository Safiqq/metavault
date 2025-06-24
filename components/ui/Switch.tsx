import { Pressable, View } from "react-native";

interface SwitchProps {
  state: boolean;
  callback: () => void;
}

export const Switch: React.FC<SwitchProps> = ({ state, callback }) => {
  return (
    <Pressable
      className={`w-10 h-5 rounded-full ${state ? "bg-black" : "bg-[#BBBBBB]"}`}
      onPress={callback}
    >
      <View
        className={`w-4 h-4 rounded-full absolute top-0.5 bg-white ${
          state ? "right-0.5" : "left-0.5"
        }`}
      ></View>
    </Pressable>
  );
};
