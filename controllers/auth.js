const express = require('express');
const passport = require('../config/ppConfig');
const router = express.Router();
const db = require('../models');

router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.get('/logout', (req, res) => {
  req.logOut(); 
  req.flash('success', 'Logging out, See you Later!');
  res.redirect('/');
});



router.post('/signup', (req, res) => {
  const { email, name, password } = req.body;
  db.user.findOrCreate({
    defaults: { name, password },
    where: { email
     }, include: [{model: db.userinfo, as: 'userinfo'}]
    
  })
  .then(([user, created]) => {
    if (created) {
      const successObject = {
        successRedirect: '/',
        successFlash: `Welcome ${user.name}. Account was created`
      }
      // passport authenicate
      passport.authenticate('local', successObject)(req, res);
    } else {
      // Send back email already exists
      req.flash('error', 'Email already exists');
      res.redirect('/auth/signup');
    }
  })
  .catch(error => {
    console.log('**************SignUpError******************');
    console.log(error);
    req.flash('error', 'Email or Password is incorrect. Please try again.');
    res.redirect('/auth/signup');
  });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  successFlash: 'Welcome back ...',
  failureFlash: 'Email or password is incorrect' 
}));


module.exports = router;