const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://faesalzher:ba05f497faesal@cluster0.ifg05.mongodb.net/faesal?retryWrites=true&w=majority', { useNewUrlParser: true }, (err) => {
    if (!err) { console.log('MongoDB Connection Succeeded.') }
    else { console.log('Error in DB connection : ' + err) }
});

require('./user.model');