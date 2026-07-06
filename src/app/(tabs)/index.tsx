import { SafeAreaView } from "@/components/SafeAreaView";
import { TECHNIQUES } from "@/data/techniques";
import { useSessionStore } from "@/store/useSessionStore";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Flame,
  Lightbulb,
  Lock,
  Wind,
} from "lucide-react-native";
import { useMemo } from "react";
import {
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekDates(): Date[] {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const CARD_TINTS = ["skyBlue", "emberCoral", "duskViolet"] as const;

const TINT_CLASSES = {
  skyBlue: { bg: "bg-skyBlue/10", text: "text-skyBlue" },
  emberCoral: { bg: "bg-emberCoral/10", text: "text-emberCoral" },
  duskViolet: { bg: "bg-duskViolet/10", text: "text-duskViolet" },
} as const;

const DAILY_TIPS = [
  "Breathe through your nose, not your mouth — it filters air and activates calm more effectively.",
  "Consistency beats intensity. A short daily session builds more lasting calm than one long weekly one.",
  "If a breath-hold ever feels strainful, shorten it. Comfort matters more than the exact count.",
  "Morning sessions can set a calmer tone for the whole day — try Box Breathing before checking your phone.",
  "Exhaling longer than you inhale is one of the fastest ways to signal safety to your nervous system.",
  "Notice tension in your shoulders and jaw before you begin — breathing works best when the body isn't already bracing.",
  "Your breath is always available. Even 4 rounds between meetings can reset a stress spiral.",
];

export default function HomeScreen() {
  const router = useRouter();
  const currentStreak = useSessionStore((state) => state.currentStreak);
  const userRole = useSessionStore((state) => state.userRole);
  const sessions = useSessionStore((state) => state.sessions);
  const savedCustomRoutines = useSessionStore(
    (state) => state.savedCustomRoutines,
  );

  const isPro = userRole === "premium_tier";
  const weekDates = useMemo(getWeekDates, []);

  const sessionDaySet = useMemo(
    () => new Set(sessions.map((s) => s.completedAt.split("T")[0])),
    [sessions],
  );

  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();

  const hasSessionOn = (d: Date) =>
    sessionDaySet.has(d.toISOString().split("T")[0]);

  const featuredTechnique = TECHNIQUES[0];
  const quickPicks = TECHNIQUES.slice(0, 4);

  function getDailyTip() {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000,
    );
    return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
  }

  return (
    <SafeAreaView
      className="flex-1 bg-mistWhite"
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: Platform.OS === "android" ? 40 : 20,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="font-inter text-sm text-driftGray">
              {getGreeting()}
            </Text>
            <Text className="font-jakartaBold text-2xl font-bold text-inkNavy mt-0.5">
              Ready to breathe?
            </Text>
          </View>
          <View className="w-12 h-12 rounded-full bg-skyBlue items-center justify-center">
            <Wind size={20} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </View>

        {/* Week strip — real session data, not decorative */}
        <View className="flex-row justify-between mb-8">
          {weekDates.map((d, i) => {
            const today = isToday(d);
            const done = hasSessionOn(d);
            return (
              <View key={i} className="items-center">
                <Text className="font-inter text-xs text-driftGray mb-2">
                  {DAY_LABELS[i]}
                </Text>
                <View
                  className={`w-9 h-9 rounded-full items-center justify-center ${
                    today
                      ? "bg-skyBlue"
                      : done
                        ? "bg-skyBlue/10 border border-skyBlue/30"
                        : "bg-cloudPanel border border-hairline"
                  }`}
                >
                  <Text
                    className={`font-jakartaBold text-xs font-bold ${
                      today
                        ? "text-cloudPanel"
                        : done
                          ? "text-skyBlue"
                          : "text-driftGray"
                    }`}
                  >
                    {d.getDate()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Hero card + side card */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="font-jakartaBold text-lg font-bold text-inkNavy">
            Today's Focus
          </Text>
          <Pressable onPress={() => router.push("/techniques")}>
            <Text className="font-jakartaBold text-xs font-bold text-skyBlue">
              See all
            </Text>
          </Pressable>
        </View>

        <View className="flex-row gap-3 mb-8" style={{ height: 180 }}>
          <Pressable
            onPress={() => router.push(`/technique/${featuredTechnique.id}`)}
            className="flex-[3] rounded-3xl overflow-hidden"
          >
            <ImageBackground
              source={{ uri: featuredTechnique.imageUrl }}
              style={{ flex: 1, justifyContent: "flex-end" }}
              resizeMode="cover"
            >
              <View
                style={{
                  padding: 16,
                  backgroundColor: "rgba(22,32,46,0.45)",
                }}
              >
                <Text className="font-jakartaBold text-lg font-bold text-cloudPanel">
                  {featuredTechnique.name}
                </Text>
                <Text className="font-inter text-xs text-cloudPanel/85 mt-1">
                  {featuredTechnique.tagline}
                </Text>
              </View>
            </ImageBackground>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(tabs)/profile")}
            className="flex-1 bg-emberCoral/10 rounded-3xl items-center justify-center"
          >
            <Flame size={22} color="#FF7A59" strokeWidth={2.5} />
            <Text className="font-jakartaBold text-xl font-bold text-inkNavy mt-2">
              {currentStreak}
            </Text>
            <Text
              className="font-inter text-[10px] text-driftGray uppercase mt-1"
              style={{ transform: [{ rotate: "0deg" }] }}
            >
              Streak
            </Text>
          </Pressable>
        </View>

        {/* My Routines — Pro only */}
        {isPro && savedCustomRoutines.length > 0 && (
          <>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-jakartaBold text-lg font-bold text-inkNavy">
                My Routines
              </Text>
              <Pressable onPress={() => router.push("/techniques")}>
                <Text className="font-jakartaBold text-xs font-bold text-skyBlue">
                  See all
                </Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
            >
              {savedCustomRoutines.slice(0, 5).map((r) => (
                <Pressable
                  key={r.id}
                  onPress={() =>
                    router.push(`/(tabs)/breathe?customRoutineId=${r.id}`)
                  }
                  className="bg-duskViolet/10 rounded-2xl p-4"
                  style={{ width: 150 }}
                >
                  <Text className="font-jakartaBold text-sm font-bold text-inkNavy">
                    {r.name}
                  </Text>
                  <Text className="font-inter text-xs text-driftGray mt-2">
                    {r.inhale}s in - {r.exhale}s out
                  </Text>
                  <Text className="font-inter text-xs text-driftGray">
                    {r.rounds} rounds
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {/* Quick Start — horizontal pastel cards */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="font-jakartaBold text-lg font-bold text-inkNavy">
            Quick Start
          </Text>
          <Pressable onPress={() => router.push("/techniques")}>
            <Text className="font-jakartaBold text-xs font-bold text-skyBlue">
              See all
            </Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingRight: 24 }}
        >
          {quickPicks.map((t, i) => {
            const tint = CARD_TINTS[i % CARD_TINTS.length];
            const locked = t.isPremium && !isPro;
            return (
              <Pressable
                key={t.id}
                onPress={() => router.push(`/technique/${t.id}`)}
                className={`${TINT_CLASSES[tint].bg} rounded-2xl p-4`}
                style={{ width: 160 }}
              >
                <View className="flex-row items-center justify-between mb-6">
                  <Text
                    className={`font-inter text-xs ${TINT_CLASSES[tint].text} font-bold`}
                  >
                    {t.goodFor[0]}
                  </Text>
                  {locked && <Lock size={14} color="#7C6FEF" />}
                </View>
                <Text className="font-jakartaBold text-sm font-bold text-inkNavy">
                  {t.name}
                </Text>
                <Text className="font-inter text-xs text-driftGray mt-1">
                  {t.rounds} rounds
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {/* Daily Tip */}
        <View className="bg-skyBlue/5 border border-skyBlue/15 rounded-2xl p-4 mt-8 mb-8 flex-row items-start">
          <View className="w-9 h-9 rounded-full bg-skyBlue/15 items-center justify-center mr-3">
            <Lightbulb size={16} color="#3E7EFF" strokeWidth={2.5} />
          </View>
          <View className="flex-1">
            <Text className="font-jakartaBold text-xs font-bold text-skyBlue uppercase mb-1">
              Today's Tip
            </Text>
            <Text className="font-inter text-sm text-inkNavy leading-5">
              {getDailyTip()}
            </Text>
          </View>
        </View>

        {/* Recent Sessions preview */}
        {sessions.length > 0 && (
          <>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-jakartaBold text-lg font-bold text-inkNavy">
                Recent Sessions
              </Text>
              <Pressable onPress={() => router.push("/history")}>
                <Text className="font-jakartaBold text-xs font-bold text-skyBlue">
                  See all
                </Text>
              </Pressable>
            </View>
            <View className="gap-3 mb-8">
              {sessions.slice(0, 3).map((s) => (
                <View
                  key={s.id}
                  className="bg-cloudPanel rounded-2xl p-4 border border-hairline flex-row items-center justify-between"
                >
                  <View className="flex-1">
                    <Text className="font-jakartaBold text-sm font-bold text-inkNavy">
                      {s.patternName}
                    </Text>
                    <Text className="font-inter text-xs text-driftGray mt-0.5">
                      {new Date(s.completedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                  <View className="bg-mistWhite px-3 py-1.5 rounded-lg">
                    <Text className="font-jakartaBold text-xs font-bold text-skyBlue">
                      {Math.floor(s.durationSeconds / 60)}m{" "}
                      {s.durationSeconds % 60}s
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Explore banner */}
        <Pressable
          onPress={() => router.push("/techniques")}
          className="bg-inkNavy rounded-3xl p-6 flex-row items-center justify-between"
        >
          <View className="flex-1 pr-4">
            <Text className="font-jakartaBold text-lg font-bold text-cloudPanel mb-1">
              Explore All Techniques
            </Text>
            <Text className="font-inter text-xs text-cloudPanel/70">
              Browse every breathing pattern, benefit tags, and your saved
              routines
            </Text>
          </View>
          <View className="w-11 h-11 rounded-full bg-cloudPanel/15 items-center justify-center">
            <ChevronRight size={20} color="#FFFFFF" />
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
