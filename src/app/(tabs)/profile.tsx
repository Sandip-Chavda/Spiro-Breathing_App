import { SafeAreaView } from "@/components/SafeAreaView";
import SettingsRow from "@/components/SettingsRow";
import StreakRecoveryBanner from "@/components/StreakRecoveryBanner";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSessionStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getLocalDateString } from "@/utils/date";
import { BlurView } from "expo-blur";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  Clock,
  FileText,
  Flame,
  Info,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  Vibrate,
} from "lucide-react-native";
import { useMemo } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { ContributionGraph } from "react-native-chart-kit/v2";

const SUPPORT_EMAIL = "support@yourdomain.com"; // TODO: replace with your real support address

export default function ProfileScreen() {
  const sessions = useSessionStore((state) => state.sessions);
  const currentStreak = useSessionStore((state) => state.currentStreak);
  const userRole = useSessionStore((state) => state.userRole);
  const isPro = useSessionStore((state) => state.userRole) === "premium_tier";
  const fullName = useSessionStore((state) => state.fullName);
  const breathingHapticsEnabled = useSettingsStore(
    (s) => s.breathingHapticsEnabled,
  );
  const setBreathingHapticsEnabled = useSettingsStore(
    (s) => s.setBreathingHapticsEnabled,
  );

  const router = useRouter();

  const dummyHeatmapValues = useMemo(() => {
    const today = new Date();
    const data = [];
    for (let i = 0; i < 105; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      data.push({
        date: getLocalDateString(date),
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

  const heatmapValues = useMemo(() => {
    const map = new Map<string, number>();
    sessions.forEach((session) => {
      const date = getLocalDateString(new Date(session.completedAt));
      const minutes = Math.round(session.durationSeconds / 60);
      map.set(date, (map.get(date) ?? 0) + minutes);
    });
    return Array.from(map.entries()).map(([date, count]) => ({
      date,
      count: Math.round(count),
    }));
  }, [sessions]);

  const chartWidth = Dimensions.get("window").width - 72;
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          const { error } = await supabase.auth.signOut();
          if (error) console.warn("Sign out failed:", error.message);
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This permanently deletes your account and all your data, sessions, streaks, and custom routines. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Are you absolutely sure?",
              "There is no way to recover your account after this.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete Permanently",
                  style: "destructive",
                  onPress: async () => {
                    Haptics.notificationAsync(
                      Haptics.NotificationFeedbackType.Warning,
                    );
                    const { error } = await supabase.rpc("delete_user");
                    if (error) {
                      console.warn("Account deletion failed:", error.message);
                      Alert.alert(
                        "Something went wrong",
                        "Couldn't delete your account. Please try again or contact support.",
                      );
                      return;
                    }
                    await supabase.auth.signOut();
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const handleContactSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Spiro Support`);
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
          paddingTop: Platform.OS === "android" ? 10 : 20,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-jakartaBold text-3xl font-bold text-inkNavy">
          <Text className="text-skyBlue">
            {fullName ? `${fullName.split(" ")[0]}'s ` : "Your"}
          </Text>
          Progress
        </Text>
        <Text className="font-inter text-sm text-driftGray mt-1 mb-8">
          Track your parasympathetic consistency.
        </Text>

        <StreakRecoveryBanner />

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
            className="bg-duskViolet rounded-2xl py-4 px-8 w-full items-center mb-10"
          >
            <Text className="font-jakartaBold text-lg font-bold text-cloudPanel">
              View Plans
            </Text>
          </Pressable>
        )}

        {/* Account */}
        <Text className="font-jakarta text-sm text-driftGray uppercase mb-3">
          Account
        </Text>
        <View className="bg-cloudPanel rounded-2xl border border-hairline mb-6 overflow-hidden">
          <View className="flex-row items-center px-4 py-4 border-b border-hairline">
            <View className="w-11 h-11 rounded-full bg-skyBlue items-center justify-center mr-3">
              <Text className="font-jakartaBold text-base font-bold text-cloudPanel">
                {fullName ? fullName.charAt(0).toUpperCase() : "?"}
              </Text>
            </View>
            <View>
              <Text className="font-jakartaBold text-sm font-bold text-inkNavy">
                {fullName ?? "Spiro User"}
              </Text>
              <Text className="font-inter text-xs text-driftGray mt-0.5">
                {isPro ? "Pro Member" : "Free Member"}
              </Text>
            </View>
          </View>
          <SettingsRow
            icon={LogOut}
            label="Sign Out"
            onPress={handleSignOut}
            isLast
          />
        </View>

        {/* Preferences */}
        <Text className="font-jakarta text-sm text-driftGray uppercase mb-3">
          Preferences
        </Text>
        <View className="bg-cloudPanel rounded-2xl border border-hairline mb-6">
          <View className="flex-row items-center justify-between px-4 py-3.5">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-skyBlue/10 items-center justify-center mr-3">
                <Vibrate size={16} color="#3E7EFF" strokeWidth={2.2} />
              </View>
              <Text className="font-inter text-sm text-inkNavy">
                Breathing Vibration
              </Text>
            </View>
            <Switch
              value={breathingHapticsEnabled}
              onValueChange={setBreathingHapticsEnabled}
              trackColor={{ false: "#E3E9F1", true: "#3E7EFF" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Support & Legal */}
        <Text className="font-jakarta text-sm text-driftGray uppercase mb-3">
          Support & Legal
        </Text>
        <View className="bg-cloudPanel rounded-2xl border border-hairline mb-6 overflow-hidden">
          <SettingsRow
            icon={Mail}
            label="Contact Support"
            onPress={handleContactSupport}
          />
          <SettingsRow
            icon={ShieldCheck}
            label="Privacy Policy"
            onPress={() => router.push("/privacy-policy")}
          />
          <SettingsRow
            icon={FileText}
            label="Terms of Use"
            onPress={() => router.push("/terms-of-use")}
          />
          <SettingsRow
            icon={Info}
            label="App Version"
            rightLabel={appVersion}
            isLast
          />
        </View>

        {/* Danger Zone */}
        <Text className="font-inter text-xs text-emberCoral uppercase mb-3 text-center mt-4">
          Danger Zone
        </Text>
        <Pressable
          onPress={handleDeleteAccount}
          className="flex-row items-center justify-center gap-2 bg-emberCoral/5 border border-emberCoral/20 rounded-2xl py-4"
        >
          <AlertTriangle size={16} color="#FF7A59" />
          <Text className="font-jakartaBold text-sm font-bold text-emberCoral">
            Delete Account
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
