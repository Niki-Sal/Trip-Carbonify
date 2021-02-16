const express = require('express')
const router = express.Router()
const db = require('../models')
const { get } = require('./auth')


//GET each category form to login the information
router.get('/:category' , async(req, res)=>{
    category = req.params.category
    res.render(`categories/${category}`)
})





module.exports = router