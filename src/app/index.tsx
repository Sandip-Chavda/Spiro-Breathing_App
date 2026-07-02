import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-obsidianDark">
      <Text className="font-jakarta text-3xl font-bold text-spiroCyan">
        SPIRO
      </Text>
      <Text className="mt-2 font-inter text-sm text-mutedEther">
        Parasympathetic Dark Mode Active
      </Text>
    </View>
  );
}
