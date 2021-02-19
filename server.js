require('dotenv').config();
const express = require('express');
const axios = require ('axios')
const db = require('./models');
const layouts = require('express-ejs-layouts');
//session
const session = require('express-session');
//Passport
const passport = require('./config/ppConfig');
//Flash
const flash = require('connect-flash');
const methodOverride = require("method-override")
const app = express();
app.set('view engine', 'ejs');

// Session 
const SECRET_SESSION = process.env.SECRET_SESSION;
const isLoggedIn = require('./middleware/isLoggedIn');
//Multer & Cloudinary
const multer = require('multer')
const cloudinary = require('cloudinary')
const uploads = multer({ dest: './uploads'})


//Why do I need that? do I need one for categories?
const router = require('./controllers/users');

// MIDDLEWARE
app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);
app.use(methodOverride("_method"))

// Session Middleware
const sessionObject = {
  secret: SECRET_SESSION,
  resave: false,
  saveUninitialized: true
}
app.use(session(sessionObject));
// Passport Middleware
app.use(passport.initialize()); // Initialize passport
app.use(passport.session()); // Add a session
// Flash Middleware
app.use(flash());
app.use((req, res, next) => {
  console.log(res.locals);
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

// Controllers
app.use('/auth', require('./controllers/auth'));
app.use('/users', require('./controllers/users'));
app.use('/categories', require('./controllers/categories'));


//////////////////////////////////////////////////////////////
//GET homepage-index
app.get('/', (req, res) => {
  res.render('index');
});

//POST and render temporary information from NOT loggedin user in public category pages to result page
app.post('/result', (req, res)=>{
  let title = req.params.category
  let activity = req.body.activity
  let activityType = req.body.activityType
  let country = req.body.country
  let mode = req.body.mode
  let fuelType = req.body.fuelType

  let APIResponse = `https://api.triptocarbon.xyz/v1/footprint?activity=${activity}&activityType=${activityType}&fuelType=${fuelType}&country=${country}&mode=${mode}`
  console.log(APIResponse)
  axios.get(APIResponse)
  .then(function(response){
      console.log(response.data)
      let result = response.data
      res.render('result', {result})
  })
  .catch(function(error){
      console.log('******this is API error*******')
      console.log(error)
  })
})

//GET users profile

app.get('/profile', isLoggedIn, async(req, res) => { 
  try{
    const { id, name, email } = req.user.get();
    const thisUser = await db.user.findOne({
      where:{
        id: id
      },
      include: [{
        model: db.userinfo,
        as: 'userinfo'
      }]
    })
    const alluserTasks = await db.task.findAll({
      where:{
        userId:id
      },
      include: [db.category]
    })
    const thisUserinfo = await db.userinfo.findOne({
      where:{
        userId: id
      }
    })
  res.render('profile', { id, name, email, alluserTasks, thisUserinfo})
  }catch (err){
    console.log(err)
  }
});
app.get('/about' ,isLoggedIn, async(req, res)=>{
  try{
    const { id, name, email } = req.user.get();
      const user = await db.user.findOne({
          where:{
             id: id 
          }
      })
      res.render('about', {user})
  } catch(err){
    console.log(err)
  }
})
//GET a page for editing userinfo
app.get('/profile/editAbout/:idx' , isLoggedIn, async(req, res) =>{
  try{
    let idx = req.params.idx
    const { id, name, email } = req.user.get();
    const thisUser = await db.user.findOne({
      where:{id: id}
    })
    const infoToUpdate = await db.userinfo.findOne({
      where:{id: idx}
    }) 
    res.render ('moreInfoEdit',{infoToUpdate})
  }catch (err){
    console.log(err)
  } 
})
//GET a page for editing activity titles
app.get('/profile/editTask/:idx', isLoggedIn, async(req, res)=>{
  try{
    let idx = req.params.idx
    const { id, name, email } = req.user.get();
    const thisUser = await db.user.findOne({
      where:{id: id}
    })
    const tasktoUpdate = await db.task.findOne({
      where:{id: idx}
    }) 
    console.log(tasktoUpdate)
    res.render ('edit',{tasktoUpdate})
  }catch (err){
    console.log(err)
  }  
})

//POST more info about user in user profile
app.post('/about' , uploads.single('inputFile'), isLoggedIn, async(req, res)=>{
  try{
      let about = await req.body.about
      const image = await req.file.path
      const result = await cloudinary.uploader.upload(image)
      const imageUrl = await result.url
      const { id, name, email } = await req.user.get();
      console.log(id)
      console.log(name)
      console.log(email)
      console.log(about)
      console.log(result)
      console.log(result.url)
  
      const userinfoObject = {
          photo: imageUrl,
          about: about,
          userId: id
      }
      console.log(userinfoObject)
      const UserInfoPromise = await db.userinfo.create(
         userinfoObject,
         { where: {userId: id} }
      )
      
      res.redirect ('/profile')
  }catch (err){
    console.log(err)
  }
})
//EDIT user moreinfo through '/profile/aboutedit'
app.put('/profile/editAbout/:idx' ,uploads.single('inputFile'), isLoggedIn, async(req, res, next)=>{
  try{
    const image = await req.file.path
    const result = await cloudinary.uploader.upload(image)
    const newPhoto = await result.url

    let newAbout = await req.body.about
    let idx = await req.params.idx

  const { id, name, email } = await req.user.get();
    const thisUser = await db.user.findOne({
      where:{id: id}
    })
    const updateduserinfo = await db.userinfo.update(
      {
        photo: newPhoto,
        about: newAbout
      },
      {returning: true,where:{ id:idx }},
  )
  res.redirect('/profile')
  }catch (next){
    console.log(next)
  }  
})

//EDIT activity titles in profile
app.put('/profile/editTask/:idx', isLoggedIn, async(req, res, next)=>{
  try{
    let title = req.body.title
    let idx = req.params.idx
    const { id, name, email } = req.user.get();
    const thisUser = await db.user.findOne({
      where:{id: id}
    })
    const updatedTask = await db.task.update(
      {title: title},
      {returning: true,where:{ id:idx }},
  )
  res.redirect('/profile')
  }catch (next){
    console.log(next)
  }  
})

//DELETE activities in profile
app.delete('/profile/:idx', isLoggedIn, async( req, res)=>{
  try{
    
    let idx = req.params.idx
    const { id, name, email } = req.user.get();
    const thisUser = await db.user.findOne({
      where:{id: id}
    })
    const deletedTask = await db.task.destroy({
      where:{id: idx}
    })
  res.redirect('/profile')
  }catch (next){
    console.log(next)
  }  
})


//////////////////////////////////////////
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;