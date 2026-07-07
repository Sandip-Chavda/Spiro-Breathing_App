import AmbientBackground from "@/components/AmbientBackground";
import FluidBreathingView from "@/components/FluidBreathingView";
import HapticsModal from "@/components/HapticsSoundModal";
import { SafeAreaView } from "@/components/SafeAreaView";
import SoundModal from "@/components/SoundModal";
import { getTechniqueById } from "@/data/techniques";
import { BreathingPattern, useSessionStore } from "@/store/useSessionStore";
import { useUIStore } from "@/store/useUIStore";
import { getLocalDateString } from "@/utils/date";
import { haptics } from "@/utils/haptics";
import { generateUUID } from "@/utils/uuid";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Check,
  Lock,
  Minus,
  Music,
  Play,
  Plus,
  RotateCcw,
  Settings,
  Square,
  Vibrate,
  X,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type Phase = "inhale" | "holdIn" | "exhale" | "holdOut" | "idle";
type ActivePhase = "inhale" | "holdIn" | "exhale" | "holdOut";

const FREE_TIER_MAX_ROUNDS = 20;

const DEFAULT_PATTERN: BreathingPattern = {
  name: "Box Breathing",
  inhale: 4,
  holdIn: 4,
  exhale: 4,
  holdOut: 4,
  rounds: 20,
  isPremium: false,
};

interface CustomPatternInput {
  name: string;
  inhale: string;
  holdIn: string;
  exhale: string;
  holdOut: string;
  rounds: string;
}

