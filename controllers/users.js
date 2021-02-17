const express = require ('express')
const axios = require ('axios')
const router = express.Router()
const db = require('../models')


//POST information from user in public category pages to result page
router.post('/result', (req, res)=>{
    let activity = req.body.activity
    let activityType = req.body.activityType
    let country = req.body.country
    let mode = req.body.mode

    let APIResponse = `https://api.triptocarbon.xyz/v1/footprint?activity=${activity}&activityType=${activityType}&country=${country}&mode=${mode}`
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


module.exports = router
