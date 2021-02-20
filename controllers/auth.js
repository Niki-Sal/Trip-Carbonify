const express = require('express');
const passport = require('../config/ppConfig');
const router = express.Router();

// import database
const db = require('../models');

router.get('/signup', (req, res) => {
  res.render('auth/signup'); // this is a form
});

router.get('/login', (req, res) => {
  res.render('auth/login'); // this is a form
});

router.get('/logout', (req, res) => {
  req.logOut(); // logs the user out of the session
  req.flash('success', 'Logging out, See you Later!');
  res.redirect('/');
});


// What routes do we need (post routes)
router.post('/signup', (req, res) => {
  // we now have access to the user info (req.body);
  // console.log(req.body);
  const { email, name, password } = req.body; // goes and us access to whatever key/value inside of the object (req.body)
  db.user.findOrCreate({
    defaults: { name, password },
    where: { email
     }, include: [{model: db.userinfo, as: 'userinfo'}]
    
  })
  .then(([user, created]) => {
    if (created) {
      // if created, success and we will redirect back to / page
      console.log(`${user.name} was created....`);
      // flash messages
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
    console.log('**************Error');
    console.log(error);
    req.flash('error', 'Either email or password is incorrect. Please try again.');
    res.redirect('/auth/signup');
  });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  successFlash: 'Welcome back ...',
  failureFlash: 'Either email or password is incorrect' 
}));


module.exports = router;