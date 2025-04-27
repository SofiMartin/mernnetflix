const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');

dotenv.config();

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

  app.use(express.json());

  app.use("/api/auth", authRoute);
  app.use("/api/users", userRoute);

app.listen(8800, () => {
  console.log('Server is running on port 8800');
});