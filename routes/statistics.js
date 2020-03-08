const express = require('express');
const router = express.Router();
const fetch = require('node-fetch')
router.route('/').get((req,res) => {
    var nClosedPotholes;
    let settings = { method: "Get" };
    fetch('https://data.memphistn.gov/resource/2244-gnrp.json?category=Maintenance-Potholes', settings )
    .then((res) => {
        return res.json();
    })
    .then((json) => {
        nClosedPotholes = json.length;
        res.render('statistics', {
            title: 'Statistics',
            nClosedPotholes: nClosedPotholes
        });
    
        return json;
    })

})
module.exports = router;