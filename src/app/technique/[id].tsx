import { useAuth } from "@/context/AuthProvider";
import { getTechniqueById } from "@/data/techniques";
import { useSessionStore } from "@/store/useSessionStore";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertTriangle,
  ArrowLeft,
  Lock,
  ShieldAlert,
} from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TechniqueDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, loading } = useAuth();
  const userRole = useSessionStore((s) => s.userRole);
  const isPro = userRole === "premium_tier";

  if (!loading && !session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const technique = getTechniqueById(id);

  if (!technique) {
    return (
      <SafeAreaView className="flex-1 bg-mistWhite items-center justify-center">
        <Text className="font-inter text-driftGray">Technique not found.</Text>
      </SafeAreaView>
    );
  }

  const locked = technique.isPremium && !isPro;

  const handleStart = () => {
    router.push(`/(tabs)/breathe?techniqueId=${technique.id}`);
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
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-jakartaBold text-3xl font-bold text-inkNavy mb-1">
          {technique.name}
        </Text>
        <Text className="font-inter text-sm text-driftGray mb-1">
          {technique.tagline}
        </Text>
        <Text className="font-inter text-xs text-skyBlue font-bold uppercase mb-6">
          {technique.intensity} · {technique.rounds} rounds
        </Text>

        {/* Benefits */}
        <Text className="font-jakartaBold text-base font-bold text-inkNavy mb-2">
          Benefits
        </Text>
        <View className="bg-cloudPanel rounded-2xl p-4 border border-hairline mb-6">
          {technique.benefits.map((b, i) => (
            <Text
              key={i}
              className="font-inter text-sm text-inkNavy mb-1 last:mb-0"
            >
              • {b}
            </Text>
          ))}
        </View>

        {/* How to */}
        <Text className="font-jakartaBold text-base font-bold text-inkNavy mb-2">
          How to Practice
        </Text>
        <View className="bg-cloudPanel rounded-2xl p-4 border border-hairline mb-6">
          {technique.howTo.map((step, i) => (
            <Text
              key={i}
              className="font-inter text-sm text-inkNavy mb-2 last:mb-0"
            >
              {i + 1}. {step}
            </Text>
          ))}
        </View>

        {/* Precautions */}
        <View className="flex-row items-center mb-2">
          <ShieldAlert size={16} color="#3E7EFF" />
          <Text className="font-jakartaBold text-base font-bold text-inkNavy ml-2">
            Precautions
          </Text>
        </View>
        <View className="bg-skyBlue/5 rounded-2xl p-4 border border-skyBlue/20 mb-6">
          {technique.precautions.map((p, i) => (
            <Text
              key={i}
              className="font-inter text-sm text-inkNavy mb-2 last:mb-0"
            >
              • {p}
            </Text>
          ))}
        </View>

        {/* Warnings */}
        <View className="flex-row items-center mb-2">
          <AlertTriangle size={16} color="#FF7A59" />
          <Text className="font-jakartaBold text-base font-bold text-inkNavy ml-2">
            Warnings
          </Text>
        </View>
        <View className="bg-emberCoral/5 rounded-2xl p-4 border border-emberCoral/20">
          {technique.warnings.map((w, i) => (
            <Text
              key={i}
              className="font-inter text-sm text-inkNavy mb-2 last:mb-0"
            >
              • {w}
            </Text>
          ))}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View className="absolute bottom-0 left-0 right-0 px-6 border-hairline mb-16">
        {locked ? (
          <Pressable
            onPress={() => router.push("/(tabs)/profile")}
            className="bg-duskViolet rounded-2xl py-4 items-center flex-row justify-center"
          >
            <Lock size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text className="font-jakartaBold text-base font-bold text-cloudPanel">
              Upgrade to Pro to Unlock
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleStart}
            className="bg-skyBlue rounded-2xl py-4 items-center"
          >
            <Text className="font-jakartaBold text-base font-bold text-cloudPanel">
              Start Session
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
