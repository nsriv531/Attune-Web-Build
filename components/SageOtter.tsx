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
    fur: '#A68A6D',
    furShadow: '#8C7257',
    mask: '#F4E3C5',
    maskShadow: '#E0CBB0',
    outline: '#2D241E',
};

export type SageState = 'idle' | 'watching' | 'nudge' | 'alert' | 'celebrate' | 'excessive_celebration';

export function SageOtter({ size = 150, state = 'idle' }: { size?: number, state?: SageState }) {
    const hoverY = useSharedValue(0);
    const torsoX = useSharedValue(0);
    const bodyScale = useSharedValue(1);
    const eyeScaleY = useSharedValue(1);
    const tailRotate = useSharedValue(0);
    const globalRotate = useSharedValue(0);

    useEffect(() => {
        const smoothBreathe = Easing.inOut(Easing.sin);

        // Smoothly reset global rotation if leaving the excessive celebration state
        if (state !== 'excessive_celebration') {
            globalRotate.value = withTiming(0, { duration: 300 });
        }

        if (state === 'idle') {
            // SLEEPY STATE: Very slow, heavy hovering
            hoverY.value = withRepeat(withTiming(-4, { duration: 4000, easing: smoothBreathe }), -1, true);
            bodyScale.value = withRepeat(withTiming(1.01, { duration: 4000, easing: smoothBreathe }), -1, true);
            tailRotate.value = withRepeat(withTiming(3, { duration: 4500, easing: smoothBreathe }), -1, true);
            torsoX.value = withTiming(0);

            // Instantly snap eyes to halfway down (heavy-lidded) so they don't start fully open
            eyeScaleY.value = 0.5;

            // Sleepy eyes: Holds half-closed, then does a slow, heavy blink
            eyeScaleY.value = withRepeat(
                withSequence(
                    withTiming(0.5, { duration: 3000 }), // Hold the half-closed peek
                    withTiming(0.1, { duration: 500 }),  // Slow blink closed
                    withTiming(0.5, { duration: 600 })   // Slow open back to halfway
                ), -1, false
            );
        }
        else if (state === 'watching') {
            // Soft, heavy hovering
            hoverY.value = withRepeat(withTiming(-6, { duration: 2000, easing: smoothBreathe }), -1, true);
            bodyScale.value = withRepeat(withTiming(1.03, { duration: 2000, easing: smoothBreathe }), -1, true);
            tailRotate.value = withRepeat(withTiming(6, { duration: 2500, easing: smoothBreathe }), -1, true);
            torsoX.value = withTiming(0);

            // Blinking sequence
            eyeScaleY.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 3500 }),
                    withTiming(0.1, { duration: 100 }),
                    withTiming(1, { duration: 100 })
                ), -1, false
            );
        }
        else if (state === 'nudge') {
            // DISTRACTED: Double-shake, then pause for 2.5 seconds
            hoverY.value = withTiming(0);
            eyeScaleY.value = withTiming(1);
            tailRotate.value = withTiming(0);
            torsoX.value = withRepeat(
                withSequence(
                    withTiming(-4, { duration: 60 }),
                    withTiming(4, { duration: 60 }),
                    withTiming(-4, { duration: 60 }),
                    withTiming(4, { duration: 60 }),
                    withTiming(0, { duration: 60 }),
                    withTiming(0, { duration: 2500 }) // The pause
                ), -1, false
            );
        }
        else if (state === 'alert') {
            // PANIC: Fast, tiny heartbeat/shiver, tail tucked tightly
            hoverY.value = withSpring(-8);
            bodyScale.value = withRepeat(withTiming(1.03, { duration: 150 }), -1, true); // Fast breathing
            eyeScaleY.value = withSpring(1.4);
            tailRotate.value = withSpring(-20);
            torsoX.value = withTiming(0);
        }
        else if (state === 'celebrate') {
            // HAPPY: Double bounce, then a pause before jumping again
            hoverY.value = withRepeat(
                withSequence(
                    withTiming(-12, { duration: 250, easing: Easing.out(Easing.quad) }),
                    withTiming(0, { duration: 250, easing: Easing.in(Easing.quad) }),
                    withTiming(-12, { duration: 250, easing: Easing.out(Easing.quad) }),
                    withTiming(0, { duration: 250, easing: Easing.in(Easing.quad) }),
                    withTiming(0, { duration: 1500 }) // The pause
                ), -1, false
            );
            bodyScale.value = withRepeat(withTiming(1.05, { duration: 300 }), -1, true);
            tailRotate.value = withRepeat(withTiming(20, { duration: 200 }), -1, true);
            eyeScaleY.value = withTiming(1);
            torsoX.value = withTiming(0);
        }
        else if (state === 'excessive_celebration') {
            // EXTREME: High bounce, continuous fast wag
            hoverY.value = withRepeat(withSpring(-16), -1, true);
            bodyScale.value = withRepeat(withTiming(1.08, { duration: 250 }), -1, true);
            tailRotate.value = withRepeat(withTiming(30, { duration: 150 }), -1, true);
            eyeScaleY.value = withTiming(1);
            torsoX.value = withTiming(0);

            // Barrel Roll once, hold the pose for 2 seconds, snap back invisibly, and roll again
            globalRotate.value = withRepeat(
                withSequence(
                    withTiming(360, { duration: 800, easing: Easing.inOut(Easing.quad) }),
                    withTiming(360, { duration: 2000 }), // Hold at 360
                    withTiming(0, { duration: 0 })       // Instant reset to 0 to loop cleanly
                ), -1, false
            );
        }

    }, [state]);

    const floatProps = useAnimatedProps(() => ({
        transform: [
            { translateX: 50 }, { translateY: 50 },
            { rotate: `${globalRotate.value}deg` },
            { translateX: -50 }, { translateY: -50 },
            { translateY: hoverY.value },
            { translateX: torsoX.value }
        ]
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

                {/* 1. Tail */}
                <AnimatedG animatedProps={tailProps}>
                    <Path d="M 50 72 Q 88 85 78 52" fill="none" stroke={SAGE_COLORS.furShadow} strokeWidth="18" strokeLinecap="round" />
                    <Path d="M 50 69 Q 85 80 75 49" fill="none" stroke={SAGE_COLORS.fur} strokeWidth="18" strokeLinecap="round" />
                </AnimatedG>

                {/* 2. Main Body */}
                <G transform="rotate(-15, 50, 50)">
                    <AnimatedG animatedProps={bodyProps}>
                        <Rect x="25" y="25" width="50" height="70" rx="25" fill={SAGE_COLORS.fur} />
                        <Path d="M 25 65 C 25 105 75 105 75 65 C 65 90 35 90 25 65 Z" fill={SAGE_COLORS.furShadow} />
                        <Rect x="34" y="45" width="32" height="45" rx="16" fill={SAGE_COLORS.mask} />
                        <Path d="M 34 65 C 34 100 66 100 66 65 C 58 85 42 85 34 65 Z" fill={SAGE_COLORS.maskShadow} />
                    </AnimatedG>

                    {/* Ears */}
                    <Circle cx="26" cy="30" r="7" fill={SAGE_COLORS.furShadow} />
                    <Circle cx="74" cy="30" r="7" fill={SAGE_COLORS.furShadow} />

                    {/* Head Skull */}
                    <Ellipse cx="50" cy="38" rx="28" ry="24" fill={SAGE_COLORS.fur} />
                    <Ellipse cx="50" cy="50" rx="24" ry="12" fill={SAGE_COLORS.furShadow} opacity={0.5} />

                    {/* Face Mask */}
                    <Path d="M 24 40 Q 30 28 50 32 Q 70 28 76 40 C 76 55 60 60 50 60 C 40 60 24 55 24 40 Z" fill={SAGE_COLORS.mask} />

                    {/* Nose and Mouth */}
                    <Rect x="46" y="43" width="8" height="4.5" rx="2.25" fill={SAGE_COLORS.outline} />
                    <Path d="M 44 48 Q 47 50 50 48 Q 53 50 56 48" fill="none" stroke={SAGE_COLORS.outline} strokeWidth="1.5" strokeLinecap="round" />

                    {/* Expressive Eyes */}
                    <AnimatedG animatedProps={eyeProps}>
                        <Rect x="34" y="39" width="5.5" height="9" rx="2.75" fill={SAGE_COLORS.outline} />
                        <Rect x="60.5" y="39" width="5.5" height="9" rx="2.75" fill={SAGE_COLORS.outline} />
                    </AnimatedG>

                    {/* Flippers */}
                    <Rect x="25" y="65" width="14" height="8" rx="4" fill={SAGE_COLORS.furShadow} transform="rotate(25, 32, 69)" />
                    <Rect x="61" y="65" width="14" height="8" rx="4" fill={SAGE_COLORS.furShadow} transform="rotate(-25, 68, 69)" />
                </G>
            </AnimatedG>
        </Svg>
    );
}