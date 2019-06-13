var express = require('express');
var router = express.Router();
let geo = require('geolib');

const PotHoleHit = require('../Models/PotHoleHit');

function treatAsUTC(date) {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}

function daysBetween(startDate, endDate) {
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
}

// proto group commons
router.route('/grouptest')
    .get(function (req, res) {
        PotHoleHit.find({}, {}, function (err, result) {
            if (err)

                res.send(err);
            else {
                let modArray = result.map(function (hit) {
                    return {
                        latitude: hit.lat,
                        longitude: hit.long
                    }
                });

                // Rebuild an array from sorted collection
                let newArray = geo.orderByDistance({latitude: 0, longitude: 0}, modArray).map(function (hit) {
                    return result[hit.key];
                });
                // Now my array is sorted
                res.send(newArray);

                // Now iterate through and combine pts within 5 meters of each other

            }

        })
    });

router.route('/agetest')
    .get(function (req, res) {

        let age = req.query.age;
        if (age) {
            console.log(age);
            age = parseInt(age);
        } else {
            age = -1;
        }
        PotHoleHit.find({}, {}, function (err, result) {
            if (err)

                res.send(err);
            else {
                let newArray = result.filter(function (hit) {
                    if (age < 1) {
                        return true;
                    }
                    let dateToday = Date.now();
                    let dateVal = Date.parse(hit.date);
                    let dateDateVal = new Date(dateVal);
                    let dayDiff = daysBetween(dateDateVal, dateToday);
                    // console.log(dayDiff);
                    if (dayDiff >= age) {
                        console.log(dateDateVal.toDateString());
                        return true;
                    } else {
                        return false;
                    }


                });


                // Now my array is aged
                res.send(newArray);
            }

        })

    });

router.route('/filtertest')
    .get(function (req, res) {

        let age = req.query.age;
        if (age) {
            console.log(age);
            age = parseInt(age);
        } else {
            age = -1;
        }
        PotHoleHit.find({}, {}, function (err, result) {
            if (err)

                res.send(err);
            else {
                let newArray = result.filter(function (hit) {
                    if (age < 1) {
                        return true;
                    }
                    let dateToday = Date.now();
                    let dateVal = Date.parse(hit.date);
                    let dateDateVal = new Date(dateVal);
                    let dayDiff = daysBetween(dateDateVal, dateToday);
                    // console.log(dayDiff);
                    if (dayDiff <= age) {
                        console.log(dateDateVal.toDateString());
                        return true;
                    } else {
                        return false;
                    }


                });


                // Now my array is aged
                res.send(newArray);
            }

        })

    });

// Base route that displays the current home page
router.route('/')
    .post(function (req, res) {
        if (!req.body) {
            // FIXME: why does just trying to log to console render a template? And here it will case an exception
            // console.log("No Request Body");
            res.send({});
            return;
        }
        // FIXME: why does just trying to log to console render a template? Ane here it will case an exception
        // console.log("Recording a hit");
        PotHoleHit.create(req.body).then(function (bump) {
            res.send(bump);
        })
    });

// Generate some test data
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
                z: 9.050082,
                marker: 0
            },
            {
                date: new Date(),
                long: -89.8963223,
                lat: 35.403242,
                x: -1.7812861,
                y: 2.1930888,
                z: 9.050082,
                marker: 240
            },
            {
                date: new Date(),
                long: -89.760556,
                lat: 35.445368,
                x: -1.7812861,
                y: 2.1930888,
                z: 9.050082,
                marker: 60
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

// Routes for app controlers
router.route('/')
    .get(function (req, res) {
        res.send('Get a Job')
    });


module.exports = router;
