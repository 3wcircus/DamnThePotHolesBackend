let geo = require('geolib');
const fs = require('fs');
const PotHoleHitG = require('../Models/PotHoleHitGEO');
const config = require('../config/config');
//Set up mongoose connection
let mongoose = require('mongoose');
// Creating a branch

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

function sort_hits(hitlist)
{
    // console.log(hitlist[0]);
    let modArray = hitlist.map(function (hit)
    {
        return ({latitude: hit.geometry.coordinates[0], longitude: hit.geometry.coordinates[1]});
        
    });
    // console.log("");
    let newArray = geo.orderByDistance({latitude: 0, longitude: 0}, modArray).map(function (hit, ndx)
    {
        return hitlist[ndx];
    });
    // console.log(newArray[0]);
    return (newArray);
}

// Normalize multiple points
// Find center location
// TODO: Use average of intensity
// Use most recent dated hit for all other properties
function normalize_near_hits(nearby_hits)
{
    let hits_to_remove = [];
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

    // fixme Don't assume first one what you want
    normalized_hit = nearby_hits[0];
    // console.log(normalized_hit);
    // Now get center

//    let center_hit = geo.getCenterOfBounds(nearby_hits);
    let center_hit = geo.getCenterOfBounds(nearby_hits.map(function (hit, ndx)
    {
        return ({latitude: hit.geometry.coordinates[0], longitude: hit.geometry.coordinates[1]});
    }));
    console.log(`Center of ${nearby_hits.length} hits is ${JSON.stringify(center_hit)}`);


    
    // console.log(normalized_hit);
    // for(let i =0; i < nearby_hits.length;i++)
    // {
    //     let obj = JSON.parse(nearby_hits[i])

    // }
    // todo: change for geeJSON
    normalized_hit.geometry.coordinates[1] = center_hit.longitude;
    normalized_hit.geometry.coordinates[0] = center_hit.latitude;
    return normalized_hit;
}

// This function will take a list of hits and will merge ones within 10 meters to the center
function merge_hits(hitlist, diameter)
{
    // take in the complete list of potholes and create an array to store the currently being worked potholes
    //  and create an array of potholes that have been processed through the filter
    let currentHitCollection = sort_hits(hitlist);
    let hitsBeingFiltered = [];
    let hitsFilteredOutCollection = [];
    console.log(`Current Number of hits: ${currentHitCollection.length}`);
    console.log("*************************************");
    currentHitCollection.forEach(function (element,index) 
    {
            if(hitsBeingFiltered.length === 0)
            {
                hitsBeingFiltered.push(currentHitCollection.splice(index));
            }
            currentHitCollection.forEach((element,index)=>
            {
                
            })
    })




}


let json_hits = readTextFile('./test_dtp_json.json');
// let json_hits = readTextFile('./dtpgeojson.json');
// console.log(sort_hits(json_hits.features))
merge_hits(json_hits.features,20);


// let json_hits = readTextFile('./testdata.json');
// console.log(json_hits);
// console.log("*************************************");

// let hit_list = sort_hits2(json_hits);
/**********************************************************
 * TEST NORMALIZATION POINT OF ENTRY
 *
 * @type {string}
 */

console.log("DONE");
