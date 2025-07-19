// app.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const bcrypt = require('bcryptjs');
const expressLayouts = require('express-ejs-layouts');
const multer = require('multer');

const app = express();

// --- Configuration ---

// Database Connection
const connectDB = require('./config/db');
connectDB();

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_very_secret_key_for_your_blog_platform',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Connect Flash for flash messages
app.use(flash());

// Make flash messages and authentication status available to all templates
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.isAuthenticated = req.session.userId ? true : false;
    res.locals.searchQuery = ''; // <-- NEW: Initialize searchQuery globally
    next();
});

// EJS Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Static Files (for Bootstrap, custom CSS, etc.)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


// Body Parser Middleware to parse form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method Override Middleware (for PUT and DELETE requests from forms)
app.use(methodOverride('_method'));

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public/uploads/'));
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb('Error: Images Only! (jpeg, jpg, png, gif)');
    }
}).single('postImage');

// --- Initial Admin User Setup ---
const User = require('./models/User');
const setupAdminUser = async () => {
    try {
        const adminUser = await User.findOne({ username: process.env.ADMIN_USERNAME });
        if (!adminUser) {
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
            const newUser = new User({
                username: process.env.ADMIN_USERNAME,
                password: hashedPassword
            });
            await newUser.save();
            console.log('Default admin user created.');
        } else {
            console.log('Admin user already exists.');
        }
    } catch (err) {
        console.error('Error setting up admin user:', err);
    }
};
mongoose.connection.once('open', setupAdminUser);


// --- Routes ---
const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

app.use('/', indexRoutes);
app.use('/admin', (req, res, next) => {
    req.upload = upload;
    next();
}, adminRoutes);
app.use('/auth', authRoutes);


// --- Server Start ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
