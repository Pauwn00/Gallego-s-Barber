import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import 'moment/locale/es';
import { appointmentsAPI } from '../services/api';

moment.locale('es');

// Lista de servicios disponibles
const SERVICES = [
  { id: 'haircut', name: 'Corte de pelo', price: '5€', icon: 'content-cut' },
  { id: 'shave', name: 'Afeitado', price: '5€', icon: 'face' },
  { id: 'haircut_shave', name: 'Corte y afeitado', price: '9€', icon: 'spa' },
  { id: 'styling', name: 'Peinado', price: '10€', icon: 'brush' },
  { id: 'color', name: 'Tinte', price: '30€', icon: 'palette' },
];

const BookAppointmentScreen = ({ navigation }) => {
  // Estados para el proceso de reserva
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fecha mínima seleccionable (hoy)
  const minDate = moment().format('YYYY-MM-DD');

  // Obtener horarios disponibles cuando se selecciona una fecha
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimes(selectedDate);
    }
  }, [selectedDate]);

  // Función para obtener los horarios disponibles
  const fetchAvailableTimes = async (date) => {
    setLoading(true);
    try {
      const result = await appointmentsAPI.getAvailability(date);
      
      if (result.success) {
        setAvailableSlots(result.data.available_slots || []);
      } else {
        console.error('Error al obtener horarios:', result.error);
        Alert.alert('Error', 'No se pudieron cargar los horarios disponibles');
        
        // Fallback a datos mock en caso de error
        const mockSlots = [];
        for (let hour = 9; hour < 18; hour++) {
          for (let minute of [0, 30]) {
            if (hour === 18 && minute === 0) continue;
            
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const available = Math.random() > 0.3;
            
            mockSlots.push({
              time: timeString,
              available: available,
            });
          }
        }
        setAvailableSlots(mockSlots);
      }
    } catch (error) {
      console.error('Error al obtener horarios disponibles:', error);
      Alert.alert('Error', 'No se pudieron cargar los horarios disponibles');
    } finally {
      setLoading(false);
    }
  };

  // Manejar la confirmación de la cita
  const handleConfirmAppointment = async () => {
    if (!selectedDate || !selectedTime || !selectedService) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const selectedServiceObj = SERVICES.find(s => s.id === selectedService);
      
      const appointmentData = {
        date: selectedDate,
        time: selectedTime,
        service_type: selectedServiceObj?.name || 'Servicio no especificado',
        notes: notes || null
      };

      const result = await appointmentsAPI.createAppointment(appointmentData);
      
      if (result.success) {
        Alert.alert(
          '¡Reserva confirmada!',
          `Tu cita ha sido reservada para el ${moment(selectedDate).format('DD/MM/YYYY')} a las ${selectedTime}.`,
          [
            { 
              text: 'OK', 
              onPress: () => navigation.navigate('Dashboard')
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'No se pudo confirmar la cita');
      }
    } catch (error) {
      console.error('Error al confirmar la cita:', error);
      Alert.alert('Error', 'No se pudo confirmar la cita');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar el paso 1: Seleccionar servicio
  const renderServiceSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Elige un servicio</Text>
      
      {SERVICES.map((service) => (
        <TouchableOpacity
          key={service.id}
          style={[
            styles.serviceItem,
            selectedService === service.id && styles.selectedService
          ]}
          onPress={() => setSelectedService(service.id)}
        >
          <View style={styles.serviceContent}>
            <View style={styles.serviceIconContainer}>
              <Icon name={service.icon} size={28} color="#E63946" />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.servicePrice}>{service.price}</Text>
            </View>
          </View>
          {selectedService === service.id && (
            <Icon name="check-circle" size={24} color="#E63946" />
          )}
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity
        style={[
          styles.nextButton,
          !selectedService && styles.disabledButton
        ]}
        disabled={!selectedService}
        onPress={() => setCurrentStep(2)}
      >
        <Text style={styles.nextButtonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );

  // Renderizar el paso 2: Seleccionar fecha
  const renderDateSelection = () => {
    // Marcar la fecha seleccionada en el calendario
    const markedDates = {};
    if (selectedDate) {
      markedDates[selectedDate] = {
        selected: true,
        selectedColor: '#E63946',
      };
    }
    
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Elige una fecha</Text>
        
        <Calendar
          minDate={minDate}
          markedDates={markedDates}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          theme={{
            todayTextColor: '#E63946',
            arrowColor: '#E63946',
            selectedDayBackgroundColor: '#E63946',
          }}
          style={styles.calendar}
        />
        
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(1)}
          >
            <Icon name="arrow-back" size={20} color="#666" />
            <Text style={styles.backButtonText}>Anterior</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              !selectedDate && styles.disabledButton,
              { flex: 1 }
            ]}
            disabled={!selectedDate}
            onPress={() => setCurrentStep(3)}
          >
            <Text style={styles.nextButtonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Renderizar el paso 3: Seleccionar hora
  const renderTimeSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        Horarios disponibles para el{' '}
        <Text style={styles.selectedDateText}>
          {moment(selectedDate).format('DD/MM/YYYY')}
        </Text>
      </Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#E63946" style={styles.loader} />
      ) : (
        <View style={styles.timeGrid}>
          {availableSlots.map((slot, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.timeSlot,
                !slot.available && styles.unavailableSlot,
                selectedTime === slot.time && styles.selectedTimeSlot
              ]}
              disabled={!slot.available}
              onPress={() => setSelectedTime(slot.time)}
            >
              <Text style={[
                styles.timeText,
                !slot.available && styles.unavailableTimeText,
                selectedTime === slot.time && styles.selectedTimeText
              ]}>
                {slot.time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(2)}
        >
          <Icon name="arrow-back" size={20} color="#666" />
          <Text style={styles.backButtonText}>Anterior</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedTime && styles.disabledButton,
            { flex: 1 }
          ]}
          disabled={!selectedTime}
          onPress={() => setCurrentStep(4)}
        >
          <Text style={styles.nextButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Renderizar el paso 4: Confirmación
  const renderConfirmation = () => {
    const selectedServiceObj = SERVICES.find(s => s.id === selectedService);
    
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Confirma tu cita</Text>
        
        <View style={styles.confirmationCard}>
          <View style={styles.confirmationRow}>
            <Icon name={selectedServiceObj?.icon} size={22} color="#E63946" />
            <Text style={styles.confirmationLabel}>Servicio:</Text>
            <Text style={styles.confirmationValue}>{selectedServiceObj?.name}</Text>
          </View>
          
          <View style={styles.confirmationRow}>
            <Icon name="event" size={22} color="#E63946" />
            <Text style={styles.confirmationLabel}>Fecha:</Text>
            <Text style={styles.confirmationValue}>
              {moment(selectedDate).format('dddd, D [de] MMMM [de] YYYY')}
            </Text>
          </View>
          
          <View style={styles.confirmationRow}>
            <Icon name="access-time" size={22} color="#E63946" />
            <Text style={styles.confirmationLabel}>Hora:</Text>
            <Text style={styles.confirmationValue}>{selectedTime}</Text>
          </View>
          
          <View style={styles.confirmationRow}>
            <Icon name="euro" size={22} color="#E63946" />
            <Text style={styles.confirmationLabel}>Precio:</Text>
            <Text style={styles.confirmationValue}>{selectedServiceObj?.price}</Text>
          </View>
        </View>
        
        <Text style={styles.notesLabel}>Notas adicionales (opcional):</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Añade cualquier detalle específico sobre tu reserva..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(3)}
          >
            <Icon name="arrow-back" size={20} color="#666" />
            <Text style={styles.backButtonText}>Anterior</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.confirmButton, loading && styles.disabledButton]}
            disabled={loading}
            onPress={handleConfirmAppointment}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Icon name="check" size={20} color="white" />
                <Text style={styles.confirmButtonText}>Confirmar Reserva</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Renderizar el contenido según el paso actual
  const renderStepContent = () => {
    switch(currentStep) {
      case 1: return renderServiceSelection();
      case 2: return renderDateSelection();
      case 3: return renderTimeSelection();
      case 4: return renderConfirmation();
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservar Cita</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((step) => (
          <View 
            key={step}
            style={[
              styles.progressStep,
              step <= currentStep ? styles.activeStep : {}
            ]}
          >
            <Text style={styles.progressStepText}>{step}</Text>
          </View>
        ))}
        
        <View style={styles.progressLine} />
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F1B2A',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 16,
    backgroundColor: 'white',
    position: 'relative',
  },
  progressStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  activeStep: {
    backgroundColor: '#E63946',
  },
  progressStepText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressLine: {
    position: 'absolute',
    top: 30,
    left: 55,
    right: 55,
    height: 2,
    backgroundColor: '#ddd',
    zIndex: 0,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F1B2A',
    marginBottom: 24,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedService: {
    borderColor: '#E63946',
    borderWidth: 2,
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE8E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F1B2A',
  },
  servicePrice: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  nextButton: {
    backgroundColor: '#E63946',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#ddd',
    opacity: 0.7,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendar: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginRight: 10,
  },
  backButtonText: {
    color: '#666',
    marginLeft: 4,
    fontSize: 16,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '30%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedTimeSlot: {
    backgroundColor: '#E63946',
    borderColor: '#E63946',
  },
  unavailableSlot: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  selectedTimeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  unavailableTimeText: {
    color: '#aaa',
  },
  loader: {
    marginVertical: 40,
  },
  selectedDateText: {
    color: '#E63946',
    fontWeight: 'bold',
  },
  confirmationCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmationLabel: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
    marginRight: 8,
    width: 70,
  },
  confirmationValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F1B2A',
    flex: 1,
    textTransform: 'capitalize',
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F1B2A',
    marginBottom: 10,
  },
  notesInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#E63946',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default BookAppointmentScreen;