var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const { connectToMongoDB } = require('./config/mongo.connections');
const authMiddleware = require('./middleware/logs.middleware');
const aiDiagnosticRoutes = require('./routes/aiDiagnostic.routes');
 
var indexRouter = require('./routes/index');
var utilisateurRouter = require('./routes/utilisateur.routes');
var fermeRouter = require('./routes/ferme.routes');
var capteurRouter = require('./routes/capteur.routes');
var actionneurRouter = require('./routes/actionneur.routes');
var energieRouter = require('./routes/energie.routes');
var alerteRouter = require('./routes/alerte.routes');
var analyseRouter = require('./routes/analyse.routes');
 
const http = require('http');
require('dotenv').config();
 
var app = express();
 
// Configuration CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
 
app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
 
// CORRECTION: Middleware d'authentification (sans quotes)
//app.use(authMiddleware);
 
// Routes
app.use('/', indexRouter);
app.use('/users', utilisateurRouter);
app.use('/api/farm', fermeRouter);
app.use('/api/sensors', capteurRouter);
app.use('/api/actuators', actionneurRouter);
app.use('/api/energy', energieRouter);
app.use('/api/alerte', alerteRouter);
app.use('/api/analyse', analyseRouter);
app.use('/images', express.static('public/images'));
app.use('/api/ai-diagnostic', aiDiagnosticRoutes); 
// Gestion des erreurs 404
app.use(function(req, res, next) {
  next(createError(404));
});
 
// Gestionnaire d'erreurs
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({ error: err.message });
});
 
// Démarrage du serveur
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
 
server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`🚀 Node.js version: ${process.version}`);
  console.log(`🌐 CORS activé pour: ${process.env.CORS_ORIGIN || "*"}`);
});
 
module.exports = app;