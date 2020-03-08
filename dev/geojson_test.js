const fs = require('fs');
const PotHoleHitG = require('../Models/PotHoleHitGEO');
const config = require('../config/config');
let mongoose = require('mongoose');




function readTextFile(file) {
    let rawtext = fs.readFileSync(file).toString();
    return (JSON.parse(rawtext));
}

function writeTextFile(fileContent) {
    fs.writeFile("./sample.txt", fileContent, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log("File has been created");
    })
}

let json_hits = readTextFile('./testdata.json');

let geojson_hits = {
    "type": "FeatureCollection",
    "features": []
};

let mongoDB = config.db;


console.log(`Preparing to connect to MongoDB at ${mongoDB}`);

mongoose.connect(mongoDB, {useNewUrlParser: true});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Iterate each hit in old format and convert to geoJSON
json_hits.forEach(function (element) {
// console.log("processing...");
    let jsonhit = new PotHoleHitG(
            {
            "geometry": {
                "type": "Point",
                "coordinates": [element.longitude, element.latitude],

            },
            "type": "Feature",
            "properties":
                {
                    "date": element.date,
                    "userTag": element.userTag, // default to 311
                    "marker": element.marker, // hardcode
                    "x": element.x,
                    "y": element.y,
                    "z": element.z,
                    "lastx": element.lastx,
                    "lasty": element.lasty,
                    "lastz": element.lastz,
                    "active": true
                }
        });
    // geojson_hits.features.push(new_geo_json);
    PotHoleHitG.create(jsonhit);

});

// console.log(JSON.stringify(geojson_hits));
//
// // Iterate each hit in old format and convert to geoJSON
// json_hits.forEach(function (element) {
//     let new_geo_json =
//         {
//             "geometry": {
//                 "type": "Point",
//                 "coordinates": [element.longitude, element.latitude],
//
//             },
//             "type": "Feature",
//             "properties":
//                 {
//                     "date": element.date,
//                     "userTag": element.userTag,
//                     "marker": element.marker,
//                     "x": element.x,
//                     "y": element.y,
//                     "z": element.z,
//                     "lastx": element.lastx,
//                     "lasty": element.lasty,
//                     "lastz": element.lastz
//                 }
//         };
//     geojson_hits.features.push(new_geo_json);
//
// });
//
// console.log(JSON.stringify(geojson_hits));
