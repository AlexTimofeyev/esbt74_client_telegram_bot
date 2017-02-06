function checkInputConsumption( inputStr, countOfSensors, scale ) {
  var measures = inputStr.trim().split(' ');
  console.log( measures );

  if( measures.length != countOfSensors ) {
    return {
      'measure1': 0,
      'measure2': 1,
      'checkResult': false
    };
  }

  for( var i = 0; i < measures.length; ++i ) {
    if( measures[ i ].length > scale ) {
      return {
        'measure1': 0,
        'measure2': 1,
        'checkResult': false
      };
    }
  }

  var value1 = parseInt( measures[ 0 ], 10);
  if( isNaN(value1) || value1 < 0) {
    return {
      'measure1': 0,
      'measure2': 1,
      'checkResult': false
    };
  }
  var value2 = 0;
  if( countOfSensors == 2 ) {
    value2 = parseInt( measures[ 1 ], 10 );
    if( isNaN(value2) || value2 < 0 ) {
      return {
        'measure1': 0,
        'measure2': 1,
        'checkResult': false
      };
    }
  }

  return {
    'measure1': value1,
    'measure2': value2,
    'checkResult' : true
  };
};

module.exports.checkInputConsumption = checkInputConsumption;
