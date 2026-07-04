import { SafeAreaView } from "@/components/SafeAreaView";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSessionStore";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Clock,
  Flame,
  History,
  Lock,
  LogOut,
} from "lucide-react-native";
import { useMemo } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ContributionGraph } from "react-native-chart-kit/v2";

export default function ProfileScreen() {
  const sessions = useSessionStore((state) => state.sessions);
  const currentStreak = useSessionStore((state) => state.currentStreak);
  const deleteSession = useSessionStore((state) => state.deleteSession);
  const userRole = useSessionStore((state) => state.userRole);
  const isPro = useSessionStore((state) => state.userRole) === "premium_tier";
  const upgradeToPro = useSessionStore((state) => state.upgradeToPro);
  const router = useRouter();

  const dummyHeatmapValues = useMemo(() => {
    const today = new Date();
    const data = [];
    for (let i = 0; i < 105; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      data.push({
        date: date.toISOString().slice(0, 10),
        count: Math.floor(Math.random() * 15),
      });
    }
    return data;
  }, []);

  const totalSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);

  const formatTotalTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) return `${hrs} hr ${mins}min ${secs}sec`;
    if (mins > 0) return `${mins}min ${secs}sec`;
    return `${secs}sec`;
  };

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return (
      date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " • " +
      date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    );
  };

  const heatmapValues = useMemo(() => {
    const map = new Map<string, number>();

    sessions.forEach((session) => {
      const date = session.completedAt.split("T")[0];
      const minutes = Math.round(session.durationSeconds / 60);
      map.set(date, (map.get(date) ?? 0) + minutes);
    });

    return Array.from(map.entries()).map(([date, count]) => ({
      date,
      count: Math.round(count),
    }));
  }, [sessions]);

  const chartWidth = Dimensions.get("window").width - 72;

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) console.warn("Sign out failed:", error.message);
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-mistWhite"
      edges={["top", "left", "right"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          paddingTop: Platform.OS === "android" ? 40 : 20,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-jakartaBold text-3xl font-bold text-inkNavy">
          Your Progress
        </Text>
        <Text className="font-inter text-sm text-driftGray mt-1 mb-8">
          Track your parasympathetic consistency.
        </Text>

        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-cloudPanel rounded-2xl p-5 border border-hairline items-center">
            <Flame size={28} color="#FF7A59" strokeWidth={2.5} />
            <Text className="font-jakartaBold text-3xl font-bold text-inkNavy mt-2">
              {currentStreak}
            </Text>
            <Text className="font-inter text-xs text-driftGray uppercase mt-1">
              Day Streak
            </Text>
          </View>
          <View className="flex-1 bg-cloudPanel rounded-2xl p-5 border border-hairline items-center">
            <Clock size={28} color="#7C6FEF" strokeWidth={2.5} />
            <Text className="font-jakartaBold text-lg font-bold text-inkNavy mt-2 text-center">
              {formatTotalTime(totalSeconds)}
            </Text>
            <Text className="font-inter text-xs text-driftGray uppercase mt-1">
              Total Time
            </Text>
          </View>
        </View>

        <Text className="font-jakartaBold text-lg font-bold text-inkNavy mb-3">
          Consistency Graph
        </Text>
        <View className="bg-cloudPanel rounded-2xl p-4 border border-hairline mb-8 relative">
          <ContributionGraph
            values={isPro ? heatmapValues : dummyHeatmapValues}
            endDate={new Date()}
            numDays={105}
            width={chartWidth}
            height={170}
            weekStartsOn={1}
            cellSize={12}
            gutterSize={4}
            showMonthLabels
            showWeekdayLabels
            emptyColor="#EDF1F7"
            colors={["#DCE7FF", "#AEC7FF", "#6FA0FF", "#3E7EFF"]}
            onDayPress={(day) => console.log(day)}
          />

          {!isPro && (
            <View className="absolute inset-0 rounded-2xl overflow-hidden">
              <BlurView
                intensity={90}
                tint="systemChromeMaterialLight"
                className="flex-1 items-center justify-center p-8"
              >
                <Lock size={32} color="#3E7EFF" />
                <Text className="font-jakartaBold text-lg font-bold text-inkNavy mt-4 mb-2">
                  Unlock Your Progress
                </Text>
                <Text className="font-inter text-sm text-driftGray text-center mb-6">
                  Upgrade to Pro to track your daily consistency and session
                  history.
                </Text>
                <Pressable
                  onPress={() => router.push("/upgrade")}
                  className="bg-skyBlue rounded-xl py-3 px-6"
                >
                  <Text className="font-jakartaBold text-base font-bold text-cloudPanel">
                    Upgrade to Pro
                  </Text>
                </Pressable>
              </BlurView>
            </View>
          )}

          {isPro && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: "#77879B", marginRight: 8 }}>
                Less
              </Text>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  backgroundColor: "#EDF1F7",
                  marginRight: 4,
                }}
              />
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  backgroundColor: "#DCE7FF",
                  marginRight: 4,
                }}
              />
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  backgroundColor: "#6FA0FF",
                  marginRight: 4,
                }}
              />
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  backgroundColor: "#3E7EFF",
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: 12, color: "#77879B" }}>More</Text>
            </View>
          )}
        </View>

        {!isPro && (
          <Pressable
            onPress={() => router.push("/upgrade")}
            className="bg-duskViolet rounded-2xl py-4 px-8 w-full items-center mb-8"
          >
            <Text className="font-jakartaBold text-lg font-bold text-cloudPanel">
              View Plans
            </Text>
          </Pressable>
        )}

        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <History size={18} color="#77879B" strokeWidth={2.5} />
            <Text className="font-jakartaBold text-lg font-bold text-inkNavy ml-2">
              History Log
            </Text>
          </View>
          {sessions.length > 3 && (
            <Pressable
              onPress={() => router.push("/history")}
              className="flex-row items-center"
            >
              <Text className="font-jakartaBold text-xs font-bold text-skyBlue">
                View All
              </Text>
              <ChevronRight size={14} color="#3E7EFF" />
            </Pressable>
          )}
        </View>

        {sessions.length === 0 ? (
          <View className="bg-cloudPanel rounded-2xl p-8 border border-hairline items-center">
            <Text className="font-inter text-driftGray text-center">
              No sessions logged yet. Complete a breathing cycle to see your
              history here!
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {sessions.slice(0, 3).map((session) => (
              <View
                key={session.id}
                className="bg-cloudPanel rounded-2xl p-4 border border-hairline flex-row justify-between items-center"
              >
                <View className="flex-1">
                  <Text className="font-jakartaBold text-base font-bold text-inkNavy">
                    {session.patternName}
                  </Text>
                  <Text className="font-inter text-xs text-driftGray mt-1">
                    {formatDate(session.completedAt)}
                  </Text>
                </View>
                <View className="bg-mistWhite px-3 py-2 rounded-lg mr-3">
                  <Text className="font-jakartaBold text-sm font-bold text-skyBlue">
                    {formatSessionTime(session.durationSeconds)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
        <Pressable
          onPress={handleSignOut}
          className="flex-row justify-center gap-2 mt-8 bg-skyBlue rounded-2xl py-4 items-center"
          style={{
            shadowColor: "#3E7EFF",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <LogOut size={16} color="#ffffff" />
          <Text className="font-jakartaBold text-base font-bold text-cloudPanel">
            Sign Out
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
