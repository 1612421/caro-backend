const passport = require('passport');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user, done) => {
    console.log('serializeUser');
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    console.log('deserializeUser');
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

// Xử lí đăng ký
passport.use('local.register', new LocalStrategy({
    usernameField: 'account',
    passwordField: 'password',
    passReqToCallback: true
}, (req, account, password, done) => {
    // Kiểm tra các field có hợp lệ hay không
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min: 4, max: 20});
    req.checkBody('account', 'Invalid account').notEmpty().isLength({min: 4, max: 15});
    req.checkBody('username', 'Invalid username').notEmpty().isLength({max: 50});
    let errors = req.validationErrors();

    if (errors.length > 0){
        let messages = [];

        errors.forEach(error => {
            messages.push(error.msg);
        });

        return done(null, false, {messages: messages});
    }

    // Kiểm tra tài khoản đã tồn tại hay chưa
    User.findOneByAccount(account)
        .then(user => {
            // Nếu tồn tại
            if (user){
                return done(null, false, {messages: 'account is exists'});
            }

            bcrypt.hash(password, 5, (err, hash) => {
                if (err){
                    return done(err);
                }

                // Lưu vào tài khoản vào db
                User.registerAccount(req.body, hash)
                    .then(rs => done(null, rs))
                    .catch(err => done(err));
            });
        })
}));

// Xử l1 đăng nhập
passport.use('local.login', new LocalStrategy({
    usernameField: 'account',
    passwordField: 'password',
    passReqToCallback: true
}, (req, account, password, done) => {
    // Kiểm tra các field có hợp lệ
    req.checkBody('account', 'Invalid account').notEmpty().isLength({min: 4, max: 15});
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min: 4, max: 20});
    let errors = req.validationErrors();

    if (errors.length > 0){
        let messages = [];

        errors.forEach(error => {
            messages.push(error.msg);
        });

        return done(null, false, {messages: messages});
    }

    User.findOneByAccount(account)
        .then(user => {
            if (!user){
                return done(null, false, {messages: 'account is not exists'});
            }

            bcrypt.compare(password, user.password, (err, result) => {
                if (err){
                    return done(err);
                }

                if (!result){
                    return done(null, false, {messages: 'incorrect password'});
                }

                return done(null, user);
            });
        })
        .catch(err => done(err));
}));