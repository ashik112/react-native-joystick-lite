import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import alpha from 'color-alpha';

let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch (error) {
  console.warn('expo-haptics not available');
}

interface JoystickProps {
  onMove?: (data: JoystickData) => void;
  onEnd?: () => void;
  size?: number;
  color?: string;
  interval?: number;
  haptics?: boolean;
}

interface JoystickData {
  position: {
    x: number;
    y: number;
  };
  force: number;
  angle: {
    radian: number;
    degree: number;
  };
  direction: string;
}

const getDirection = (angleDeg: number): string => {
  if (
    (angleDeg >= 337.5 && angleDeg <= 360) ||
    (angleDeg >= 0 && angleDeg < 22.5)
  ) {
    return 'right';
  } else if (angleDeg >= 22.5 && angleDeg < 67.5) {
    return 'up-right';
  } else if (angleDeg >= 67.5 && angleDeg < 112.5) {
    return 'up';
  } else if (angleDeg >= 112.5 && angleDeg < 157.5) {
    return 'up-left';
  } else if (angleDeg >= 157.5 && angleDeg < 202.5) {
    return 'left';
  } else if (angleDeg >= 202.5 && angleDeg < 247.5) {
    return 'down-left';
  } else if (angleDeg >= 247.5 && angleDeg < 292.5) {
    return 'down';
  } else if (angleDeg >= 292.5 && angleDeg < 337.5) {
    return 'down-right';
  }
  return '';
};

const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

/**
 * Applies alpha transparency to a color using the color-alpha library
 * @param color - Color string (named color, hex, rgb, etc.)
 * @param opacity - Alpha value between 0 and 1
 * @returns RGBA color string
 */
const withAlpha = (color: string, opacity: number): string => {
  return alpha(color, opacity);
};

export const Joystick: React.FC<JoystickProps> = React.memo(
  ({
    onMove = () => {},
    onEnd = () => {},
    size = 150,
    color = '#06b6d4',
    interval = 100,
    haptics = false,
  }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const BOUNDARY_RADIUS = size / 2;
    const JOYSTICK_RADIUS = size / 6;
    const MAX_DISTANCE = BOUNDARY_RADIUS + JOYSTICK_RADIUS / 2;

    // Pre-compute colors to avoid calling color-alpha inside worklets
    const boundaryColorActive = withAlpha(color, 0.2);
    const boundaryColorInactive = color;
    const backgroundColorBoundary = withAlpha(color, 0.2);
    const backgroundColorJoystick = withAlpha(color, 0.6);

    const debouncedOnMove = useCallback(
      (data: JoystickData) => {
        debounce(() => {
          onMove?.(data);
        }, interval)();
      },
      [onMove, interval]
    );

    const panGesture = useMemo(
      () =>
        Gesture.Pan()
          .runOnJS(true)
          .onBegin(() => {
            if (haptics && Haptics) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
          })
          .onUpdate((event: { translationX: any; translationY: any }) => {
            const rawX = event.translationX;
            const rawY = event.translationY;
            const distance = Math.sqrt(rawX ** 2 + rawY ** 2);

            let newX = rawX;
            let newY = rawY;

            if (distance > MAX_DISTANCE) {
              const angle = Math.atan2(rawY, rawX);
              newX = MAX_DISTANCE * Math.cos(angle);
              newY = MAX_DISTANCE * Math.sin(angle);
            }

            translateX.value = newX;
            translateY.value = newY;

            const force = Math.min(1, distance / MAX_DISTANCE);
            const angleRad = Math.atan2(-newY, newX);
            const angleDeg = (angleRad * (180 / Math.PI) + 360) % 360;
            const direction = getDirection(angleDeg);

            const normalizedX = (newX / BOUNDARY_RADIUS) * size;
            const normalizedY = -(newY / BOUNDARY_RADIUS) * size;

            debouncedOnMove({
              position: {
                x: Math.max(-size, Math.min(size, normalizedX)),
                y: Math.max(-size, Math.min(size, normalizedY)),
              },
              force,
              angle: {
                radian: angleRad,
                degree: angleDeg,
              },
              direction,
            });
          })
          .onEnd(() => {
            // translateX.value = withSpring(0);
            // translateY.value = withSpring(0);
            translateX.value = withTiming(0, { duration: 300 });
            translateY.value = withTiming(0, { duration: 300 });
            if (onEnd) {
              onEnd();
            }
          }),
      [
        haptics,
        MAX_DISTANCE,
        translateX,
        translateY,
        BOUNDARY_RADIUS,
        size,
        debouncedOnMove,
        onEnd,
      ]
    );

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    }));

    const boundaryStyle = useAnimatedStyle(() => {
      return {
        borderColor:
          Math.abs(translateX.value) > 0 || Math.abs(translateY.value) > 0
            ? boundaryColorActive
            : boundaryColorInactive,
      };
    });

    return (
      <GestureHandlerRootView style={styles.root}>
        <GestureDetector gesture={panGesture}>
          <Animated.View
            testID="joystick-boundary"
            accessibilityLabel="Joystick Boundary"
            style={[
              styles.boundary,
              {
                width: size,
                height: size,
                borderRadius: BOUNDARY_RADIUS,
                backgroundColor: backgroundColorBoundary,
                // borderColor: color,
              },
              boundaryStyle, // Applying the animated style here
            ]}
          >
            <Animated.View
              testID="joystick-handle"
              accessibilityLabel="Joystick Handle"
              style={[
                styles.joystick,
                {
                  width: JOYSTICK_RADIUS * 2,
                  height: JOYSTICK_RADIUS * 2,
                  borderRadius: JOYSTICK_RADIUS,
                  backgroundColor: backgroundColorJoystick,
                },
                animatedStyle,
              ]}
            />
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    );
  }
);

export default Joystick;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boundary: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  joystick: {
    position: 'absolute',
  },
});
