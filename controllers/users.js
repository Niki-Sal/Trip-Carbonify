const express = require ('express')
const axios = require ('axios')
const router = express.Router()
const db = require('../models')
const layouts = require('express-ejs-layouts');
const session = require('express-session');
const passport = require('../config/ppConfig');
const flash = require('connect-flash');
// //what is it?
// const { deserializeUser } = require('passport')

// Session 
const SECRET_SESSION = process.env.SECRET_SESSION;
const isLoggedIn = require('../middleware/isLoggedIn');
// MIDDLEWARE
router.use(require('morgan')('dev'));
router.use(express.urlencoded({ extended: false }));
router.use(express.static(__dirname + '/public'));
router.use(layouts);

// Session Middleware
const sessionObject = {
    secret: SECRET_SESSION,
    resave: false,
    saveUninitialized: true
  }
router.use(session(sessionObject));
// Passport
router.use(passport.initialize()); // Initialize passport
router.use(passport.session()); // Add a session
// Flash 
router.use(flash());
router.use((req, res, next) => {
  console.log(res.locals);
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});
////////////////////////////////////////////////////////////
//GET home page for logged in user
router.get('/', (req, res) => {
    res.render('index');
  });


//GET information and show result page for loggin user
router.get('/result/:category/:title',isLoggedIn, async(req, res)=>{
    try{
        let thisCat = req.params.category
        let thisTitle = req.params.title

        const searchedCat = await db.category.findOne({
            where:{
                name: thisCat
            }
            
        })
        const searchedTask = await db.task.findOne({
            where: {
                title : thisTitle
            },
            include: [{
                model: db.detail,
                as: 'detail'
            }]
        })
        
        res.render('userResult',{searchedCat, searchedTask})
    } catch(error){
        console.log('**this is error**')
        console.log(error)
    }
})

///////////////inja

//POST information and add to database form loggin user
router.post('/result/:category',isLoggedIn, async(req, res)=>{
    try{
        let categoryName = req.params.category
        let title = req.body.title
        let activity = req.body.activity
        let activityType = req.body.activityType
        let country = req.body.country
        let mode = req.body.mode
        let fuelType = req.body.fuelType

        let APIResponse = `https://api.triptocarbon.xyz/v1/footprint?activity=${activity}&activityType=${activityType}&fuelType=${fuelType}&country=${country}&mode=${mode}`
        console.log(APIResponse)
        let response = await axios.get(APIResponse)
        console.log(response.data)
        let result = response.data
        let resultNumber = parseInt(result.carbonFootprint)
        ///how to find current user?????????
        const { id, name, email } = req.user.get(); 
        const user = await db.user.findOne({
            where:{
                name: name,
                email: email,
            }})
        
        const task = await db.task.create({
            title: title,
            carbon: resultNumber,
            detail:{
                activity,
                activityType,
                country,
                mode
            },
        },{
            include: {
                model: db.detail,
                as:'detail'
            }
        })
        const [category, wasCreated] = await db.category.findOrCreate({
            where:{
                name: categoryName
            }
        })
       
        await task.addCategory(category)
        await user.addTask(task)
        res.redirect(`/users/result/${categoryName}/${title}`)
    } catch(error){
        console.log('******this is error*******')
        console.log(error)
    }
})



module.exports = router
