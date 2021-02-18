const express = require('express')
const router = express.Router()
const db = require('../models')
//what is this??
// const { get } = require('./auth')


//GET each category form to NOT logged in users
router.get('/:category' , async(req, res)=>{
    category = req.params.category
    res.render(`categories/${category}`,{category})
})





module.exports = router