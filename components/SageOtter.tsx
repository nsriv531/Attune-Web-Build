import React, { useEffect } from 'react';
import Svg, { G, Circle, Rect, Path, Ellipse } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withRepeat,
    withTiming,
    withSequence,
    withSpring,
    Easing
} from 'react-native-reanimated';

const AnimatedG = Animated.createAnimatedComponent(G);

// Tovi's Palette + Volumetric Shadows
const SAGE_COLORS = {
    fur: '#A68A6D',          // Main warm brown
    furShadow: '#8C7257',    // Darker brown for z-axis depth
    mask: '#F4E3C5',         // Creamy beige
    maskShadow: '#E0CBB0',   // Shadow for the cream area
    outline: '#2D241E',      // Charcoal
    ring: '#F2D388'          // Golden comet ring
};

export function SageOtter({ size = 150, state = 'idle' }) {
    const hoverY = useSharedValue(0);
    const bodyScale = useSharedValue(1);
    const eyeScaleY = useSharedValue(1);
    const tailRotate = useSharedValue(0);

    useEffect(() => {
        const smoothBreathe = Easing.inOut(Easing.sin);

        if (state === 'idle') {
            // Soft, heavy hovering to emphasize plumpness
            hoverY.value = withRepeat(withTiming(-6, { duration: 2000, easing: smoothBreathe }), -1, true);
            bodyScale.value = withRepeat(withTiming(1.03, { duration: 2000, easing: smoothBreathe }), -1, true);
            tailRotate.value = withRepeat(withTiming(6, { duration: 2500, easing: smoothBreathe }), -1, true);

            // Blinking
            eyeScaleY.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 3500 }),
                    withTiming(0.1, { duration: 100 }),
                    withTiming(1, { duration: 100 })
                ), -1, false
            );
        } else if (state === 'celebrate') {
            hoverY.value = withRepeat(withSpring(-12), -1, true);
            tailRotate.value = withRepeat(withTiming(20, { duration: 200 }), -1, true);
            eyeScaleY.value = withTiming(1);
        }
    }, [state]);

    const floatProps = useAnimatedProps(() => ({
        transform: [{ translateY: hoverY.value }]
    }));

    const bodyProps = useAnimatedProps(() => ({
        // Anchor scaling at the bottom so he squishes down naturally
        transform: [{ translateY: 75 }, { scaleY: bodyScale.value }, { translateY: -75 }]
    }));

    const tailProps = useAnimatedProps(() => ({
        transform: [
            { translateX: 65 }, { translateY: 65 },
            { rotate: `${tailRotate.value}deg` },
            { translateX: -65 }, { translateY: -65 }
        ]
    }));

    const eyeProps = useAnimatedProps(() => ({
        transform: [{ translateY: 43 }, { scaleY: eyeScaleY.value }, { translateY: -43 }]
    }));

    return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
            <AnimatedG animatedProps={floatProps}>

                {/* 1. The Comet Ring (Background) */}
                <Path d="M 15 65 A 40 40 0 0 1 85 35" fill="none" stroke={SAGE_COLORS.ring} strokeWidth="6" strokeLinecap="round" opacity={0.4} />

                {/* 2. Tail (Animated independently) */}
                <AnimatedG animatedProps={tailProps}>
                    {/* Tail Shadow for depth */}
                    <Path d="M 50 68 Q 88 80 78 48" fill="none" stroke={SAGE_COLORS.furShadow} strokeWidth="18" strokeLinecap="round" />
                    {/* Main Tail */}
                    <Path d="M 50 65 Q 85 75 75 45" fill="none" stroke={SAGE_COLORS.fur} strokeWidth="18" strokeLinecap="round" />
                </AnimatedG>

                {/* 3. Main Body (Tilted 15 degrees for the floating pose) */}
                <G transform="rotate(-15, 50, 50)">
                    <AnimatedG animatedProps={bodyProps}>
                        {/* Base Body Pill */}
                        <Rect x="20" y="30" width="60" height="55" rx="27.5" fill={SAGE_COLORS.fur} />

                        {/* Z-Axis Depth: Bottom Body Shadow (Crescent shape) */}
                        <Path d="M 20 55 C 20 90 80 90 80 55 C 70 80 30 80 20 55 Z" fill={SAGE_COLORS.furShadow} />

                        {/* Cream Belly Patch */}
                        <Rect x="30" y="45" width="40" height="35" rx="17.5" fill={SAGE_COLORS.mask} />

                        {/* Z-Axis Depth: Belly Shadow */}
                        <Path d="M 30 60 C 30 85 70 85 70 60 C 60 78 40 78 30 60 Z" fill={SAGE_COLORS.maskShadow} />
                    </AnimatedG>

                    {/* Ears */}
                    <Circle cx="26" cy="30" r="7" fill={SAGE_COLORS.furShadow} />
                    <Circle cx="74" cy="30" r="7" fill={SAGE_COLORS.furShadow} />

                    {/* Head Skull */}
                    <Ellipse cx="50" cy="38" rx="28" ry="24" fill={SAGE_COLORS.fur} />

                    {/* Head Z-Axis Depth: Under-chin shadow dropped onto the body */}
                    <Ellipse cx="50" cy="50" rx="24" ry="12" fill={SAGE_COLORS.furShadow} opacity={0.5} />

                    {/* Face Mask - Smooth, rounded interlocking paths */}
                    <Path d="M 24 40 Q 30 28 50 32 Q 70 28 76 40 C 76 55 60 60 50 60 C 40 60 24 55 24 40 Z" fill={SAGE_COLORS.mask} />

                    {/* Nose and Mouth */}
                    <Rect x="46" y="43" width="8" height="4.5" rx="2.25" fill={SAGE_COLORS.outline} />
                    <Path d="M 44 48 Q 47 50 50 48 Q 53 50 56 48" fill="none" stroke={SAGE_COLORS.outline} strokeWidth="1.5" strokeLinecap="round" />

                    {/* Expressive Eyes */}
                    <AnimatedG animatedProps={eyeProps}>
                        <Rect x="34" y="39" width="5.5" height="9" rx="2.75" fill={SAGE_COLORS.outline} />
                        <Rect x="60.5" y="39" width="5.5" height="9" rx="2.75" fill={SAGE_COLORS.outline} />
                    </AnimatedG>

                    {/* Flippers (Overlapping the belly line for 3D illusion) */}
                    <Rect x="22" y="58" width="14" height="8" rx="4" fill={SAGE_COLORS.furShadow} transform="rotate(25, 29, 62)" />
                    <Rect x="64" y="58" width="14" height="8" rx="4" fill={SAGE_COLORS.furShadow} transform="rotate(-25, 71, 62)" />
                </G>
            </AnimatedG>
        </Svg>
    );
}