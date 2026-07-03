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
      className="flex-1 bg-obsidianDark"
      edges={["top", "left", "right"]}
    >
      <AmbientBackground phase={phase} />

      <View className="flex-1 items-center justify-between pt-8 pb-32 px-6 relative z-10">
        <View className="w-full items-center mt-4">
          <Text className="font-jakarta text-2xl font-bold text-pureOxygen mb-1">
            {activePattern.name}
          </Text>

          {!hasStarted && (
            <>
              <Pressable
                onPress={() => setIsModalVisible(true)}
                className="flex-row items-center bg-sleekSlate px-3 py-1.5 rounded-full mt-2 mb-4"
              >
                <Settings size={14} color="#00E5C9" />
                <Text className="font-inter text-xs text-spiroCyan ml-1.5 font-bold">
                  Change Technique
                </Text>
              </Pressable>

              {/* Pro Round Stepper / Free Round Display */}
              <View className="flex-row items-center gap-4 mb-6">
                {isPro && (
                  <Pressable
                    onPress={() => adjustRounds(-1)}
                    className="w-10 h-10 rounded-full bg-sleekSlate items-center justify-center"
                  >
                    <Minus size={20} color="#FFFFFF" />
                  </Pressable>
                )}
                <Text className="font-jakarta text-xl font-bold text-pureOxygen">
                  {activePattern.rounds} Rounds
                </Text>
                {isPro && (
                  <Pressable
                    onPress={() => adjustRounds(1)}
                    className="w-10 h-10 rounded-full bg-sleekSlate items-center justify-center"
                  >
                    <Plus size={20} color="#FFFFFF" />
                  </Pressable>
                )}
              </View>
            </>
          )}

          {hasStarted && (
            <View className="flex-row justify-center gap-12 mt-6">
              <View className="items-center">
                <Text className="font-inter text-xs text-mutedEther mb-1 uppercase">
                  Round
                </Text>
                <Text className="font-jakarta text-xl font-bold text-pureOxygen">
                  {currentRound} / {activePattern.rounds}
                </Text>
              </View>
              <View className="items-center">
                <Text className="font-inter text-xs text-mutedEther mb-1 uppercase">
                  Time
                </Text>
                <Text className="font-jakarta text-xl font-bold text-pureOxygen">
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
            <Text className="font-jakarta text-2xl font-bold text-pureOxygen text-center">
              {phaseText}
            </Text>
            {timeLeft > 0 && (
              <Text className="font-jakarta font-bold text-pureOxygen mt-2">
                <Text className="text-6xl">
                  {timeLeft.toFixed(1).split(".")[0]}
                </Text>
                <Text className="text-3xl text-pureOxygen/70">
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
                className="w-16 h-16 rounded-full items-center justify-center bg-sleekSlate border border-mutedEther/20"
              >
                <RotateCcw size={24} color="#8A99AD" />
              </Pressable>
            )}

            <Pressable
              onPress={handlePlayPause}
              disabled={isLockedForToday && !hasStarted} // Disable play if locked for the day
              className={`w-20 h-20 rounded-full items-center justify-center ${isRunning ? "bg-vagusIndigo" : "bg-spiroCyan"} ${isLockedForToday && !hasStarted ? "opacity-30" : ""}`}
            >
              {isRunning ? (
                <Square size={32} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Play
                  size={32}
                  color="#0A0D10"
                  fill="#0A0D10"
                  style={{ marginLeft: 4 }}
                />
              )}
            </Pressable>
          </View>
        </View>
      </View>

      {/* Daily Limit Lock Overlay (Free Users) */}
      {isLockedForToday && !hasStarted && (
        <View className="absolute inset-0 bg-obsidianDark/80 items-center justify-center z-20 px-8">
          <View className="bg-sleekSlate border border-vagusIndigo/30 rounded-3xl p-8 items-center w-full">
            <Lock size={40} color="#5F69FF" strokeWidth={2.5} />
            <Text className="font-jakarta text-xl font-bold text-pureOxygen mt-4 mb-2">
              Daily Limit Reached
            </Text>
            <Text className="font-inter text-mutedEther text-center mb-6">
              Free users can complete one session per day. Upgrade to Pro for
              unlimited daily breathing.
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/profile")}
              className="bg-spiroCyan rounded-2xl py-4 px-8 w-full items-center"
            >
              <Text className="font-jakarta text-lg font-bold text-obsidianDark">
                Upgrade to Pro
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {isComplete && (
        <View className="absolute inset-0 bg-obsidianDark/90 items-center justify-center z-20 px-8">
          <Animated.View
            style={[popupStyle]}
            className="bg-sleekSlate border border-spiroCyan/30 rounded-3xl p-8 items-center w-full"
          >
            <View className="w-20 h-20 rounded-full bg-spiroCyan/10 items-center justify-center mb-4">
              <Check size={40} color="#00E5C9" strokeWidth={3} />
            </View>
            <Text className="font-jakarta text-2xl font-bold text-pureOxygen mb-2">
              Session Complete!
            </Text>
            <Text className="font-inter text-mutedEther text-center mb-6">
              You successfully completed {currentRound} rounds of{" "}
              {activePattern.name}.
            </Text>

            <View className="flex-row gap-4 mb-8">
              <View className="bg-obsidianDark px-5 py-3 rounded-xl items-center">
                <Text className="font-inter text-xs text-mutedEther uppercase">
                  Time
                </Text>
                <Text className="font-jakarta text-xl font-bold text-spiroCyan">
                  {formatTime(elapsedTime)}
                </Text>
              </View>
              <View className="bg-obsidianDark px-5 py-3 rounded-xl items-center">
                <Text className="font-inter text-xs text-mutedEther uppercase">
                  Rounds
                </Text>
                <Text className="font-jakarta text-xl font-bold text-spiroCyan">
                  {currentRound}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleReset}
              className="bg-spiroCyan rounded-2xl py-4 px-8 w-full items-center"
            >
              <Text className="font-jakarta text-lg font-bold text-obsidianDark">
                Done
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      )}

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-obsidianDark border-t border-mutedEther/20 rounded-t-3xl p-6 pb-12 max-h-[90%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="font-jakarta text-xl font-bold text-pureOxygen">
                Breathing Techniques
              </Text>
              <Pressable onPress={() => setIsModalVisible(false)}>
                <X size={24} color="#8A99AD" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="font-jakarta text-sm text-mutedEther uppercase mb-3">
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
                      className={`p-4 rounded-2xl border flex-row justify-between items-center ${activePattern.name === p.name ? "bg-spiroCyan/10 border-spiroCyan" : "bg-sleekSlate border-mutedEther/10"} ${isLocked ? "opacity-50" : ""}`}
                    >
                      <View>
                        <Text className="font-jakarta text-base font-bold text-pureOxygen">
                          {p.name}
                        </Text>
                        <Text className="font-inter text-xs text-mutedEther mt-1">
                          {p.inhale}s in{" "}
                          {p.holdIn > 0 ? `- ${p.holdIn}s hold` : ""} -{" "}
                          {p.exhale}s out{" "}
                          {p.holdOut > 0 ? `- ${p.holdOut}s hold` : ""} •{" "}
                          {p.rounds} rounds
                        </Text>
                      </View>
                      {isLocked && <Lock size={20} color="#5F69FF" />}
                    </Pressable>
                  );
                })}
              </View>

              {/* Saved Custom Routines (Pro Feature) */}
              {isPro && savedCustomRoutines.length > 0 && (
                <>
                  <Text className="font-jakarta text-sm text-mutedEther uppercase mb-3">
                    My Saved Routines
                  </Text>
                  <View className="gap-3 mb-6">
                    {savedCustomRoutines.map((r) => (
                      <View
                        key={r.id}
                        className="p-4 rounded-2xl border bg-sleekSlate border-mutedEther/10 flex-row justify-between items-center"
                      >
                        <Pressable
                          onPress={() => handleSelectPattern(r)}
                          className="flex-1"
                        >
                          <Text className="font-jakarta text-base font-bold text-pureOxygen">
                            {r.name}
                          </Text>
                          <Text className="font-inter text-xs text-mutedEther mt-1">
                            {r.inhale}s in - {r.exhale}s out • {r.rounds} rounds
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => r.id && deleteCustomRoutine(r.id)}
                          className="ml-4"
                        >
                          <X size={20} color="#5F69FF" />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* Custom Builder with Pro Lock Overlay */}
              <View className="relative">
                <Text className="font-jakarta text-sm text-mutedEther uppercase mb-3">
                  Create Custom
                </Text>
                <View className="bg-sleekSlate p-4 rounded-2xl border border-mutedEther/10 gap-4">
                  <View className="flex-row justify-between items-center">
                    <Text className="font-inter text-pureOxygen">
                      Routine Name
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#0A0D10",
                        width: 140,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        color: "#FFFFFF",
                        textAlign: "center",
                      }}
                      placeholder="My Routine"
                      placeholderTextColor="#8A99AD"
                      value={customPattern.name}
                      onChangeText={(text) =>
                        setCustomPattern((prev) => ({ ...prev, name: text }))
                      }
                      editable={isPro} // Disable input if not pro
                    />
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="font-inter text-pureOxygen">
                      Inhale (sec)
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#0A0D10",
                        width: 64,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        color: "#FFFFFF",
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
                    <Text className="font-inter text-pureOxygen">
                      Hold In (sec)
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#0A0D10",
                        width: 64,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        color: "#FFFFFF",
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
                    <Text className="font-inter text-pureOxygen">
                      Exhale (sec)
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#0A0D10",
                        width: 64,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        color: "#FFFFFF",
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
                    <Text className="font-inter text-pureOxygen">
                      Hold Out (sec)
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#0A0D10",
                        width: 64,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        color: "#FFFFFF",
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
                    <Text className="font-inter text-pureOxygen">Rounds</Text>
                    <TextInput
                      style={{
                        backgroundColor: "#0A0D10",
                        width: 64,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        color: "#FFFFFF",
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
                      intensity={100}
                      tint="systemThickMaterialDark"
                      className="flex-1 items-center justify-center p-8"
                    >
                      <Lock size={32} color="#5F69FF" />
                      <Text className="font-jakarta text-lg font-bold text-pureOxygen mt-4 mb-2">
                        Pro Feature
                      </Text>
                      <Text className="font-inter text-sm text-mutedEther text-center">
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
                  className="bg-spiroCyan rounded-2xl py-4 mt-6 items-center"
                >
                  <Text className="font-jakarta text-lg font-bold text-obsidianDark">
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
