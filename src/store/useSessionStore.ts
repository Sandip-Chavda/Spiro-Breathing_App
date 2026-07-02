import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface BreathingSession {
  id: string;
  patternName: string;
  completedAt: string; // ISO Timestamp
  durationSeconds: number;
}

interface SessionState {
  sessions: BreathingSession[];
  currentStreak: number;
  lastActiveDate: string | null;
  addSession: (session: BreathingSession) => void;
  clearHistory: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentStreak: 0,
      lastActiveDate: null,

      addSession: (session) => {
        const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
        const state = get();

        let newStreak = state.currentStreak;

        // Streak calculation logic
        if (state.lastActiveDate !== today) {
          const yesterday = new Date(Date.now() - 86400000)
            .toISOString()
            .split("T")[0];
          if (state.lastActiveDate === yesterday) {
            newStreak += 1; // Continue streak
          } else {
            newStreak = 1; // Reset streak
          }
        }

        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, 50), // Keep last 50 sessions
          currentStreak: newStreak,
          lastActiveDate: today,
        }));
      },

      clearHistory: () =>
        set({ sessions: [], currentStreak: 0, lastActiveDate: null }),
    }),
    {
      name: "spiro-session-storage", // Unique key in AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
