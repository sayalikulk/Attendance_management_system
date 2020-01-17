const mongoose = require('mongoose');

const branchSchema = mongoose.Schema({
    coords: {
        lat1: {
            type: Number,
            required: true
        },
        long1: {
            type: Number,
            required: true
        },
        lat2: {
            type: Number,
            required: true
        },
        long2: {
            type: Number,
            required: true
        }
    },
    name: {
        type: String,
        required: true
    },
    timeSlot: {
        startTime: {
            type: String,
            default: "07:00:00"
        },
        endTime: {
            type: String,
            default: "10:00:00"
        }
    }
});


const Branch = mongoose.model('branch', branchSchema);

/* let testBranch = new Branch({
    coords: {
        lat1: 19,
        long1: 70,
        lat2: 19.8,
        long2: 70.5
    },
    name: "Test branch1"
})
testBranch.save((err, data) => {
    console.log(err);
    // console.log(data);
}); */


module.exports = Branch;

module.exports.findBranchById = (id, callback) => {
    console.log('Branch ID to find:');
    console.log(id);
    Branch.findOne({_id: id}, (err, branch) => {
        if(err) console.log(err);
        // console.log("BRANCH:", branch);
        callback(branch);
    });
};

module.exports.returnTestBranch = (callback) => {
    Branch.findOne({name: 'Test branch1'}, (err, branch) => {
        if(err) console.log(err);
        console.log("BRANCH:", branch);
        callback(branch);
    })
};