export default function BreatheScreen() {
  const router = useRouter();
  const { techniqueId, customRoutineId } = useLocalSearchParams<{
    techniqueId?: string;
    customRoutineId?: string;
  }>();

  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activePattern, setActivePattern] =
    useState<BreathingPattern>(DEFAULT_PATTERN);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customPattern, setCustomPattern] = useState<CustomPatternInput>({
    name: "My Routine",
    inhale: "4",
    holdIn: "4",
    exhale: "4",
    holdOut: "4",
    rounds: "20",
  });
  const [isHapticsModalVisible, setIsHapticsModalVisible] = useState(false);
  const [isSoundModalVisible, setIsSoundModalVisible] = useState(false);

  const phaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseIndexRef = useRef(0);

  const addSession = useSessionStore((state) => state.addSession);
  const userRole = useSessionStore((state) => state.userRole);
  const lastActiveDate = useSessionStore((state) => state.lastActiveDate);
  const savedCustomRoutines = useSessionStore(
    (state) => state.savedCustomRoutines,
  );
  const addCustomRoutine = useSessionStore((state) => state.addCustomRoutine);
  const deleteCustomRoutine = useSessionStore(
    (state) => state.deleteCustomRoutine,
  );

  const setSessionActive = useUIStore((s) => s.setSessionActive);

  useEffect(() => {
    if (!isRunning) return;
    if (phase === "inhale") {
      haptics.phaseInhale();
    } else if (phase === "holdIn" || phase === "holdOut") {
      haptics.phaseHold();
    } else if (phase === "exhale") {
      haptics.phaseExhale();
    }
  }, [phase]);

  useEffect(() => {
    setSessionActive(hasStarted && !isComplete);
  }, [hasStarted, isComplete]);

  // Block Android hardware back button while a session is running
  useEffect(() => {
    const onBackPress = () => {
      if (hasStarted && !isComplete) {
        Alert.alert(
          "Session in Progress",
          "Stop your current session before leaving this screen.",
        );
        return true; // prevents default back navigation
      }
      return false;
    };
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );
    return () => subscription.remove();
  }, [hasStarted, isComplete]);

  useEffect(() => {
    if (customRoutineId) {
      const r = savedCustomRoutines.find((x) => x.id === customRoutineId);
      if (r) handleSelectPattern(r);
      return;
    }
    if (!techniqueId) return;
    const t = getTechniqueById(techniqueId);
    if (!t) return;
    if (t.isPremium && !isPro) return;
    handleSelectPattern(t);
  }, [techniqueId, customRoutineId]);

  const isPro = userRole === "premium_tier";

  const today = getLocalDateString();
  const isLockedForToday = !isPro && lastActiveDate === today;

  const getActivePhases = (pattern: BreathingPattern): ActivePhase[] => {
    const arr: ActivePhase[] = ["inhale"];
    if (pattern.holdIn > 0) arr.push("holdIn");
    arr.push("exhale");
    if (pattern.holdOut > 0) arr.push("holdOut");
    return arr;
  };

  useEffect(() => {
    if (isComplete && elapsedTime > 0) {
      addSession({
        id: generateUUID(),
        patternName: activePattern.name,
        completedAt: new Date().toISOString(),
        durationSeconds: elapsedTime,
      });
    }
  }, [isComplete]);

  useEffect(() => {
    if (isRunning) {
      setHasStarted(true);
      const activePhases = getActivePhases(activePattern);
      const durations = activePhases.map((p) => activePattern[p] * 1000);

      let currentTime = durations[phaseIndexRef.current] / 1000;
      setPhase(activePhases[phaseIndexRef.current]);
      setTimeLeft(currentTime);

      phaseTimerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            phaseIndexRef.current =
              (phaseIndexRef.current + 1) % activePhases.length;

            if (phaseIndexRef.current === 0) {
              setCurrentRound((prevRound) => {
                const newRound = prevRound + 1;
                if (newRound >= activePattern.rounds) {
                  setIsRunning(false);
                  setIsComplete(true);
                  return activePattern.rounds;
                }
                return newRound;
              });
            }

            currentTime = durations[phaseIndexRef.current] / 1000;
            setPhase(activePhases[phaseIndexRef.current]);
            return currentTime;
          }
          return parseFloat((prev - 0.1).toFixed(1));
        });
      }, 100);

      sessionTimerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    }

    return () => {
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [isRunning, activePattern]);

  const handlePlayPause = () => {
    if (isComplete) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      handleReset();
      setIsRunning(true);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsComplete(false);
    setPhase("idle");
    setTimeLeft(0);
    setCurrentRound(0);
    setElapsedTime(0);
    setHasStarted(false);
    phaseIndexRef.current = 0;
  };

  const MIN_ROUNDS_FOR_CREDIT = 1;

  // Manual early stop (Reset tapped mid-session, before finishing).
  // If at least one full round completed, that's real, meaningful use —
  // save it exactly like a normal completed session (addSession already
  // updates the streak AND the daily-lock date on its own). Anything less
  // is an accidental tap: no record, no penalty, free retry.
  const handleStopEarly = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentRound >= MIN_ROUNDS_FOR_CREDIT && elapsedTime > 0) {
      addSession({
        id: generateUUID(),
        patternName: activePattern.name,
        completedAt: new Date().toISOString(),
        durationSeconds: elapsedTime,
      });
    }
    handleReset();
  };

  const handleSelectPattern = (pattern: BreathingPattern) => {
    handleReset();
    let newPattern = { ...pattern };
    if (!isPro) {
      newPattern.rounds = Math.min(pattern.rounds, FREE_TIER_MAX_ROUNDS);
    }
    setActivePattern(newPattern);
    setCustomPattern({
      name: "My Routine",
      inhale: String(pattern.inhale),
      holdIn: String(pattern.holdIn),
      exhale: String(pattern.exhale),
      holdOut: String(pattern.holdOut),
      rounds: String(newPattern.rounds),
    });
    setIsModalVisible(false);
  };

  const handleSaveCustom = () => {
    const newPattern: BreathingPattern = {
      name: customPattern.name || "Custom Routine",
      inhale: parseFloat(customPattern.inhale) || 0,
      holdIn: parseFloat(customPattern.holdIn) || 0,
      exhale: parseFloat(customPattern.exhale) || 0,
      holdOut: parseFloat(customPattern.holdOut) || 0,
      rounds: parseInt(customPattern.rounds, 10) || 1,
      isPremium: false,
    };
    addCustomRoutine(newPattern);
    handleSelectPattern(newPattern);
  };

  const adjustRounds = (delta: number) => {
    if (!isPro) return;
    Haptics.selectionAsync();
    setActivePattern((prev) => ({
      ...prev,
      rounds: Math.max(1, prev.rounds + delta),
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const formatEstimate = (totalSeconds: number) => {
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  const phaseText =
    phase === "idle"
      ? "Ready"
      : phase === "inhale"
        ? "Inhale"
        : phase === "holdIn"
          ? "Hold"
          : phase === "exhale"
            ? "Exhale"
            : "Hold";

  const popupScale = useSharedValue(0);
  useEffect(() => {
    if (isComplete) {
      popupScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    } else {
      popupScale.value = withTiming(0, { duration: 200 });
    }
  }, [isComplete]);

  const popupStyle = useAnimatedStyle(() => ({
    transform: [{ scale: popupScale.value }],
    opacity: popupScale.value,
  }));

  const patternCycleSeconds =
    activePattern.inhale +
    activePattern.holdIn +
    activePattern.exhale +
    activePattern.holdOut;
  const totalSessionSeconds = Math.round(
    patternCycleSeconds * activePattern.rounds,
  );

  return (
    <SafeAreaView
      className="flex-1 bg-mistWhite"
      style={{ paddingTop: Platform.OS === "android" ? 10 : 20 }}
      edges={["left", "right"]}
    >
      <AmbientBackground phase={phase} />

      {!hasStarted && (
        <View className="absolute gap-4 bottom-35 right-6 z-20 items-center justify-cente">
          <Pressable
            onPress={() => setIsHapticsModalVisible(true)}
            className="w-14 h-14 rounded-full bg-cloudPanel border border-hairline items-center justify-center"
          >
            <Vibrate size={22} color="#3E7EFF" />
          </Pressable>
          <Pressable
            onPress={() => setIsSoundModalVisible(true)}
            className="w-14 h-14 rounded-full bg-cloudPanel border border-hairline items-center justify-center"
          >
            <Music size={22} color="#3E7EFF" />
          </Pressable>
        </View>
      )}

      <View className="flex-1 items-center justify-between pt-8 pb-32 px-6 relative z-10">
        <View className="w-full items-center mt-4">
          <Text className="font-jakartaBold text-2xl font-bold text-inkNavy mb-1">
            {activePattern.name}
          </Text>

          {!hasStarted && (
            <>
              <View className="flex-row gap-2 mt-2 mb-4">
                <Pressable
                  onPress={() => router.push("/techniques")}
                  className="flex-row items-center bg-skyBlue/10 border border-skyBlue/20 px-3 py-1.5 rounded-full"
                >
                  <Settings size={14} color="#3E7EFF" />
                  <Text className="font-inter text-xs text-skyBlue ml-1.5 font-bold">
                    Change Technique
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setIsModalVisible(true)}
                  className="flex-row items-center bg-duskViolet/10 border border-duskViolet/20 px-3 py-1.5 rounded-full"
                >
                  {!isPro && (
                    <Lock
                      size={13}
                      color="#7C6FEF"
                      style={{ marginRight: 6 }}
                    />
                  )}
                  <Text className="font-inter text-xs text-duskViolet font-bold">
                    Custom Routines
                  </Text>
                </Pressable>
              </View>

              <View className="flex-row items-center gap-4 mb-6">
                {isPro && (
                  <Pressable
                    onPress={() => adjustRounds(-1)}
                    className="w-10 h-10 rounded-full bg-cloudPanel border border-hairline items-center justify-center"
                  >
                    <Minus size={20} color="#16202E" />
                  </Pressable>
                )}
                <Text className="font-jakartaBold text-xl font-bold text-inkNavy">
                  {activePattern.rounds} Rounds
                </Text>
                {isPro && (
                  <Pressable
                    onPress={() => adjustRounds(1)}
                    className="w-10 h-10 rounded-full bg-cloudPanel border border-hairline items-center justify-center"
                  >
                    <Plus size={20} color="#16202E" />
                  </Pressable>
                )}
              </View>
              <Text className="font-inter text-lg text-driftGray text-center -mt-4 mb-2">
                {formatEstimate(totalSessionSeconds)} Total
              </Text>
            </>
          )}

          {hasStarted && (
            <View className="flex-row justify-center gap-12 mt-6">
              <View className="items-center">
                <Text className="font-inter text-xs text-driftGray mb-1 uppercase">
                  Round
                </Text>
                <Text className="font-jakartaBold text-xl font-bold text-inkNavy">
                  {currentRound} / {activePattern.rounds}
                </Text>
              </View>
              <View className="items-center">
                <Text className="font-inter text-xs text-driftGray mb-1 uppercase">
                  Time
                </Text>
                <Text className="font-jakartaBold text-xl font-bold text-inkNavy">
                  {formatTime(elapsedTime)}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="flex-1 w-full items-center justify-center">
          <FluidBreathingView
            phase={phase}
            isRunning={isRunning}
            timeLeft={timeLeft}
            inhaleDuration={activePattern.inhale * 1000}
            holdInDuration={activePattern.holdIn * 1000}
            exhaleDuration={activePattern.exhale * 1000}
            holdOutDuration={activePattern.holdOut * 1000}
          >
            <Text className="font-jakartaBold text-2xl font-bold text-cloudPanel text-center">
              {phaseText}
            </Text>
            {timeLeft > 0 && (
              <Text className="font-jakartaBold font-bold text-cloudPanel mt-2">
                <Text className="text-6xl">
                  {timeLeft.toFixed(1).split(".")[0]}
                </Text>
                <Text className="text-3xl text-cloudPanel/70">
                  .{timeLeft.toFixed(1).split(".")[1]}
                </Text>
              </Text>
            )}
          </FluidBreathingView>
        </View>

        <View className="w-full items-center">
          <View className="flex-row items-center justify-center gap-8 mb-10">
            {hasStarted && !isComplete && (
              <Pressable
                onPress={handleStopEarly}
                className="w-16 h-16 rounded-full items-center justify-center bg-cloudPanel border border-hairline"
              >
                <RotateCcw size={24} color="#77879B" />
              </Pressable>
            )}

            <Pressable
              onPress={handlePlayPause}
              disabled={isLockedForToday && !hasStarted}
              className={`w-20 h-20 rounded-full items-center justify-center ${isRunning ? "bg-duskViolet" : "bg-skyBlue"} ${isLockedForToday && !hasStarted ? "opacity-30" : ""}`}
              style={{
                shadowColor: isRunning ? "#7C6FEF" : "#3E7EFF",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              {isRunning ? (
                <Square size={32} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Play
                  size={32}
                  color="#FFFFFF"
                  fill="#FFFFFF"
                  style={{ marginLeft: 4 }}
                />
              )}
            </Pressable>
          </View>
        </View>
      </View>

      {isLockedForToday && !hasStarted && (
        <View className="absolute inset-0 bg-inkNavy/40 items-center justify-center z-20 px-8">
          <View className="bg-cloudPanel border border-hairline rounded-3xl p-8 items-center w-full shadow-lg">
            <View className="w-16 h-16 rounded-full bg-duskViolet/10 items-center justify-center">
              <Lock size={32} color="#7C6FEF" strokeWidth={2.5} />
            </View>
            <Text className="font-jakartaBold text-xl font-bold text-inkNavy mt-4 mb-2">
              Daily Limit Reached
            </Text>
            <Text className="font-inter text-driftGray text-center mb-6">
              Free users can complete one session per day. Upgrade to Pro for
              unlimited daily breathing.
            </Text>
            <Pressable
              onPress={() => router.push("/upgrade")}
              className="bg-skyBlue rounded-2xl py-4 px-8 w-full items-center"
            >
              <Text className="font-jakartaBold text-lg font-bold text-cloudPanel">
                Upgrade to Pro
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {isComplete && (
        <View className="absolute inset-0 bg-inkNavy/40 items-center justify-center z-20 px-8">
          <Animated.View
            style={[popupStyle]}
            className="bg-cloudPanel border border-hairline rounded-3xl p-8 items-center w-full shadow-lg"
          >
            <View className="w-20 h-20 rounded-full bg-skyBlue/10 items-center justify-center mb-4">
              <Check size={40} color="#3E7EFF" strokeWidth={3} />
            </View>
            <Text className="font-jakartaBold text-2xl font-bold text-inkNavy mb-2">
              Session Complete!
            </Text>
            <Text className="font-inter text-driftGray text-center mb-6">
              You successfully completed {currentRound} rounds of{" "}
              {activePattern.name}.
            </Text>

            <View className="flex-row gap-4 mb-8">
              <View className="bg-mistWhite px-5 py-3 rounded-xl items-center">
                <Text className="font-inter text-xs text-driftGray uppercase">
                  Time
                </Text>
                <Text className="font-jakartaBold text-xl font-bold text-skyBlue">
                  {formatTime(elapsedTime)}
                </Text>
              </View>
              <View className="bg-mistWhite px-5 py-3 rounded-xl items-center">
                <Text className="font-inter text-xs text-driftGray uppercase">
                  Rounds
                </Text>
                <Text className="font-jakartaBold text-xl font-bold text-skyBlue">
                  {currentRound}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleReset}
              className="bg-skyBlue rounded-2xl py-4 px-8 w-full items-center"
            >
              <Text className="font-jakartaBold text-lg font-bold text-cloudPanel">
                Done
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      )}

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-inkNavy/40">
          <View className="bg-mistWhite border-t border-hairline rounded-t-3xl p-6 pb-12 max-h-[90%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="font-jakartaBold text-xl font-bold text-inkNavy">
                Custom Routines
              </Text>
              <Pressable onPress={() => setIsModalVisible(false)}>
                <X size={24} color="#77879B" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {isPro && savedCustomRoutines.length > 0 && (
                <>
                  <Text className="font-jakarta text-sm text-driftGray uppercase mb-3">
                    My Saved Routines
                  </Text>
                  <View className="gap-3 mb-6">
                    {savedCustomRoutines.map((r) => (
                      <View
                        key={r.id}
                        className="p-4 rounded-2xl border bg-cloudPanel border-hairline flex-row justify-between items-center"
                      >
                        <Pressable
                          onPress={() => handleSelectPattern(r)}
                          className="flex-1"
                        >
                          <Text className="font-jakartaBold text-base font-bold text-inkNavy">
                            {r.name}
                          </Text>
                          <Text className="font-inter text-xs text-driftGray mt-1">
                            {r.inhale}s in - {r.exhale}s out • {r.rounds} rounds
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => r.id && deleteCustomRoutine(r.id)}
                          className="ml-4"
                        >
                          <X size={20} color="#7C6FEF" />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </>
              )}

              <View className="relative">
                <Text className="font-jakarta text-sm text-driftGray uppercase mb-3">
                  Create Custom
                </Text>
                <View className="bg-cloudPanel p-5 rounded-2xl border border-hairline">
                  <View className="mb-5">
                    <Text className="font-inter text-xs text-driftGray uppercase mb-2">
                      Routine Name
                    </Text>
                    <TextInput
                      className="font-jakarta text-base text-inkNavy pb-2 border-b border-hairline"
                      placeholder="My Routine"
                      placeholderTextColor="#B8C2D1"
                      value={customPattern.name}
                      onChangeText={(text) =>
                        setCustomPattern((prev) => ({ ...prev, name: text }))
                      }
                      editable={isPro}
                    />
                  </View>

                  <View className="flex-row flex-wrap gap-x-6 gap-y-5 mb-2">
                    <View style={{ width: "42%" }}>
                      <Text className="font-inter text-xs text-driftGray uppercase mb-2">
                        Inhale (sec)
                      </Text>
                      <TextInput
                        className="font-jakarta text-base text-inkNavy pb-2 border-b border-hairline"
                        keyboardType="decimal-pad"
                        value={customPattern.inhale}
                        onChangeText={(text) =>
                          setCustomPattern((prev) => ({
                            ...prev,
                            inhale: text,
                          }))
                        }
                        editable={isPro}
                      />
                    </View>

                    <View style={{ width: "42%" }}>
                      <Text className="font-inter text-xs text-driftGray uppercase mb-2">
                        Hold In (sec)
                      </Text>
                      <TextInput
                        className="font-jakarta text-base text-inkNavy pb-2 border-b border-hairline"
                        keyboardType="decimal-pad"
                        value={customPattern.holdIn}
                        onChangeText={(text) =>
                          setCustomPattern((prev) => ({
                            ...prev,
                            holdIn: text,
                          }))
                        }
                        editable={isPro}
                      />
                    </View>

                    <View style={{ width: "42%" }}>
                      <Text className="font-inter text-xs text-driftGray uppercase mb-2">
                        Exhale (sec)
                      </Text>
                      <TextInput
                        className="font-jakarta text-base text-inkNavy pb-2 border-b border-hairline"
                        keyboardType="decimal-pad"
                        value={customPattern.exhale}
                        onChangeText={(text) =>
                          setCustomPattern((prev) => ({
                            ...prev,
                            exhale: text,
                          }))
                        }
                        editable={isPro}
                      />
                    </View>

                    <View style={{ width: "42%" }}>
                      <Text className="font-inter text-xs text-driftGray uppercase mb-2">
                        Hold Out (sec)
                      </Text>
                      <TextInput
                        className="font-jakarta text-base text-inkNavy pb-2 border-b border-hairline"
                        keyboardType="decimal-pad"
                        value={customPattern.holdOut}
                        onChangeText={(text) =>
                          setCustomPattern((prev) => ({
                            ...prev,
                            holdOut: text,
                          }))
                        }
                        editable={isPro}
                      />
                    </View>

                    <View style={{ width: "100%" }}>
                      <Text className="font-inter text-xs text-driftGray uppercase mb-2">
                        Rounds
                      </Text>
                      <TextInput
                        className="font-jakarta text-base text-inkNavy pb-2 border-b border-hairline"
                        keyboardType="numeric"
                        value={customPattern.rounds}
                        onChangeText={(text) =>
                          setCustomPattern((prev) => ({
                            ...prev,
                            rounds: text,
                          }))
                        }
                        editable={isPro}
                      />
                    </View>
                  </View>
                </View>

                {!isPro && (
                  <View className="absolute inset-0 rounded-2xl overflow-hidden">
                    <BlurView
                      intensity={80}
                      tint="systemChromeMaterialLight"
                      className="flex-1 items-center justify-center p-8"
                    >
                      <Lock size={32} color="#7C6FEF" />
                      <Text className="font-jakartaBold text-lg font-bold text-inkNavy mt-4 mb-2">
                        Pro Feature
                      </Text>
                      <Text className="font-inter text-sm text-driftGray text-center">
                        Upgrade to Pro to create and save your own custom
                        breathing routines.
                      </Text>
                    </BlurView>
                  </View>
                )}
              </View>

              {isPro && (
                <Pressable
                  onPress={handleSaveCustom}
                  className="bg-skyBlue rounded-2xl py-4 mt-6 items-center"
                >
                  <Text className="font-jakartaBold text-lg font-bold text-cloudPanel">
                    Save & Use Custom
                  </Text>
                </Pressable>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <HapticsModal
        visible={isHapticsModalVisible}
        onClose={() => setIsHapticsModalVisible(false)}
      />
      <SoundModal
        visible={isSoundModalVisible}
        onClose={() => setIsSoundModalVisible(false)}
      />
    </SafeAreaView>
  );
}
