const express = require('express');
const router = express.Router();
// const Pot_Holes = require('../Models/PotHoleHit');

/* GET landing page. */
// FIXME: Deprecate this as now redirects to geoJSON page
router.get('/', function (req, res, next) {
    console.log("Hit root");
    // var dataFilter = {
    //     __v: false,
    //     _id: false
    // };
    //
    // // Pull hits from remote Mongo instance
    // Pot_Holes.find({}, dataFilter, function (err, ph_recs) { //Use the find method on the data model to search DB
    //     if (err) {
    //         console.log("Error getting hit records: \n" + ph_recs);
    //         res.send(err);
    //     } else {
    //         // No exception, so inject hits and render
    //
    //         console.log(`Successfully Google retrieved ${ph_recs}`)
    //         res.render('google_maps', {
    //             pot_holes: ph_recs,
    //             google_map_api_key: 'not-my key'
    //         })
    //     }
    // });
    res.redirect('/dtp');
});

module.exports = router;
