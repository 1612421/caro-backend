var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const multer = require('../../config/multer-disk-storage');
const jwt = require('../../FunctionHelpers/jwt');
const User = require('../../models/user');

// Xử lí đăng ký tài khoản
// POST /user/register
router.post('/register', notLogged, (req, res) => {
    passport.authenticate('local.register', {session: false}, (err, user, info) => {
        if (err){
            return res.status(500).json({messages: [err.message]});
        }
        else if (!user){
            return res.status(500).json({ ...info });
        }

        req.login(user, {session: false}, (err) => {
            if (err){
                res.status(500).json({messages: [err.message]});
            }

            let token = jwt.generateJWT(user, process.env.SECRET_KEY, process.env.EXPIRE_IN);
            res.cookie('Authorization', `Bearer ${token}`, {
                httpOnly: false,
                sameSite: false,
                secure: true
            });
            return res.status(200).json({messages: ['register successfully']});
        });
    })(req, res)
});

// Xử lí đăng nhập
// POST /user/login
router.post('/login', notLogged, (req, res) => {
    passport.authenticate('local.login', {session: false}, (err, user, info) => {
        if (err){
            return res.status(500).json({messages: [err.message]});
        }
        else if (!user){
            return res.status(401).json({ ...info });
        }

        req.login(user, {session: false}, (err) => {
            if (err){
                res.status(500).json({messages: [err.message]});
            }

            let token = jwt.generateJWT(user, process.env.SECRET_KEY, process.env.EXPIRE_IN);
            res.cookie('Authorization', `Bearer ${token}`, {
                httpOnly: true,
                sameSite: false
            });
            return res.status(200).json({messages: ['login successfully']});
        });
    })(req, res)
});

// Xử lí đăng xuất
// GET /user/logout
router.get('/logout', isLogged, (req, res) => {
    res.cookie('Authorization', '', {httpOnly: true});
    res.coo
    return res.status(200).json({messages: ['logout successfully']});
});

// Xử lí thay đổi thông tin cá nhân
// POST /user/update-profile
router.post('/update-profile', isLogged, (req, res) => {

    // Kiểm tra các field có hợp lệ hay không
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('username', 'Invalid username').notEmpty().isLength({min:1, max: 50});

    let errors = req.validationErrors();

    if (errors.length > 0){
        let messages = [];

        errors.forEach(error => {
            messages.push(error.msg);
        });

        return res.status(400).json({messages: messages});
    }

    const propertiesUpdate = {
        username: req.body.username,
        email: req.body.email
    };

    User.update({_id: req.user.id}, propertiesUpdate)
        .then((result) => {
            res.status(200).json({messages: ['update profile successfully']});
        }).catch(err => {
            res.status(500).json({messages: [err.message]});
        });
});

// Xử lí update avatar
// POST /user/update-avatar
router.post('/update-avatar', isLogged, multer.single('avatar'),(req, res) => {
    var propertiesUpdate = {
        avatar: `images/${req.user.id}${req.file.originalname}`
    }

    User.update({_id: req.user.id}, propertiesUpdate)
        .then((result) => {
            res.status(200).json({ 
                messages: ['update avatar successfully'],
                data: {
                    urlImg: `images/${req.user.id}${req.file.originalname}`
                }
            });
        }).catch(err => {
            res.status(500).json({messages: [err.message]});
        });
});

// Xử lí thay đổi mật khẩu
// POST /user/change-password
router.post('/change-password', isLogged, (req, res) => {
    User.findOneById({_id: req.user.id})
        .then(user => {
            bcrypt.compare(req.body.oldPassword, user.password, (err, result) => {
                if (err) {
                    return res.status(400).json({messages: [err.message]});
                } 

                if (!result) {
                    return res.status(400).json({messages: ['Incorrect current password.']});
                }

                bcrypt.hash(req.body.newPassword, 5, (err, hash) => {
                    if (err) {
                        return res.status(400).json({messages: [err.message]});
                    }

                    User.update({_id: user.id}, {password: hash})
                        .then(result => {
                            return res.status(200).json({messages: ['Change password successfully.']});
                        })
                        .catch(err => {
                            return res.status(400).json({messages: [err.message]});
                        });
                    });
            });
        }).catch(err => {
            return res.status(400).json({messages: [err.message]});
        });
});

module.exports = router;

// Chỉ cho phép sang funtion tiếp theo khi user chưa đăng nhập
function notLogged(req, res, next){
    if (req.isLogged){
        return res.status(400).json({messages: ['you have logged in']});
    }

    next();
}

// Chỉ cho phép sang function tiếp theo khi user đã đăng nhập
function isLogged(req, res, next){
    if (!req.isLogged){
        return res.status(401).json({messages: ['you must loggin before send this request']});
    }

    next();
}