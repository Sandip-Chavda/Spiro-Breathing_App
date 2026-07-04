import { useAuth } from "@/context/AuthProvider";
import { useSessionStore } from "@/store/useSessionStore";
import { Redirect, useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  Flame,
  Infinity as InfinityIcon,
  Sparkles,
  Wind,
} from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BENEFITS = [
  { icon: InfinityIcon, text: "Unlimited daily sessions — no daily lock" },
  { icon: Wind, text: "All premium techniques, including Deep Calm" },
  { icon: Sparkles, text: "Unlimited custom routines with decimal precision" },
  { icon: Flame, text: "Full consistency graph & session history" },
];

export default function UpgradeScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const userRole = useSessionStore((s) => s.userRole);
  const upgradeToPro = useSessionStore((s) => s.upgradeToPro);
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");

  if (!loading && !session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const isPro = userRole === "premium_tier";

  return (
    <SafeAreaView
      className="flex-1 bg-mistWhite"
      edges={["top", "left", "right"]}
    >
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <ArrowLeft size={22} color="#16202E" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-8">
          <Image
            source={require("../../assets/icon2.png")}
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              marginBottom: 16,
            }}
            resizeMode="contain"
          />
          <Text className="font-jakartaBold text-3xl font-bold text-inkNavy text-center">
            {isPro ? "You're on Spiro Pro" : "Unlock Spiro Pro"}
          </Text>
          <Text className="font-inter text-sm text-driftGray text-center mt-2">
            {isPro
              ? "Thanks for supporting Spiro — enjoy unlimited breathing."
              : "Unlimited sessions, every technique, full analytics."}
          </Text>
        </View>

        {!isPro && (
          <>
            {/* Plan toggle */}
            <View className="flex-row bg-cloudPanel border border-hairline rounded-2xl p-1.5 mb-6">
              <Pressable
                onPress={() => setPlan("monthly")}
                className={`flex-1 py-3 rounded-xl items-center ${plan === "monthly" ? "bg-skyBlue" : ""}`}
              >
                <Text
                  className={`font-jakartaBold text-sm font-bold ${plan === "monthly" ? "text-cloudPanel" : "text-driftGray"}`}
                >
                  Monthly
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setPlan("yearly")}
                className={`flex-1 py-3 rounded-xl items-center ${plan === "yearly" ? "bg-skyBlue" : ""}`}
              >
                <Text
                  className={`font-jakartaBold text-sm font-bold ${plan === "yearly" ? "text-cloudPanel" : "text-driftGray"}`}
                >
                  Yearly
                </Text>
              </Pressable>
            </View>

            {/* Price card */}
            <View className="bg-cloudPanel border border-hairline rounded-3xl p-6 mb-8 items-center">
              <Text className="font-jakartaBold text-4xl font-bold text-inkNavy">
                {plan === "monthly" ? "₹49" : "₹499"}
                <Text className="font-inter text-base text-driftGray">
                  {" "}
                  / {plan === "monthly" ? "month" : "year"}
                </Text>
              </Text>
              {plan === "yearly" && (
                <View className="bg-emberCoral/10 rounded-full px-3 py-1 mt-3">
                  <Text className="font-jakartaBold text-xs font-bold text-emberCoral">
                    Save ~15% vs monthly
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Benefits */}
        <Text className="font-jakarta text-sm text-driftGray uppercase mb-3">
          What you get
        </Text>
        <View className="gap-3 mb-8">
          {BENEFITS.map((b, i) => (
            <View
              key={i}
              className="bg-cloudPanel border border-hairline rounded-2xl p-4 flex-row items-center"
            >
              <View className="w-10 h-10 rounded-full bg-skyBlue/10 items-center justify-center mr-4">
                <b.icon size={18} color="#3E7EFF" strokeWidth={2.5} />
              </View>
              <Text className="font-inter text-sm text-inkNavy flex-1">
                {b.text}
              </Text>
              <Check size={18} color="#3E7EFF" />
            </View>
          ))}
        </View>

        {!isPro && (
          <Text className="font-inter text-xs text-driftGray text-center mb-4">
            Payment isn't live yet — this button is a placeholder for testing
            Pro features while we finish setting up billing.
          </Text>
        )}
      </ScrollView>

      {!isPro && (
        <View className="absolute bottom-0 left-0 right-0 px-6 py-4  border-hairline mb-14">
          <Pressable
            onPress={upgradeToPro}
            className="bg-skyBlue rounded-2xl py-4 items-center"
            style={{
              shadowColor: "#3E7EFF",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <Text className="font-jakartaBold text-base font-bold text-cloudPanel">
              Continue with {plan === "monthly" ? "Monthly" : "Yearly"} (Test)
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
