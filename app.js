var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { connectToMongoDB } = require('./config/mongo.connections');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user.routes');

// Nouvelles routes (avec les noms de fichiers renommés)
var farmRouter = require('./routes/farm.routes');
var sensorRouter = require('./routes/sensor.routes');
var actuatorRouter = require('./routes/actuator.routes');
var energyRouter = require('./routes/energy.routes');
var eventRouter = require('./routes/event.routes');

const http = require('http');
require('dotenv').config();

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Monter les nouvelles routes API sous le préfixe /api
app.use('/api/farm', farmRouter);
app.use('/api/sensors', sensorRouter);
app.use('/api/actuators', actuatorRouter);
app.use('/api/energy', energyRouter);
app.use('/api/events', eventRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json('error');
});

const server = http.createServer(app);//sna3na server
server.listen(process.env.PORT, () => {
  connectToMongoDB();
  console.log(`server is running on port ${process.env.PORT}`);
});