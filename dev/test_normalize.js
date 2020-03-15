let geo = require('geolib');
const fs = require('fs');
const PotHoleHitG = require('../Models/PotHoleHitGEO');
const config = require('../config/config');
//Set up mongoose connection
let mongoose = require('mongoose');


function treatAsUTC(date)
{
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}

function daysBetween(startDate, endDate)
{
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
}

function readTextFile(file)
{
    let rawtext = fs.readFileSync(file).toString();
    return (JSON.parse(rawtext));
}

// TODO Fix sort alogorithm for geoJSON
function sort_hits2(modArray)
{
    // Rebuild an array from sorted collection
    // todo: change for geeJSON
    let newArray = geo.orderByDistance({latitude: 0, longitude: 0}, modArray).map(function (hit)
    {
        return modArray[hit.key];
    });
    // Now my array is sorted
    return (newArray);
}

function sort_hits(hitlist)
{
    let modArray = hitlist.map(function (hit)
    {
        return ({latitude: hit.geometry.coordinates[0], longitude: hit.geometry.coordinates[1]});
        // return {
        //     latitude: hit.geometry.coordinates[0],
        //     longitude: hit.geometry.coordinates[1]
        // }
    });
    // console.log(modArray);
    // Rebuild an array from sorted collection
    let newArray = geo.orderByDistance({latitude: 0, longitude: 0}, modArray).map(function (hit, ndx)
    {
        // console.log(ndx);
        return hitlist[ndx];
    });
    // Now my array is sorted
    // console.log(newArray);
    return (newArray);
}

// Normalize multiple points
// Find center location
// TODO: Use average of intensity
// Use most recent dated hit for all other properties
function normalize_near_hits(nearby_hits)
{
    let normalized_hit = null;
    // Sort by date
    // console.log(`Unsorted list ${JSON.stringify(nearby_hits)}`);
    nearby_hits.sort((a, b) =>
    {
        // todo: change for geeJSON
        let dateVal1 = Date.parse(a.date);
        let dateVal2 = Date.parse(b.date);
        return daysBetween(dateVal1, dateVal2);
    });

    // sort by severity
    // todo: change for geeJSON
    nearby_hits.sort((a, b) =>
    {
        return (a.marker - b.marker);
    });
    // console.log(`Sorted list ${JSON.stringify(nearby_hits)}`);

    // fixme Don't assume first one what you want
    normalized_hit = nearby_hits[0];
    // Now get center

//    let center_hit = geo.getCenterOfBounds(nearby_hits);
    let center_hit = geo.getCenterOfBounds(nearby_hits.map(function (hit, ndx)
    {
        return ({latitude: hit.geometry.coordinates[0], longitude: hit.geometry.coordinates[1]});
    }));
    console.log(`Center of ${nearby_hits.length} hits is ${JSON.stringify(center_hit)}`);
    // todo: change for geeJSON
    normalized_hit.geometry.coordinates[1] = center_hit.longitude;
    normalized_hit.geometry.coordinates[0] = center_hit.latitude;
    return normalized_hit;
}

