// Script para importar una hierba con estructura TCM Actions
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function importHerbWithTcmActions() {
  try {
    // Leer el archivo de datos de la hierba
    const herbFilePath = path.join('attached_assets', 'sheng_jiang_fixed.json');
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
      chineseName: herbData.chineseName || "",
      latinName: herbData.latinName || "",
      englishName: herbData.englishName || "",
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
      console.log('Hierba importada correctamente:', result);
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
importHerbWithTcmActions().then(() => {
  console.log('Proceso de importación finalizado');
}).catch(err => {
  console.error('Error general:', err);
});