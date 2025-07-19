// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @route   GET /auth/login
// @desc    Show login page
router.get('/login', (req, res) => {
    res.render('login');
});

// @route   POST /auth/login
// @desc    Handle login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        req.flash('error_msg', 'Please enter all fields');
        return res.redirect('/auth/login');
    }

    try {
        const user = await User.findOne({ username });

        if (!user) {
            req.flash('error_msg', 'Incorrect username or password');
            return res.redirect('/auth/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            req.session.userId = user._id; // Store user ID in session
            req.flash('success_msg', 'You are now logged in');
            res.redirect('/admin/dashboard');
        } else {
            req.flash('error_msg', 'Incorrect username or password');
            res.redirect('/auth/login');
        }
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Something went wrong. Please try again.');
        res.redirect('/auth/login');
    }
});

// @route   GET /auth/logout
// @desc    Handle logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            req.flash('error_msg', 'Error logging out.');
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        req.flash('success_msg', 'You are logged out');
        res.redirect('/');
    });
});

module.exports = router;
