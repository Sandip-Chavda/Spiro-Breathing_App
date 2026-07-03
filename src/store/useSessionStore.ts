import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface BreathingPattern {
  id?: string; // Needed for saving/deleting custom routines
  name: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  rounds: number;
  isPremium?: boolean; // To lock certain presets
}

export interface BreathingSession {
  id: string;
  patternName: string;
  completedAt: string; // ISO Timestamp
  durationSeconds: number;
}

interface SessionState {
  userRole: "free_tier" | "premium_tier";
  sessions: BreathingSession[];
  savedCustomRoutines: BreathingPattern[];
  currentStreak: number;
  lastActiveDate: string | null;

  upgradeToPro: () => void; // For easy testing
  addSession: (session: BreathingSession) => void;
  addCustomRoutine: (routine: BreathingPattern) => void;
  deleteCustomRoutine: (id: string) => void;
  clearHistory: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      userRole: "free_tier", // Default to free
      sessions: [],
      savedCustomRoutines: [],
      currentStreak: 0,
      lastActiveDate: null,

      upgradeToPro: () => set({ userRole: "premium_tier" }),

      addSession: (session) => {
        const today = new Date().toISOString().split("T")[0];
        const state = get();

        let newStreak = state.currentStreak;

        if (state.lastActiveDate !== today) {
          const yesterday = new Date(Date.now() - 86400000)
            .toISOString()
            .split("T")[0];
          if (state.lastActiveDate === yesterday) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        }

        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, 50),
          currentStreak: newStreak,
          lastActiveDate: today,
        }));
      },

      addCustomRoutine: (routine) => {
        const newRoutine = { ...routine, id: Date.now().toString() };
        set((state) => ({
          savedCustomRoutines: [...state.savedCustomRoutines, newRoutine],
        }));
      },

      deleteCustomRoutine: (id) => {
        set((state) => ({
          savedCustomRoutines: state.savedCustomRoutines.filter(
            (r) => r.id !== id,
          ),
        }));
      },

      clearHistory: () =>
        set({ sessions: [], currentStreak: 0, lastActiveDate: null }),
    }),
    {
      name: "spiro-session-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
