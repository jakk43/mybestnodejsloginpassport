var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

router.get('/register', forwardAuthenticated, (req, res) => res.render('auth/register'));
router.get('/login', forwardAuthenticated, (req, res) => res.render('auth/login'));

// Register
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;

    if (!name || !email || !password || !password2) {
        req.flash('error_msg', 'Please enter all fields');
        res.redirect('/users/register');
    }

    if (password != password2) {
        req.flash('error_msg', 'Passwords do not match');
        res.redirect('/users/register');
    }

    User.findOne({ email: email }).then(user => {
        if (user) {
            req.flash('error_msg', 'Email already exists');
            res.redirect('/users/register');
        } else {
            const newUser = new User({
                name,
                email,
                password
            });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => {
                            req.flash('success_msg','You are now registered and can log in');
                            res.redirect('/users/login');
                        })
                        .catch(err => console.log(err));
                });
            });
        }
    });

});


// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: req.flash('error_msg', 'Invalid email or password.'),
        successFlash: ""
    })(req, res, next);
});


// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;
