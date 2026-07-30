const bcrypt = require('bcryptjs');
const express = require('express');
import dotenv from 'dotenv';
dotenv.config();
const app = express();

app.use(express.json());


//++++++++++++++++++++++++++++++//
//++++++++++++++++++++++++++++++//

// Middleware para parsear JSON en las peticiones (body-parser integrado)

const Usuario = require('./usuarioEsquema'); // Importamos el modelo de Usuario
const Camara = require('./camaraEsquema');
const conectarBD = require("./conexion")
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
async function iniciarServidor() {
await conectarBD();
}
iniciarServidor();

// Middleware para verificar JWT
function verificarToken(req, res, next) {
  console.log(req)
  const authHeader = req.headers['authorization'];  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  const token = authHeader.split(' ')[1];  // Espera formato "Bearer token"
  console.log(token)
  try {
    const decoded = jwt.verify(token, process.env.SECRETO);    // Verifica y decodifica el token
    console.log(decoded)
    req.usuarioId = decoded.id;                    // Guardamos el id del token en la request para usarlo después
    next();                                       // Token válido, continuar a la siguiente función
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

// Registro de un nuevo usuario
app.post('/api/registro', async (req, res) => {
  try {
    const { nombre, email, clave } = req.body;
    
    // 1. Generar un salt (semilla aleatoria) para el hash
    const salt = await bcrypt.genSalt(10);                  // 10 rondas de generación de salt
    // 2. Hashear la contraseña proporcionada usando el salt generado
    const hash = await bcrypt.hash(clave, salt);
    
    // 3. Crear y guardar el nuevo usuario con la contraseña hasheada
    const nuevoUsuario = new Usuario({ nombre, email, clave: hash });
    await nuevoUsuario.save();
    
    res.status(201).json({ mensaje: 'Usuario registrado con éxito', id: nuevoUsuario._id });
  } catch (error) {
    res.status(400).json({ error: 'No se pudo registrar el usuario' });
  }
});

// Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();    // Busca todos los documentos de usuarios en la BD
    res.json(usuarios);                       // Responde con la lista en formato JSON
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' }); // Error genérico en caso de fallo
  }
});

// Obtener un usuario por ID
app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id); // Busca usuario por el ID proporcionado
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' }); // Si no existe, 404
    }
    res.json(usuario); // Si existe, lo devolvemos en JSON
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

////

// Actualizar un usuario existente
app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const datosActualizados = req.body;
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      datosActualizados,
      { new: true } // opción new:true para obtener el documento actualizado
    );
    if (!usuarioActualizado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuarioActualizado);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar un usuario
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuarioEliminado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

//CRUD
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor API escuchando en http://localhost:${PORT}`);
});
// 

app.get('/api/camaras', verificarToken, async (req, res) => {
  try {
    const camaras = await Camara.find({
    
    }).sort({ fechaCreacion: -1 });
 
    res.json(camaras);
 
  } catch (error) {
    console.error('Error al obtener camaras:', error);
 
    res.status(500).json({
      error: 'Error al obtener las camaras'
    });
  }
});

// Obtener una camara por ID
app.get('/api/camaras/:id', verificarToken, async (req, res) => {
  try {
    const camara = await Camara.findOne({
      _id: req.params.id
    });
 
    if (!camara) {
      return res.status(404).json({
        error: 'Camara no encontrada'
      });
    }
 
    res.json(camara);
 
  } catch (error) {
    console.error('Error al obtener camara:', error);
 
    res.status(400).json({
      error: 'Identificador de camara inválido'
    });
  }
});

// Crear una nueva camara

app.post(
'/api/camaras',
verificarToken,
async (req,res)=>{

    console.log("Archivo recibido:");
    console.log(req.file);

    console.log("Datos recibidos:");
    console.log(req.body);


    try {

        const {
            marca,
            modelo,
            tipo,
            formato,
            resolucion,
            estado,
            precioEstimado,
            observaciones
        } = req.body;


        const nuevaCamara = new Camara({

            creador:req.usuarioId,

            marca,
            modelo,
            tipo,
            formato,
            resolucion,
            estado,

            precioEstimado:Number(precioEstimado),

            observaciones
        });


        const camaraGuardada = await nuevaCamara.save();


        res.status(201).json(camaraGuardada);


    } catch(error){

        console.error("Error al crear camara:",error);

        res.status(400).json({
            error:"Error al crear la camara"
        });

    }

});

// Actualizar una camara existente
app.put('/api/camaras/:id', verificarToken, async (req, res) => {
  try {
    const {
      marca,
      modelo,
      tipo,
      formato,
      resolucion,
      estado,
      precioEstimado,
      observaciones,
    } = req.body;
 
    const camaraActualizada = await Camara.findOneAndUpdate(
      {
        _id: req.params.id
      },
      {
        marca,
        modelo,
        tipo,
        formato,
        resolucion,
        estado,
        precioEstimado,
        observaciones,
      },
      {
        new: true,
        runValidators: true
      }
    );
 
    if (!camaraActualizada) {
      return res.status(404).json({
        error: 'Camara no encontrada'
      });
    }
 
    res.json(camaraActualizada);
 
  } catch (error) {
    console.error('Error al actualizar camara:', error);
 
    res.status(400).json({
      error: 'Error al actualizar la camara'
    });
  }
});
 
// Eliminar una camara
app.delete('/api/camaras/:id', verificarToken, async (req, res) => {
  try {
    const camaraEliminada = await Camara.findOneAndDelete({
      _id: req.params.id
    });
 
    if (!camaraEliminada) {
      return res.status(404).json({
        error: 'Camara no encontrada'
      });
    }
 
    res.json({
      mensaje: 'Camara eliminada correctamente'
    });
 
  } catch (error) {
    console.error('Error al eliminar camara:', error);
  }
    res.status(400).json({
      error: 'Error al eliminar la camara'
    });
  });

//
const jwt = require('jsonwebtoken');
 
// Login de usuario (autenticación)
app.post('/api/login', async (req, res) => {
  try {
    const { email, clave } = req.body;
    
    // 1. Buscar al usuario por email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' }); // No se encontró el email
    }
    // 2. Verificar la contraseña con bcrypt.compare
    const passwordOk = await bcrypt.compare(clave, usuario.clave);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' }); // Contraseña incorrecta
    }
    
    // 3. Credenciales válidas: Generar token JWT
    const datosToken = { id: usuario._id };            // Podemos incluir datos en el token (p.ej. el ID de usuario)
    const secreto = process.env.SECRETO;            // Clave secreta para firmar el token (en producción, mantener en una variable de entorno)
    const opciones = { expiresIn: '1h' };              // El token expirará en 1 hora
    const token = jwt.sign(datosToken, secreto, opciones);
    
    // 4. Enviar el token al cliente
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.post('/api/verificatoken',verificarToken, async (req, res) => {
console.log("entra")
  try {
    res.send("verificado")                      // Responde con la lista en formato JSON
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error del servidor' }); // Error genérico en caso de fallo
  }
});

app.get('/api/usuario-logueado', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuarioId).select('-clave');

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json(usuario);

  } catch (error) {
    res.status(500).json({
      error: 'Error del servidor'
    });
  }
});