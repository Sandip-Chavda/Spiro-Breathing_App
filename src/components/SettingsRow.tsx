import { ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface Props {
  icon: React.ComponentType<any>;
  label: string;
  rightLabel?: string;
  onPress?: () => void;
  destructive?: boolean;
  isLast?: boolean;
}

export default function SettingsRow({
  icon: Icon,
  label,
  rightLabel,
  onPress,
  destructive,
  isLast,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-4 py-3.5 ${!isLast ? "border-b border-hairline" : ""}`}
    >
      <View
        className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${destructive ? "bg-emberCoral/10" : "bg-skyBlue/10"}`}
      >
        <Icon
          size={16}
          color={destructive ? "#FF7A59" : "#3E7EFF"}
          strokeWidth={2.2}
        />
      </View>
      <Text
        className={`font-inter text-sm flex-1 ${destructive ? "text-emberCoral font-bold" : "text-inkNavy"}`}
      >
        {label}
      </Text>
      {rightLabel && (
        <Text className="font-inter text-xs text-driftGray mr-1">
          {rightLabel}
        </Text>
      )}
      <ChevronRight size={16} color="#B8C2D1" />
    </Pressable>
  );
}
