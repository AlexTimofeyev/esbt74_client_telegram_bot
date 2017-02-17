const https = require('https');
var querystring = require('querystring');
var htmlparser = require("htmlparser2");

var getSession = function( cookieStr ) {
  var parts = cookieStr.split(';');
  var sesParts = parts[0].split('=');
  return sesParts[1];
};

function login(inputData) {

/*
  return new Promise((resolve,reject) => {
    inputData.jsessionid = 'A1EB134888628A55FB93768E71F3B245';
    resolve(inputData);
  });
*/

  console.log('login: ' + inputData.name + ' ' + inputData.password );
  return new Promise((resolve, reject) => {

    var post_data = querystring.stringify({
      'username' : inputData.name,
      'password' : inputData.password
    });

    console.log( post_data );

    var options = {
      hostname: 'cabinet.esbt.ru',
      path: '/Present-web/login.action',
      method: 'POST',
      headers: {
        'Host': 'cabinet.esbt.ru',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(post_data)
      }
    };

    var req = https.request(options, (res) => {
      //console.log('status :' + res.statusCode);
      //console.log('header :' + JSON.stringify(res.headers));
      //console.log('cookie: ' + res.headers['set-cookie']);

      //console.log('JSESSIONID: ' + getSession(res.headers['set-cookie'].toString()));

      if( res.statusCode == 302 ) {
        console.log('status 302 ok');
        inputData.jsessionid = getSession(res.headers['set-cookie'].toString());
        resolve(inputData);
      } else {
        reject('error: login action: statusCode != 302 = ' + res.statusCode );
      }

      res.on('data', (d) => {
        //console.log(d);
      });
    });

    req.on('error', (e) => {
      console.error(e);
      reject(e);
    });

    req.write(post_data);
    req.end();

  });
};

function retrieveAccountId( inputData ) {

  console.log('retrieveAccountId');

  return new Promise((resolve, reject) => {
    //inputData.useraccountid = '224502';
    //resolve(inputData);
    var accountid = '';
    var parser = new htmlparser.Parser({
        onopentag: function(name, attribs){
            if(name === "input" && attribs.type === "hidden" && attribs.name === 'useraccountid'){
              accountid = attribs.value;
            }
        }
    }, {decodeEntities: true});

    var options = {
      hostname: 'cabinet.esbt.ru',
      path: '/Present-web/consumer/my_summary/menu.action',
      method: 'GET',
      headers: {
        'Host': 'cabinet.esbt.ru',
        'Referer': 'https://cabinet.esbt.ru/Present-web/appLaunch.action',
        'Cookie': 'JSESSIONID='+inputData.jsessionid
      }
    };

    //console.log(options);

    var req = https.request(options, (res) => {

      if( res.statusCode == 200 ) {
        console.log('status 200 ok');
      } else {
        reject('error: statusCode != 200 = ' + res.statusCode );
      }

      res.on('data', (d) => {
        parser.write(d.toString());
        parser.end();
        if( accountid === ''){
          reject('parser error');
        } else {
          inputData.useraccountid = accountid;
          resolve(inputData);
        }
      });
    });

    req.on('error', (e) => {
      console.error(e);
      reject(e);
    });

    req.end();
  });
};

function retrievePostOptions( opts ) {

  console.log('retrievePostOptions');

  return new Promise((resolve, reject) => {

    var parserForm = new htmlparser.Parser({
      onopentag: function(name, attribs){
        if(name === "input" && attribs.type === "hidden" ) {
          if(attribs.name === 'accountinfoid'){
            console.log('accountinfoid: ' + attribs.value );
            opts.accountinfoid = attribs.value;
          } else if(attribs.name === 'countercapacity') {
            console.log('countercapacity: ' + attribs.value);
            opts.countercapacity = attribs.value;
          } else if(attribs.name === 'counterscale') {
            console.log('couterscale: ' + attribs.value);
            opts.counterscale = attribs.value;
          }
        }
      }
    }, {decodeEntities: true});

    var options = {
      hostname: 'cabinet.esbt.ru',
      path: '/Present-web/consumer/countervalue/getNewCounterValue.action?useraccountid=' + opts.useraccountid,
      method: 'GET',
      headers: {
        'Host': 'cabinet.esbt.ru',
        'Referer': 'https://cabinet.esbt.ru/Present-web/appLaunch.action',
        'Cookie': 'JSESSIONID='+opts.jsessionid
      }
    };

    var req = https.request(options, (res) => {

      if( res.statusCode == 200 ) {
        console.log('retrievePostOptions: status 200 ok');
      } else {
        reject('error: statusCode != 200 = ' + res.statusCode );
      }

      res.on('data', (d) => {
        parserForm.write(d.toString());
        parserForm.end();
        resolve(opts);
      });
    });

    req.on('error', (e) => {
      console.error(e);
      reject(e);
    });

    req.end();

  });
};

function postConsumption( opts ) {
  return new Promise((resolve, reject) => {

    var post_data = querystring.stringify({
      'dayvalue' : opts['dayvalue'],
      'nightvalue' : opts['nightvalue'],
      'measured' : opts['measured'],
      'dojo.measured' : opts['dojo.measured'],
      'accountinfoid' : opts['accountinfoid'],
      'countercapacity' : opts['countercapacity'],
      'counterscale' : opts['counterscale']
    });

    var options = {
      hostname: 'cabinet.esbt.ru',
      path: '/Present-web/consumer/countervalue/addCounterValue.action',
      method: 'POST',
      headers: {
        'Host': 'cabinet.esbt.ru',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(post_data),
        'Cookie': 'JSESSIONID='+opts['jsessionid']
      }
    };

    console.log(post_data);
    console.log(options);
    resolve('ok');

    var req = https.request(options, (res) =>{

      if(res.statusCode == 302 ) {
        resolve('ok');
      } else {
        reject('statusCode != 302, = ' + res.statusCode );
      }

      res.on('data',(d) => {
        //console.log(d);
      });
      res.on('error', (e) => {
        //consloe.log(e);
        reject(e);
      });
    });

    req.write(post_data);
    req.end();

  });
};

function retrieveAccoundInformation( inputData ) {
  return new Promise((resolve,reject) => {
    login(inputData)
    .then( dataWithSessionId => retrieveAccountId( dataWithSessionId ))
    .then( dataWithUserAccoutId => retrievePostOptions( dataWithUserAccoutId ))
    .then( dataWithUserAccoutId => {
      resolve( dataWithUserAccoutId );
    })
    .catch( e => {
      reject( e );
    });
  });
};


module.exports.login = login;
module.exports.retrieveAccountId = retrieveAccountId;
module.exports.retrievePostOptions = retrievePostOptions;
module.exports.postConsumption = postConsumption;
module.exports.retrieveAccoundInformation = retrieveAccoundInformation;
