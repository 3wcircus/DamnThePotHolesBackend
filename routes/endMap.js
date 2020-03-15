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
        logger.info('get asynch open cases');
        let OPEN_311_SVC_CLOSED_TICKETS = 'https://data.memphistn.gov/resource/2244-gnrp.json?category=Maintenance-Potholes';
        const resp = await fetch(OPEN_311_SVC_CLOSED_TICKETS);
        const newResp = await resp.json();
        logger.info(`ASYNCH ${newResp.length}`);
        let caselocations = newResp.map(function (element)
        {
            let jsonhit =
                {
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            element.location1 ? element.location1.coordinates[0] : 0,
                            element.location1 ? element.location1.coordinates[1] : 0
                        ]
                    },
                    "type": "Feature",
                    "properties":
                        {
                            "date": element.close_date,
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
        // logger.info(`Fetch: ${caselocations}`);
        // logger.info(`Type: ${typeof (caselocations)}`);
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
        // logger.info(arguments.callee.name);
        logger.info(`Rendering Closed Hit Map, ${arguments.callee.name}`);
        logger.info(`Fetch Closed Hits, ${arguments.callee.name}`);

        // logger.info(arguments.callee.name);
        logger.info(`Rendering Closed Hit Map, ${arguments.callee.name}`);
        // Add a new source from our GeoJSON data and set the
        // 'cluster' option to true. GL-JS will add the point_count property to your source data.
        const dataFilter = {
            __v: false,
            _id: false
        };
        console.log("root closed cases");

        // Pull hits from remote Mongo instance
        // FIXME: This code is duped in every map route
        PotHoleHitG.find({}, dataFilter, function (err, pot_holes)
        { //Use the find method on the data model to search DB
            if (err)
            {
                console.log("Error getting hit records: \n" + pot_holes);
                res.send(err);
            }
            else
            {
                // Fetch the closed pot hole tickets from 31 web service
                let caselocations = [];
                // TODO Add decent exception handling and clean this up
                apiGetAll()
                    .then((data) =>
                        {
                            caselocations = data;
                            logger.info(`AFTER ${caselocations.length}`);
                            res.render('endMap', {
                                pgtitle: 'CLOSED Cases',
                                pot_holes: pot_holes,
                                case_locations: caselocations,
                                ctxroot:'/endMap'
                            });
                        }
                    );
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

                // Fetch the closed pot hole tickets from 31 web service
                let caselocations = [];
                // TODO Add decent exception handling and clean this up
                apiGetAll()
                    .then((data) =>
                        {
                            caselocations = data;
                            logger.info(`AFTER ${caselocations.length}`);
                            res.render('endMap', {
                                pgtitle: 'CLOSED Cases',
                                pot_holes: pot_holes,
                                case_locations: caselocations,
                                ctxroot:'/endMap'
                            });
                        }
                    );

                // Now my array is aged and only hits that matched range included
                // res.send(newArray); // debug
                // res.render('endMap', {
                //     title: 'DTP',
                //     pot_holes: pot_holes,
                //     ctxroot: '/endMap'
                // });
            }

        })

    });
module.exports = router;
