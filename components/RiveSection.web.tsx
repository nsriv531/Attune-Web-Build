import React from 'react';
import Rive from '@rive-app/react-canvas';

const toviAsset = require('../assets/rive/tovi.riv');
const iconSetAsset = require('../assets/rive/interactive-icon-set.riv');

export function RiveSection() {
  return (
    <div style={{ width: '100%', height: 600, marginBottom: 20 }}>
      <Rive
        src={toviAsset}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

interface RiveIconSetProps {
  size?: number;
  artboardName?: string;
  stateMachineName?: string;
}

export function RiveIconSet({
  size = 160,
  artboardName,
  stateMachineName = 'State Machine 1',
}: RiveIconSetProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Rive
        src={iconSetAsset}
        artboard={artboardName}
        stateMachines={stateMachineName}
        autoplay
      />
    </div>
  );
}
