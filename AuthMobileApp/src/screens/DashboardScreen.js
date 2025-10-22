import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, appointmentsAPI } from '../services/api';
import moment from 'moment';
import 'moment/locale/es';  // Importamos la localización en español
import Icon from 'react-native-vector-icons/MaterialIcons';

moment.locale('es');  // Configuramos moment para usar español

const DashboardScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar datos del usuario y citas al montar el componente
  useEffect(() => {
    loadUserData();
    loadAppointments();
  }, []);

  // Cargar datos del usuario
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.username || 'Usuario');
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
  };

  // Cargar las citas del usuario
  const loadAppointments = async () => {
    setLoading(true);
    try {
      const result = await appointmentsAPI.getMyAppointments();
      
      if (result.success) {
        // Convertir las fechas de string a objetos Date
        const appointmentsWithDates = result.data.map(appointment => ({
          ...appointment,
          date: new Date(appointment.date)
        }));
        setAppointments(appointmentsWithDates);
      } else {
        console.error('Error al cargar citas:', result.error);
        // Fallback a datos mock en caso de error
        const mockAppointments = [
          {
            id: 1,
            date: new Date(2025, 8, 25),
            time: '10:30',
            service_type: 'Corte de pelo',
            notes: 'Degradado en los lados'
          },
          {
            id: 2,
            date: new Date(2025, 8, 30),
            time: '16:00',
            service_type: 'Afeitado',
            notes: 'Afeitado completo con navaja'
          },
        ];
        setAppointments(mockAppointments);
      }
    } catch (error) {
      console.error('Error al cargar citas:', error);
      // En caso de error, usar datos mock
      setAppointments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Manejar refresh al deslizar hacia abajo
  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }]
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Ir a la pantalla de reserva
  const handleNewAppointment = () => {
    navigation.navigate('BookAppointment');
  };

  // Cancelar una cita
  const handleCancelAppointment = async (appointmentId) => {
    Alert.alert(
      'Cancelar Cita',
      '¿Estás seguro de que quieres cancelar esta cita?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await appointmentsAPI.cancelAppointment(appointmentId);
              
              if (result.success) {
                Alert.alert('Éxito', 'La cita ha sido cancelada');
                // Recargar las citas
                loadAppointments();
              } else {
                Alert.alert('Error', result.error || 'No se pudo cancelar la cita');
              }
            } catch (error) {
              console.error('Error al cancelar cita:', error);
              Alert.alert('Error', 'No se pudo cancelar la cita');
            }
          },
        },
      ]
    );
  };

  // Renderizar cada cita
  const renderAppointmentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => {/* Ver detalle de cita */}}
    >
      <View style={styles.appointmentHeader}>
        <Text style={styles.serviceType}>{item.service_type}</Text>
        <View style={styles.dateContainer}>
          <Icon name="event" size={16} color="#555" />
          <Text style={styles.date}>
            {moment(item.date).format('dddd, D [de] MMMM')}
          </Text>
        </View>
      </View>
      
      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Icon name="access-time" size={16} color="#555" />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
        
        {item.notes && (
          <View style={styles.detailRow}>
            <Icon name="note" size={16} color="#555" />
            <Text style={styles.detailText}>{item.notes}</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={() => handleCancelAppointment(item.id)}
      >
        <Text style={styles.cancelText}>Cancelar cita</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color="#E63946" />
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>¡Bienvenido, {userName}!</Text>
          <Text style={styles.subtitle}>
            Reserva tu próxima cita o gestiona tus reservas existentes
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.newAppointmentButton}
          onPress={handleNewAppointment}
        >
          <Icon name="calendar-today" size={20} color="#fff" />
          <Text style={styles.newAppointmentText}>Nueva Reserva</Text>
        </TouchableOpacity>

        <View style={styles.appointmentsSection}>
          <Text style={styles.sectionTitle}>Mis Citas</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#E63946" />
          ) : appointments.length > 0 ? (
            appointments.map((item) => renderAppointmentItem({ item }))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="event-busy" size={50} color="#ccc" />
              <Text style={styles.emptyStateText}>
                No tienes citas programadas
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Reserva tu primera cita ahora
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  logo: {
    width: 120,
    height: 50,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  logoutText: {
    color: '#E63946',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F1B2A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
  },
  newAppointmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E63946',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  newAppointmentText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  appointmentsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F1B2A',
    marginBottom: 16,
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  appointmentHeader: {
    marginBottom: 12,
  },
  serviceType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F1B2A',
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: '#555',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  appointmentDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 6,
  },
  cancelButton: {
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelText: {
    color: '#E63946',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#555',
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
});

export default DashboardScreen;