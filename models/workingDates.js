const mongoose = require('mongoose');

const workingDatesSchema = mongoose.Schema({
    date: {
        type: String,
        required: true
    }
});

const WorkingDate = mongoose.model('WorkingDate', workingDatesSchema);
/*
let current_datetime = new Date();
var nextDay = new Date();

const months = ["JAN", "FEB", "MAR","APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

for(var i=0;i < 30; i++) {
    nextDay.setDate(nextDay.getDate() + 1);
    if(nextDay.getDay() != 0) {
        let date = new WorkingDate({
            date: nextDay.getDate() + "-" + months[nextDay.getMonth()] + "-" + nextDay.getFullYear()
        });
        date.save();
    }
}
*/

module.exports = WorkingDate;