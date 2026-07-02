import { SafeAreaView } from "@/components/SafeAreaview";
import { useSessionStore } from "@/store/useSessionStore";
import { Clock, Flame, History } from "lucide-react-native";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

export default function ProfileScreen() {
  const sessions = useSessionStore((state) => state.sessions);
  const currentStreak = useSessionStore((state) => state.currentStreak);
  const clearHistory = useSessionStore((state) => state.clearHistory);

  const totalSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalMinutes = Math.floor(totalSeconds / 60);

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

  return (
    <SafeAreaView
      className="flex-1 bg-obsidianDark"
      edges={["top", "left", "right"]}
    >
      <ScrollView
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

        {/* Stats Cards */}
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
            <Text className="font-jakarta text-3xl font-bold text-pureOxygen mt-2">
              {totalMinutes}m
            </Text>
            <Text className="font-inter text-xs text-mutedEther uppercase mt-1">
              Total Time
            </Text>
          </View>
        </View>

        {/* History Header */}
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

        {/* History List */}
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
