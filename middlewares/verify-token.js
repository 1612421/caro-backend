const jwt = require('../FunctionHelpers/jwt');

module.exports = (req, res, next) => {
    try {
        // Lấy token từ cookie
        let token = req.cookies['Authorization'];
        if (!token) {
            return next();
        }

        // Xác thực token
        const decode = jwt.verify(token.split(' ')[1], process.env.SECRET_KEY);
        req.user = decode;

        // gia hạn token
        token = jwt.generateJWT(decode, process.env.SECRET_KEY, process.env.EXPIRE_IN);
        res.cookie('Authorization', `Bearer ${token}`, {httpOnly: true});

        // Đánh dấu tài user đã đăng nhập
        req.isLogged = true;
    } catch(err) {
        req.isLogged = false;
    } 

    next();
}