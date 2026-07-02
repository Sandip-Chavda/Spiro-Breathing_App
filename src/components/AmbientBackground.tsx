import { useEffect, useMemo } from "react";
import { Dimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

// Individual floating particle
const Particle = ({ delay, duration, size, startX, color }: any) => {
  const y = useSharedValue(height + 50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withTiming(-50, { duration, easing: Easing.linear }),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.3, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: startX,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
};

export default function AmbientBackground({ phase }: { phase: string }) {
  const bgColor = useSharedValue("#0A0D10");

  useEffect(() => {
    // Fade the entire screen background based on the phase
    if (phase === "inhale")
      bgColor.value = withTiming("#00E5C9", { duration: 3000 });
    else if (phase === "exhale")
      bgColor.value = withTiming("#00A896", { duration: 3000 });
    else if (phase === "holdIn" || phase === "holdOut")
      bgColor.value = withTiming("#5F69FF", { duration: 1500 });
    else bgColor.value = withTiming("#0A0D10", { duration: 1000 });
  }, [phase]);

  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: bgColor.value,
    opacity: 0.08, // Keep the color very subtle so text remains readable
  }));

  // Generate 20 randomized particles
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 4000,
      duration: 4000 + Math.random() * 4000,
      size: 4 + Math.random() * 8,
      startX: Math.random() * width,
      color: Math.random() > 0.5 ? "#FFFFFF" : "#00E5C9",
    }));
  }, []);

  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 bg-obsidianDark">
      {/* Full screen fading color */}
      <Animated.View
        style={[{ flex: 1, width: "100%", height: "100%" }, bgStyle]}
      />

      {/* Floating Air Particles */}
      {particles.map((p) => (
        <Particle
          key={p.id}
          delay={p.delay}
          duration={p.duration}
          size={p.size}
          startX={p.startX}
          color={p.color}
        />
      ))}
    </View>
  );
}
