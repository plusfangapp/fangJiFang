// Script para importar Ma Huang con estructura completa TCM Actions
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function importMaHuang() {
  try {
    // Leer el archivo de datos de la hierba
    const herbFilePath = path.join(__dirname, 'attached_assets', 'Ma Huang mejorado.json');
    const herbData = JSON.parse(fs.readFileSync(herbFilePath, 'utf8'));
    
    console.log(`Importando ${herbData.pinyinName}...`);
    
    // Validar que la estructura de tcmActions esté completa
    if (!Array.isArray(herbData.tcmActions) || herbData.tcmActions.length === 0) {
      console.error('No se encontraron tcmActions válidos en el archivo de datos');
      return;
    }
    
    // Construir los datos para la API
    const postData = {
      pinyinName: herbData.pinyinName,
      chineseName: herbData.chineseName || "生姜",
      latinName: herbData.latinName || "",
      englishName: herbData.englishName || "Fresh Ginger",
      category: herbData.category || "",
      nature: herbData.nature || "",
      flavor: herbData.flavor || "",
      toxicity: herbData.toxicity || "",
      meridians: herbData.meridians || [],
      dosage: herbData.dosage || "",
      tcmActions: herbData.tcmActions,
      pharmacologicalEffects: herbData.pharmacologicalEffects || [],
      biologicalEffects: herbData.biologicalEffects || [],
      herbDrugInteractions: herbData.herbDrugInteractions || []
    };
    
    // Mostrar la primera acción TCM para verificar
    console.log('Primera acción TCM:', JSON.stringify(postData.tcmActions[0], null, 2));
    
    // Enviar los datos a la API
    const response = await fetch('http://localhost:5000/api/herbs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Hierba importada correctamente con ID:', result.id);
      return result;
    } else {
      const errorText = await response.text();
      console.error('Error al importar la hierba:', response.status, errorText);
    }
  } catch (error) {
    console.error('Error en la importación:', error);
  }
}

// Ejecutar la función de importación
importMaHuang().then(() => {
  console.log('Proceso de importación finalizado');
}).catch(err => {
  console.error('Error general:', err);
});