import { supabase } from "@/lib/supabase";
import { generateUUID } from "@/utils/uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface BreathingPattern {
  id?: string;
  name: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  rounds: number;
  isPremium?: boolean;
}

export interface BreathingSession {
  id: string;
  patternName: string;
  completedAt: string;
  durationSeconds: number;
}

interface SessionState {
  userId: string | null;
  userRole: "free_tier" | "premium_tier";
  sessions: BreathingSession[];
  savedCustomRoutines: BreathingPattern[];
  currentStreak: number;
  lastActiveDate: string | null;

  // Ad-unlock state — scaffolded now, UI wiring comes later once ads are built
  bonusSessionDate: string | null;
  bonusRoundsToday: number;
  unlockedPresetIds: string[];

  upgradeToPro: () => void;
  addSession: (session: BreathingSession) => void;
  addCustomRoutine: (routine: BreathingPattern) => void;
  deleteCustomRoutine: (id: string) => void;
  clearHistory: () => void;

  unlockBonusSession: () => void;
  unlockBonusRounds: (rounds: number) => void;
  unlockPreset: (presetId: string) => void;

  hydrateFromCloud: (userId: string) => Promise<void>;
  resetLocalState: () => void;
}

const DEFAULT_STATE = {
  userId: null,
  userRole: "free_tier" as const,
  sessions: [],
  savedCustomRoutines: [],
  currentStreak: 0,
  lastActiveDate: null,
  bonusSessionDate: null,
  bonusRoundsToday: 0,
  unlockedPresetIds: [],
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      upgradeToPro: () => {
        set({ userRole: "premium_tier" });
        const userId = get().userId;
        if (!userId) return;
        supabase
          .from("profiles")
          .update({ user_role: "premium_tier" })
          .eq("id", userId)
          .then(({ error }) => {
            if (error) console.warn("upgradeToPro sync failed:", error.message);
          });
      },

      addSession: (session) => {
        const today = new Date().toISOString().split("T")[0];
        const state = get();

        let newStreak = state.currentStreak;
        if (state.lastActiveDate !== today) {
          const yesterday = new Date(Date.now() - 86400000)
            .toISOString()
            .split("T")[0];
          newStreak = state.lastActiveDate === yesterday ? newStreak + 1 : 1;
        }

        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, 50),
          currentStreak: newStreak,
          lastActiveDate: today,
        }));

        const userId = get().userId;
        if (!userId) return;

        supabase
          .from("sessions")
          .insert({
            id: session.id,
            user_id: userId,
            pattern_name: session.patternName,
            completed_at: session.completedAt,
            duration_seconds: session.durationSeconds,
          })
          .then(({ error }) => {
            if (error) console.warn("addSession sync failed:", error.message);
          });

        supabase
          .from("profiles")
          .update({ current_streak: newStreak, last_active_date: today })
          .eq("id", userId)
          .then(({ error }) => {
            if (error) console.warn("streak sync failed:", error.message);
          });
      },

      addCustomRoutine: (routine) => {
        const newRoutine = { ...routine, id: generateUUID() };
        set((state) => ({
          savedCustomRoutines: [...state.savedCustomRoutines, newRoutine],
        }));

        const userId = get().userId;
        if (!userId) return;

        supabase
          .from("custom_routines")
          .insert({
            id: newRoutine.id,
            user_id: userId,
            name: newRoutine.name,
            inhale: newRoutine.inhale,
            hold_in: newRoutine.holdIn,
            exhale: newRoutine.exhale,
            hold_out: newRoutine.holdOut,
            rounds: newRoutine.rounds,
          })
          .then(({ error }) => {
            if (error)
              console.warn("addCustomRoutine sync failed:", error.message);
          });
      },

      deleteCustomRoutine: (id) => {
        set((state) => ({
          savedCustomRoutines: state.savedCustomRoutines.filter(
            (r) => r.id !== id,
          ),
        }));

        const userId = get().userId;
        if (!userId) return;

        supabase
          .from("custom_routines")
          .delete()
          .eq("id", id)
          .eq("user_id", userId)
          .then(({ error }) => {
            if (error)
              console.warn("deleteCustomRoutine sync failed:", error.message);
          });
      },

      clearHistory: () => {
        set({ sessions: [], currentStreak: 0, lastActiveDate: null });

        const userId = get().userId;
        if (!userId) return;

        supabase
          .from("sessions")
          .delete()
          .eq("user_id", userId)
          .then(({ error }) => {
            if (error) console.warn("clearHistory sync failed:", error.message);
          });

        supabase
          .from("profiles")
          .update({ current_streak: 0, last_active_date: null })
          .eq("id", userId)
          .then(({ error }) => {
            if (error)
              console.warn("clearHistory profile sync failed:", error.message);
          });
      },

      unlockBonusSession: () => {
        const today = new Date().toISOString().split("T")[0];
        set({ bonusSessionDate: today });
        const userId = get().userId;
        if (!userId) return;
        supabase
          .from("profiles")
          .update({ bonus_session_date: today })
          .eq("id", userId)
          .then(({ error }) => {
            if (error)
              console.warn("unlockBonusSession sync failed:", error.message);
          });
      },

      unlockBonusRounds: (rounds) => {
        const newTotal = get().bonusRoundsToday + rounds;
        set({ bonusRoundsToday: newTotal });
        const userId = get().userId;
        if (!userId) return;
        supabase
          .from("profiles")
          .update({ bonus_rounds_today: newTotal })
          .eq("id", userId)
          .then(({ error }) => {
            if (error)
              console.warn("unlockBonusRounds sync failed:", error.message);
          });
      },

      unlockPreset: (presetId) => {
        const updated = Array.from(
          new Set([...get().unlockedPresetIds, presetId]),
        );
        set({ unlockedPresetIds: updated });
        const userId = get().userId;
        if (!userId) return;
        supabase
          .from("profiles")
          .update({ unlocked_preset_ids: updated })
          .eq("id", userId)
          .then(({ error }) => {
            if (error) console.warn("unlockPreset sync failed:", error.message);
          });
      },

      hydrateFromCloud: async (userId: string) => {
        set({ userId });

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError) {
          console.warn(
            "hydrateFromCloud profile fetch failed:",
            profileError.message,
          );
        }

        const { data: sessions, error: sessionsError } = await supabase
          .from("sessions")
          .select("*")
          .eq("user_id", userId)
          .order("completed_at", { ascending: false })
          .limit(50);

        if (sessionsError) {
          console.warn(
            "hydrateFromCloud sessions fetch failed:",
            sessionsError.message,
          );
        }

        const { data: routines, error: routinesError } = await supabase
          .from("custom_routines")
          .select("*")
          .eq("user_id", userId);

        if (routinesError) {
          console.warn(
            "hydrateFromCloud routines fetch failed:",
            routinesError.message,
          );
        }

        set({
          userRole: profile?.user_role ?? "free_tier",
          currentStreak: profile?.current_streak ?? 0,
          lastActiveDate: profile?.last_active_date ?? null,
          bonusSessionDate: profile?.bonus_session_date ?? null,
          bonusRoundsToday: profile?.bonus_rounds_today ?? 0,
          unlockedPresetIds: profile?.unlocked_preset_ids ?? [],
          sessions: (sessions ?? []).map((s) => ({
            id: s.id,
            patternName: s.pattern_name,
            completedAt: s.completed_at,
            durationSeconds: s.duration_seconds,
          })),
          savedCustomRoutines: (routines ?? []).map((r) => ({
            id: r.id,
            name: r.name,
            inhale: r.inhale,
            holdIn: r.hold_in,
            exhale: r.exhale,
            holdOut: r.hold_out,
            rounds: r.rounds,
          })),
        });
      },

      resetLocalState: () => {
        set(DEFAULT_STATE);
      },
    }),
    {
      name: "spiro-session-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
