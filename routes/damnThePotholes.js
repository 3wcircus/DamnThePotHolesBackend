var express = require('express');
var router = express.Router();
const PotHoleHit = require('../models/PotHoleHit');

// Routes for app controlers
router.route('/')
    .get(function (req, res) {
        res.send('Get a map')
    })
    .post(function (req, res) {
        res.send('Add a map')
    })
    .put(function (req, res) {
        res.send('Update a map')
    });

router.route('/seed')
    .get(function (req, res) {
        const holeSeedData = [
            {
                date: new Date(),
                long: 37.782551,
                lat: 122.445368,
                x: -1.7812861,
                y: 2.1930888,
                z: 9.050082
            },
            {
                date: new Date(),
                long: 37.754665,
                lat: 122.403242,
                x: -1.7812861,
                y: 2.1930888,
                z: 9.050082
            },
            {
                date: new Date(),
                long: 37.760556,
                lat: 122.445368,
                x: -1.7812861,
                y: 2.1930888,
                z: 9.050082
            }
        ];

        PotHoleHit.create(holeSeedData, function (err, results) {
            res.send(results);
        });
    });

module.exports = router;