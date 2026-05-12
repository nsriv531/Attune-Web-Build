import React, { useEffect } from 'react';
import Svg, { G, Circle, Rect, Path } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withRepeat,
    withTiming,
    withSequence,
    withSpring,
    Easing
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

const AnimatedG = Animated.createAnimatedComponent(G);

export function SageOtter({ size = 100, state = 'idle' }) {
    // 1. Independent shared values for different body parts
    const headY = useSharedValue(0);
    const bodyScale = useSharedValue(1);
    const eyeScaleY = useSharedValue(1);
    const tailRotate = useSharedValue(0);

    // 2. The "Brain" of the animation
    useEffect(() => {
        // Natural easing curve for breathing
        const breatheEasing = Easing.inOut(Easing.sin);

        if (state === 'idle') {
            // Calm breathing
            headY.value = withRepeat(withTiming(1.5, { duration: 2500, easing: breatheEasing }), -1, true);
            bodyScale.value = withRepeat(withTiming(1.02, { duration: 2500, easing: breatheEasing }), -1, true);
            // Slow tail sway
            tailRotate.value = withRepeat(withTiming(4, { duration: 3000, easing: breatheEasing }), -1, true);
            // Organic Blinking (stays open for 3.5s, blinks fast)
            eyeScaleY.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 3500 }),
                    withTiming(0.1, { duration: 100 }),
                    withTiming(1, { duration: 100 })
                ), -1, false
            );
        }
        else if (state === 'watching') {
            // Attentive: Head slightly raised, eyes wide, still body
            headY.value = withTiming(-2, { duration: 500 });
            bodyScale.value = withTiming(1, { duration: 500 });
            eyeScaleY.value = withTiming(1.1, { duration: 300 }); // Wide eyes
            tailRotate.value = withRepeat(withTiming(2, { duration: 4000, easing: breatheEasing }), -1, true);
        }
        else if (state === 'nudge') {
            // Distracted: Quick, nervous side-to-side shake
            headY.value = withRepeat(withSequence(withTiming(-1, { duration: 60 }), withTiming(1, { duration: 60 })), -1, true);
            eyeScaleY.value = withTiming(1);
            tailRotate.value = withTiming(0);
        }
        else if (state === 'alert') {
            // Panicking: Popped up, rigid, huge eyes
            headY.value = withSpring(-6);
            bodyScale.value = withSpring(1.05);
            eyeScaleY.value = withSpring(1.3);
            tailRotate.value = withSpring(-10);
        }
        else if (state === 'celebrate') {
            // Happy: Bouncy jumps, fast tail wagging
            headY.value = withRepeat(withSpring(-10), -1, true);
            bodyScale.value = withRepeat(withTiming(1.08, { duration: 300 }), -1, true);
            tailRotate.value = withRepeat(withTiming(12, { duration: 200 }), -1, true);
            eyeScaleY.value = withTiming(1);
        }
    }, [state]);

    // 3. Mapping values to SVG attributes safely
    const headProps = useAnimatedProps(() => ({
        transform: [{ translateY: headY.value }]
    }));

    const bodyProps = useAnimatedProps(() => ({
        transform: [{ translateY: 90 }, { scaleY: bodyScale.value }, { translateY: -90 }]
    }));

    const eyeProps = useAnimatedProps(() => ({
        // Anchor the scale to the center of the eyes (y=37) so they blink closed properly
        transform: [{ translateY: 37 }, { scaleY: eyeScaleY.value }, { translateY: -37 }]
    }));

    const tailProps = useAnimatedProps(() => ({
        // Anchor the rotation to the base of the tail (x=35, y=85)
        transform: [
            { translateX: 35 }, { translateY: 85 },
            { rotate: `${tailRotate.value}deg` },
            { translateX: -35 }, { translateY: -85 }
        ]
    }));

    return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
            {/* 1. The Tail - Wrapped in AnimatedG for swishing motion */}
            <AnimatedG animatedProps={tailProps}>
                <Path d="M 35 85 Q 10 90 8 60" fill="none" stroke={Colors.purpleMid} strokeWidth="16" strokeLinecap="round" />
                <Path d="M 35 85 Q 15 88 12 65" fill="none" stroke={Colors.purple} strokeWidth="8" strokeLinecap="round" />
            </AnimatedG>

            {/* 2. Body Group - Uses a 'Bib' for depth */}
            <AnimatedG animatedProps={bodyProps}>
                <Rect x="20" y="45" width="60" height="45" rx="25" fill={Colors.purple} />
                <Path d="M 32 45 Q 50 60 68 45 L 62 82 Q 50 90 38 82 Z" fill={Colors.bg} opacity={0.3} />
            </AnimatedG>

            {/* 3. Head Group - The Expressive Core */}
            <AnimatedG animatedProps={headProps}>
                <Circle cx="25" cy="35" r="7" fill={Colors.purpleMid} />
                <Circle cx="25" cy="35" r="4" fill={Colors.purple} />
                <Circle cx="75" cy="35" r="7" fill={Colors.purpleMid} />
                <Circle cx="75" cy="35" r="4" fill={Colors.purple} />

                <Rect x="20" y="20" width="60" height="45" rx="28" fill={Colors.purple} />
                <Path d="M 28 45 Q 28 25 50 25 Q 72 25 72 45 Z" fill={Colors.bg} opacity={0.2} />

                <G id="muzzle">
                    <Circle cx="42" cy="48" r="9" fill={Colors.bg} />
                    <Circle cx="58" cy="48" r="9" fill={Colors.bg} />
                    <Rect x="46" y="42" width="8" height="5" rx="2.5" fill={Colors.textPrimary} />
                </G>

                {/* Eyes - Wrapped in AnimatedG for Blinking and Wide-eyed reactions */}
                <AnimatedG animatedProps={eyeProps}>
                    <Rect x="36" y="32" width="7" height="10" rx="3.5" fill={Colors.textPrimary} />
                    <Rect x="57" y="32" width="7" height="10" rx="3.5" fill={Colors.textPrimary} />
                    <Circle cx="38" cy="34" r="1.2" fill="white" />
                    <Circle cx="59" cy="34" r="1.2" fill="white" />
                </AnimatedG>
            </AnimatedG>

            {/* 4. Arms - Integrated into the silhouette */}
            <Rect x="25" y="55" width="12" height="18" rx="6" fill={Colors.purpleMid} transform="rotate(-10, 31, 64)" />
            <Rect x="63" y="55" width="12" height="18" rx="6" fill={Colors.purpleMid} transform="rotate(10, 69, 64)" />
        </Svg>
    );
}