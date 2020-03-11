/***************************************************
 * This file is meant to separate all the routes for backend operations
 * like recording a hit sent in from a mobile device
 *
 * FIXME: Migrate other routes from damnThePotholes to here
 *
 * @type {createApplication}
 */


// Create a rolling file logger based on date/time that fires process events
const express = require('express'), router = express.Router(), PotHoleHitG = require('../Models/PotHoleHitGEO'),
    log = require('simple-node-logger'), logger_opts = {
        errorEventName: 'error',
        logDirectory: './logs', // NOTE: folder must exist and be writable...
        fileNamePattern: 'dtp-<DATE>.log',
        dateFormat: 'YYYY.MM.DD'
    }, logger = log.createRollingFileLogger(logger_opts);

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

/*
    TODO: Legacy landing route as now should redirect to /dtp. See index.js route
 */

router.route('/')
    .get(function (req, res)
    {
        // logger.info(arguments.callee.name);
        logger.info(`API root, ${arguments.callee.name}`);
        res.send('API Root');
    });


/*
    This route accepts an extra parameter that is how many days to go back for hits.
    This route is IMPORTANT as it should let us filter hit results by age in days
    TODO: This route needs more testing to confirm it works
    TODO: If this tests out, rename and move to other route file
 */
router.route('/agetest/:age')
    .get(function (req, res)
    {

        let age = req.params.age; // Get the number of aging days passed in
        console.log('Age = ' + age);
        if (age)
        {
            console.log(age);
            age = parseInt(age);
        }
        else
        {
            age = -1;
        }
        PotHoleHitG.find({}, {}, function (err, result)
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
                let newArray = result.filter(function (hit) // Super Kludge
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
                // res.send(newArray);
                // newArray.forEach((el,idx) => {
                //     console.log(`G${idx}: ${el}`);
                //     logger.info(`G${idx}: ${el}`);
                // });

                res.render('index', {
                    title: 'DTP',
                    pot_holes: newArray
                });
            }

        })

    });

// export a reference
module.exports = router;
