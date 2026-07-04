import { useAuth } from "@/context/AuthProvider";
import { Redirect } from "expo-router";

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return null; // Splash screen is still visible at this point
  }

  return <Redirect href={session ? "/(tabs)" : "/(auth)/sign-in"} />;
}