// This function will take a list of hits and will merge ones within 10 meters to the center
function merge_hits(hitlist, diameter)
{

    let merged_hits = [];
    let nearby_hits = [];
    // console.log(hitlist);
    // let hitlist_sorted = sort_hits2(hitlist);
    // let modArray = sort_hits2(hitlist);
    let modArray = sort_hits(hitlist); // for geojson
    // console.log(modArray);
    // let modArray = hitlist_sorted.map(function (hit) {
    //     return {
    //         latitude: hit.lat,
    //         longitude: hit.long
    //     }
    // });

    console.log(`Original number of hits is ${modArray.length}`);
    // console.log(modArray);
    console.log("*************************************");
    modArray.forEach(function (element)
        {
            if (nearby_hits.length === 0)
            {
                console.log(`Pushing empty ${element}`);
                nearby_hits.push(element);
                // console.log(`NOTHING IN NEARBY HITS. ${JSON.stringify(element)}`);
            }
            else
            {
                let in_range = true;
                for (let i = 0; i < nearby_hits.length; i++)
                {
                    // todo: change for geeJSON

                    let hit_distance = geo.getDistance({
                            latitude: nearby_hits[i].geometry.coordinates[0], longitude:
                                nearby_hits[i].geometry.coordinates[1]
                        }
                        ,
                        {
                            latitude: element.geometry.coordinates[0], longitude:
                                element.geometry.coordinates[1]
                        });
                    // let hit_distance = geo.getDistance(nearby_hits[i], element);
                    if (hit_distance > diameter)
                    {
                        // console.log(`Point out of range at ${hit_distance} meters. ${JSON.stringify(nearby_hits[i])} ${JSON.stringify(element)}`);
                        in_range = false;
                        break;
                    }
                }
                // Check if still in range
                if (in_range)
                {
                    nearby_hits.push(element);
                }
                else
                {
                    // Process nearby hits
                    if (nearby_hits.length === 1) // Only one hit so add it
                    {
                        // console.log(`Only one nearby hit so adding it ${JSON.stringify(nearby_hits[0])}`);
                        merged_hits.push(nearby_hits[0]); // TODO: This may be risky
                        nearby_hits = [];
                        nearby_hits.push(element);
                    }
                    else // Process the nearby hits and reset the array
                    {
                        // let center_hit = geo.getCenterOfBounds(nearby_hits);
                        // console.log(`Center of ${nearby_hits.length} hits is ${JSON.stringify(center_hit)}`);
                        let center_hit = normalize_near_hits(nearby_hits);
                        merged_hits.push(center_hit);
                        nearby_hits = [];
                        nearby_hits.push(element);
                    }
                }
            }
        }
    );
    if (nearby_hits.length > 0)
    {
        console.log(`WHATS LEFT IN ARRAY of ${nearby_hits.length} ${JSON.stringify(nearby_hits)}`);
        // let center_hit = geo.getCenterOfBounds(nearby_hits);
        // console.log(`Center of ${nearby_hits.length} hits is ${JSON.stringify(center_hit)}`);
        let center_hit = normalize_near_hits(nearby_hits);
        merged_hits.push(center_hit);
    }
    console.log(`Original number of hits is ${modArray.length}`);
    console.log(`Merged number of hits is ${merged_hits.length}`);
    return merged_hits;
}


let json_hits = readTextFile('./dtpgeojson.json');
// console.log(sort_hits(json_hits.features));

// let json_hits = readTextFile('./testdata.json');
// console.log(json_hits);
// console.log("*************************************");

// let hit_list = sort_hits2(json_hits);
/**********************************************************
 * TEST NORMALIZATION POINT OF ENTRY
 *
 * @type {string}
 */
let mongoDB = config.db;
// console.log(`Preparing to connect to MongoDB at ${mongoDB}`);
// mongoose.connect(mongoDB, {useNewUrlParser: true})
//     .then(() =>
//     {
//         console.log(`connect to MongoDB at ${mongoDB} successful`);
//     })
//     .catch((err) =>
//     {
//         console.log(`connect to MongoDB at ${mongoDB} FAILED!${err.stack}`);
//         process.exit(1);
//     });
// mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
// Read hits from db

// Merge hits
console.log(json_hits);
merge_hits(json_hits.features, 20);


//
// // Try to build a list with complete data
// let hit_list = merged_json_hits.map(function (hit) {
//     return json_hits.find(obj => {
//         // console.log(JSON.stringify(hit));
//         return (obj.long === hit.longitude && obj.lat === hit.latitude);
//     });
// });

// let mongoDB = config.db;
//
//
// console.log(`Preparing to connect to MongoDB at ${mongoDB}`);
//
// mongoose.connect(mongoDB, {useNewUrlParser: true});
//
// let db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
console.log("Updating records");
// console.log(hit_list);
// hit_list.forEach(function (element) {
//     PotHoleHit.create(element);
// });
console.log("DONE");
