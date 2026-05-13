import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RiveView, Fit, useRiveFile } from '@rive-app/react-native';

const toviAsset = require('../assets/rive/tovi.riv');
const iconSetAsset = require('../assets/rive/interactive-icon-set.riv');

export function RiveSection() {
  const { riveFile, isLoading } = useRiveFile(toviAsset);

  if (isLoading || !riveFile) return null;

  return (
    <RiveView
      file={riveFile}
      fit={Fit.Contain}
      autoPlay={true}
      style={{ width: '100%', height: 600, marginBottom: 20 }}
    />
  );
}

interface RiveIconSetProps {
  size?: number;
  /** Artboard inside interactive-icon-set.riv — e.g. "03_Flash", "01_Star". */
  artboardName?: string;
  /** State machine inside the artboard. Defaults to Rive's standard "State Machine 1". */
  stateMachineName?: string;
}

export function RiveIconSet({
  size = 160,
  artboardName,
  stateMachineName = 'State Machine 1',
}: RiveIconSetProps) {
  const { riveFile, isLoading } = useRiveFile(iconSetAsset);

  if (isLoading || !riveFile) return null;

  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <RiveView
        file={riveFile}
        artboardName={artboardName}
        stateMachineName={stateMachineName}
        fit={Fit.Contain}
        autoPlay
        style={styles.iconRive}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRive: {
    width: '100%',
    height: '100%',
  },
});
