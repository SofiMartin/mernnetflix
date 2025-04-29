const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Importar middleware de manejo de errores
const { errorHandler } = require('./middlewares/errorHandler');

// Rutas
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const animeRoute = require('./routes/animes');
const profileRoute = require('./routes/profiles');
const watchlistRoute = require('./routes/watchlists');

// Cargar variables de entorno
dotenv.config();

// Configuración de la base de datos
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // URL del cliente
  credentials: true, // Para cookies/headers de autenticación
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization', 'token', 'profileid'] // Headers permitidos
}));
app.use(express.json());

// Rutas API
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/animes", animeRoute);
app.use("/api/profiles", profileRoute);
app.use("/api/watchlists", watchlistRoute);

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
  });
}

// Middleware de manejo de errores (debe estar al final)
app.use(errorHandler);

// Puerto
const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', err => {
  console.error('Excepción no capturada:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});