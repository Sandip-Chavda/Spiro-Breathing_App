import AmbientBackground from "@/components/AmbientBackground";
import FluidBreathingView from "@/components/FluidBreathingView";
import { SafeAreaView } from "@/components/SafeAreaview";
import { Play, RotateCcw, Square } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

type Phase = "inhale" | "holdIn" | "exhale" | "holdOut" | "idle";

export default function BreatheScreen() {
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);

  const phaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseIndexRef = useRef(0);

  const totalRounds = 5;
  const pattern = {
    inhaleDuration: 4000,
    holdInDuration: 4000,
    exhaleDuration: 4000,
    holdOutDuration: 4000,
  };

  const phases: Phase[] = ["inhale", "holdIn", "exhale", "holdOut"];
  const durations = [
    pattern.inhaleDuration,
    pattern.holdInDuration,
    pattern.exhaleDuration,
    pattern.holdOutDuration,
  ];

  useEffect(() => {
    if (isRunning) {
      setHasStarted(true);
      let currentTime = durations[phaseIndexRef.current] / 1000;
      setPhase(phases[phaseIndexRef.current]);
      setTimeLeft(currentTime);

      phaseTimerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            phaseIndexRef.current = (phaseIndexRef.current + 1) % 4;

            if (phaseIndexRef.current === 0) {
              setCurrentRound((prevRound) => {
                if (prevRound + 1 > totalRounds) {
                  setIsRunning(false);
                  return prevRound;
                }
                return prevRound + 1;
              });
            }

            currentTime = durations[phaseIndexRef.current] / 1000;
            setPhase(phases[phaseIndexRef.current]);
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
  }, [isRunning]);

  const handlePlayPause = () => {
    if (currentRound >= totalRounds && !isRunning) {
      handleReset();
      setIsRunning(true);
      return;
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase("idle");
    setTimeLeft(0);
    setCurrentRound(1);
    setElapsedTime(0);
    setHasStarted(false);
    phaseIndexRef.current = 0;
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

  return (
    <SafeAreaView
      className="flex-1 bg-obsidianDark"
      edges={["top", "left", "right"]}
    >
      <AmbientBackground phase={phase} />

      <View className="flex-1 items-center justify-between pt-8 pb-32 px-6 relative z-10">
        <View className="w-full items-center mt-4">
          <Text className="font-jakarta text-3xl font-bold text-pureOxygen mb-6">
            Box Breathing
          </Text>
          <View className="flex-row justify-center gap-12">
            <View className="items-center">
              <Text className="font-inter text-xs text-mutedEther mb-1 uppercase">
                Round
              </Text>
              <Text className="font-jakarta text-xl font-bold text-pureOxygen">
                {currentRound} / {totalRounds}
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
        </View>

        <View className="flex-1 w-full items-center justify-center">
          {/* Pass isRunning and timeLeft to sync animation perfectly */}
          <FluidBreathingView
            phase={phase}
            isRunning={isRunning}
            timeLeft={timeLeft}
            {...pattern}
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

        <View className="flex-row items-center justify-center gap-8 mb-10">
          {hasStarted && (
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
    </SafeAreaView>
  );
}
