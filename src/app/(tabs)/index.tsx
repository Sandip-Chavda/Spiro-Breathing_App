import { SafeAreaView } from "@/components/SafeAreaView";
import { useSessionStore } from "@/store/useSessionStore";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Flame,
  Lock,
  Moon,
  Sparkles,
  Wind,
} from "lucide-react-native";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

const QUICK_TECHNIQUES = [
  {
    name: "Box Breathing",
    blurb: "4-4-4-4",
    icon: Wind,
  },
  {
    name: "4-7-8 Relaxing",
    blurb: "Wind down",
    icon: Moon,
  },
  {
    name: "Coherent",
    blurb: "5-5 · Grounding",
    icon: Sparkles,
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const router = useRouter();
  const currentStreak = useSessionStore((state) => state.currentStreak);
  const lastActiveDate = useSessionStore((state) => state.lastActiveDate);
  const userRole = useSessionStore((state) => state.userRole);
  const sessions = useSessionStore((state) => state.sessions);

  const isPro = userRole === "premium_tier";
  const today = new Date().toISOString().split("T")[0];
  const isLockedForToday = !isPro && lastActiveDate === today;
  const lastSession = sessions[0];

  return (
    <SafeAreaView
      className="flex-1 bg-mistWhite"
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: Platform.OS === "android" ? 40 : 24,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header row: greeting + streak badge */}
        <View className="flex-row items-center justify-between mb-1">
          <Text className="font-inter text-sm text-driftGray">
            {getGreeting()}
          </Text>
          {currentStreak > 0 && (
            <View className="flex-row items-center bg-emberCoral/10 px-3 py-1 rounded-full">
              <Flame size={14} color="#FF7A59" strokeWidth={2.5} />
              <Text className="font-jakartaBold text-xs font-bold text-emberCoral ml-1">
                {currentStreak} day{currentStreak > 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>

        <Text className="font-jakartaBold text-3xl font-bold text-inkNavy mb-8">
          Ready to breathe?
        </Text>

        {/* Hero CTA */}
        <Pressable
          onPress={() => router.push("/(tabs)/breathe")}
          className="bg-skyBlue rounded-3xl p-6 mb-10"
          style={{
            shadowColor: "#3E7EFF",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.28,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          <View className="w-12 h-12 rounded-full bg-cloudPanel/20 items-center justify-center mb-6">
            {isLockedForToday ? (
              <Lock size={22} color="#FFFFFF" />
            ) : (
              <Wind size={22} color="#FFFFFF" />
            )}
          </View>
          <Text className="font-jakartaBold text-2xl font-bold text-cloudPanel mb-1">
            Begin Session
          </Text>
          <Text className="font-inter text-sm text-cloudPanel/80 mb-6">
            {lastSession
              ? `Continue with ${lastSession.patternName}`
              : "Start your first breathing cycle"}
          </Text>
          <View className="flex-row items-center">
            <Text className="font-jakartaBold text-sm font-bold text-cloudPanel">
              {isLockedForToday ? "Unlock a bonus round" : "Start now"}
            </Text>
            <ArrowRight size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </View>
        </Pressable>

        {/* Quick Start — horizontal chip scroller, visually distinct from Profile's list rows */}
        <Text className="font-jakarta text-sm text-driftGray uppercase mb-3">
          Quick Start
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingRight: 24 }}
        >
          {QUICK_TECHNIQUES.map((t) => (
            <Pressable
              key={t.name}
              onPress={() => router.push("/(tabs)/breathe")}
              className="bg-cloudPanel rounded-2xl p-4 border border-hairline items-start"
              style={{ width: 128 }}
            >
              <View className="w-10 h-10 rounded-full bg-skyBlue/10 items-center justify-center mb-3">
                <t.icon size={18} color="#3E7EFF" strokeWidth={2.5} />
              </View>
              <Text className="font-jakartaBold text-sm font-bold text-inkNavy">
                {t.name}
              </Text>
              <Text className="font-inter text-xs text-driftGray mt-0.5">
                {t.blurb}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
