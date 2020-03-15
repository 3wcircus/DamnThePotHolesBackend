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
const fetch = require('node-fetch');

const OPEN_311_USER = 'OPEN_311';
// FIXME: This code for creating a log file is duplicated in each Route javascript and should not be
// Create a rolling file logger based on date/time that fires process events
const logger_opts = {
    errorEventName: 'error',
    logDirectory: './logs', // NOTE: folder must exist and be writable...
    fileNamePattern: 'dtp-<DATE>.log',
    dateFormat: 'YYYY.MM.DD'
};
const logger = log.createRollingFileLogger(logger_opts); // Create a Logger

// Get async/await version working
async function apiGetAll()
{
    try
    {
        logger.info('get asynch');
        let OPEN_311_SVC_OPEN_TICKETS = 'https://data.memphistn.gov/resource/aiee-9zqu.json?category=Maintenance-Potholes';
        const resp = await fetch(OPEN_311_SVC_OPEN_TICKETS);
        const newResp = await resp.json();
        logger.info(`ASYNCH ${newResp.length}`);
        let caselocations = newResp.map(function (element)
        {
            let jsonhit =
                {
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            element.location_1 ? element.location_1.coordinates[0] : 0,
                            element.location_1 ? element.location_1.coordinates[1] : 0
                        ]
                    },
                    "type": "Feature",
                    "properties":
                        {
                            "date": element.reported_date,
                            "userTag": OPEN_311_USER,
                            "marker": 2112,
                            "x": 0,
                            "y": 1,
                            "z": 2,
                            "lastx": 0,
                            "lasty": 0,
                            "lastz": 0,
                            "active": true,
                            "address1": element.address1,
                            "postal_code": element.postal_code,
                            "incident_id":element.incident_id,
                            "incident_number":element.incident_number
                        }
                };
            return jsonhit;
        });
        logger.info(`Fetch: ${caselocations}`);
        logger.info(`Type: ${typeof (caselocations)}`);
        return caselocations;
    }
    catch (err)
    {
// all errors will be captured here for anything in the try block
        console.log(err)
    }
}

// Base home page that displays all the maps and all the current hits
router.route('/')
    .get(function (req, res)
    {
        // let OPEN_311_SVC_OPEN_TICKETS = 'https://data.memphistn.gov/resource/aiee-9zqu.json?category=Maintenance-Potholes';
        // logger.info(arguments.callee.name);
        logger.info(`Rendering Open Hit Map, ${arguments.callee.name}`);
        logger.info(`Fetch OPen Hits, ${arguments.callee.name}`);

        // logger.info(arguments.callee.name);
        logger.info(`Rendering Open Hit Map, ${arguments.callee.name}`);
        // Add a new source from our GeoJSON data and set the
        // 'cluster' option to true. GL-JS will add the point_count property to your source data.
        const dataFilter = {
            __v: false,
            _id: false
        };
        console.log("root open cases");

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
                // Fetch the open pot hole tickets from 31 web service
                let caselocations = [];
                // TODO Add decent exception handling and clean this up
                apiGetAll()
                    .then((data) =>
                        {
                            caselocations = data;
                            logger.info(`AFTER ${caselocations.length}`);
                            res.render('openMap', {
                                pgtitle: 'OPEN Cases',
                                pot_holes: potholes,
                                case_locations: caselocations
                            });
                        }
                    );
            }
        });


        // fetch(OPEN_311_SVC_OPEN_TICKETS)
        //     .then((response) => {
        //         return response.json();
        //     })
        //     .then((result) => {
        //         logger.info(`RES\n ${result.length}`);
        //         // caselocations = result.forEach(function (element) {
        //         caselocations = result.map(function (element)
        //         {
        //             let jsonhit =
        //                 {
        //                     "geometry": {
        //                         "type":"Point",
        //                         "coordinates":[
        //                             element.location1 ? element.location1.coordinates[0]:0,
        //                             element.location1 ? element.location1.coordinates[1]:0
        //                         ]
        //                     },
        //                     "type": "Feature",
        //                     "properties":
        //                         {
        //                             "date": element.reported_date,
        //                             "userTag": OPEN_311_USER,
        //                             "marker": 2112,
        //                             "x": 0,
        //                             "y": 1,
        //                             "z": 2,
        //                             "lastx": 0,
        //                             "lasty": 0,
        //                             "lastz": 0,
        //                             "active": true
        //                         }
        //                 };
        //             // caselocations.push(jsonhit); // Add to the array of closed tickets converted to GeoJSON
        //             // logger.info(`pushed ${jsonhit}`);
        //             return jsonhit;
        //         });
        //         return result;
        //     })
        //     .then((data) =>
        //     {
        //
        //         // logger.info(`REC: ${data}`); // Sanity checks
        //         // logger.info(`DUMP\n ${caselocations}`);
        //         logger.info(`DUMP\n ${caselocations.length}`);
        //     });

        // logger.info(`AFTER\n ${caselocations.length}`);

    });


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
        // FIXME Should be able to generate all this from object. This is to hard-coded
        let jsonhit = new PotHoleHitG(
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [req.body.longitude, req.body.latitude],

                },
                "type": "Feature",
                "properties":
                    {
                        "date": req.body.date,
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
