var express = require('express');
var router = express.Router();
const Pot_Holes = require('../Models/PotHoleHit');

/* GET landing page. */
router.get('/', function (req, res, next) {

    // TODO:Figure out how not to exclude the dat field
    var dataFilter = {
        __v: false,
        _id: false
    };

    // Pull hits from remote Mongo instance
    Pot_Holes.find({}, dataFilter, function (err, ph_recs) { //Use the find method on the data model to search DB
        if (err) {
            console.log("Error getting hit records: \n" + ph_recs);
            res.send(err);
        } else {
            // No exception, so inject hits and render

            console.log(`Successfully Google retrieved ${ph_recs}`)
            res.render('google_maps', {
                pot_holes: ph_recs,
                google_map_api_key: 'AIzaSyAcQjbN0Wx4DzaqxJTiyOl5ZgaCvGQk4yI'
            })
        }
    });
});

module.exports = router;
