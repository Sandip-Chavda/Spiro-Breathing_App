import { create } from "zustand";

// Ephemeral, in-memory only — never persisted or synced.
// Used to let the tab bar know a breathing session is active,
// so it can block navigation away from the Breathe screen.
interface UIState {
  isSessionActive: boolean;
  setSessionActive: (active: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSessionActive: false,
  setSessionActive: (active) => set({ isSessionActive: active }),
}));
