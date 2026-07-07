import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SettingsState {
  breathingHapticsEnabled: boolean; // only gates inhale/hold/exhale vibration
  soundEnabled: boolean; // scaffolded now, wired up once sound is built
  setBreathingHapticsEnabled: (value: boolean) => void;
  setSoundEnabled: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      breathingHapticsEnabled: true,
      soundEnabled: true,
      setBreathingHapticsEnabled: (value) =>
        set({ breathingHapticsEnabled: value }),
      setSoundEnabled: (value) => set({ soundEnabled: value }),
    }),
    {
      name: "spiro-settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
