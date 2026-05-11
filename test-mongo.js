require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

console.log('URI:', uri);
console.log('Connexion...');

mongoose.connect(uri)
  .then(() => {
    console.log('✅ MongoDB connecté !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  });