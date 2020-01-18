const PORT = process.env.PORT || 5000
const express = require('express');
const path = require('path');
const userRouter = require('./routes/userRoutes');
const mongoose = require('mongoose');
const Branch = require('./models/branch');
require('dotenv/config')
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const expressLayouts = require('express-layouts');
const scheduler = require('node-schedule');
const Employee = require('./models/employee');
    /* const multer = require('multer');
    const upload = multer({dest: '/temp'}); */
    


// Initialize app
const app = express();

// Connect to database: (Add your URI string to ../config/mongodbURI.js)
mongoose.connect(process.env.DB, {useNewUrlParser:true, useUnifiedTopology: true})
    .then(console.log('Connected to MongoDB'))
	.catch((err) => console.log(err));


// app.use(expressLayouts);
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname + '/views')));






// Body-parser, cookie-parser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());


// Express Session. Note: Session data is stored on the server side only
app.use(session({
    secret:'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// connect-flash
app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');  // Passport sets its own 'error' messages
    next();
});


app.use('/users', userRouter);

app.get('/loca', (req, res) => {
    res.render('loc');
})

app.post('/loca', (req, res) => {
    const id = req.user.eid;
    console.log(req.body);
    // Check if current location coords (stored in data) are within office
    var userCoords = req.body;
    console.log(req.user);
    let branch = Branch.findBranchById(req.user.branch, (branch) => {
        console.log(branch);
        if(branch.coords.lat1 < userCoords.latitude &&
            userCoords.latitude < branch.coords.lat2 &&
            branch.coords.long1 < userCoords.longitude && 
            userCoords.longitude < branch.coords.long2) {
                // User in office
                /* console.log('USER IN OFFICE')
                req.flash('success_msg', 'Location verified');
                res.json({inOffice: true}); */
                Employee.markAttendance(id, (result) => {
                    if(result) {
                        console.log('Marked');
                        console.log(res);   
                        req.redirect('/users');
                    }
                    else {
                        console.log('error');
                    }
                });
            }
        else {
            req.flash('error_msg', 'Current location not in office');
            console.log('USER NOT IN OFFICE');
            res.json({inOffice: false});
        }
    });
    // res.redirect('/users');
});

var j = scheduler.scheduleJob('0 11 * * *', () => {
    Employee.updateMany({}, {attendanceFlag: false}), () => {
        console.log('Attendance Flags reset');
    };
});

/* app.post('/records', upload.single('audio_file'), (req, res) => {
    console.log(req.file);
}); */

app.get('/', (req,res)=>{
    res.redirect("/users/login");
});

app.get('/logout', function (req, res) {
    // console.log('Log out');
    req.logout();
    req.flash('success_msg', 'Logged out');
    res.redirect('/users/login');
});


app.listen(PORT, ()=>console.log(`Server started on port: ${PORT}`))


