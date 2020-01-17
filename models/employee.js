const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Branch = require('./branch'); 


const employeeSchema = mongoose.Schema({
	eid: {
		type: String,
		required: true,
		index: true
	},
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	voiceId: {
		type: String,
		// required: true // what about admin?
	},
	groupId: {
		type: String,
	},
	userType: {
		type: String
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    }
});



const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;

module.exports.hashPassword = (newUser, callback) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) console.log(err);
            else{
                newUser.password = hash;
                callback(newUser);
            }
        })
    })
};

module.exports.getUserById = (id, callback) => {
	Employee.findById(id, callback);
};

module.exports.getUserByEID = (eid, callback) => {
    Employee.findOne({eid:eid}, callback);
};

module.exports.comparePassword = (password, hash, callback) => {
    bcrypt.compare(password, hash, (err, res) => {
        if(err) console.log(err);
        else callback(null, res);
    });
};

module.exports.getEmployeesByGroupId = (id, callback) => {
	Employee.find({groupId: id}, (err, list) => {
		if(err)	console.log(err);
		else {
			callback(list);
		}
	});
};

module.exports.deleteById = (id, callback) => {
	Employee.deleteOne({eid: id}, (err) => {
		if(err) console.log(err);
		callback();

})};

/*module.exports.getOfficeCoords = () => {
    
};*/