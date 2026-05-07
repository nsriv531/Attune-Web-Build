import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';

interface SageMascotProps {
  size?: number;
}

export function SageMascot({ size = 80 }: SageMascotProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      style={{ flex: 1 }}
    >
      {/* Stone */}
      <Ellipse cx={48} cy={68} rx={30} ry={20} fill="#c8bfb0" />
      <Ellipse cx={48} cy={66} rx={28} ry={18} fill="#d8d0c4" />
      <Ellipse cx={44} cy={62} rx={10} ry={6} fill="rgba(255,255,255,0.25)" />

      {/* Stem */}
      <Path
        d="M48 56 C47 46 46 40 48 30"
        stroke="#5a8a40"
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* Left leaf */}
      <Path
        d="M48 42 C40 36 36 30 40 26 C42 36 44 40 48 42Z"
        fill="#72a855"
      />

      {/* Right leaf */}
      <Path
        d="M48 38 C56 32 60 26 56 22 C54 32 52 36 48 38Z"
        fill="#5a9640"
      />

      {/* Top bud */}
      <Ellipse cx={48} cy={28} rx={4} ry={5} fill="#7fc25a" />

      {/* Soil shadow */}
      <Ellipse cx={48} cy={86} rx={22} ry={5} fill="rgba(0,0,0,0.06)" />
    </Svg>
  );
}

const styles = StyleSheet.create({});
