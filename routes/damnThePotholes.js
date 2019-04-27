var express = require('express');
var router = express.Router();
const PotHoleHit = require('../Models/PotHoleHit');

// Routes for app controlers
router.route('/')
    .get(function (req, res) {
        res.send('Get a map')
    })
    .post(function (req, res) {
        console.log(`Add a Bump: ${req.body}`);
        PotHoleHit.create(req.body).then(function (bump) {
            res.send(bump);
        })
    })
    .put(function (req, res) {
        res.send('Update a map')
    });

router.route('/seed')
    .get(function (req, res) {
        console.log("*** CREATING SEED DATA ***");
        const holeSeedData = [
            {
                date: new Date(),
                long: -89.7663223,
                lat: 35.1940644,
                x: -1.7812861,
                y: 2.1930888,
                z: 9.050082
            },
            {
                date: new Date(),
                long: -89.8963223,
                lat: 35.403242,
                x: -1.7812861,
                y: 2.1930888,
                z: 9.050082
            },
            {
                date: new Date(),
                long: -89.760556,
                lat: 35.445368,
                x: -1.7812861,
                y: 2.1930888,
                z: 9.050082
            }
        ];

        PotHoleHit.create(holeSeedData, function (err, results) {
            if (err) {
                res.send(err);
            } else {
                // We got results
                res.send(results);
            }
        });
    });

module.exports = router;
