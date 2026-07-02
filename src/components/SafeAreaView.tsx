import { styled } from "nativewind";
import {
  SafeAreaView as RNSafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";

const StyledSafeAreaView = styled(RNSafeAreaView);

export function SafeAreaView(props: SafeAreaViewProps) {
  return <StyledSafeAreaView {...props} />;
}
