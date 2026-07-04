import { SafeAreaView } from "@/components/SafeAreaView";
import { TECHNIQUES } from "@/data/techniques";
import { useSessionStore } from "@/store/useSessionStore";
import { useRouter } from "expo-router";
import { ChevronRight, Flame, Lock, Wind } from "lucide-react-native";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

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

  const freeTechniques = TECHNIQUES.filter((t) => !t.isPremium);
  const premiumTechniques = TECHNIQUES.filter((t) => t.isPremium);

  const renderCard = (t: (typeof TECHNIQUES)[number]) => {
    const locked = t.isPremium && !isPro;
    return (
      <Pressable
        key={t.id}
        onPress={() => router.push(`/technique/${t.id}`)}
        className="bg-cloudPanel rounded-2xl p-4 border border-hairline flex-row items-center mb-3"
      >
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="font-jakartaBold text-base font-bold text-inkNavy">
              {t.name}
            </Text>
            {locked && (
              <Lock size={13} color="#7C6FEF" style={{ marginLeft: 6 }} />
            )}
          </View>
          <Text className="font-inter text-xs text-driftGray mt-1">
            {t.tagline}
          </Text>
        </View>
        <ChevronRight size={18} color="#77879B" />
      </Pressable>
    );
  };

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
          <Text className="font-inter text-sm text-cloudPanel/80">
            {lastSession
              ? `Continue with ${lastSession.patternName}`
              : "Start your first breathing cycle"}
          </Text>
        </Pressable>

        <Text className="font-jakarta text-sm text-driftGray uppercase mb-3">
          Free Techniques
        </Text>
        {freeTechniques.map(renderCard)}

        <Text className="font-jakarta text-sm text-driftGray uppercase mt-6 mb-3">
          Premium Techniques
        </Text>
        {premiumTechniques.map(renderCard)}
      </ScrollView>
    </SafeAreaView>
  );
}
