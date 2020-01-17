const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
    _id: {
        type: Date,
        required: true
    },
    in_time: {
        type: Date,
        required: true
    },
    out_type: {
        type: Date,
        required: true
    }
});


module.exports = mongoose.model('Attendance', attendanceSchema);