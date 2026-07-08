import { ChevronRight } from "lucide-react-native";
import { Pressable, Switch, Text, View } from "react-native";

interface Props {
  icon: React.ComponentType<any>;
  label: string;
  rightLabel?: string;
  onPress?: () => void;
  destructive?: boolean;
  isLast?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
}

export default function SettingsRow({
  icon: Icon,
  label,
  rightLabel,
  onPress,
  destructive,
  isLast,
  toggleValue,
  onToggleChange,
}: Props) {
  const isToggle = toggleValue !== undefined;

  const content = (
    <>
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
      {isToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggleChange}
          trackColor={{ false: "#E3E9F1", true: "#3E7EFF" }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <>
          {rightLabel && (
            <Text className="font-inter text-xs text-driftGray mr-1">
              {rightLabel}
            </Text>
          )}
          <ChevronRight size={16} color="#B8C2D1" />
        </>
      )}
    </>
  );

  if (isToggle) {
    return (
      <View
        className={`flex-row items-center px-4 py-3.5 ${!isLast ? "border-b border-hairline" : ""}`}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-4 py-3.5 ${!isLast ? "border-b border-hairline" : ""}`}
    >
      {content}
    </Pressable>
  );
}
