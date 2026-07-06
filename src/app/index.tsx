import { useAuth } from "@/context/AuthProvider";
import { useSessionStore } from "@/store/useSessionStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
  const { session, loading } = useAuth();
  const fullName = useSessionStore((s) => s.fullName);
  const profileHydrated = useSessionStore((s) => s.profileHydrated);

  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("hasSeenOnboarding").then((value) => {
      setHasSeenOnboarding(value === "true");
      setOnboardingChecked(true);
    });
  }, []);

  if (loading || !onboardingChecked) {
    return null; // splash screen still visible
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Wait for the cloud profile to actually load before deciding —
  // otherwise a fresh sign-in briefly shows stale data from a previous account.
  if (!profileHydrated) {
    return null;
  }

  if (!fullName) {
    return <Redirect href="/name-setup" />;
  }

  return <Redirect href="/(tabs)" />;
}
