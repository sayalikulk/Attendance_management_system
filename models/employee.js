const mongoose = require('mongoose');
const WorkingDate = require('./workingDates');
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
	},
	// presentDates: [WorkingDate.schema],
	presentDates: [{type: String}],
	attendanceFlag: {
		type: Boolean,
		default: false,
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
    Employee.findOne({eid:eid}, (err, data) => {
		if(err)	console.log(err);
		// console.log('User found for attendance:');
		// console.log(data);
		callback(err, data);
	});
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

module.exports.markAttendance = (id, callback) => {
	Employee.getUserByEID(id, (err, employee) => {
		// console.log(employee.presentDates);
		if(employee.attendanceFlag) {
			console.log('flag already true');
			callback(false);
		}
		else {
			const months = ["JAN", "FEB", "MAR","APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];	
			const current_datetime = new Date();
			const dateToAppend = current_datetime.getDate() + "-" + months[current_datetime.getMonth()] + "-" + current_datetime.getFullYear();
			// console.log(`dateToAppend: ${dateToAppend}`);
			WorkingDate.findOne({date: dateToAppend}, (err, data) => {
				if(err) console.log(err);
				else if(data == null) {
					console.log('Date not found');
				}
				else {
					// console.log('DATA:');
					// console.log(data);
					employee.presentDates.push(dateToAppend);
					employee.attendanceFlag = true;
					employee.save(
				(err,data) => {
					if(err)	console.log(err);
					else {
						console.log('updated flag');
						// console.log(data);
					}
				});
			}

			})
			callback(true);
		}

	})
}
/*module.exports.getOfficeCoords = () => {
    
};*/