import { SafeAreaView } from "@/components/SafeAreaView";
import { useAuth } from "@/context/AuthProvider";
import { useSessionStore } from "@/store/useSessionStore";
import { Redirect, useRouter } from "expo-router";
import { Wind } from "lucide-react-native";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function NameSetupScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const setFullName = useSessionStore((s) => s.setFullName);
  const [name, setName] = useState("");

  if (!loading && !session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const handleContinue = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setFullName(trimmed);
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-mistWhite">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-center px-8"
        >
          <View className="w-14 h-14 rounded-full bg-skyBlue items-center justify-center mb-8">
            <Wind size={24} color="#FFFFFF" strokeWidth={2.5} />
          </View>

          <Text className="font-jakartaBold text-3xl font-bold text-inkNavy mb-2">
            What should we call you?
          </Text>
          <Text className="font-inter text-sm text-driftGray mb-10">
            Just for a bit of personal touch around the app.
          </Text>

          <TextInput
            className="font-jakarta text-lg text-inkNavy pb-3 border-b border-hairline mb-10"
            placeholder="Your name"
            placeholderTextColor="#B8C2D1"
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Pressable
            onPress={handleContinue}
            disabled={!name.trim()}
            className="bg-skyBlue rounded-full py-4 items-center"
            style={{ opacity: name.trim() ? 1 : 0.5 }}
          >
            <Text className="font-jakartaBold text-base font-bold text-cloudPanel">
              Continue
            </Text>
          </Pressable>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
