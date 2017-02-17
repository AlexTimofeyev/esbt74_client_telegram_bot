var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var ConsumerSchema = new mongoose.Schema({
  chatId: String,
  state: Number,
  email: String,
  password: String,
  loggedin: Boolean,
  useraccountid: String,
  accountinfoid: String,
  countercapacity: Number,
  counterscale: Number,
  inputValueDay: Number,
  inputValueNight: Number,
  inputDateStr: String,
  inputDateDojo: String
});

module.exports = mongoose.model('Consumer', ConsumerSchema);
