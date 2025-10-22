import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';

const SplashScreen = ({ navigation }) => {
  // Valor inicial para la animación de opacidad
  const fadeAnim = new Animated.Value(0);
  
  // Valor inicial para la animación de escala
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Animación para hacer aparecer el logo con efecto fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
        easing: Easing.elastic(1),
      })
    ]).start();
    
    // Después de 2.5 segundos, navega a la pantalla de login
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2500);
    
    // Limpia el timeout al desmontar el componente
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.logoContainer}>
        <Animated.Image
          source={require('../assets/logo.png')}
          style={[
            styles.logo,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          resizeMode="contain"
        />
      </View>
      <Animated.Text style={[styles.appName, { opacity: fadeAnim }]}>
        Gallego's Barbers
      </Animated.Text>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Estilo y tradición</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 280,
    height: 180,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F1B2A',
    marginTop: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
  },
});

export default SplashScreen;