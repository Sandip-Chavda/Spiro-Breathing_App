import { useSessionStore } from "@/store/useSessionStore";
import { daysBetween, getLocalDateString } from "@/utils/date";
import { useRouter } from "expo-router";
import { AlertTriangle, Flame, Lock } from "lucide-react-native";
import { Alert, Pressable, Text, View } from "react-native";

const FREE_RECOVERY_DAYS = 5;
const COST_PER_EXTRA_DAY = 2;

export default function StreakRecoveryBanner() {
  const router = useRouter();
  const userRole = useSessionStore((s) => s.userRole);
  const currentStreak = useSessionStore((s) => s.currentStreak);
  const lastActiveDate = useSessionStore((s) => s.lastActiveDate);
  const recoverStreak = useSessionStore((s) => s.recoverStreak);

  const isPro = userRole === "premium_tier";

  if (!lastActiveDate || currentStreak <= 0) return null;

  const today = getLocalDateString();
  if (lastActiveDate === today) return null;

  const gap = daysBetween(lastActiveDate, today);
  const missedDays = gap - 1;
  if (missedDays <= 0) return null;

  const extraDays = Math.max(0, missedDays - FREE_RECOVERY_DAYS);
  const cost = extraDays * COST_PER_EXTRA_DAY;

  const handleRecover = () => {
    if (!isPro) {
      router.push("/upgrade");
      return;
    }

    if (cost === 0) {
      Alert.alert(
        "Recover Streak",
        `Recover your ${currentStreak}-day streak? This is free with Pro.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Recover", onPress: recoverStreak },
        ],
      );
      return;
    }

    Alert.alert(
      "Recover Streak",
      `You missed ${missedDays} days. The first ${FREE_RECOVERY_DAYS} are free with Pro — the remaining ${extraDays} cost ₹${COST_PER_EXTRA_DAY} each (₹${cost} total). This is a test charge — real billing isn't live yet.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: `Pay ₹${cost} (Test)`, onPress: recoverStreak },
      ],
    );
  };

  return (
    <View className="bg-emberCoral/5 border border-emberCoral/20 rounded-2xl p-4 mb-6 flex-row items-start">
      <View className="w-10 h-10 rounded-full bg-emberCoral/15 items-center justify-center mr-3">
        <AlertTriangle size={18} color="#FF7A59" strokeWidth={2.5} />
      </View>
      <View className="flex-1">
        <Text className="font-jakartaBold text-sm font-bold text-inkNavy mb-1">
          Your {currentStreak}-day streak is at risk
        </Text>
        <Text className="font-inter text-xs text-driftGray mb-3">
          {missedDays} day{missedDays > 1 ? "s" : ""} missed.{" "}
          {isPro
            ? cost === 0
              ? "Free to recover with Pro."
              : `First ${FREE_RECOVERY_DAYS} days free, ₹${COST_PER_EXTRA_DAY}/day after — ₹${cost} total.`
            : `Recovery requires Pro (up to ${FREE_RECOVERY_DAYS} days free, ₹${COST_PER_EXTRA_DAY}/day beyond that).`}
        </Text>
        <Pressable
          onPress={handleRecover}
          className="bg-emberCoral rounded-xl py-2.5 px-4 self-start flex-row items-center"
        >
          {!isPro && (
            <Lock size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
          )}
          <Flame size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text className="font-jakartaBold text-xs font-bold text-cloudPanel">
            {!isPro
              ? "Upgrade to Recover"
              : cost === 0
                ? "Recover Free"
                : `Recover for ₹${cost}`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
