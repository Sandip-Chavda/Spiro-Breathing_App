import { useAuth } from "@/context/AuthProvider";
import { getTechniqueById } from "@/data/techniques";
import { useSessionStore } from "@/store/useSessionStore";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Crown,
  ShieldAlert,
} from "lucide-react-native";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function TechniqueDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <SafeAreaView className="flex-1 bg-mistWhite" edges={["left", "right"]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image — full bleed under the status bar, back button floats over it */}
        <ImageBackground
          source={{ uri: technique.imageUrl }}
          style={{ width: "100%", height: 270 + insets.top }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["rgba(22,32,46,0.35)", "rgba(22,32,46,0)"]}
            style={{ height: insets.top + 60, justifyContent: "flex-end" }}
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={{
                marginLeft: 20,
                marginBottom: 12,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(22,32,46,0.4)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </Pressable>
          </LinearGradient>
        </ImageBackground>

        <View style={{ padding: 24 }}>
          <Text className="font-jakartaBold text-3xl font-bold text-inkNavy mb-1">
            {technique.name}
          </Text>
          <Text className="font-inter text-sm text-driftGray mb-1">
            {technique.tagline}
          </Text>
          <Text className="font-inter text-xs text-skyBlue font-bold uppercase mb-4">
            {technique.intensity} · {technique.rounds} rounds
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-6">
            {technique.goodFor.map((tag) => (
              <View key={tag} className="bg-skyBlue/10 rounded-full px-3 py-1">
                <Text className="font-inter text-xs text-skyBlue font-bold">
                  {tag}
                </Text>
              </View>
            ))}
          </View>

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
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-6  border-hairline">
        {locked ? (
          // <Pressable
          //   onPress={() => router.push("/upgrade")}
          //   className="bg-duskViolet rounded-2xl py-4 items-center flex-row justify-center"
          // >
          //   <Lock size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          //   <Text className="font-jakartaBold text-base font-bold text-cloudPanel">
          //     Upgrade to Pro to Unlock
          //   </Text>
          // </Pressable>

          <Pressable
            onPress={() => router.push("/upgrade")}
            className="flex-row items-center px-4 py-4 bg-skyBlue border-b border-hairline rounded-2xl"
          >
            <View className="w-8 h-8 rounded-lg items-center justify-center mr-3">
              <Crown size={16} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <Text className="font-jakartaBold text-base font-bold text-white flex-1">
              Upgrade to Premium
            </Text>
            <View className="bg-skyBlue rounded-full px-2.5 py-1 mr-2">
              <Text className="font-jakartaBold text-[10px] font-bold text-cloudPanel">
                PRO
              </Text>
            </View>
            <ChevronRight size={16} color="#ffffff" />
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
