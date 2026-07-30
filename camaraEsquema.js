// Ejemplo de esquema Camara (simplificado)
const { Schema, model } = require('mongoose');

const CamaraSchema = new Schema({
    creador: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    marca: String,
    modelo: String,
    tipo: String,
    fechaCreacion: { type: Date, default: Date.now },
    formato: String,
    resolucion: String,
    estado: String,
    precioEstimado: Number,
    observaciones: String,
    imagenUrl: String
});
const Camara = model('Camara', CamaraSchema);
module.exports = Camara;