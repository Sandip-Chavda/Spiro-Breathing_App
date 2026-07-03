import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface FluidBreathingViewProps {
  phase: "inhale" | "holdIn" | "exhale" | "holdOut" | "idle";
  isRunning: boolean;
  timeLeft: number; // in seconds
  inhaleDuration: number;
  holdInDuration: number;
  exhaleDuration: number;
  holdOutDuration: number;
  children: React.ReactNode;
}

export default function FluidBreathingView({
  phase,
  isRunning,
  timeLeft,
  inhaleDuration = 4000,
  holdInDuration = 4000,
  exhaleDuration = 4000,
  holdOutDuration = 4000,
  children,
}: FluidBreathingViewProps) {
  const scale = useSharedValue(1);
  const auraScale = useSharedValue(1);
  const color = useSharedValue("#3E7EFF");

  // Use a ref so we can access the latest timeLeft inside the effect
  // without triggering the effect every 100ms tick
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  useEffect(() => {
    const easing = Easing.bezier(0.4, 0, 0.2, 1);

    // If paused, freeze everything immediately!
    if (!isRunning && phase !== "idle") {
      cancelAnimation(scale);
      cancelAnimation(auraScale);
      cancelAnimation(color);
      return;
    }

    // Calculate remaining duration in ms for perfect sync
    const durationMs = (timeLeftRef.current || 0) * 1000;

    if (phase === "inhale") {
      // Cooling in — sky blue
      scale.value = withTiming(1.6, { duration: durationMs, easing });
      auraScale.value = withTiming(2.0, { duration: durationMs, easing });
      color.value = withTiming("#3E7EFF", { duration: durationMs / 2 });
    } else if (phase === "exhale") {
      // Warming out — ember coral
      scale.value = withTiming(1, { duration: durationMs, easing });
      auraScale.value = withTiming(1, { duration: durationMs, easing });
      color.value = withTiming("#FF7A59", { duration: durationMs / 2 });
    } else if (phase === "holdIn" || phase === "holdOut") {
      // Stillness — dusk violet
      color.value = withTiming("#7C6FEF", { duration: 500 });
    } else if (phase === "idle") {
      scale.value = withTiming(1, { duration: 500 });
      auraScale.value = withTiming(1, { duration: 500 });
      color.value = withTiming("#3E7EFF", { duration: 500 });
    }
  }, [phase, isRunning]); // Only trigger when phase changes or play/pause state changes

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: color.value,
    shadowColor: color.value,
  }));

  const auraStyle = useAnimatedStyle(() => ({
    transform: [{ scale: auraScale.value }],
    backgroundColor: color.value,
  }));

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 140,
            height: 140,
            borderRadius: 70,
            opacity: 0.18,
          },
          auraStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            width: 140,
            height: 140,
            borderRadius: 70,
            alignItems: "center",
            justifyContent: "center",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 24,
            elevation: 10,
          },
          coreStyle,
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}
