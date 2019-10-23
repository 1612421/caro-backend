var express = require('express');
var router = express.Router();
const passport = require('passport');
const jwt = require('../../FunctionHelpers/jwt');

// Xử lí đăng ký tài khoản
// POST /user/register
router.post('/register', notLogged, (req, res) => {
    passport.authenticate('local.register', {session: false}, (err, user, info) => {
        if (err){
            return res.status(500).json({messages: err.message});
        }
        else if (!user){
            return res.status(500).json({...info});
        }

        req.login(user, {session: false}, (err) => {
            if (err){
                res.status(500).json({messages: err.message});
            }

            let token = jwt.generateJWT(user, process.env.SECRET_KEY, process.env.EXPIRE_IN);
            res.cookie('Authorization', `Bearer ${token}`, {httpOnly: true, domain: 'localhost:3001'});
            return res.status(200).json({messages: 'register successfully'});
        });
    })(req, res)
});

// Xử lí đăng nhập
// POST /user/login
router.post('/login', notLogged, (req, res) => {
    passport.authenticate('local.login', {session: false}, (err, user, info) => {
        if (err){
            return res.status(500).json({messages: err.message});
        }
        else if (!user){
            return res.status(401).json({...info});
        }

        req.login(user, {session: false}, (err) => {
            if (err){
                res.status(500).json({messages: err.message});
            }

            let token = jwt.generateJWT(user, process.env.SECRET_KEY, process.env.EXPIRE_IN);
            res.cookie('Authorization', `Bearer ${token}`, {httpOnly: true});
            return res.status(200).json({messages: 'login successfully'});
        });
    })(req, res)
});

// Xử lí đăng xuất
// GET /user/logout
router.get('/logout', isLogged, (req, res) => {
    res.cookie('Authorization', '', {httpOnly: true});
    res.coo
    return res.status(200).json({messages: 'logout successfully'});
});

module.exports = router;

// Chỉ cho phép sang funtion tiếp theo khi user chưa đăng nhập
function notLogged(req, res, next){
    if (req.isLogged){
        return res.status(400).json({messages: 'you have logged in'});
    }

    next();
}

// Chỉ cho phép sang function tiếp theo khi user đã đăng nhập
function isLogged(req, res, next){
    if (!req.isLogged){
        return res.status(400).json({messages: 'you must loggin before send this request'});
    }

    next();
}