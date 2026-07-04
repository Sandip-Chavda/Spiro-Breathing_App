import { useAuth } from "@/context/AuthProvider";
import { useSessionStore } from "@/store/useSessionStore";
import { Redirect, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const sessions = useSessionStore((s) => s.sessions);

  if (!loading && !session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDay = (isoString: string) => {
    const date = new Date(isoString);
    return (
      date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }) +
      " • " +
      date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    );
  };

  const formatMonthTotal = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  };

  // Group sessions by "Month Year", preserving newest-first order
  const groupedByMonth = useMemo(() => {
    const groups = new Map<
      string,
      { sessions: typeof sessions; totalSeconds: number }
    >();

    sessions.forEach((s) => {
      const date = new Date(s.completedAt);
      const key = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      if (!groups.has(key)) {
        groups.set(key, { sessions: [], totalSeconds: 0 });
      }
      const group = groups.get(key)!;
      group.sessions.push(s);
      group.totalSeconds += s.durationSeconds;
    });

    return Array.from(groups.entries());
  }, [sessions]);

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
          Full History
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {sessions.length === 0 ? (
          <View className="bg-cloudPanel rounded-2xl p-8 border border-hairline items-center mt-4">
            <Text className="font-inter text-driftGray text-center">
              No sessions logged yet.
            </Text>
          </View>
        ) : (
          groupedByMonth.map(([month, group]) => (
            <View key={month} className="mb-8">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-jakartaBold text-base font-bold text-inkNavy">
                  {month}
                </Text>
                <Text className="font-inter text-xs text-driftGray">
                  {group.sessions.length} session
                  {group.sessions.length > 1 ? "s" : ""} ·{" "}
                  {formatMonthTotal(group.totalSeconds)}
                </Text>
              </View>

              <View className="gap-3">
                {group.sessions.map((s) => (
                  <View
                    key={s.id}
                    className="bg-cloudPanel rounded-2xl p-4 border border-hairline flex-row justify-between items-center"
                  >
                    <View className="flex-1">
                      <Text className="font-jakartaBold text-base font-bold text-inkNavy">
                        {s.patternName}
                      </Text>
                      <Text className="font-inter text-xs text-driftGray mt-1">
                        {formatDay(s.completedAt)}
                      </Text>
                    </View>
                    <View className="bg-mistWhite px-3 py-2 rounded-lg mr-3">
                      <Text className="font-jakartaBold text-sm font-bold text-skyBlue">
                        {formatSessionTime(s.durationSeconds)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
