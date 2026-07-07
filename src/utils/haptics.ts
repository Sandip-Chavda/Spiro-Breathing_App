import { useSettingsStore } from "@/store/useSettingsStore";
import * as Haptics from "expo-haptics";
import { Vibration } from "react-native";

function breathingHapticsEnabled() {
  return useSettingsStore.getState().breathingHapticsEnabled;
}

export const haptics = {
  // UI feedback — always fires, not affected by the breathing-haptics setting
  selection: () => {
    Haptics.selectionAsync();
  },
  impact: (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium,
  ) => {
    Haptics.impactAsync(style);
  },
  notification: (type: Haptics.NotificationFeedbackType) => {
    Haptics.notificationAsync(type);
  },

  // Phase cues — the ONLY thing gated by the settings toggle
  phaseInhale: () => {
    if (breathingHapticsEnabled()) Vibration.vibrate(150);
  },
  phaseHold: () => {
    if (breathingHapticsEnabled()) Vibration.vibrate([0, 100, 100, 100]);
  },
  phaseExhale: () => {
    if (breathingHapticsEnabled()) Vibration.vibrate(500);
  },
  cancel: () => Vibration.cancel(),
};

export { Haptics };
