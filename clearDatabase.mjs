// Script para eliminar hierbas y fórmulas excepto Sheng Jiang
import fetch from 'node-fetch';

async function clearDatabaseExceptShengJiang() {
  try {
    // 1. Obtener todas las hierbas
    const herbsResponse = await fetch('http://localhost:5000/api/herbs');
    const herbs = await herbsResponse.json();
    console.log(`Encontradas ${herbs.length} hierbas en la base de datos`);
    
    // 2. Filtrar para mantener solo Sheng Jiang y eliminar el resto
    const herbsToDelete = herbs.filter(herb => herb.pinyinName !== 'Sheng Jiang');
    console.log(`Se eliminarán ${herbsToDelete.length} hierbas, manteniendo solo Sheng Jiang`);
    
    // 3. Eliminar las hierbas seleccionadas
    for (const herb of herbsToDelete) {
      console.log(`Eliminando hierba: ${herb.pinyinName} (ID: ${herb.id})`);
      const deleteResponse = await fetch(`http://localhost:5000/api/herbs/${herb.id}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        console.log(`- Hierba ${herb.pinyinName} eliminada correctamente`);
      } else {
        console.error(`- Error al eliminar la hierba ${herb.pinyinName}: ${deleteResponse.status}`);
      }
    }
    
    // 4. Obtener todas las fórmulas
    const formulasResponse = await fetch('http://localhost:5000/api/formulas');
    const formulas = await formulasResponse.json();
    console.log(`Encontradas ${formulas.length} fórmulas en la base de datos`);
    
    // 5. Eliminar todas las fórmulas
    for (const formula of formulas) {
      console.log(`Eliminando fórmula: ${formula.pinyinName} (ID: ${formula.id})`);
      const deleteResponse = await fetch(`http://localhost:5000/api/formulas/${formula.id}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        console.log(`- Fórmula ${formula.pinyinName} eliminada correctamente`);
      } else {
        console.error(`- Error al eliminar la fórmula ${formula.pinyinName}: ${deleteResponse.status}`);
      }
    }
    
    console.log('Limpieza de la base de datos completada');
    
  } catch (error) {
    console.error('Error al limpiar la base de datos:', error);
  }
}

clearDatabaseExceptShengJiang();