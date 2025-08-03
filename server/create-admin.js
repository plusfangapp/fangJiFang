const bcrypt = require('bcrypt');
const { Pool } = require('@neondatabase/serverless');

async function createAdminUser() {
  // Configuración de la conexión a la base de datos
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    // Primero eliminamos cualquier usuario admin existente
    await pool.query("DELETE FROM users WHERE username = 'admin'");
    
    // Crear hash de la contraseña
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insertar el usuario administrador
    const result = await pool.query(
      `INSERT INTO users (username, password, full_name, email, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      ['admin', hashedPassword, 'Administrador', 'admin@ejemplo.com', 'admin']
    );
    
    console.log(`Usuario administrador creado con ID: ${result.rows[0].id}`);
    console.log('Credenciales:');
    console.log('- Usuario: admin');
    console.log('- Contraseña: admin123');
    
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser();