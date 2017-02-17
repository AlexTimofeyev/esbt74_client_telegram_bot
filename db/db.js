var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

mongoose.connect( mongodbUri, function(err, res) {
  if(err){
    console.log('error while connecting to mongodb: ' + err);
  } else{
    console.log('connected to mongodb');
  }
});

mongoose.connection.on('connected', function() {
  console.log('connected');
});

mongoose.connection.on('error', function(error) {
  console.log('error ' + error );
});

mongoose.connection.on('disconnected', function() {
  console.log('disconnected');
});

process.on('SIGINT', function() {
  mongoose.connection.close( function() {
    console.log('on sigint disconnect');
    process.exit(0);
  });
});

require('./consumer.js');
