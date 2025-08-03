import * as bcrypt from 'bcrypt';
import { pool } from './db';

async function createAdminUser() {
  try {
    const plainPassword = 'adminpass';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    console.log('Creando usuario administrador...');
    
    // Insertar el usuario administrador
    const result = await pool.query(
      `INSERT INTO users (username, password, full_name, email, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      ['admin', hashedPassword, 'Administrador', 'admin@example.com', 'admin']
    );
    
    console.log(`Usuario administrador creado con ID: ${result.rows[0].id}`);
    console.log('Email: admin@example.com');
    console.log('Contraseña: adminpass');
    
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error);
  } finally {
    // Cerrar la conexión
    await pool.end();
  }
}

createAdminUser();