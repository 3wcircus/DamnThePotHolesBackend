const express = require('express');
const router = express.Router();
const PotHoleHitG = require('../Models/PotHoleHitGEO');

function treatAsUTC(date) {
    logger.debug(arguments.callee.name);
    const result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}

function daysBetween(startDate, endDate) {
    logger.debug(arguments.callee.name);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
}

// FIXME: Update for geoJSON
router.route('/agetest')
    .get(function (req, res) {

        let age = req.query.age;
        if (age) {
            console.log(age);
            age = parseInt(age);
        } else {
            age = -1;
        }
        PotHoleHitG.find({}, {}, function (err, result) {
            if (err)
                res.send(err);
            else {
                let newArray = result.filter(function (hit) {
                    if (age < 1) {
                        return true;
                    }
                    let dateToday = Date.now();
                    let dateVal = Date.parse(hit.properties.date);
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

module.exports = router;
