const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/registration",{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    // useCreateIndex:true
}).then((result) => {
    console.log(`Connection is Sucsessfully`)
}).catch((err) => {
    console.log(err)
});