const crypto = require('crypto');

const generatePassword = () => {
    // Generates a 10-character random string
    return crypto.randomBytes(5).toString('hex');
};

module.exports = { generatePassword };