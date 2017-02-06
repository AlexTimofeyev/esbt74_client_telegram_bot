var verificator = require('./check_input.js');

console.log( verificator.checkInputConsumption(' 14340 543 ', 2, 6));
console.log( verificator.checkInputConsumption(' f 4321 ', 2, 6));
console.log( verificator.checkInputConsumption(' 14340 d ', 2, 6));
