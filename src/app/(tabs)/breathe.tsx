import AmbientBackground from "@/components/AmbientBackground";
import FluidBreathingView from "@/components/FluidBreathingView";
import { SafeAreaView } from "@/components/SafeAreaView";
import { useSessionStore } from "@/store/useSessionStore";
import {
  Check,
  Play,
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

interface BreathingPattern {
  name: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  rounds: number;
}

const PRESETS: BreathingPattern[] = [
  {
    name: "Box Breathing",
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    rounds: 10,
  },
  {
    name: "4-7-8 Relaxing",
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    rounds: 10,
  },
  {
    name: "Coherent Breathing",
    inhale: 5,
    holdIn: 0,
    exhale: 5,
    holdOut: 0,
    rounds: 10,
  },
];

// FIX: Use strings for the input state so decimals don't get wiped out
interface CustomPatternInput {
  inhale: string;
  holdIn: string;
  exhale: string;
  holdOut: string;
  rounds: string;
}

export default function BreatheScreen() {
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
    inhale: "4",
    holdIn: "4",
    exhale: "4",
    holdOut: "4",
    rounds: "10",
  });

  const phaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseIndexRef = useRef(0);

  const addSession = useSessionStore((state) => state.addSession);

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
    setActivePattern(pattern);
    // Sync custom inputs with the selected preset
    setCustomPattern({
      inhale: String(pattern.inhale),
      holdIn: String(pattern.holdIn),
      exhale: String(pattern.exhale),
      holdOut: String(pattern.holdOut),
      rounds: String(pattern.rounds),
    });
    setIsModalVisible(false);
  };

  const handleSaveCustom = () => {
    const newPattern: BreathingPattern = {
      name: "Custom Routine",
      inhale: parseFloat(customPattern.inhale) || 0,
      holdIn: parseFloat(customPattern.holdIn) || 0,
      exhale: parseFloat(customPattern.exhale) || 0,
      holdOut: parseFloat(customPattern.holdOut) || 0,
      rounds: parseInt(customPattern.rounds, 10) || 1,
    };
    handleSelectPattern(newPattern);
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
            <Pressable
              onPress={() => setIsModalVisible(true)}
              className="flex-row items-center bg-sleekSlate px-3 py-1.5 rounded-full mt-2 mb-6"
            >
              <Settings size={14} color="#00E5C9" />
              <Text className="font-inter text-xs text-spiroCyan ml-1.5 font-bold">
                Change Technique
              </Text>
            </Pressable>
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
              className={`w-20 h-20 rounded-full items-center justify-center ${isRunning ? "bg-vagusIndigo" : "bg-spiroCyan"}`}
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
              You successfully completed {activePattern.rounds} rounds of{" "}
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
                  {activePattern.rounds}
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
                {PRESETS.map((p) => (
                  <Pressable
                    key={p.name}
                    onPress={() => handleSelectPattern(p)}
                    className={`p-4 rounded-2xl border ${activePattern.name === p.name ? "bg-spiroCyan/10 border-spiroCyan" : "bg-sleekSlate border-mutedEther/10"}`}
                  >
                    <Text className="font-jakarta text-base font-bold text-pureOxygen">
                      {p.name}
                    </Text>
                    <Text className="font-inter text-xs text-mutedEther mt-1">
                      {p.inhale}s in {p.holdIn > 0 ? `- ${p.holdIn}s hold` : ""}{" "}
                      - {p.exhale}s out{" "}
                      {p.holdOut > 0 ? `- ${p.holdOut}s hold` : ""} • {p.rounds}{" "}
                      rounds
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text className="font-jakarta text-sm text-mutedEther uppercase mb-3">
                Create Custom
              </Text>
              <View className="bg-sleekSlate p-4 rounded-2xl border border-mutedEther/10 gap-4">
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
                  />
                </View>
              </View>

              <Pressable
                onPress={handleSaveCustom}
                className="bg-spiroCyan rounded-2xl py-4 mt-6 items-center"
              >
                <Text className="font-jakarta text-lg font-bold text-obsidianDark">
                  Save & Use Custom
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
