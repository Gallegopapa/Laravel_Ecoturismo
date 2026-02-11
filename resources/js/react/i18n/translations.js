/**
 * Archivo de Traducciones
 * 
 * Sistema simple de internacionalización (i18n) sin librerías externas.
 * 
 * Estructura:
 * - Objeto con claves de idioma ('es', 'en')
 * - Cada idioma contiene un objeto con traducciones
 * - Las claves son nombres descriptivos en camelCase
 * 
 * Uso:
 * import { useTranslation } from './useTranslation';
 * const { t } = useTranslation();
 * <h1>{t('welcome')}</h1>
 */

export const translations = {
  es: {
    // Panel de Accesibilidad
    accessibility: 'Accesibilidad',
    accessibilityOptions: 'Opciones de Accesibilidad',
    increaseFontSize: 'Aumentar tamaño de texto',
    decreaseFontSize: 'Disminuir tamaño de texto',
    highContrast: 'Alto contraste',
    underlineLinks: 'Subrayar enlaces',
    grayscale: 'Escala de grises',
    resetSettings: 'Restablecer configuración',
    language: 'Idioma',
    selectLanguage: 'Seleccionar idioma',
    spanish: 'Español',
    english: 'Inglés',
    closePanel: 'Cerrar panel',
    openAccessibilityPanel: 'Abrir panel de accesibilidad',
    
    // Estados de configuración
    active: 'Activado',
    inactive: 'Desactivado',
    fontSizeNormal: 'Normal',
    fontSizeLarge: 'Grande',
    fontSizeExtraLarge: 'Extra grande',
    
    // Navegación general
    home: 'Inicio',
    places: 'Lugares',
    ecohotels: 'Ecohoteles',
    about: 'Nosotros',
    contact: 'Contacto',
    login: 'Iniciar sesión',
    register: 'Registrarse',
    logout: 'Cerrar sesión',
    
    // Mensajes comunes
    welcome: 'Bienvenido',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    save: 'Guardar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    delete: 'Eliminar',
    edit: 'Editar',
    search: 'Buscar',
    filter: 'Filtrar',
    
    // Accesibilidad - descripciones
    fontSizeDescription: 'Ajusta el tamaño del texto para facilitar la lectura',
    highContrastDescription: 'Aumenta el contraste de colores para mejor visibilidad',
    underlineLinksDescription: 'Subraya todos los enlaces para identificarlos fácilmente',
    grayscaleDescription: 'Convierte la interfaz a escala de grises',
    resetDescription: 'Restaura todas las configuraciones a valores predeterminados',
    languageDescription: 'Cambia el idioma de la interfaz',
  },
  
  en: {
    // Accessibility Panel
    accessibility: 'Accessibility',
    accessibilityOptions: 'Accessibility Options',
    increaseFontSize: 'Increase text size',
    decreaseFontSize: 'Decrease text size',
    highContrast: 'High contrast',
    underlineLinks: 'Underline links',
    grayscale: 'Grayscale',
    resetSettings: 'Reset settings',
    language: 'Language',
    selectLanguage: 'Select language',
    spanish: 'Spanish',
    english: 'English',
    closePanel: 'Close panel',
    openAccessibilityPanel: 'Open accessibility panel',
    
    // Configuration states
    active: 'Active',
    inactive: 'Inactive',
    fontSizeNormal: 'Normal',
    fontSizeLarge: 'Large',
    fontSizeExtraLarge: 'Extra large',
    
    // General navigation
    home: 'Home',
    places: 'Places',
    ecohotels: 'Ecohotels',
    about: 'About',
    contact: 'Contact',
    login: 'Log in',
    register: 'Sign up',
    logout: 'Log out',
    
    // Common messages
    welcome: 'Welcome',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    
    // Accessibility - descriptions
    fontSizeDescription: 'Adjust text size for easier reading',
    highContrastDescription: 'Increase color contrast for better visibility',
    underlineLinksDescription: 'Underline all links for easy identification',
    grayscaleDescription: 'Convert interface to grayscale',
    resetDescription: 'Restore all settings to default values',
    languageDescription: 'Change interface language',
  }
};

/**
 * Obtener traducción por clave
 * @param {string} key - Clave de traducción
 * @param {string} language - Idioma ('es' o 'en')
 * @returns {string} - Texto traducido
 */
export const getTranslation = (key, language) => {
  const translation = translations[language]?.[key];
  
  if (!translation) {
    console.warn(`Traducción no encontrada: ${key} (${language})`);
    return key; // Retorna la clave si no encuentra traducción
  }
  
  return translation;
};
