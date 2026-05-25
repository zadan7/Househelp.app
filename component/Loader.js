import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useRef } from "react";
import { Easing } from "react-native-reanimated";
import { useEffect } from "react";





const Loader = () => {
     const spinValue = useRef(new Animated.Value(0)).current;


     useEffect(() => {
    // Define an infinite, continuous loop
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500, // Speed of one full rotation in milliseconds
        easing: Easing.linear, // Pure continuous speed without deceleration bumps
        useNativeDriver: true, // Offloads processing directly to the native UI thread
      })
    );

    spinAnimation.start();

    // Kill the thread process immediately if component unmounts to save battery/RAM
    return () => spinAnimation.stop();
  }, [spinValue]);
     const spin = spinValue.interpolate({
       inputRange: [0, 1],
       outputRange: ['0deg', '360deg']
     });
  return (
    <View style={styles.loadingOverlay}>
               <View style={styles.spinnerContainer}>
                 <Animated.Image
                   source={require('../assets/icon.png')}
                   style={[styles.spinnerIcon, { transform: [{ rotate: spin }] }]}
                 />
               </View>
                </View>
  );
}   

const styles = StyleSheet.create({
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 255, 255, 0.26)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  spinnerContainer: { alignItems: 'center', justifyContent: 'center', borderRadius: 55, borderColor: 'green', borderWidth: 5 },
  spinnerIcon: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: 'white' },
});

export default Loader;