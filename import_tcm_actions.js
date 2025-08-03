import fs from 'fs';
import path from 'path';

async function importTcmActions() {
  try {
    const filePath = path.join('attached_assets', 'sheng_jiang_fixed.json');
    console.log(`Leyendo archivo desde: ${filePath}`);
    
    const fileData = fs.readFileSync(filePath, 'utf8');
    const herbData = JSON.parse(fileData);
    
    console.log(`Datos leídos correctamente para: ${herbData.pinyinName}`);
    
    // Verificar la estructura de tcmActions
    if (Array.isArray(herbData.tcmActions) && herbData.tcmActions.length > 0) {
      console.log(`Se encontraron ${herbData.tcmActions.length} tcmActions.`);
      
      // Mostrar la primera función
      const firstAction = herbData.tcmActions[0];
      console.log('Primera acción:', {
        function: firstAction.function,
        clinicalUsesCount: firstAction.clinicalUses?.length || 0
      });
      
      // Preparar los datos para POST
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
      
      // Guardar un archivo JSON con el formato correcto para importación
      const outputPath = path.join('attached_assets', 'import_ready.json');
      fs.writeFileSync(outputPath, JSON.stringify(postData, null, 2));
      console.log(`Archivo listo para importación guardado en: ${outputPath}`);
      
    } else {
      console.error('No se encontraron tcmActions o no están en formato de array');
    }
    
  } catch (error) {
    console.error('Error al importar las acciones TCM:', error);
  }
}

importTcmActions();