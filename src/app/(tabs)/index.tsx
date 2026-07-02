import {
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

import { SafeAreaView } from "@/components/SafeAreaview";
import { Activity, Heart, Sparkles } from "lucide-react-native";
import { useState } from "react";

export default function DiagnosticsScreen() {
  const [stressLevel, setStressLevel] = useState(5);
  const [moodText, setMoodText] = useState("");

  return (
    <SafeAreaView
      className="flex-1 bg-obsidianDark"
      edges={["top", "left", "right"]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: Platform.OS === "android" ? 40 : 20,
              paddingBottom: 140, // FIX: Large padding to clear the floating tab bar and keyboard
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled" // Allows clicking the button without dismissing keyboard first
          >
            {/* Header */}
            <Text className="font-jakarta text-3xl font-bold text-pureOxygen">
              Diagnostics
            </Text>
            <Text className="font-inter text-sm text-mutedEther mt-1 mb-8">
              Input your current telemetry to generate a routine.
            </Text>

            {/* Stress Level Slider */}
            <View className="bg-sleekSlate rounded-2xl p-5 mb-6 border border-mutedEther/10">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-jakarta text-base text-pureOxygen">
                  Stress Level
                </Text>
                <Text className="font-jakarta text-lg font-bold text-spiroCyan">
                  {stressLevel}/10
                </Text>
              </View>

              <View className="flex-row justify-between items-center mt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <Pressable
                    key={num}
                    onPress={() => setStressLevel(num)}
                    className={`w-6 h-6 rounded-md items-center justify-center ${stressLevel >= num ? "bg-deepKinetic" : "bg-obsidianDark"}`}
                  >
                    <Text
                      className={`font-inter text-xs ${stressLevel >= num ? "text-pureOxygen" : "text-mutedEther"}`}
                    >
                      {num}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Heart Rate Input */}
            <View className="bg-sleekSlate rounded-2xl p-5 mb-6 border border-mutedEther/10">
              <View className="flex-row items-center mb-3">
                <Heart size={20} color="#5F69FF" strokeWidth={2.5} />
                <Text className="font-jakarta text-base text-pureOxygen ml-3">
                  Heart Rate (BPM)
                </Text>
              </View>
              <TextInput
                className="bg-obsidianDark rounded-xl p-4 text-pureOxygen font-inter text-lg"
                keyboardType="numeric"
                placeholder="e.g., 75"
                placeholderTextColor="#8A99AD"
              />
            </View>

            {/* Mood Journal Input */}
            <View className="bg-sleekSlate rounded-2xl p-5 mb-8 border border-mutedEther/10">
              <View className="flex-row items-center mb-3">
                <Activity size={20} color="#00E5C9" strokeWidth={2.5} />
                <Text className="font-jakarta text-base text-pureOxygen ml-3">
                  Emotional Data Log
                </Text>
              </View>
              <TextInput
                className="bg-obsidianDark rounded-xl p-4 text-pureOxygen font-inter text-base min-h-[100px]"
                multiline
                textAlignVertical="top"
                placeholder="Describe how you feel right now..."
                placeholderTextColor="#8A99AD"
                value={moodText}
                onChangeText={setMoodText}
              />
            </View>

            {/* Generate Button */}
            <Pressable className="bg-spiroCyan rounded-2xl py-5 items-center justify-center flex-row active:bg-deepKinetic">
              <Sparkles size={20} color="#0A0D10" strokeWidth={2} />
              <Text className="font-jakarta text-lg font-bold text-obsidianDark ml-2">
                Generate AI Breath Formula
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
