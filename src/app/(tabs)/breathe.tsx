import AmbientBackground from "@/components/AmbientBackground";
import FluidBreathingView from "@/components/FluidBreathingView";
import { SafeAreaView } from "@/components/SafeAreaView";
import { BreathingPattern, useSessionStore } from "@/store/useSessionStore";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import {
  Check,
  Lock,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Settings,
  Square,
  X,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
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

const PRESETS: BreathingPattern[] = [
  {
    name: "Box Breathing",
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    rounds: 20,
    isPremium: false,
  },
  {
    name: "4-7-8 Relaxing",
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    rounds: 20,
    isPremium: false,
  },
  {
    name: "Coherent Breathing",
    inhale: 5,
    holdIn: 0,
    exhale: 5,
    holdOut: 0,
    rounds: 20,
    isPremium: false,
  },
  {
    name: "Deep Calm",
    inhale: 6,
    holdIn: 2,
    exhale: 8,
    holdOut: 0,
    rounds: 20,
    isPremium: true,
  },
];

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
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const [activePattern, setActivePattern] = useState<BreathingPattern>(
    PRESETS[0],
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customPattern, setCustomPattern] = useState<CustomPatternInput>({
    name: "My Routine",
    inhale: "4",
    holdIn: "4",
    exhale: "4",
    holdOut: "4",
    rounds: "20",
  });

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

  const isPro = userRole === "premium_tier";

  // Check if free user has already completed a session today
  const today = new Date().toISOString().split("T")[0];
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
        id: Date.now().toString(),
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
      handleReset();
      setIsRunning(true);
      return;
    }
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

  const handleSelectPattern = (pattern: BreathingPattern) => {
    handleReset();
    let newPattern = { ...pattern };
    // Cap rounds at 20 for free users
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
    addCustomRoutine(newPattern); // Save to store
    handleSelectPattern(newPattern);
  };

  // Pro feature: Adjust rounds dynamically
  const adjustRounds = (delta: number) => {
    if (!isPro) return;
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

  return (
    <SafeAreaView
      className="flex-1 bg-mistWhite"
      edges={["top", "left", "right"]}
    >
      <AmbientBackground phase={phase} />

      <View className="flex-1 items-center justify-between pt-8 pb-32 px-6 relative z-10">
        <View className="w-full items-center mt-4">
          <Text className="font-jakartaBold text-2xl font-bold text-inkNavy mb-1">
            {activePattern.name}
          </Text>

          {!hasStarted && (
            <>
              <Pressable
                onPress={() => setIsModalVisible(true)}
                className="flex-row items-center bg-skyBlue/10 border border-skyBlue/20 px-3 py-1.5 rounded-full mt-2 mb-4"
              >
                <Settings size={14} color="#3E7EFF" />
                <Text className="font-inter text-xs text-skyBlue ml-1.5 font-bold">
                  Change Technique
                </Text>
              </Pressable>

              {/* Pro Round Stepper / Free Round Display */}
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
                onPress={handleReset}
                className="w-16 h-16 rounded-full items-center justify-center bg-cloudPanel border border-hairline"
              >
                <RotateCcw size={24} color="#77879B" />
              </Pressable>
            )}

            <Pressable
              onPress={handlePlayPause}
              disabled={isLockedForToday && !hasStarted} // Disable play if locked for the day
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

      {/* Daily Limit Lock Overlay (Free Users) */}
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
              onPress={() => router.push("/(tabs)/profile")}
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
                Breathing Techniques
              </Text>
              <Pressable onPress={() => setIsModalVisible(false)}>
                <X size={24} color="#77879B" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="font-jakarta text-sm text-driftGray uppercase mb-3">
                Presets
              </Text>
              <View className="gap-3 mb-6">
                {PRESETS.map((p) => {
                  const isLocked = p.isPremium && !isPro;
                  return (
                    <Pressable
                      key={p.name}
                      onPress={() => !isLocked && handleSelectPattern(p)}
                      disabled={isLocked}
                      className={`p-4 rounded-2xl border flex-row justify-between items-center ${activePattern.name === p.name ? "bg-skyBlue/10 border-skyBlue" : "bg-cloudPanel border-hairline"} ${isLocked ? "opacity-50" : ""}`}
                    >
                      <View>
                        <Text className="font-jakartaBold text-base font-bold text-inkNavy">
                          {p.name}
                        </Text>
                        <Text className="font-inter text-xs text-driftGray mt-1">
                          {p.inhale}s in{" "}
                          {p.holdIn > 0 ? `- ${p.holdIn}s hold` : ""} -{" "}
                          {p.exhale}s out{" "}
                          {p.holdOut > 0 ? `- ${p.holdOut}s hold` : ""} •{" "}
                          {p.rounds} rounds
                        </Text>
                      </View>
                      {isLocked && <Lock size={20} color="#7C6FEF" />}
                    </Pressable>
                  );
                })}
              </View>

              {/* Saved Custom Routines (Pro Feature) */}
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

              {/* Custom Builder with Pro Lock Overlay */}
              <View className="relative">
                <Text className="font-jakarta text-sm text-driftGray uppercase mb-3">
                  Create Custom
                </Text>
                <View className="bg-cloudPanel p-4 rounded-2xl border border-hairline gap-4">
                  <View className="flex-row justify-between items-center">
                    <Text className="font-inter text-inkNavy">
                      Routine Name
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#F6F8FB",
                        width: 140,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        color: "#16202E",
                        textAlign: "center",
                      }}
                      placeholder="My Routine"
                      placeholderTextColor="#77879B"
                      value={customPattern.name}
                      onChangeText={(text) =>
                        setCustomPattern((prev) => ({ ...prev, name: text }))
                      }
                      editable={isPro} // Disable input if not pro
                    />
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="font-inter text-inkNavy">
                      Inhale (sec)
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#F6F8FB",
                        width: 64,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        color: "#16202E",
                        textAlign: "center",
                      }}
                      keyboardType="decimal-pad"
                      value={customPattern.inhale}
                      onChangeText={(text) =>
                        setCustomPattern((prev) => ({ ...prev, inhale: text }))
                      }
                      editable={isPro}
                    />
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="font-inter text-inkNavy">
                      Hold In (sec)
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#F6F8FB",
                        width: 64,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        color: "#16202E",
                        textAlign: "center",
                      }}
                      keyboardType="decimal-pad"
                      value={customPattern.holdIn}
                      onChangeText={(text) =>
                        setCustomPattern((prev) => ({ ...prev, holdIn: text }))
                      }
                      editable={isPro}
                    />
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="font-inter text-inkNavy">
                      Exhale (sec)
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#F6F8FB",
                        width: 64,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        color: "#16202E",
                        textAlign: "center",
                      }}
                      keyboardType="decimal-pad"
                      value={customPattern.exhale}
                      onChangeText={(text) =>
                        setCustomPattern((prev) => ({ ...prev, exhale: text }))
                      }
                      editable={isPro}
                    />
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="font-inter text-inkNavy">
                      Hold Out (sec)
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#F6F8FB",
                        width: 64,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        color: "#16202E",
                        textAlign: "center",
                      }}
                      keyboardType="decimal-pad"
                      value={customPattern.holdOut}
                      onChangeText={(text) =>
                        setCustomPattern((prev) => ({ ...prev, holdOut: text }))
                      }
                      editable={isPro}
                    />
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="font-inter text-inkNavy">Rounds</Text>
                    <TextInput
                      style={{
                        backgroundColor: "#F6F8FB",
                        width: 64,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        color: "#16202E",
                        textAlign: "center",
                      }}
                      keyboardType="numeric"
                      value={customPattern.rounds}
                      onChangeText={(text) =>
                        setCustomPattern((prev) => ({ ...prev, rounds: text }))
                      }
                      editable={isPro}
                    />
                  </View>
                </View>

                {/* Blurred Lock Overlay for Free Users */}
                {!isPro && (
                  <View className="absolute inset-0 rounded-2xl overflow-hidden">
                    <BlurView
                      intensity={85}
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
    </SafeAreaView>
  );
}
