var express = require('express');
var router = express.Router();
let geo = require('geolib');
let ejs = require('ejs-locals');

const PotHoleHitG = require('../Models/PotHoleHitGEO');

const log = require('simple-node-logger');


// create a rolling file logger based on date/time that fires process events
const logger_opts = {
    errorEventName: 'error',
    logDirectory: './logs', // NOTE: folder must exist and be writable...
    fileNamePattern: 'dtp-<DATE>.log',
    dateFormat: 'YYYY.MM.DD'
};
const logger = log.createRollingFileLogger(logger_opts);

function treatAsUTC(date) {
    logger.debug(arguments.callee.name);
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}

function daysBetween(startDate, endDate) {
    logger.debug(arguments.callee.name);
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
}

// proto group commons
// FIXME: Update for geoJSON
// router.route('/grouptest')
//     .get(function (req, res) {
//         logger.debug(arguments.callee.name);
//         PotHoleHit.find({}, {}, function (err, result) {
//             if (err)
//
//                 res.send(err);
//             else {
//                 let modArray = result.map(function (hit) {
//                     return {
//                         latitude: hit.lat,
//                         longitude: hit.long
//                     }
//                 });
//
//                 // Rebuild an array from sorted collection
//                 let newArray = geo.orderByDistance({latitude: 0, longitude: 0}, modArray).map(function (hit) {
//                     return result[hit.key];
//                 });
//                 // Now my array is sorted
//                 res.send(newArray);
//
//                 // Now iterate through and combine pts within 5 meters of each other
//
//             }
//
//         })
//     });

// Base home page that displays all the maps and all the current hits
router.route('/')
    .get(function (req, res) {
        logger.info(arguments.callee.name);
        // Add a new source from our GeoJSON data and set the
        // 'cluster' option to true. GL-JS will add the point_count property to your source data.
        var dataFilter = {
            __v: false,
            _id: false
        };

        // Pull hits from remote Mongo instance
        PotHoleHitG.find({}, dataFilter, function (err, potholes) { //Use the find method on the data model to search DB
            if (err) {
                console.log("Error getting hit records: \n" + potholes);
                res.send(err);
            } else {
                // No exception, so inject hits and render

                // console.log(`Successfully retrieved EJS ${ph_recs}`)
                // potholes = ph_recs;
                // console.log(potholes);
                // let ph = JSON.parse(potholes);
                res.render('index', {
                    title: 'DTP Landing Page',
                    pot_holes: potholes
                });
            }
        });

    });

// FIXME: This iwas just for debug
// router.route('/ejsdata')
//     .get(function (req, res) {
//         logger.info(arguments.callee.name);
//         // Add a new source from our GeoJSON data and set the
//         // 'cluster' option to true. GL-JS will add the point_count property to your source data.
//         // TODO:Figure out how not to exclude the dat field
//         var dataFilter = {
//             __v: false,
//             _id: false
//         };
//
//         // Pull hits from remote Mongo instance
//         let ph_recs = null;
//         PotHoleHit.find({}, dataFilter, function (err, ph_recs) { //Use the find method on the data model to search DB
//             if (err) {
//                 console.log("Error getting hit records: \n" + ph_recs);
//                 res.send(err);
//             } else {
//                 // No exception, so inject hits and render
//
//                 // console.log(`Successfully retrieved EJS ${ph_recs}`)
//             }
//         });
//         // console.log(ph_recs);
//         res.send(ph_recs);
//     });

// FIXME: Update for geoJSON
// router.route('/agetest')
//     .get(function (req, res) {
//         logger.debug(arguments.callee.name);
//         let age = req.query.age;
//         if (age) {
//             console.log(age);
//             age = parseInt(age);
//         } else {
//             age = -1;
//         }
//         PotHoleHit.find({}, {}, function (err, result) {
//             if (err)
//
//                 res.send(err);
//             else {
//                 let newArray = result.filter(function (hit) {
//                     if (age < 1) {
//                         return true;
//                     }
//                     let dateToday = Date.now();
//                     let dateVal = Date.parse(hit.date);
//                     let dateDateVal = new Date(dateVal);
//                     let dayDiff = daysBetween(dateDateVal, dateToday);
//                     // console.log(dayDiff);
//                     if (dayDiff >= age) {
//                         console.log(dateDateVal.toDateString());
//                         return true;
//                     } else {
//                         return false;
//                     }
//
//
//                 });
//
//
//                 // Now my array is aged
//                 res.send(newArray);
//             }
//
//         })
//
//     });

// FIXME: Update for geoJSON
// router.route('/filtertest')
//     .get(function (req, res) {
//         logger.debug(arguments.callee.name);
//         let age = req.query.age;
//         if (age) {
//             console.log(age);
//             age = parseInt(age);
//         } else {
//             age = -1;
//         }
//         PotHoleHit.find({}, {}, function (err, result) {
//             if (err)
//
//                 res.send(err);
//             else {
//                 let newArray = result.filter(function (hit) {
//                     if (age < 1) {
//                         return true;
//                     }
//                     let dateToday = Date.now();
//                     let dateVal = Date.parse(hit.date);
//                     let dateDateVal = new Date(dateVal);
//                     let dayDiff = daysBetween(dateDateVal, dateToday);
//                     // console.log(dayDiff);
//                     if (dayDiff <= age) {
//                         console.log(dateDateVal.toDateString());
//                         return true;
//                     } else {
//                         return false;
//                     }
//
//
//                 });
//
//
//                 // Now my array is aged
//                 res.send(newArray);
//             }
//
//         })
//
//     });

// Posts a new hit
// FIXME: Update for geoJSON
router.route('/')
    .post(function (req, res) {
        logger.debug(arguments.callee.name);
        if (!req.body) {
            // FIXME: why does just trying to log to console render a template? And here it will case an exception
            logger.warn('No Request Body in Hit POST');
            res.send({});
            return;
        }
        // FIXME: why does just trying to log to console render a template? Ane here it will case an exception
        logger.info('New Hit Received: ', req.body);
        PotHoleHit.create(req.body).then(function (bump) {
            res.send(bump);
        })
    });

// Generate some test data
// FIXME: Update for geoJSON
// router.route('/seed')
//     .get(function (req, res) {
//         console.log("*** CREATING SEED DATA ***");
//         const holeSeedData = [
//             {
//                 date: new Date(),
//                 long: -89.7663223,
//                 lat: 35.1940644,
//                 x: -1.7812861,
//                 y: 2.1930888,
//                 z: 9.050082,
//                 marker: 0
//             },
//             {
//                 date: new Date(),
//                 long: -89.8963223,
//                 lat: 35.403242,
//                 x: -1.7812861,
//                 y: 2.1930888,
//                 z: 9.050082,
//                 marker: 240
//             },
//             {
//                 date: new Date(),
//                 long: -89.760556,
//                 lat: 35.445368,
//                 x: -1.7812861,
//                 y: 2.1930888,
//                 z: 9.050082,
//                 marker: 60
//             }
//         ];
//
//         PotHoleHit.create(holeSeedData, function (err, results) {
//             if (err) {
//                 res.send(err);
//             } else {
//                 // We got results
//                 res.send(results);
//             }
//         });
//     });

// Routes for app controlers
router.route('/')
    .get(function (req, res) {
        res.send('Get a Job')
    });


module.exports = router;
