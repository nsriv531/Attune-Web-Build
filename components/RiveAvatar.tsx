import React, { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import RiveView, { RiveViewHandle } from 'rive-react-native';

export type AvatarState = 'idle' | 'watching' | 'nudge' | 'alert' | 'celebrate';

interface RiveAvatarProps {
  size?: number;
  state?: AvatarState;
}

export function RiveAvatar({ size = 200, state = 'idle' }: RiveAvatarProps) {
  const riveRef = useRef<RiveViewHandle>(null);

  useEffect(() => {
    if (!riveRef.current) return;

    // Trigger state machine input based on current state
    // Input name should match your Rive state machine input
    riveRef.current.setInputValue('state', stateToInput(state));
  }, [state]);

  return (
    <RiveView
      ref={riveRef}
      source={require('@/assets/mascot/tovi.riv')}
      stateMachineName="AvatarState"
      style={[styles.riveContainer, { width: size, height: size }]}
      autoplay
    />
  );
}

function stateToInput(state: AvatarState): number {
  // Map states to numeric inputs (Rive state machine numbers)
  // Adjust these based on your Rive file's state machine setup
  const stateMap: Record<AvatarState, number> = {
    idle: 0,
    watching: 1,
    nudge: 2,
    alert: 3,
    celebrate: 4,
  };
  return stateMap[state];
}

const styles = StyleSheet.create({
  riveContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
