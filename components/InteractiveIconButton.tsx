import React, { useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import RiveView, { RiveViewHandle } from 'rive-react-native';

interface InteractiveIconButtonProps {
  fileName: string; // Name of the .riv file in assets/rive folder
  size?: number;
  onPress?: () => void;
}

export function InteractiveIconButton({
  fileName,
  size = 48,
  onPress,
}: InteractiveIconButtonProps) {
  const riveRef = useRef<RiveViewHandle>(null);

  const handlePress = () => {
    riveRef.current?.fireState('State Machine 1', 'Star Idle');
    onPress?.();
  };

  return (
    <Pressable onPress={handlePress} style={{ width: size, height: size }}>
      <RiveView
        ref={riveRef}
        source={{ uri: `file:///android_asset/assets/rive/${fileName}` }}
        stateMachineName="State Machine 1"
        style={[styles.container, { width: size, height: size }]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
