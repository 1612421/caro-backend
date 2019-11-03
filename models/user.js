const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = Schema({
    username: {
        type: String,
        minlength: 1,
        maxlength: 50
    },
    fbId: {type: String},
    account: {
        type: String,
        require: true,
        minlength: 4,
        maxlength: 15
    },
    email: {
        type: String,
        require: true,
        maxlength: 60,
        password: {
            type: String,
            require: true
        }
    },
    password: {type: String},
    avatar: {type: String},
});

const User = mongoose.model('User', userSchema);

module.exports= {
    registerAccount: (entity, passwordHash) => {
        let user = new User({
            account: entity.account,
            email: entity.email,
            password: passwordHash,
            username: entity.username,
            avatar: 'images/user.jpg'
        });

        return user.save();
    },

    findOneByAccount: (account) => {
        return User.findOne({account}).exec();
    },

    findOneById: (id) => {
        return User.findById(id).exec();
    },

    update: (conditionObject, properies) => {
        return User.update(conditionObject, {$set: properies}).exec();
    }
}