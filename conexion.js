const mongoose = require('mongoose');
import dotenv from 'dotenv';
dotenv.config();
//const uri = 'mongodb+srv://2022167_db_user:TAeJ83YKyLj3qrcu@cluster0.4tvtzmg.mongodb.net/?appName=Cluster0';
const uri = process.env.MONGO; // Reemplaza con tu URI de conexión a MongoDB Atlas
async function conectarBD() {
try {
await mongoose.connect(uri);
console.log('Conectado correctamente a MongoDB Atlas con Mongoose');
} catch (error) {
console.log('Error conectando con Mongoose:', error.message);
}
}
module.exports = conectarBD;