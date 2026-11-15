import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { colors, shadow } from "./theme";

const Loader = () => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Infinite, continuous rotation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    spinAnimation.start();

    // Stop the animation if the component unmounts
    return () => spinAnimation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.loadingOverlay}>
      <View style={styles.spinnerContainer}>
        <Animated.Image
          source={require("../assets/icon.png")}
          style={[styles.spinnerIcon, { transform: [{ rotate: spin }] }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20, 32, 26, 0.35)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  spinnerContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 24,
    backgroundColor: colors.card,
    ...shadow,
  },
  spinnerIcon: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: colors.primarySoft },
});

export default Loader;
