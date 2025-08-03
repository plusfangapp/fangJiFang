import pkg from 'pg';
const { Pool } = pkg;

async function addMedicationsColumn() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Iniciando migración para añadir columna medications a la tabla patients...');
    
    // Verificar si la columna medications ya existe
    const checkColumnResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'patients' AND column_name = 'medications'
    `);

    // Solo añadir la columna si no existe
    if (checkColumnResult.rows.length === 0) {
      // Agregar columna medications a la tabla patients
      await pool.query(`
        ALTER TABLE patients
        ADD COLUMN medications JSONB DEFAULT '[]'::jsonb
      `);
      console.log('✅ Columna "medications" añadida correctamente a la tabla patients');
    } else {
      console.log('ℹ️ La columna "medications" ya existe en la tabla patients');
    }

    // Crear tabla medications si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medications (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        dosage TEXT,
        frequency TEXT,
        notes TEXT
      )
    `);
    console.log('✅ Tabla "medications" creada/verificada correctamente');

    console.log('✅ Migración completada con éxito');
  } catch (error) {
    console.error('❌ Error ejecutando la migración:', error);
  } finally {
    await pool.end();
  }
}

addMedicationsColumn().catch(console.error);