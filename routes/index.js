var express = require('express');
var router = express.Router();
const Pot_Holes = require('../Models/PotHoleHit');

/* GET home page. */
router.get('/', function (req, res, next) {

    var dataFilter = {
        __v: false,
        _id: false,
        date: false
    };

    Pot_Holes.find({}, dataFilter,function(err, ph_recs) { //Use the find method on the data model to search DB
        if (err) {
            throw err; // If we get an error then bail
        } else {


            console.log("Got records " + ph_recs.length);
            // var phs = ph_recs.map(function (ph) {
            //     return {
            //         "date": "'"+ph.date.toDateString()+"'",
            //         "x": ph.x,
            //         "y": ph.y,
            //         "z": ph.z,
            //         "latitude": ph.lat,
            //         "longitude": ph.long
            //     };
            // });

            console.log("*" + ph_recs);
            res.render('google_maps', {
                pot_holes: ph_recs,
                google_map_api_key: 'AIzaSyAcQjbN0Wx4DzaqxJTiyOl5ZgaCvGQk4yI'
            })
        }
    });
});

module.exports = router;
