const crypto = require('crypto');

const secretKey = crypto.randomBytes(32).toString('hex'); // Генерация 32-байтового ключа
console.log(secretKey);