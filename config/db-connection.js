const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://node-shop:Sungjekyocr123@caro-db-uvech.mongodb.net/test?retryWrites=true&w=majority',
{ 
    useNewUrlParser: true,
    useUnifiedTopology: true 
}).then(() => console.log('Connect to db success'))
    .catch(err => console.log(err));