import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { authAPI } from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    console.log('handleLogin called with:', { email, password: '***' });
    
    if (!email || !password) {
      setError('Por favor, introduce email y contraseña.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Calling authAPI.login...');
      const result = await authAPI.login(email, password);
      console.log('Login result:', result);
      
      if (result.success) {
        // Si llega aquí, la autenticación fue exitosa
        console.log('Login successful, navigating to dashboard');
        setLoading(false);
        
        // Navegar al dashboard
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      } else {
        console.log('Login failed:', result.error);
        setLoading(false);
        setError(result.error || 'Error al iniciar sesión. Verifica tus credenciales.');
      }
    } catch (err) {
      console.log('Login error:', err);
      setLoading(false);
      setError(err?.response?.data?.detail || 'Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/logo.png')} 
              style={styles.logo} 
              resizeMode="contain"
            />
          </View>

          <Card>
            <Text style={styles.heading}>Iniciar Sesión</Text>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Introduce tu email"
              autoCapitalize="none"
            />

            <Input
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="Introduce tu contraseña"
              secureTextEntry
            />

            <Button
              title="Iniciar Sesión"
              onPress={handleLogin}
              loading={loading}
            />

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerText}>
                ¿No tienes cuenta? <Text style={styles.registerButton}>Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 120,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    color: '#E63946',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  registerLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  registerText: {
    color: '#555',
    fontSize: 14,
  },
  registerButton: {
    color: '#E63946',
    fontWeight: 'bold',
  },
});

export default LoginScreen;