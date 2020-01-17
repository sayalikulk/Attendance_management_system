const mongoose = require('mongoose');

// Connect to database: (Add your URI string to ../config/mongodbURI.js)
mongoose.connect(mongodbURI, {useNewUrlParser:true, useUnifiedTopology: true})
    .then(console.log('Connected to MongoDB'))
    .catch((err) => console.log(err));

const voiceSchema = mongoose.Schema({
    audioFiles: [{
        type: String    //  URI string?
    }]
});

let Voice = mongoose.model('Voice', voiceSchema);

module.exports = Voice; 