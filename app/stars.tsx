import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";

// Define the type for a star
type Star = {
  id: number;
  x: number;
  y: number;
  animation: Animated.Value;
};

const SpinningStars: React.FC = () => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const [stars, setStars] = useState<Star[]>([]);

  // Spin animation setup
  useEffect(() => {
    const rotation = Animated.sequence([
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 100000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(spinValue, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(rotation, {
      iterations: -1, // Infinite loop
    }).start();

    return () => {
      spinValue.setValue(0);
    };
  }, [spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Generate stars randomly and start their animations
  useEffect(() => {
    const numStars = 100; // Number of dots
    const newStars: Star[] = [];

    for (let i = 0; i < numStars; i++) {
      const angle = Math.random() * 2 * Math.PI; // Random angle
      const radius = Math.random() * 500; // Random radius (container's radius)
      const x = 500 + radius * Math.cos(angle); // X-coordinate
      const y = 500 + radius * Math.sin(angle); // Y-coordinate

      const animation = new Animated.Value(0);

      // Start the fade-in and fade-out animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1,
            duration: 2000 + Math.random() * 2000, // Random duration for variation
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 2000 + Math.random() * 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ).start();

      newStars.push({ id: i, x, y, animation });
    }

    setStars(newStars);
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ rotate }],
        },
      ]}
    >
      {stars.map((star) => (
        <Animated.View
          key={star.id}
          style={[
            styles.star,
            {
              top: star.y - 2.5, // Adjust for dot size
              left: star.x - 2.5, // Adjust for dot size
              opacity: star.animation, // Bind animation to opacity
            },
          ]}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 1000,
    height: 1000,
    borderRadius: 500, // Makes the container circular
    backgroundColor: "transparent",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  star: {
    position: "absolute",
    width: 2,
    height: 2,
    backgroundColor: "white",
    borderRadius: 2.5, // Makes the dot circular
  },
});

export default SpinningStars;
