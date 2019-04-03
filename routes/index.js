var express = require('express');
var router = express.Router();
const Pot_Holes =require('../Models/PotHoleHit');

/* GET home page. */
router.get('/', function(req, res, next) {

  Pot_Holes.get({}, function (err, ph_recs)
  { //Use the find method on the data model to search DB
    if (err) {
      throw err; // If we get an error then bail
    }
   console.log(`Got records ${ph_recs.length}`);
    ph_recs.map(function(x){
      console.log(x);
    });
    res.render('google_maps', {
      google_map_api_key: 'AIzaSyAcQjbN0Wx4DzaqxJTiyOl5ZgaCvGQk4yI',
      pot_holes: ph_recs})
  })

});

module.exports = router;
