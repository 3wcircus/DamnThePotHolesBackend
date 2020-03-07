const express = require('express');
const router = express.Router();
// const Pot_Holes = require('../Models/PotHoleHit');

/* GET landing page. */
// FIXME: Deprecate this as now redirects to geoJSON version of page
router.get('/', function (req, res, next) {
    console.log("Hit root");

    res.redirect('/dtp');
});

module.exports = router;
