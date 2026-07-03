import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Home, User, Wind } from "lucide-react-native";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

// Custom Clean Tab Item with Active Background Glow
const TabItem = ({ isFocused, label, iconName, onPress }: any) => {
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(isFocused ? 1.1 : 1, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
    };
  });

  const animatedBgStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isFocused ? 1 : 0, { duration: 250 }),
      transform: [{ scale: withSpring(isFocused ? 1 : 0.8, { damping: 20 }) }],
    };
  });

  const icons: Record<string, any> = {
    index: Home,
    breathe: Wind,
    profile: User,
  };
  const Icon = icons[iconName];

  const color = isFocused ? "#3E7EFF" : "#77879B";

  return (
    <Pressable onPress={onPress} style={styles.tabItem}>
      <View style={styles.contentWrapper}>
        <Animated.View style={[styles.activeBackground, animatedBgStyle]} />
        <Animated.View style={animatedIconStyle}>
          <Icon size={24} color={color} strokeWidth={1.8} />
        </Animated.View>
        <Text style={[styles.tabLabel, { color: color }]}>{label}</Text>
      </View>
    </Pressable>
  );
};

// The Custom Floating Glass Tab Bar
const CustomTabBar = ({ state, navigation }: any) => {
  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={80} tint="light" style={styles.blurView}>
        <View style={styles.tabBarInner}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;

            const config: Record<string, { label: string; icon: string }> = {
              index: { label: "Home", icon: "index" },
              breathe: { label: "Breathe", icon: "breathe" },
              profile: { label: "Profile", icon: "profile" },
            };

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabItem
                key={route.key}
                isFocused={isFocused}
                label={config[route.name].label}
                iconName={config[route.name].icon}
                onPress={onPress}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="breathe" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 25,
    left: 15,
    right: 15,
    height: 70,
    borderRadius: 28,
    shadowColor: "#16202E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  blurView: {
    flex: 1,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(22, 32, 46, 0.06)",
  },
  tabBarInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    backgroundColor:
      Platform.OS === "android" ? "rgba(255, 255, 255, 0.85)" : "transparent",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  // FIX: Added fixed width and height so all pills are identical in size
  contentWrapper: {
    width: 95,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
  },
  activeBackground: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 24,
    backgroundColor: "rgba(62, 126, 255, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(62, 126, 255, 0.22)",
  },
  tabLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    marginTop: 4,
  },
});
