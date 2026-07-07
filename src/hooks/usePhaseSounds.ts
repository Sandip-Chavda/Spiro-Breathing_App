import { useAudioPlayer } from "expo-audio";

// One hook instance = one independent set of players. Used both for real
// playback during a session (breathe.tsx) and for demo "Feel" buttons in
// SoundModal — separate instances don't conflict with each other.
export function usePhaseSounds() {
  const inhalePlayer = useAudioPlayer(
    require("../../assets/sounds/inhale.mp3"),
  );
  const holdPlayer = useAudioPlayer(require("../../assets/sounds/hold.mp3"));
  const exhalePlayer = useAudioPlayer(
    require("../../assets/sounds/exhale.mp3"),
  );

  const playInhale = () => {
    inhalePlayer.seekTo(0); // expo-audio doesn't auto-reset position
    inhalePlayer.play();
  };
  const playHold = () => {
    holdPlayer.seekTo(0);
    holdPlayer.play();
  };
  const playExhale = () => {
    exhalePlayer.seekTo(0);
    exhalePlayer.play();
  };
  const pauseAll = () => {
    inhalePlayer.pause();
    holdPlayer.pause();
    exhalePlayer.pause();
  };

  return { playInhale, playHold, playExhale, pauseAll };
}
