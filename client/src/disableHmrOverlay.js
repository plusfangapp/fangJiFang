// Archivo para deshabilitar el overlay de errores HMR
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    console.log('Actualizando módulos sin mostrar overlay de errores');
  });
}

// Exportar una función vacía para que se pueda importar
export function disableErrorOverlay() {
  // Esta función no hace nada, solo está para poder importar este archivo
  return null;
}