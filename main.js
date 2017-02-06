const client = require('./esbt74-client.js');
var TelegramBot = require('node-telegram-bot-api');
var verificator = require('./check_input.js');
var dateFunction = require('./date_functions.js');
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
mongoose.connect( mongodbUri, function(err,res) {
  if( err){
    console.log('error while connecting to mongodb: ' + err);
  } else{
    console.log('connected to mongodb');
  }
});

var db = mongoose.connection;

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

var Consumer = mongoose.model('Consumer', ConsumerSchema);

db.on('error', (err) => {
  console.log('error: ' + error);
});

db.on('open', () => {
  console.log('connection opened');
  //Consumer.remove({}, function(err){
  //  console.log('collection removed');
  //});
});

var bot = new TelegramBot('326208144:AAGc32GrmMc9PNFYM4GQWrqUPQFw_0VtHK4', { polling: true} );

bot.onText(/\/send/, (msg, match) => {
  Consumer.find({chatId: msg.chat.id})
  .then( consumers => {
    if( consumers.length == 0 ) {
      bot.sendMessage( msg.chat.id, 'необходимо ввести email и пароль, введите /login');
      return 0;
    } else {
      var consumer = consumers[ 0 ];
      if( consumer.loggedin === false ) {
        bot.sendMessage( msg.chat.id, 'необходимо ввести email и пароль, введите /login');
      } else {
        consumer.state = 4;
        consumer.save()
        .then( consumer => {
          if( consumer.countercapacity == 2 ) {
            bot.sendMessage( consumer.chatId, 'введите показания счетчиков через пробел в виде:\nдневной ночной');
            return 0;
          } else {
            bot.sendMessage( msg.chat.id, 'введите показания счетчика:');
            return 0;
          }
        })
      }
    }
  })
  .catch( e => {
    console.log(e);
  });
});

function createEmptyConsumer( chatid ) {
  var consumer = new Consumer({
    chatId: chatid,
    loggedin: false,
    email: '',
    password: '',
    state: 0
  });
  return consumer.save();
}

function getConsumer( chatid ) {
  return new Promise((resolve, reject) => {
    Consumer.find({chatId: chatid})
    .then( consumers => {
      if( consumers.length === 0 ) {
        return createEmptyConsumer( chatid );
      } else {
        resolve( consumers[0]);
      }
    })
  });
};

bot.onText(/\/login/, (msg) => {
  console.log('login msg');

  getConsumer( msg.chat.id )
  .then( consumer => {
    if( consumer.loggedin === true ) {
      bot.sendMessage( consumer.chatId, "у меня уже есть ваши данные");
      return 0;
    } else {
      bot.sendMessage( consumer.chatId, "введите email и пароль (через пробел)");
      consumer.state = 1;
      return consumer.save();
    }
  })
  .catch( (e) => {
    console.log(e);
  });
});

function getUserInputAsLoginData( consumer, text ) {
  return new Promise((resolve, reject) => {
    var loginData = text.split(' ');
    if( loginData.length != 2 ) {
      reject({
        'cons' : consumer,
        'error' : 'incorrect input: not 2 words'
      });
    }
    var inputData = {
      'name' : loginData[ 0 ],
      'password' : loginData[ 1 ]
    };
    console.log('resolve: ');
    console.log( inputData );
    resolve( {
      'cons' : consumer,
      'inputData' : inputData
    });
  });
};

function login( inputData ) {
  return new Promise((resolve, reject) => {
    console.log( inputData.inputData );
    client.retrieveAccoundInformation( inputData.inputData )
    .then( (userData ) => {
      console.log(userData);
      resolve({
        'cons' : inputData.cons,
        'accountinfo' : userData
      });
    })
    .catch( (e) => {
      reject({
        'cons' : inputData.cons,
        'error' : e
      });
    });
  });
}

function saveConsumerLoginInformation( account ) {
  return new Promise((resolve, reject) => {

    var consumer = account.cons;

    consumer.email = account.accountinfo.name;
    consumer.state = 3;
    consumer.password = account.accountinfo.password;
    consumer.loggedin = true;
    consumer.useraccountid = account.accountinfo.useraccountid;
    consumer.accountinfoid = account.accountinfo.accountinfoid;
    consumer.countercapacity = account.accountinfo.countercapacity;
    consumer.counterscale = account.accountinfo.counterscale;

    consumer.save()
    .then( cons => {

      console.log(consumer);

      resolve({
        'cons' : cons,
        'text' : 'check ok'
      });
    })
    .catch( e => {
      reject({
        'cons' : consumer,
        'error' : e
      })
    });
  });
};

