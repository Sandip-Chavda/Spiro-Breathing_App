import { useSettingsStore } from "@/store/useSettingsStore";
import { Music, X } from "lucide-react-native";
import { Modal, Pressable, Switch, Text, View } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SoundModal({ visible, onClose }: Props) {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-inkNavy/40">
        <View className="bg-mistWhite border-t border-hairline rounded-t-3xl p-6 pb-10">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="font-jakartaBold text-xl font-bold text-inkNavy">
              Breathing Sound
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={24} color="#77879B" />
            </Pressable>
          </View>

          <View className="flex-row items-center justify-between bg-cloudPanel rounded-2xl p-4 border border-hairline mb-4">
            <View className="flex-row items-center">
              <Music size={18} color="#3E7EFF" strokeWidth={2.5} />
              <Text className="font-jakartaBold text-sm font-bold text-inkNavy ml-3">
                Enable Sound
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: "#E3E9F1", true: "#3E7EFF" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View className="bg-cloudPanel/60 border border-hairline rounded-2xl p-6 items-center">
            <Music size={28} color="#B8C2D1" />
            <Text className="font-jakartaBold text-sm font-bold text-driftGray mt-3">
              Sound cues coming soon
            </Text>
            <Text className="font-inter text-xs text-driftGray text-center mt-1">
              Gentle audio tones for inhale, hold, and exhale are on the way.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
