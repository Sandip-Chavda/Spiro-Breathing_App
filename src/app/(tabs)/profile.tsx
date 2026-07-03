import { SafeAreaView } from "@/components/SafeAreaView";
import { useSessionStore } from "@/store/useSessionStore";
import { Clock, Flame, History } from "lucide-react-native";
import { useMemo } from "react";
import {
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
  const clearHistory = useSessionStore((state) => state.clearHistory);

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

      // convert seconds → minutes (keep precision)
      const minutes = Math.round(session.durationSeconds / 60);
      map.set(date, (map.get(date) ?? 0) + minutes);
    });

    return Array.from(map.entries()).map(([date, count]) => ({
      date,
      // round ONCE here (important for chart stability)
      count: Math.round(count),
    }));
  }, [sessions]);

  // const chartWidth = Dimensions.get("window").width - 80;
  const chartWidth = Dimensions.get("window").width - 72;

  return (
    <SafeAreaView
      className="flex-1 bg-obsidianDark"
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
        <Text className="font-jakarta text-3xl font-bold text-pureOxygen">
          Your Progress
        </Text>
        <Text className="font-inter text-sm text-mutedEther mt-1 mb-8">
          Track your parasympathetic consistency.
        </Text>

        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-sleekSlate rounded-2xl p-5 border border-mutedEther/10 items-center">
            <Flame size={28} color="#00E5C9" strokeWidth={2.5} />
            <Text className="font-jakarta text-3xl font-bold text-pureOxygen mt-2">
              {currentStreak}
            </Text>
            <Text className="font-inter text-xs text-mutedEther uppercase mt-1">
              Day Streak
            </Text>
          </View>
          <View className="flex-1 bg-sleekSlate rounded-2xl p-5 border border-mutedEther/10 items-center">
            <Clock size={28} color="#5F69FF" strokeWidth={2.5} />
            <Text className="font-jakarta text-lg font-bold text-pureOxygen mt-2 text-center">
              {formatTotalTime(totalSeconds)}
            </Text>
            <Text className="font-inter text-xs text-mutedEther uppercase mt-1">
              Total Time
            </Text>
          </View>
        </View>

        <Text className="font-jakarta text-lg font-bold text-pureOxygen mb-3">
          Consistency Graph
        </Text>
        <View className="bg-sleekSlate rounded-2xl p-4 border border-mutedEther/10 mb-8">
          <ContributionGraph
            values={heatmapValues}
            endDate={new Date()}
            numDays={105}
            width={chartWidth}
            height={170}
            weekStartsOn={1}
            cellSize={12}
            gutterSize={4}
            showMonthLabels
            showWeekdayLabels
            theme="dark"
            emptyColor="#1E2632"
            colors={["#0E4442", "#11756F", "#00B8A7", "#00E5C9"]}
            onDayPress={(day) => console.log(day)}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Text style={{ fontSize: 12, color: "#8A99AD", marginRight: 8 }}>
              Less
            </Text>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: "#1E2632",
                marginRight: 4,
              }}
            />
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: "#003833",
                marginRight: 4,
              }}
            />
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: "#00756A",
                marginRight: 4,
              }}
            />
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: "#00E5C9",
                marginRight: 8,
              }}
            />
            <Text style={{ fontSize: 12, color: "#8A99AD" }}>More</Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <History size={18} color="#8A99AD" strokeWidth={2.5} />
            <Text className="font-jakarta text-lg font-bold text-pureOxygen ml-2">
              History Log
            </Text>
          </View>
          {sessions.length > 0 && (
            <Pressable onPress={clearHistory}>
              <Text className="font-inter text-xs text-mutedEther underline">
                Clear All
              </Text>
            </Pressable>
          )}
        </View>

        {sessions.length === 0 ? (
          <View className="bg-sleekSlate rounded-2xl p-8 border border-mutedEther/10 items-center">
            <Text className="font-inter text-mutedEther text-center">
              No sessions logged yet. Complete a breathing cycle to see your
              history here!
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {sessions.map((session) => (
              <View
                key={session.id}
                className="bg-sleekSlate rounded-2xl p-4 border border-mutedEther/10 flex-row justify-between items-center"
              >
                <View>
                  <Text className="font-jakarta text-base font-bold text-pureOxygen">
                    {session.patternName}
                  </Text>
                  <Text className="font-inter text-xs text-mutedEther mt-1">
                    {formatDate(session.completedAt)}
                  </Text>
                </View>
                <View className="bg-obsidianDark px-3 py-2 rounded-lg">
                  <Text className="font-jakarta text-sm font-bold text-spiroCyan">
                    {formatSessionTime(session.durationSeconds)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
