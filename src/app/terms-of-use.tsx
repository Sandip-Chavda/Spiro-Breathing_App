import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsOfUseScreen() {
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
          Terms of Use
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        <Text className="font-inter text-xs text-driftGray mb-6">
          Last updated: 7/ 06 /2026
        </Text>

        <Text className="font-jakartaBold text-base font-bold text-inkNavy mb-2">
          Not Medical Advice
        </Text>
        <Text className="font-inter text-sm text-inkNavy mb-6 leading-5">
          Spiro provides breathing exercises for general wellness purposes only.
          It is not a substitute for professional medical advice, diagnosis, or
          treatment. Consult a doctor before use if you have a cardiovascular,
          respiratory, or panic disorder, or are pregnant.
        </Text>

        <Text className="font-jakartaBold text-base font-bold text-inkNavy mb-2">
          Subscriptions
        </Text>
        <Text className="font-inter text-sm text-inkNavy mb-6 leading-5">
          Spiro Pro is offered as a monthly or yearly auto-renewing
          subscription, billed through Google Play. You can manage or cancel
          your subscription at any time through your Google Play account
          settings.
        </Text>

        <Text className="font-jakartaBold text-base font-bold text-inkNavy mb-2">
          Account Termination
        </Text>
        <Text className="font-inter text-sm text-inkNavy mb-6 leading-5">
          You may delete your account at any time from within the app. We
          reserve the right to suspend accounts that violate these terms.
        </Text>

        <Text className="font-jakartaBold text-base font-bold text-inkNavy mb-2">
          Limitation of Liability
        </Text>
        <Text className="font-inter text-sm text-inkNavy leading-5">
          Spiro is provided "as is." We are not liable for any adverse effects
          resulting from use of the breathing techniques provided, beyond what
          is required by applicable law.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
