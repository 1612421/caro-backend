var express = require('express');
var router = express.Router();
const passport = require('passport');
const jwt = require('../../FunctionHelpers/jwt');

// Xử lí đăng ký tài khoản
// POST user/register
router.post('/register', (req, res) => {
    passport.authenticate('local.register', {session: false}, (err, user, info) => {
        if (err){
            return res.status(500).json({messages: err})
        }
        else if (!user){
            return res.status(500).json(info)
        }

        req.login(user, {session: false}, (err) => {
            if (err){
                res.status(500).json(err);
            }
            console.log(process.env.SECRET_KEY);
            let token = jwt.generateJWT(user, process.env.SECRET_KEY, '3h');

            res.cookie('Authorization', `Bearer ${token}`, {httpOnly: true});
            return res.status(200).json({messages: 'register successfully'});
        });
    })(req, res)
});

module.exports = router;