import { Stack } from "expo-router";

export default function VaultStackLayout() {
  return (
   <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
      }}
    />
  );
}
