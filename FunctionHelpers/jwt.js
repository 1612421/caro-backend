const jwt = require('jsonwebtoken');

module.exports = {
    generateJWT: (user, secrectKey, expiresIn) => {
        return jwt.sign({
            id: user.id,
            account: user.account,
            email: user.account
        }, secrectKey, {
            expiresIn
        });
    }
}