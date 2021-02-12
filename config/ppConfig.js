const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Database
const db = require('../models');

// Passport "serialize" info to be able to login
passport.serializeUser((user, cb) => {
    cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
    db.user.findByPk(id)
    .then(user => {
        if (user) {
            cb(null, user);
        }
        console.log('User is null...');
    })
    .catch(error => {
        console.log('Yo... There is an error');
        console.log(error);
    })
})

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, cb) => {
    db.user.findOne({
        where: { email }
    })
    .then(user => {
        if (!user || !user.validPassword(password)) {
            cb(null, false);
        } else {
            cb(null, user);
        }
    })
    .catch(error => {
        console.log('**************************** Error');
        console.log(error);
    })
}));

module.exports = passport;
