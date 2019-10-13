const jwt = require('jsonwebtoken');

module.exports = {
    generateJWT: (user, secrectKey, expiresIn) => {
        return jwt.sign({
            id: user.id
        }, secrectKey, {
            expiresIn
        });
    },

    decodeJWT: (token, secretKey) => {
        return jwt.decode(token, secretKey);
    },

    verify: (token, secretKey) => {
        return jwt.verify(token, secretKey);
    }
}