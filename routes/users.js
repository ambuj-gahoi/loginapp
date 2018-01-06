var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
// For register
router.get('/register', function(req, res){
	res.render('register');
});


// For login
router.get('/login', function(req, res){
	res.render('login');
});

// For register
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	console.log(name);

	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords are not matching').equals(req.body.password);
	var errors = req.validationErrors();
	if(errors)
	{
		res.render('register', {
			errors:errors
		});
	}
	else
	{
		var newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password
		});
		User.createUser(newUser, function(err, user){
			if(err)
			 throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You ar signed up and can now login');

		res.redirect('/users/login');
	}
});

/*passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserbyUsername(username, function(err, user){
    	if (err)
    		throw err;
    	if(!user)
    	{
    		return done(null, false, {message: 'You are not a known user'});
    	}

    	User.comparePassword(password , user.password, function(err, isMatch){
    		if(err)
    			throw err;
    		if(isMatch)
    		{
    			return done(null, user);
    		}
    		else
    		{
    			return done(null, false, {message: 'Invalid password'});
    		}
    	});
    });
  }));*/


 passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({
      username: username
    }, function(err, user) {
      if (err) throw err;
      if (!user) {
        return done(null, false, {
          message: 'Unknown USER'
        });

      }
      /**
      * Check the user's password
      */
      User.comparePassword(password, user.password, function(err, isMatch) {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {
            message: 'Invalid password'
          });
        }
      });
    });
}));



passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserbyId(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login', failureFlash: true}),
  function(req, res) {
  res.redirect('/');
 });

router.get('/logout', function(req, res){
  req.logout();

  req.flash('success_msg', 'You are logged out');

  res.redirect('/users/login');
});


module.exports = router;