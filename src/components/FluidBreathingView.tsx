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
  const color = useSharedValue("#00E5C9");

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
      scale.value = withTiming(1.6, { duration: durationMs, easing });
      auraScale.value = withTiming(2.0, { duration: durationMs, easing });
      color.value = withTiming("#00E5C9", { duration: durationMs / 2 });
    } else if (phase === "exhale") {
      scale.value = withTiming(1, { duration: durationMs, easing });
      auraScale.value = withTiming(1, { duration: durationMs, easing });
      color.value = withTiming("#00A896", { duration: durationMs / 2 });
    } else if (phase === "holdIn" || phase === "holdOut") {
      color.value = withTiming("#5F69FF", { duration: 500 });
    } else if (phase === "idle") {
      scale.value = withTiming(1, { duration: 500 });
      auraScale.value = withTiming(1, { duration: 500 });
      color.value = withTiming("#00E5C9", { duration: 500 });
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
            opacity: 0.15,
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
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 30,
            elevation: 15,
          },
          coreStyle,
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}
