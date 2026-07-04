import { useAuth } from "@/context/AuthProvider";
import { TECHNIQUES } from "@/data/techniques";
import { useSessionStore } from "@/store/useSessionStore";
import { Redirect, useRouter } from "expo-router";
import { ArrowLeft, ChevronRight, Lock } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TechniquesScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const userRole = useSessionStore((s) => s.userRole);
  const savedCustomRoutines = useSessionStore((s) => s.savedCustomRoutines);
  const isPro = userRole === "premium_tier";

  if (!loading && !session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

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
              <Lock size={14} color="#7C6FEF" style={{ marginLeft: 6 }} />
            )}
          </View>
          <Text className="font-inter text-xs text-driftGray mt-1">
            {t.tagline} · {t.intensity}
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
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={10} className="mr-3">
          <ArrowLeft size={22} color="#16202E" />
        </Pressable>
        <Text className="font-jakartaBold text-xl font-bold text-inkNavy">
          Techniques
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-jakarta text-sm text-driftGray uppercase mb-3">
          Free
        </Text>
        {freeTechniques.map(renderCard)}

        <Text className="font-jakarta text-sm text-driftGray uppercase mt-6 mb-3">
          Premium
        </Text>
        {premiumTechniques.map(renderCard)}

        {isPro && savedCustomRoutines.length > 0 && (
          <>
            <Text className="font-jakarta text-sm text-driftGray uppercase mt-6 mb-3">
              My Routines
            </Text>
            {savedCustomRoutines.map((r) => (
              <Pressable
                key={r.id}
                onPress={() =>
                  router.push(`/(tabs)/breathe?customRoutineId=${r.id}`)
                }
                className="bg-cloudPanel rounded-2xl p-4 border border-hairline flex-row items-center mb-3"
              >
                <View className="flex-1">
                  <Text className="font-jakartaBold text-base font-bold text-inkNavy">
                    {r.name}
                  </Text>
                  <Text className="font-inter text-xs text-driftGray mt-1">
                    {r.inhale}s in - {r.exhale}s out • {r.rounds} rounds
                  </Text>
                </View>
                <ChevronRight size={18} color="#77879B" />
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
