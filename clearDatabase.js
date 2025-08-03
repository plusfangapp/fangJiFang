
const { Pool } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

dotenv.config();

async function removeDuplicates() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL must be set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Remove duplicate prescriptions based on patientId and formulaId
    await pool.query(`
      DELETE FROM prescriptions a USING prescriptions b
      WHERE a.id > b.id 
      AND a.patient_id = b.patient_id 
      AND a.formula_id = b.formula_id
    `);
    console.log('- Prescripciones duplicadas eliminadas');
    
    // Remove duplicate herbs based on pinyinName
    await pool.query(`
      DELETE FROM herbs a USING herbs b
      WHERE a.id > b.id 
      AND LOWER(a.pinyin_name) = LOWER(b.pinyin_name)
    `);
    console.log('- Hierbas duplicadas eliminadas');
    
    // Remove duplicate formulas based on pinyinName
    await pool.query(`
      DELETE FROM formulas a USING formulas b
      WHERE a.id > b.id 
      AND LOWER(a.pinyin_name) = LOWER(b.pinyin_name)
    `);
    console.log('- Fórmulas duplicadas eliminadas');
    
    // Remove duplicate patients based on name and identifier
    await pool.query(`
      DELETE FROM patients a USING patients b
      WHERE a.id > b.id 
      AND LOWER(a.name) = LOWER(b.name)
      AND (a.identifier = b.identifier OR (a.identifier IS NULL AND b.identifier IS NULL))
    `);
    console.log('- Pacientes duplicados eliminados');
    
    console.log('Se han eliminado todos los duplicados correctamente');
  } catch (error) {
    console.error('Error al eliminar duplicados:', error);
  } finally {
    await pool.end();
  }
}

removeDuplicates();
