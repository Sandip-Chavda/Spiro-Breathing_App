import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen() {
  const router = useRouter();

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
          Privacy Policy
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        <Text className="font-inter text-xs text-driftGray mb-6">
          Last updated: 7 / 06 /2026
        </Text>

        <Text className="font-jakartaBold text-base font-bold text-inkNavy mb-2">
          Information We Collect
        </Text>
        <Text className="font-inter text-sm text-inkNavy mb-6 leading-5">
          When you create an account, we collect your email address and the name
          you provide. We store your breathing session history, streaks, and
          custom routines to provide the app's core features.
        </Text>

        <Text className="font-jakartaBold text-base font-bold text-inkNavy mb-2">
          How We Use Your Information
        </Text>
        <Text className="font-inter text-sm text-inkNavy mb-6 leading-5">
          Your data is used solely to operate Spiro's features — tracking your
          consistency, syncing your data across devices, and managing your
          subscription status. We do not sell your personal data to third
          parties.
        </Text>

        <Text className="font-jakartaBold text-base font-bold text-inkNavy mb-2">
          Third-Party Services
        </Text>
        <Text className="font-inter text-sm text-inkNavy mb-6 leading-5">
          We use Supabase for authentication and data storage. [If/when added:
          RevenueCat and Google Play Billing for subscription processing.] These
          providers process data on our behalf under their own privacy and
          security terms.
        </Text>

        <Text className="font-jakartaBold text-base font-bold text-inkNavy mb-2">
          Data Deletion
        </Text>
        <Text className="font-inter text-sm text-inkNavy mb-6 leading-5">
          You can permanently delete your account and all associated data at any
          time from Profile → Danger Zone. This action is immediate and
          irreversible.
        </Text>

        <Text className="font-jakartaBold text-base font-bold text-inkNavy mb-2">
          Children's Privacy
        </Text>
        <Text className="font-inter text-sm text-inkNavy mb-6 leading-5">
          Spiro is not directed at children under 13, and we do not knowingly
          collect data from them.
        </Text>

        <Text className="font-jakartaBold text-base font-bold text-inkNavy mb-2">
          Contact
        </Text>
        <Text className="font-inter text-sm text-inkNavy leading-5">
          Questions about this policy can be sent to{" "}
          <Text className="text-skyBlue">cylonescorpion@gmail.com.</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
