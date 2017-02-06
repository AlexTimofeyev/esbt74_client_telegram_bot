function getMeasuredDate() {

  var d = new Date();
  d.setUTCMinutes(0);
  d.setUTCSeconds(0);
  d.setUTCHours( d.getUTCHours() + 5);
  d.setUTCHours( 0 );
  d.setUTCMilliseconds(0);

  var dateOutput = {};
  dateOutput['measured'] = d.toISOString().slice(0,19)+'+05:00';
  dateOutput['dojo.measured'] = ('0' + d.getUTCDate()).slice(-2) + '/'
    + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '/'
    + d.getFullYear();
  return dateOutput;
};

module.exports.getMeasuredDate = getMeasuredDate;
