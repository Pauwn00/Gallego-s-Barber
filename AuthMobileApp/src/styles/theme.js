// Colores principales de la app
export const Colors = {
  // Colores primarios
  primary: '#6366F1',      // Índigo vibrante
  primaryDark: '#4F46E5',  // Índigo oscuro
  primaryLight: '#818CF8', // Índigo claro
  
  // Colores secundarios
  secondary: '#EC4899',     // Rosa vibrante
  secondaryDark: '#DB2777', // Rosa oscuro
  secondaryLight: '#F472B6', // Rosa claro
  
  // Colores de gradiente
  gradientStart: '#6366F1',
  gradientEnd: '#EC4899',
  
  // Colores neutros
  background: '#F8FAFC',    // Gris muy claro
  surface: '#FFFFFF',       // Blanco
  card: '#F1F5F9',         // Gris claro
  
  // Colores de texto
  textPrimary: '#1E293B',   // Gris oscuro
  textSecondary: '#64748B', // Gris medio
  textLight: '#94A3B8',     // Gris claro
  
  // Estados
  success: '#10B981',       // Verde
  error: '#EF4444',         // Rojo
  warning: '#F59E0B',       // Amarillo
  info: '#3B82F6',          // Azul
  
  // Colores especiales
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  border: '#E2E8F0',
}

// Tipografía
export const Typography = {
  // Tamaños de fuente
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // Pesos de fuente
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }
}

// Espaciado
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
}

// Bordes y sombras
export const Layout = {
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 999,
  },
  
  shadows: {
    small: {
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    }
  }
}