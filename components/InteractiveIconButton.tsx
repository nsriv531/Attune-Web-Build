import React, { useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import RiveView from 'rive-react-native';
import type { RiveRef } from 'rive-react-native';

const riveAssets = 'interactive-icon-set';

interface InteractiveIconButtonProps {
  fileName: keyof typeof riveAssets;
  size?: number;
  onPress?: () => void;
}

export function InteractiveIconButton({
  fileName,
  size = 48,
  onPress,
}: InteractiveIconButtonProps) {
  const riveRef = useRef<RiveRef>(null);

  const handlePress = () => {
    riveRef.current?.fireState('State Machine 1', 'Star Idle');
    onPress?.();
  };

  // const resourceName = riveAssets[fileName];
  const resourceName = riveAssets[fileName] || '25691-49048-interactive-icon-set';

  return (
    <Pressable onPress={handlePress} style={{ width: size, height: size }}>
      <RiveView
        ref={riveRef}
        resourceName={resourceName}
        stateMachineName="State Machine 1"
        style={{ ...styles.container, width: size, height: size }}
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