function getExistingConsumer( chatId ) {
  return new Promise((resolve,reject) => {
    Consumer.find({chatId: chatId})
    .then( consumers => {
      if( consumers.length === 0 ) {
        reject('вы не зарегистированы')
      } else {
        resolve( consumers[ 0 ]);
      }
    })
    .catch( e => {
      reject( e );
    });
  });
};

bot.onText(/\/cancel/, (msg) => {
  console.log('on cancel');
  getExistingConsumer( msg.chat.id)
  .then( consumer => {
    if( consumer.state === 5 ) {
      bot.sendMessage(consumer.chatId, 'передача данных отменена');
      consumer.state = 3;
      return consumer.save();
    } else {
      bot.sendMessage(consumer.chatId, 'нечего отменять');
      return 0;
    }
  })
  .catch( e => {
    console.log(e);
    bot.sendMessage( msg.chat.id, e );
  });
});

bot.onText(/\/approve/, (msg) => {
  console.log('on approve');
  getExistingConsumer( msg.chat.id )
  .then( consumer => {

    if( consumer.state === 5 ) {
      bot.sendMessage(consumer.chatId, 'пытаюсь передать данные на сервер...');

      var inputData = {};
      inputData.name = consumer.email;
      inputData.password = consumer.password;

      client.login( inputData )
      .then( dataWithSessionId => {
        dataWithSessionId.dayvalue = consumer.inputValueDay;
        dataWithSessionId.nightvalue = consumer.inputValueNight;
        dataWithSessionId.measured = consumer.inputDateStr;
        dataWithSessionId['dojo.measured'] = consumer.inputDateDojo;
        dataWithSessionId.accountinfoid = consumer.accountinfoid;
        dataWithSessionId.countercapacity = consumer.countercapacity;
        dataWithSessionId.counterscale = consumer.counterscale;
        return client.postConsumption( dataWithSessionId );
      })
      .then( result => {
        bot.sendMessage(consumer.chatId, 'данные переданы успешно');
        consumer.state = 3;
        return consumer.save();
      })
      .catch( e => {
        bot.sendMessage(consumer.chatId, e);
      });

    } else {
      bot.sendMessage(consumer.chatId, 'нечего подтверждать, необходимо ввести показания счетчиков сначала командой /send');
      return 0;
    }

  })
  .catch( e => {
    console.log(e);
    return 0;
  });
});

function getUserInputAsConsumption( consumer, text ) {
    var consumption = verificator.checkInputConsumption( text, consumer.countercapacity, consumer.counterscale );
    console.log(consumption);
    return consumption;
};

bot.on( 'message', (msg) => {
  console.log('on message');
  if(msg.text[0] != '/') {
    return;
  }
  Consumer.find({chatId: msg.chat.id})
  .then( consumers => {
    if( consumers.length === 0 ) {
      bot.sendMessage( msg.chat.id, "type /login first" );
      return 0;
    } else {
      var consumer = consumers[ 0 ];
      if( consumer.state == 1 ) { // after login
        getUserInputAsLoginData( consumer, msg.text )
        .then( inputData => login( inputData ))
        .then( userData => saveConsumerLoginInformation( userData ))
        .then( consData => {
          bot.sendMessage( consData.cons.chatId, 'login ok');
          return 0;
        })
        .catch( e => {
          bot.sendMessage( e.cons.chatId, e.error );
          return;
        });
      } else if( consumer.state == 4 ) {  // after /send
        var consumption = getUserInputAsConsumption( consumer, msg.text );
        if( consumption.checkResult === true ) {
          consumer.state = 5;
          consumer.inputValueDay = consumption.measure1;
          consumer.inputValueNight = consumption.measure2;

          var dateValue = dateFunction.getMeasuredDate();
          consumer.inputDateStr = dateValue['measured'];
          consumer.inputDateDojo = dateValue['dojo.measured'];

          consumer.save().then( consumer => {
            bot.sendMessage( consumer.chatId, 'Подтвердите передачу следующих данных:'
            + '\nДень: ' + consumer.inputValueDay + " Ночь: " + consumer.inputValueNight
            + '\nДата: ' + consumer.inputDateDojo + '\n(' + consumer.inputDateStr + ')'
            + "\n/approve - подтвердить, /cancel - отменить" );
            return 0;
          })
          .catch(e => {
            console.log( e );
            return 0;
          });
        } else {
          bot.sendMessage( consumer.chatId, 'я не смог распознать ваш ввод');
          consumer.state = 3;
          return consumer.save();
        }

      }
    }
  })
  .catch((error) => {
    console.log('on message' + error);
  });
});
