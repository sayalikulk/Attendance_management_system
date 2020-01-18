const express = require('express');
const Employee = require('../models/employee');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Branch = require('../models/branch');
const router = express.Router();
const Attendance = require('../models/workingDates');

// REGISTRATION

router.get('/register', (req, res) => {
    if(req.user) { 
        if(req.user.userType == 'admin') {
            res.render('register');
        }
        else {
            res.send('You do not have access to this page');
        }
    }
    else {
        res.render('register');
    }
});

const { check, validationResult } = require('express-validator');
let validationChecks = [
	check('eid', 'Employee ID is required').notEmpty(),
	check('name', 'Name is required').notEmpty(),
	check('email', 'Email address is required').notEmpty(),
	check('email', 'Please enter a valid email address').normalizeEmail().isEmail(),
	check('password', 'Please enter a password').notEmpty(),
	check('password', 'Minimum  length of password should be 8 characters').isLength({min:8}),
	check('password2', 'Passwords don\'t match').matches('password')
];

router.post('/register', validationChecks, (req, res) => {
    console.log('Registration Request:');
    console.log(req.body);

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log('Validation errors!');
        console.log(errors.array());
        res.render('register', {
            errors: errors.array(),
            prevInput: req.body
        });
    }
    else {

        var newEmployee = Employee({
            eid: req.body.eid,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            groupId: req.user.groupId,
        });
        Branch.returnTestBranch((branch) => {
            console.log(branch);
            newEmployee.branch = branch._id;
            Employee.hashPassword(newEmployee, (hashed) => {
                console.log(hashed);
                newEmployee.save((err) => {
                    if(err) console.log(err);
                    else {
                        req.flash('success_msg', 'You have been successfully registered');
                        if(req.user.userType === 'admin'){
                            res.redirect('/users/admin');
                        } else {
                            res.redirect('/users');
                        }
                    }
                });
            });
        });
        
    }
});

// LOGIN

router.get('/login', (req, res) => {
    if(!req.user)
        res.render('../views/login');
    else
        res.send(`You are already logged in as ${req.user.name}!`);
});

passport.use(new LocalStrategy({usernameField: 'eid'},
    function(eid, password, done) {
		// console.log('checking...');
        Employee.getUserByEID(eid, (err, user) => {
            if(err) {
				console.log(err);
				return done(err);
			}
            else if(!user) {
				// console.log('No such user');
                return done(null, false, {message:'Unknown user'});
            }
             else {
			// 	console.log('User found')
                Employee.comparePassword(password, user.password, (err, isMatch) => {
                    if(err) console.log(err);
                    else if(isMatch) {
                        // console.log('Match!');
                        return done(null, user);
                    }
                    else  {
                        // console.log('Invalid password');
                        return done(null, false, {message:'Invalid password'});
                    }
                });
            }
        });
    }));
passport.serializeUser(function(user, done) {
  	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Employee.getUserById(id, function(err, user) {
		done(err, user);
  });
});


router.post('/login', passport.authenticate('local', {
    failureRedirect:'/users/login',
    failureFlash: true,
    successFlash: 'Welcome!'
}),
(req, res) => {
    // Function called when authentication successful
    console.log('Login successful');
    req.flash('success_msg', 'Login successful!');
    req.session.user = req.user;
    if(req.user.userType === 'admin'){
        res.redirect('/users/admin');
    } else {
        res.redirect('/users');
    }
    
});


// ADMIN ROUTES
router.get('/admin', (req, res) => {
    if(req.user.userType == 'admin') {
        Employee.getEmployeesByGroupId(req.user.groupId, (list) => {
            res.render('../views/admin', {employeeList: list});
        });
    }
    else {
        res.send('You do not have access to this page');
    }
});

router.get('/addEmployee', (req, res) => {
    res.send('Add employee');
    if(req.user.userType == 'admin') {
        res.redirect('/users/register');
    }
    else {
        res.send('You do not have access to this page');
    }
});

router.get('/delEmployee', (req, res) => {
    if(req.user.userType == 'admin') {
        Employee.getEmployeesByGroupId(req.user.groupId, (list) => {
            res.render('../views/delEmployee', {employeeList: list});
        });
    }
    else {
        res.send('You do not have access to this page');
    }
});

router.get('/delEmployee/:id', (req, res) => {
    const id = req.params.id;
    console.log(`delete req id: ${id}`);
    
    Employee.deleteById(id, () => {
        console.log(`User deleted: ${id}`);
        res.redirect('/users/delEmployee');
    });

});

router.get('/', (req, res) => {
    res.render('user');
});

router.get('/mark', (req, res) => {
    var today = new Date();
    function addZero(i) {
        if(i < 10) i = "0" + i;
        return i;
    }
    var time = addZero(today.getHours())
    + ":" + addZero(today.getMinutes())
    + ":" + addZero(today.getSeconds());
    console.log(time);
    // console.log(req.user.branch);
    const branch = Branch.findBranchById(req.user.branch,(branch) => {
        const id = req.user.eid;
        console.log(`Attendance req: ${id}`);
        console.log("Current time:", time);
        console.log("Start time:", branch.timeSlot.startTime);
        console.log("End time:", branch.timeSlot.endTime);
        if(req.user.attendanceFlag) {
            console.log('Already marked');
            res.send('You have already marked your attendance');
        }
        else if(branch.timeSlot.startTime < time && time < branch.timeSlot.endTime){
            res.redirect("http://localhost:5000/loca");
        }
        else {
            console.log('Cannot register attendance now');
            res.redirect('/users');
        }
    });
    
});


module.exports = router;