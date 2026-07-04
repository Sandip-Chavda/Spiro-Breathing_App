import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { EyeOff, Lock, Mail, Wind } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    const { data, error } =
      mode === "signIn"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (mode === "signUp" && !data.session) {
      setError("Check your email to confirm your account, then sign in.");
      setMode("signIn");
      return;
    }

    router.replace("/(tabs)");
  };

  return (
    <LinearGradient
      colors={["#F6F8FB", "#E9EFFC", "#DCE7FF"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={{ flex: 1 }}
        edges={["top", "left", "right", "bottom"]}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
          >
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 28,
                paddingTop: 20,
                paddingBottom: 40,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Top row: badge + toggle pill */}
              <View className="flex-row items-center justify-between mb-10">
                <View
                  className="w-11 h-11 rounded-full bg-skyBlue items-center justify-center"
                  style={{
                    shadowColor: "#3E7EFF",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 5,
                  }}
                >
                  <Wind size={20} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <Pressable
                  onPress={() => {
                    setError("");
                    setMode(mode === "signIn" ? "signUp" : "signIn");
                  }}
                  className="bg-cloudPanel border border-hairline rounded-full px-4 py-2"
                >
                  <Text className="font-jakartaBold text-xs font-bold text-inkNavy">
                    {mode === "signIn" ? "Sign Up" : "Sign In"}
                  </Text>
                </Pressable>
              </View>

              {/* Decorative cluster — echoes the reference's floating shapes,
                  using our own inhale/exhale/hold palette instead of random color */}
              <View style={{ height: 90, marginBottom: 24 }}>
                <View
                  style={{
                    position: "absolute",
                    left: 8,
                    top: 10,
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: "#3E7EFF20",
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    left: 70,
                    top: 0,
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    backgroundColor: "#FF7A5925",
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    left: 40,
                    top: 50,
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: "#7C6FEF22",
                  }}
                />
              </View>

              {/* Headline */}
              <Text className="font-jakartaBold text-4xl font-bold text-inkNavy mb-2">
                {mode === "signIn" ? "Sign in" : "Join Spiro"}
              </Text>
              <Text className="font-inter text-sm text-driftGray mb-10">
                {mode === "signIn"
                  ? "Enter your details to proceed further"
                  : "Create an account to start breathing"}
              </Text>

              {/* Boxed fields, label above, trailing icon — matches reference */}
              <View className="gap-5 mb-8">
                <View>
                  <Text className="font-inter text-xs text-driftGray uppercase mb-2 ml-1">
                    Email
                  </Text>
                  <View className="flex-row items-center bg-cloudPanel border border-hairline rounded-2xl px-4">
                    <TextInput
                      className="flex-1 py-4 font-jakarta text-base text-inkNavy"
                      placeholder="you@example.com"
                      placeholderTextColor="#B8C2D1"
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                    />
                    <Mail size={18} color="#77879B" />
                  </View>
                </View>

                <View>
                  <Text className="font-inter text-xs text-driftGray uppercase mb-2 ml-1">
                    Password
                  </Text>
                  <View className="flex-row items-center bg-cloudPanel border border-hairline rounded-2xl px-4">
                    <TextInput
                      className="flex-1 py-4 font-jakarta text-base text-inkNavy"
                      placeholder="••••••••"
                      placeholderTextColor="#B8C2D1"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      value={password}
                      onChangeText={setPassword}
                    />
                    <Pressable
                      onPress={() => setShowPassword((v) => !v)}
                      hitSlop={10}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color="#77879B" />
                      ) : (
                        <Lock size={18} color="#77879B" />
                      )}
                    </Pressable>
                  </View>
                </View>
              </View>

              {error ? (
                <Text className="font-inter text-xs text-emberCoral mb-5 ml-1">
                  {error}
                </Text>
              ) : null}

              <Pressable
                onPress={handleSubmit}
                disabled={loading || !email || !password}
                className="bg-skyBlue rounded-full py-5 items-center"
                style={{
                  opacity: loading || !email || !password ? 0.5 : 1,
                  shadowColor: "#3E7EFF",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.25,
                  shadowRadius: 16,
                  elevation: 6,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-jakartaBold text-base font-bold text-cloudPanel">
                    {mode === "signIn" ? "Sign In" : "Sign Up"}
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </LinearGradient>
  );
}
