/*************************************************************
 * This is the main set of routes for the whole shebang
 *
 * FIXME: the routes for recording a new hit (and possible others) should be moved to the api.js routes
 *
 * @type {createApplication}
 */
const express = require('express');
const router = express.Router();
const PotHoleHitG = require('../Models/PotHoleHitGEO');
const log = require('simple-node-logger');

// FIXME: This code for creating a log file is duplicated in each Route javascript and should not be
// Create a rolling file logger based on date/time that fires process events
const logger_opts = {
    errorEventName: 'error',
    logDirectory: './logs', // NOTE: folder must exist and be writable...
    fileNamePattern: 'dtp-<DATE>.log',
    dateFormat: 'YYYY.MM.DD'
};
const logger = log.createRollingFileLogger(logger_opts); // Create a Logger

// Base home page that displays all the maps and all the current hits
router.route('/')
    .get(function (req, res)
    {
        // logger.info(arguments.callee.name);
        logger.info(`Rendering Hit Map, ${arguments.callee.name}`);
        // Add a new source from our GeoJSON data and set the
        // 'cluster' option to true. GL-JS will add the point_count property to your source data.
        const dataFilter = {
            __v: false,
            _id: false
        };
        console.log("Landing Page");
        // Pull hits from remote Mongo instance
        PotHoleHitG.find({}, dataFilter, function (err, potholes)
        { //Use the find method on the data model to search DB
            if (err)
            {
                console.log("Error getting hit records: \n" + potholes);
                res.send(err);
            }
            else
            {
                // logger.info(potholes[0]);
                // console.log(potholes[0]);
                // let ph = JSON.parse(potholes);
                res.render('index', {
                    pgtitle: 'DTP',
                    pot_holes: potholes,
                    ctxroot: '/dtp'
                });
            }
        });
    });




/*
    This route accepts an extra parameter that is how many days to go back for hits.
    This route is IMPORTANT as it should let us filter hit results by age in days
    TODO: This route needs more testing to confirm it works
    TODO: If this tests out, rename and move to other route file
 */

// TODO: Move all helper functions to their own file
// Helper function used in aging of hits
function treatAsUTC(date)
{
    logger.debug(arguments.callee.name);
    const result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}

// Helper function to calculate difference between days
function daysBetween(startDate, endDate)
{
    logger.debug(arguments.callee.name);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
}

router.route('/:age')
    .get(function (req, res)
    {

        let age = req.params.age; // Get the number of aging days passed in
        // console.log('Age = ' + age);
        if (age)
        {
            console.log(age);
            age = parseInt(age);
        }
        else
        {
            age = -1;
        }
        const dataFilter = {
            __v: false,
            _id: false
        };
        PotHoleHitG.find({}, dataFilter, function (err, result)
        {
            /*
                FIXME: Should filter on database lookup, not after.
                Right now gets all from database then filters down. This won't be acceptable should hit records reach severl thousand.
             */
            if (err)
            {
                res.send(err);
            }
            else
            {
                let pot_holes = result.filter(function (hit) // Super Kludge
                { // Filter on age days compared to current date/time
                    if (age < 1)
                    {
                        return true;
                    }
                    let dateToday = Date.now();
                    let dateVal = Date.parse(hit.properties.date);
                    let dateDateVal = new Date(dateVal);
                    let dayDiff = daysBetween(dateDateVal, dateToday);
                    // console.log(dayDiff);
                    if (dayDiff <= age)
                    {
                        // console.log(dateDateVal.toDateString());
                        return true;
                    }
                    else
                    {
                        return false;
                    }


                });


                // Now my array is aged and only hits that matched range included
                // res.send(newArray); // debug
                res.render('index', {
                    pgtitle: 'DTP',
                    pot_holes: pot_holes,
                    ctxroot: '/dtp'
                });
            }

        })

    });


/*************************************************************
 *
 *
 *  POST HIT CODE BELOW DO NOT DELETE
 *
 */
// Posts a new hit received from an external device
// ATM the Android app
router.route('/')
    .post(function (req, res)
    {
        logger.debug(arguments.callee.name);
        if (!req.body)
        {
            // FIXME: why does just trying to log to console render a template? And here it will case an exception
            logger.warn('No Request Body in Hit POST');
            res.send({});
            return;
        }
        // FIXME: why does just trying to log to console render a template? Ane here it will case an exception
        logger.info('New Hit Received: ', req.body);
        // FIXME Should be able to generate all this from object. This is too hard-coded
        // FIXME: Should send dates from mobile app as ISO8601 format and not converting here.
        let jsonhit = new PotHoleHitG(
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [req.body.longitude, req.body.latitude],

                },
                "type": "Feature",
                "properties":
                    {
                        "date": new Date(Date.parse(req.body.date)).toISOString(),
                        "userTag": req.body.userTag,
                        "marker": req.body.marker,
                        "x": req.body.x,
                        "y": req.body.y,
                        "z": req.body.z,
                        "lastx": req.body.lastx,
                        "lasty": req.body.lasty,
                        "lastz": req.body.lastz,
                        "active": true
                    }
            });
        PotHoleHitG.create(jsonhit).then(function (bump)
        {
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
    .get(function (req, res)
    {
        console.log(`Rendering Hit Map, ${arguments.callee.name}`);
        res.send('Get a Job')
    });


module.exports = router;
