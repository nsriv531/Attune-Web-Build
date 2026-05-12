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

const SAGE_COLORS = {
    fur: '#A68A6D',          // Main warm brown
    furShadow: '#8C7257',    // Darker brown for z-axis depth
    mask: '#F4E3C5',         // Creamy beige
    maskShadow: '#E0CBB0',   // Shadow for the cream area
    outline: '#2D241E',      // Charcoal
};

export function SageOtter({ size = 150, state = 'idle' }) {
    const hoverY = useSharedValue(0);
    const bodyScale = useSharedValue(1);
    const eyeScaleY = useSharedValue(1);
    const tailRotate = useSharedValue(0);

    useEffect(() => {
        const smoothBreathe = Easing.inOut(Easing.sin);

        if (state === 'idle') {
            hoverY.value = withRepeat(withTiming(-6, { duration: 2000, easing: smoothBreathe }), -1, true);
            bodyScale.value = withRepeat(withTiming(1.03, { duration: 2000, easing: smoothBreathe }), -1, true);
            tailRotate.value = withRepeat(withTiming(6, { duration: 2500, easing: smoothBreathe }), -1, true);

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
        transform: [{ translateY: 85 }, { scaleY: bodyScale.value }, { translateY: -85 }]
    }));

    const tailProps = useAnimatedProps(() => ({
        transform: [
            { translateX: 65 }, { translateY: 70 },
            { rotate: `${tailRotate.value}deg` },
            { translateX: -65 }, { translateY: -70 }
        ]
    }));

    const eyeProps = useAnimatedProps(() => ({
        transform: [{ translateY: 43 }, { scaleY: eyeScaleY.value }, { translateY: -43 }]
    }));

    return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
            <AnimatedG animatedProps={floatProps}>

                {/* 1. Tail (Untouched) */}
                <AnimatedG animatedProps={tailProps}>
                    <Path d="M 50 72 Q 88 85 78 52" fill="none" stroke={SAGE_COLORS.furShadow} strokeWidth="18" strokeLinecap="round" />
                    <Path d="M 50 69 Q 85 80 75 49" fill="none" stroke={SAGE_COLORS.fur} strokeWidth="18" strokeLinecap="round" />
                </AnimatedG>

                {/* 2. Main Body */}
                <G transform="rotate(-15, 50, 50)">
                    <AnimatedG animatedProps={bodyProps}>
                        {/* Base Body Pill - WIDTH REDUCED from 60 to 50, centered at 50 */}
                        <Rect x="25" y="25" width="50" height="70" rx="25" fill={SAGE_COLORS.fur} />

                        {/* Z-Axis Depth: Bottom Body Shadow - Coordinates adjusted to match new width */}
                        <Path d="M 25 65 C 25 105 75 105 75 65 C 65 90 35 90 25 65 Z" fill={SAGE_COLORS.furShadow} />

                        {/* Cream Belly Patch - WIDTH REDUCED to 32, centered at 50 */}
                        <Rect x="34" y="45" width="32" height="45" rx="16" fill={SAGE_COLORS.mask} />

                        {/* Z-Axis Depth: Belly Shadow - Coordinates adjusted to match new belly width */}
                        <Path d="M 34 65 C 34 100 66 100 66 65 C 58 85 42 85 34 65 Z" fill={SAGE_COLORS.maskShadow} />
                    </AnimatedG>

                    {/* Ears (Untouched) */}
                    <Circle cx="26" cy="30" r="7" fill={SAGE_COLORS.furShadow} />
                    <Circle cx="74" cy="30" r="7" fill={SAGE_COLORS.furShadow} />

                    {/* Head Skull (Untouched) */}
                    <Ellipse cx="50" cy="38" rx="28" ry="24" fill={SAGE_COLORS.fur} />

                    {/* Head Z-Axis Depth: Under-chin shadow (Untouched) */}
                    <Ellipse cx="50" cy="50" rx="24" ry="12" fill={SAGE_COLORS.furShadow} opacity={0.5} />

                    {/* Face Mask (Untouched) */}
                    <Path d="M 24 40 Q 30 28 50 32 Q 70 28 76 40 C 76 55 60 60 50 60 C 40 60 24 55 24 40 Z" fill={SAGE_COLORS.mask} />

                    {/* Nose and Mouth (Untouched) */}
                    <Rect x="46" y="43" width="8" height="4.5" rx="2.25" fill={SAGE_COLORS.outline} />
                    <Path d="M 44 48 Q 47 50 50 48 Q 53 50 56 48" fill="none" stroke={SAGE_COLORS.outline} strokeWidth="1.5" strokeLinecap="round" />

                    {/* Expressive Eyes (Untouched) */}
                    <AnimatedG animatedProps={eyeProps}>
                        <Rect x="34" y="39" width="5.5" height="9" rx="2.75" fill={SAGE_COLORS.outline} />
                        <Rect x="60.5" y="39" width="5.5" height="9" rx="2.75" fill={SAGE_COLORS.outline} />
                    </AnimatedG>

                    {/* Flippers - Shifted slightly inward to re-attach to the slimmer body */}
                    <Rect x="25" y="65" width="14" height="8" rx="4" fill={SAGE_COLORS.furShadow} transform="rotate(25, 32, 69)" />
                    <Rect x="61" y="65" width="14" height="8" rx="4" fill={SAGE_COLORS.furShadow} transform="rotate(-25, 68, 69)" />
                </G>
            </AnimatedG>
        </Svg>
    );
}