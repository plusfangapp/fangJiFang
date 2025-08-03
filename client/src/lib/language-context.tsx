import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definition of supported languages
export type Language = 'es' | 'en';

// Language context interface
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Translations
const translations: Record<Language, Record<string, string>> = {
  es: {
    // Aplicación
    'app.title': 'Medicina China',
    
    // Layout
    'layout.hide_sidebar': 'Ocultar panel lateral',
    'layout.show_sidebar': 'Mostrar panel lateral',
    'layout.version': 'Versión',
    'layout.about': 'Acerca de la aplicación',
    
    // Navegación
    'nav.dashboard': 'Dashboard',
    'nav.herbs': 'Hierbas',
    'nav.formulas': 'Fórmulas',
    'nav.patients': 'Pacientes',
    'nav.prescriptions': 'Prescripciones',
    'nav.account': 'Mi cuenta',
    'nav.settings': 'Configuración',
    'nav.hide_menu': 'Ocultar menú',
    'nav.tools': 'Herramientas',

    // Dashboard
    'dashboard.welcome': 'Bienvenido al sistema de gestión de Medicina Tradicional China',
    'dashboard.herbs_registered': 'Hierbas registradas',
    'dashboard.formulas_registered': 'Fórmulas registradas',
    'dashboard.patients_registered': 'Pacientes registrados',
    'dashboard.prescriptions_created': 'Prescripciones creadas',
    'dashboard.recent_activity': 'Actividad Reciente',
    
    // Hierbas
    'herbs.title': 'Hierbas',
    'herbs.subtitle': 'Gestiona y explora la base de datos de hierbas medicinales chinas',
    'herbs.new': 'Nueva Hierba',
    'herbs.search': 'Buscar hierbas por nombre, propiedad...',
    'herbs.not_found': 'No se encontraron hierbas',
    'herbs.try_again': 'Intenta con otra búsqueda o añade una nueva hierba',
    'herbs.chinese': 'Chino',
    'herbs.latin': 'Latín',
    'herbs.category': 'Categoría',
    
    // Fórmulas
    'formulas.title': 'Gestión de Fórmulas',
    'formulas.new': 'Nueva Fórmula',
    'formulas.search': 'Buscar fórmulas por nombre...',
    'formulas.filter_by_category': 'Filtrar por categoría:',
    'formulas.all_categories': 'Todas las categorías',
    'formulas.clear_filter': 'Limpiar filtro',
    'formulas.loading': 'Cargando fórmulas...',
    'formulas.not_found': 'No se encontraron fórmulas que coincidan con tu búsqueda',
    'formulas.composition': 'Composición',
    'formulas.delete_confirm': '¿Estás seguro de que deseas eliminar esta fórmula?',
    'formulas.delete_success': 'Fórmula eliminada',
    'formulas.delete_success_description': 'La fórmula ha sido eliminada exitosamente',
    'formulas.delete_error': 'Error',
    'formulas.delete_error_description': 'No se pudo eliminar la fórmula: {error}',

    // Configuración - General
    'settings.title': 'Configuración',
    'settings.subtitle': 'Gestiona tus preferencias y ajustes del sistema.',
    'settings.general': 'General',
    'settings.general.description': 'Configuración general del sistema.',
    'settings.version': 'Versión del sistema',
    'settings.current_version': 'Versión actual: 1.0.0',
    'settings.language': 'Idioma',
    'settings.database': 'Base de datos',
    'settings.make_backup': 'Hacer copia de seguridad',
    'settings.reset_app': 'Reiniciar aplicación',
    'settings.reset_default': 'Reiniciar a valores por defecto',

    // Configuración - Cuenta
    'settings.account': 'Cuenta',
    'settings.account.description': 'Actualiza tu información personal y preferencias.',
    'settings.name': 'Nombre',
    'settings.name.description': 'Tu nombre completo o nombre de usuario.',
    'settings.email': 'Email',
    'settings.email.description': 'Tu correo electrónico para notificaciones.',
    'settings.save_changes': 'Guardar cambios',

    // Configuración - Apariencia
    'settings.appearance': 'Apariencia',
    'settings.appearance.description': 'Personaliza la apariencia de la aplicación.',
    'settings.main_color': 'Color principal',
    'settings.select_color': 'Selecciona un color para la aplicación',
    'settings.font_size': 'Tamaño del texto',
    'settings.font_size.description': 'Ajusta el tamaño del texto en toda la aplicación.',
    'settings.font_size.small': 'Pequeño',
    'settings.font_size.normal': 'Normal',
    'settings.font_size.large': 'Grande',
    'settings.save_preferences': 'Guardar preferencias',

    // Configuración - Notificaciones
    'settings.notifications': 'Notificaciones',
    'settings.notifications.description': 'Configura tus preferencias de notificaciones.',
    'settings.patient_reminders': 'Recordatorios de pacientes',
    'settings.patient_reminders.description': 'Recibir notificaciones sobre citas y seguimientos de pacientes.',
    'settings.herb_updates': 'Actualizaciones de hierbas',
    'settings.herb_updates.description': 'Recibir notificaciones sobre actualizaciones en la base de datos de hierbas.',
    'settings.system_updates': 'Actualizaciones del sistema',
    'settings.system_updates.description': 'Recibir notificaciones sobre actualizaciones del sistema.',

    // Configuración - Importar/Exportar
    'settings.import_export': 'Importar/Exportar',
    'settings.import_export.description': 'Importa y exporta datos del sistema.',
    'settings.import_data': 'Importar datos',
    'settings.import.description': 'Importa datos de hierbas, fórmulas, pacientes y prescripciones desde un archivo JSON.',
    'settings.select_file': 'Seleccionar archivo para importar',
    'settings.export_data': 'Exportar datos',
    'settings.export.description': 'Exporta todos tus datos a un archivo JSON para hacer copias de seguridad o transferirlos a otro sistema.',
    'settings.export_all': 'Exportar todos los datos',

    // Mensajes Toast
    'toast.account_updated': 'Información de cuenta actualizada',
    'toast.account_updated.description': 'Los datos de la cuenta han sido actualizados correctamente.',
    'toast.appearance_updated': 'Apariencia actualizada',
    'toast.appearance_updated.description': 'Las preferencias de apariencia han sido actualizadas.',
    'toast.notifications_updated': 'Notificaciones actualizadas',
    'toast.notifications_updated.description': 'Las preferencias de notificaciones han sido actualizadas.',
    'toast.import_started': 'Importación iniciada',
    'toast.import_started.description': 'Por favor selecciona un archivo para importar.',
    'toast.export_done': 'Exportación realizada',
    'toast.export_done.description': 'Los datos han sido exportados correctamente.',
  },
  en: {
    // Application
    'app.title': 'Chinese Medicine',
    
    // Layout
    'layout.hide_sidebar': 'Hide sidebar',
    'layout.show_sidebar': 'Show sidebar',
    'layout.version': 'Version',
    'layout.about': 'About the application',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.herbs': 'Herbs',
    'nav.formulas': 'Formulas',
    'nav.patients': 'Patients',
    'nav.prescriptions': 'Prescriptions',
    'nav.account': 'My Account',
    'nav.settings': 'Settings',
    'nav.hide_menu': 'Hide menu',
    'nav.tools': 'Tools',

    // Dashboard
    'dashboard.welcome': 'Welcome to the Traditional Chinese Medicine management system',
    'dashboard.herbs_registered': 'Registered herbs',
    'dashboard.formulas_registered': 'Registered formulas',
    'dashboard.patients_registered': 'Registered patients',
    'dashboard.prescriptions_created': 'Created prescriptions',
    'dashboard.recent_activity': 'Recent Activity',
    
    // Herbs
    'herbs.title': 'Herbs',
    'herbs.subtitle': 'Manage and explore the Chinese medicinal herbs database',
    'herbs.new': 'New Herb',
    'herbs.search': 'Search herbs by name, property...',
    'herbs.not_found': 'No herbs found',
    'herbs.try_again': 'Try another search or add a new herb',
    'herbs.chinese': 'Chinese',
    'herbs.latin': 'Latin',
    'herbs.category': 'Category',
    
    // Formulas
    'formulas.title': 'Formulas Management',
    'formulas.new': 'New Formula',
    'formulas.search': 'Search formulas by name...',
    'formulas.filter_by_category': 'Filter by category:',
    'formulas.all_categories': 'All categories',
    'formulas.clear_filter': 'Clear filter',
    'formulas.loading': 'Loading formulas...',
    'formulas.not_found': 'No formulas found matching your search',
    'formulas.composition': 'Composition',
    'formulas.delete_confirm': 'Are you sure you want to delete this formula?',
    'formulas.delete_success': 'Formula deleted',
    'formulas.delete_success_description': 'The formula has been successfully deleted',
    'formulas.delete_error': 'Error',
    'formulas.delete_error_description': 'Could not delete formula: {error}',
    
    // Patients
    'patients.title': 'Patients Management',
    'patients.new': 'New Patient',
    'patients.search': 'Search patients by name...',
    'patients.loading': 'Loading patients...',
    'patients.not_found': 'No patients found matching your search',
    'patients.delete_confirm': 'Are you sure you want to delete this patient?',
    'patients.delete_success': 'Patient deleted',
    'patients.delete_success_description': 'The patient has been successfully deleted',
    'patients.delete_error': 'Error',
    'patients.delete_error_description': 'Could not delete patient: {error}',
    'patients.details': 'Patient Details',
    'patients.edit': 'Edit Patient',
    
    // Prescriptions
    'prescriptions.title': 'Prescriptions Management',
    'prescriptions.new': 'New Prescription',
    'prescriptions.search': 'Search prescriptions...',
    'prescriptions.loading': 'Loading prescriptions...',
    'prescriptions.not_found': 'No prescriptions found matching your search',
    'prescriptions.delete_confirm': 'Are you sure you want to delete this prescription?',
    'prescriptions.delete_success': 'Prescription deleted',
    'prescriptions.delete_success_description': 'The prescription has been successfully deleted',
    'prescriptions.delete_error': 'Error',
    'prescriptions.delete_error_description': 'Could not delete prescription: {error}',
    'prescriptions.details': 'Prescription Details',
    'prescriptions.edit': 'Edit Prescription',
    'prescriptions.patient': 'Patient',
    'prescriptions.formula': 'Formula',
    'prescriptions.date': 'Date',
    'prescriptions.notes': 'Notes',
    'prescriptions.print': 'Print',

    // Settings - General
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your preferences and system settings.',
    'settings.general': 'General',
    'settings.general.description': 'General system configuration.',
    'settings.version': 'System version',
    'settings.current_version': 'Current version: 1.0.0',
    'settings.language': 'Language',
    'settings.database': 'Database',
    'settings.make_backup': 'Create backup',
    'settings.reset_app': 'Reset application',
    'settings.reset_default': 'Reset to default values',

    // Settings - Account
    'settings.account': 'Account',
    'settings.account.description': 'Update your personal information and preferences.',
    'settings.name': 'Name',
    'settings.name.description': 'Your full name or username.',
    'settings.email': 'Email',
    'settings.email.description': 'Your email for notifications.',
    'settings.save_changes': 'Save changes',

    // Settings - Appearance
    'settings.appearance': 'Appearance',
    'settings.appearance.description': 'Customize the application appearance.',
    'settings.main_color': 'Main color',
    'settings.select_color': 'Select a color for the application',
    'settings.font_size': 'Font size',
    'settings.font_size.description': 'Adjust the text size throughout the application.',
    'settings.font_size.small': 'Small',
    'settings.font_size.normal': 'Normal',
    'settings.font_size.large': 'Large',
    'settings.save_preferences': 'Save preferences',

    // Settings - Notifications
    'settings.notifications': 'Notifications',
    'settings.notifications.description': 'Configure your notification preferences.',
    'settings.patient_reminders': 'Patient reminders',
    'settings.patient_reminders.description': 'Receive notifications about patient appointments and follow-ups.',
    'settings.herb_updates': 'Herb updates',
    'settings.herb_updates.description': 'Receive notifications about updates to the herb database.',
    'settings.system_updates': 'System updates',
    'settings.system_updates.description': 'Receive notifications about system updates.',

    // Settings - Import/Export
    'settings.import_export': 'Import/Export',
    'settings.import_export.description': 'Import and export system data.',
    'settings.import_data': 'Import data',
    'settings.import.description': 'Import herbs, formulas, patients, and prescription data from a JSON file.',
    'settings.select_file': 'Select file to import',
    'settings.export_data': 'Export data',
    'settings.export.description': 'Export all your data to a JSON file for backup or transfer to another system.',
    'settings.export_all': 'Export all data',

    // Toast Messages
    'toast.account_updated': 'Account information updated',
    'toast.account_updated.description': 'Account data has been successfully updated.',
    'toast.appearance_updated': 'Appearance updated',
    'toast.appearance_updated.description': 'Appearance preferences have been updated.',
    'toast.notifications_updated': 'Notifications updated',
    'toast.notifications_updated.description': 'Notification preferences have been updated.',
    'toast.import_started': 'Import started',
    'toast.import_started.description': 'Please select a file to import.',
    'toast.export_done': 'Export completed',
    'toast.export_done.description': 'Data has been successfully exported.',
  }
};

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Context provider
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en'); // English as default

  useEffect(() => {
    // Force English as default and save it
    localStorage.setItem('appLanguage', 'en');
    setLanguageState('en');
  }, []);

  // Function to change language and save it in localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('appLanguage', lang);
  };

  // Function to get a translation
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};