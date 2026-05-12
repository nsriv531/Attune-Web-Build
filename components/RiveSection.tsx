import React from 'react';
import { RiveView, Fit, useRiveFile } from '@rive-app/react-native';

const riveAsset = require('../assets/rive/tovi.riv');

export function RiveSection() {
  const { riveFile, isLoading } = useRiveFile(riveAsset);

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
