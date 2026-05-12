import React from 'react';
import Rive from '@rive-app/react-canvas';

const riveAsset = require('../assets/rive/tovi.riv');

export function RiveSection() {
  return (
    <div style={{ width: '100%', height: 600, marginBottom: 20 }}>
      <Rive
        src={riveAsset}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
