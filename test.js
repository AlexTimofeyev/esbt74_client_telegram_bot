const client = require('./esbt74-client.js');
var dateFunction = require('./date_functions.js');

var inputData = {
  'name' : 'ni2c2k@gmail.com',
  'password' : 'ekaterina'
};

var addValues = function( dataWithPostOptions ) {
  return new Promise((resolve, reject) => {
    dataWithPostOptions['dayvalue'] = 14086;
    dataWithPostOptions['nightvalue'] = 3338;
    var measuredDate = dateFunction.getMeasuredDate();
    dataWithPostOptions['measured'] = measuredDate['measured'];
    dataWithPostOptions['dojo.measured'] = measuredDate['dojo.measured'];
    resolve(dataWithPostOptions);
  });
};

client.retrieveAccoundInformation( inputData )
.then( userData => {
  return new Promise((resolve, reject) => {
    console.log( userData );
    resolve('ok');
  });
})
.catch( e => {
  console.log('error ' + e );
});

/*client.login( inputData )
.then( dataWithSessionId => client.retrieveAccountId( dataWithSessionId ))
.then( dataWithUserAccoutId => client.retrievePostOptions( dataWithUserAccoutId ))
.then( userData => {
  return new Promise((resolve,reject) => {
    console.log( 'userData ');
    console.log(userData);
    resolve('ok');
  })
})
.catch( e => {
  console.log('error ' + e );
})
*/

/*client.login( inputData )
.then( dataWithSessionId => client.retrieveAccountId( dataWithSessionId ))
.then( dataWithUserAccoutId => client.retrievePostOptions(dataWithUserAccoutId))
.then( dataWithPostOptions => addValues( dataWithPostOptions))
.then( fullData => client.postConsumption( fullData))
.then( strResult => {
  console.log(strResult);
  return strResult;
})
.catch( e => {
  console.log('error ' + e );
});
*/
