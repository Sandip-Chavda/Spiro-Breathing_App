const ORBIT_IMAGES = [
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1591228127791-8e2eaef098d3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1476611317561-60117649dd94?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1710322144652-bcea73280334?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function OrbitImage({
  uri,
  baseX,
  baseY,
  size,
  burst,
}: {
  uri: string;
  baseX: number;
  baseY: number;
  size: number;
  burst: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const p = burst.value;
    return {
      transform: [
        { translateX: -size / 2 + baseX * p },
        { translateY: -size / 2 + baseY * p },
        { scale: 0.3 + p * 0.7 },
      ],
      opacity: p,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: "50%",
          top: "50%",
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          zIndex: 1,
        },
        style,
      ]}
    >
      <Image source={{ uri }} style={{ width: "100%", height: "100%" }} />
    </Animated.View>
  );
}

function CircleLogoScreen() {
  const size = 64;
  // Radius is capped by available screen width so the ring can never
  // clip off the edges, regardless of device size — 32px side margin.
  const radius = Math.min(140, (SCREEN_WIDTH - size - 24) / 2);
  const n = ORBIT_IMAGES.length;

  const burst = useSharedValue(0);
  const ringRotation = useSharedValue(0);

  useEffect(() => {
    burst.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
    ringRotation.value = withDelay(
      1050,
      withTiming(360, { duration: 1600, easing: Easing.inOut(Easing.cubic) }),
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotation.value}deg` }],
  }));

  return (
    <View style={{ width: SCREEN_WIDTH, alignItems: "center" }}>
      <View style={{ width: radius * 2 + size, height: radius * 2 + size }}>
        <Animated.View
          style={[
            { position: "absolute", width: "100%", height: "100%" },
            ringStyle,
          ]}
        >
          {ORBIT_IMAGES.map((uri, i) => {
            const angle = (2 * Math.PI * i) / n - Math.PI / 2;
            const baseX = radius * Math.cos(angle);
            const baseY = radius * Math.sin(angle);
            return (
              <OrbitImage
                key={i}
                uri={uri}
                baseX={baseX}
                baseY={baseY}
                size={size}
                burst={burst}
              />
            );
          })}
        </Animated.View>

        <View
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 110,
            height: 110,
            marginLeft: -55,
            marginTop: -55,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <Image
            source={require("../../assets/icon2.png")}
            style={{ width: 110, height: 110, borderRadius: 14 }}
            resizeMode="contain"
          />
        </View>
      </View>

      <Text className="font-jakartaBold text-3xl font-bold text-inkNavy text-center mt-12">
        Welcome to Spiro
      </Text>
      <Text className="font-inter text-sm text-driftGray text-center mt-3 px-10">
        A calm space built around your breath — inhale cool, exhale warm, rest
        in stillness.
      </Text>
    </View>
  );
}

function FloatingDot({
  color,
  size,
  style,
}: {
  color: string;
  size: number;
  style: any;
}) {
  const float = useSharedValue(0);
  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 + Math.random() * 800 }),
        withTiming(0, { duration: 2000 + Math.random() * 800 }),
      ),
      -1,
      true,
    );
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -8 * float.value }],
    opacity: 0.5 + float.value * 0.3,
  }));
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
        animStyle,
      ]}
    />
  );
}

function BreathPreviewScreen() {
  const frameWidth = SCREEN_WIDTH * 0.56;
  const frameHeight = frameWidth / 0.46; // typical phone aspect ratio

  return (
    <View style={{ width: SCREEN_WIDTH, alignItems: "center" }}>
      <View style={{ width: frameWidth + 80, height: frameHeight + 40 }}>
        <FloatingDot color="#3E7EFF" size={14} style={{ top: 10, left: 4 }} />
        <FloatingDot color="#FF7A59" size={10} style={{ top: 60, right: 0 }} />
        <FloatingDot
          color="#7C6FEF"
          size={18}
          style={{ bottom: 30, left: 0 }}
        />
        <FloatingDot
          color="#3E7EFF"
          size={8}
          style={{ bottom: 70, right: 8 }}
        />

        {/* Phone frame */}
        <View
          style={{
            position: "absolute",
            left: 40,
            top: 20,
            width: frameWidth,
            height: frameHeight,
            borderRadius: 38,
            backgroundColor: "#16202E",
            padding: 7,
            shadowColor: "#16202E",
            shadowOffset: { width: 0, height: 16 },
            shadowOpacity: 0.25,
            shadowRadius: 24,
            elevation: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              borderRadius: 32,
              overflow: "hidden",
              backgroundColor: "#F6F8FB",
            }}
          >
            <Image
              source={require("../../assets/onboarding-preview.png")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>
          {/* Notch */}
          {/* <View
            style={{
              position: "absolute",
              top: 7,
              alignSelf: "center",
              width: frameWidth * 0.3,
              height: 18,
              borderRadius: 9,
              backgroundColor: "#16202E",
            }}
          /> */}
        </View>
      </View>

      <Text className="font-jakartaBold text-3xl font-bold text-inkNavy text-center mt-8">
        Guided, visual breathing
      </Text>
      <Text className="font-inter text-sm text-driftGray text-center mt-3 px-10">
        Watch the circle, follow the count. No timers to manage, no guesswork.
      </Text>
    </View>
  );
}

import { Brain, MoonStar, Wind } from "lucide-react-native";

const BENEFITS = [
  "Personalized breathing exercises",
  "Build daily calming habits",
  "Track your mindfulness journey",
];

function FloatingBubble({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withRepeat(
      withSequence(
        withTiming(-8, {
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(8, {
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 68,
          height: 68,
          borderRadius: 34,
          backgroundColor: "rgba(255,255,255,0.65)",
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.7)",
        },
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

function JourneyScreen() {
  const breathe = useSharedValue(1);

  useEffect(() => {
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.08, {
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      false,
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
    opacity: 0.18,
  }));

  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 30,
      }}
    >
      {/* HERO */}
      <View
        style={{
          width: 270,
          height: 270,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 28,
        }}
      >
        {/* breathing rings */}

        <Animated.View
          style={[
            {
              position: "absolute",
              width: 210,
              height: 210,
              borderRadius: 105,
              backgroundColor: "#3E7EFF",
            },
            ringStyle,
          ]}
        />

        <Animated.View
          style={[
            {
              position: "absolute",
              width: 170,
              height: 170,
              borderRadius: 85,
              backgroundColor: "#3E7EFF",
              opacity: 0.12,
            },
            ringStyle,
          ]}
        />

        {/* floating bubbles */}

        <FloatingBubble
          style={{
            position: "absolute",
            top: 12,
            left: 22,
          }}
        >
          <Wind size={30} color="#3E7EFF" />
        </FloatingBubble>

        <FloatingBubble
          style={{
            position: "absolute",
            top: 48,
            right: 18,
          }}
        >
          <Brain size={30} color="#7C6FEF" />
        </FloatingBubble>

        <FloatingBubble
          style={{
            position: "absolute",
            bottom: 20,
            right: 42,
          }}
        >
          <MoonStar size={30} color="#FF7A59" />
        </FloatingBubble>

        {/* mascot */}

        <Image
          source={require("../../assets/icon2.png")}
          style={{
            width: 135,
            height: 135,
            borderRadius: 80,
          }}
          resizeMode="contain"
        />
      </View>

      {/* TITLE */}

      <Text className="font-jakartaBold text-3xl text-inkNavy text-center">
        Your Journey Starts Now
      </Text>

      {/* SUBTITLE */}

      <Text
        className="font-inter text-sm text-driftGray text-center"
        style={{
          marginTop: 14,
          paddingHorizontal: 18,
          lineHeight: 24,
        }}
      >
        Build a calmer mind through guided breathing,
        {"\n"}
        daily consistency, and mindful progress.
      </Text>

      {/* BENEFITS */}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          marginTop: 42,
          paddingHorizontal: 10,
        }}
      >
        <View style={{ alignItems: "center", width: 90 }}>
          <Wind size={24} color="#3E7EFF" />
          <Text
            className="font-jakartaBold text-sm text-inkNavy"
            style={{ marginTop: 10 }}
          >
            Stress
          </Text>
          <Text className="font-inter text-xs text-driftGray">Relief</Text>
        </View>

        <View style={{ alignItems: "center", width: 90 }}>
          <Brain size={24} color="#7C6FEF" />
          <Text
            className="font-jakartaBold text-sm text-inkNavy"
            style={{ marginTop: 10 }}
          >
            Better
          </Text>
          <Text className="font-inter text-xs text-driftGray">Focus</Text>
        </View>

        <View style={{ alignItems: "center", width: 90 }}>
          <MoonStar size={24} color="#FF7A59" />
          <Text
            className="font-jakartaBold text-sm text-inkNavy"
            style={{ marginTop: 10 }}
          >
            Deep
          </Text>
          <Text className="font-inter text-xs text-driftGray">Sleep</Text>
        </View>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const totalSteps = 3;

  const finish = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/(auth)/sign-in");
  };

  const goNext = () => {
    if (index === totalSteps - 1) {
      finish();
      return;
    }
    const next = index + 1;
    setIndex(next);
    scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
  };

  return (
    <LinearGradient
      colors={["#F6F8FB", "#E9EFFC", "#DCE7FF"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-row justify-end px-6 pt-2">
          <Pressable onPress={finish} hitSlop={10}>
            <Text className="font-inter text-sm text-driftGray">Skip</Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={{ alignItems: "center" }}
          style={{ flex: 1 }}
        >
          <View
            style={{ width: SCREEN_WIDTH, justifyContent: "center", flex: 1 }}
          >
            <CircleLogoScreen />
          </View>
          <View
            style={{ width: SCREEN_WIDTH, justifyContent: "center", flex: 1 }}
          >
            <BreathPreviewScreen />
          </View>
          <View
            style={{ width: SCREEN_WIDTH, justifyContent: "center", flex: 1 }}
          >
            <JourneyScreen />
          </View>
        </ScrollView>

        <View className="px-8 pb-6">
          <View className="flex-row justify-center gap-2 mb-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                className={`h-2 rounded-full ${i === index ? "w-6 bg-skyBlue" : "w-2 bg-hairline"}`}
              />
            ))}
          </View>
          <Pressable
            onPress={goNext}
            className="bg-skyBlue rounded-full py-4 items-center"
          >
            <Text className="font-jakartaBold text-base font-bold text-cloudPanel">
              {index === totalSteps - 1 ? "Get Started" : "Next"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
