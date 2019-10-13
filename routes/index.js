var express = require('express');
var router = express.Router();
const User = require('../models/user');

/* GET home page. */
router.get('/me', isLogged, function(req, res) {
    User.findOneById(req.user.id)
      .then(user => {
        return res.status(200).json({
          data: {
            account: user.account,
            username: user.username,
            email: user.email,
            id: user.id
          }
        });
      }).catch(err => res.status(500).json({messages: err.message}));
});

module.exports = router;

function isLogged(req, res, next){
  if (!req.isLogged){
    return res.status(400).json({messages: 'you must loggin before send this request'});
  }

  next();
}