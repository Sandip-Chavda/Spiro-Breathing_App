import { usePhaseSounds } from "@/hooks/usePhaseSounds";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Music, Wind, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, Switch, Text, View } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SoundModal({ visible, onClose }: Props) {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const { playInhale, playHold, playExhale } = usePhaseSounds();

  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  const playFullCycle = () => {
    if (isPlayingDemo) return;
    setIsPlayingDemo(true);
    playInhale();
    setTimeout(() => playHold(), 1200);
    setTimeout(() => playExhale(), 2400);
    setTimeout(() => setIsPlayingDemo(false), 3600);
  };

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

          <Text className="font-inter text-xs text-driftGray mb-3">
            Try each tone below — a soft rising chime for inhale, a sustained
            tone for hold, a falling tone for exhale.
          </Text>

          <View className="flex-row gap-2 mb-3">
            <Pressable
              onPress={playInhale}
              className="flex-1 bg-skyBlue/10 border border-skyBlue/20 rounded-xl py-3 items-center"
            >
              <Text className="font-jakartaBold text-xs font-bold text-skyBlue">
                Hear Inhale
              </Text>
            </Pressable>
            <Pressable
              onPress={playHold}
              className="flex-1 bg-duskViolet/10 border border-duskViolet/20 rounded-xl py-3 items-center"
            >
              <Text className="font-jakartaBold text-xs font-bold text-duskViolet">
                Hear Hold
              </Text>
            </Pressable>
            <Pressable
              onPress={playExhale}
              className="flex-1 bg-emberCoral/10 border border-emberCoral/20 rounded-xl py-3 items-center"
            >
              <Text className="font-jakartaBold text-xs font-bold text-emberCoral">
                Hear Exhale
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={playFullCycle}
            disabled={isPlayingDemo}
            className="bg-inkNavy rounded-xl py-3 items-center flex-row justify-center"
            style={{ opacity: isPlayingDemo ? 0.6 : 1 }}
          >
            <Wind size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text className="font-jakartaBold text-sm font-bold text-cloudPanel">
              {isPlayingDemo ? "Playing…" : "Play Full Cycle"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
