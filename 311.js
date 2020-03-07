
const fs = require('fs');
// const PotHoleHitG = require('../Models/PotHoleHitGEO');
// const config = require('../config/config');
// let mongoose = require('mongoose');




function readTextFile(file) {
    let rawtext = fs.readFileSync(file).toString();
    return (JSON.parse(rawtext));
}

function writeTextFile(fileContent) {
    fs.writeFile("./sample.json", fileContent, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log("File has been created");
    })
}

let json_hits = readTextFile('./propText.json');

let geojson_hits = {
    "type": "FeatureCollection",
    "features": []
};

// let mongoDB = config.db;


// console.log(`Preparing to connect to MongoDB at ${mongoDB}`);

// mongoose.connect(mongoDB, {useNewUrlParser: true});

// let db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Iterate each hit in old format and convert to geoJSON
let item = 1;

json_hits.forEach(function (element) {
// console.log("processing...");
    let jsonhit = 
            {
            "geometry": {
                "type":"Point",
                "coordinates":[
                   element.location1 ? element.location1.coordinates[0]:0,
                    element.location1 ? element.location1.coordinates[1]:0
                ]

            },
            "type": "Feature",
            "properties":
                {
                    "date": element.reported_date,
                    "userTag": element.created_by_user,
                    "marker": element.request_priority,
                    "x": element.x,
                    "y": element.y,
                    "z": element.z,
                    "lastx": element.lastx,
                    "lasty": element.lasty,
                    "lastz": element.lastz,
                    "active": true
                }
        };
    geojson_hits.features.push(jsonhit);
    // PotHoleHitG.create(jsonhit);
    console.log(item++ +"\n"+ JSON.stringify(jsonhit));
    // console.log(geojson_hits);
    writeTextFile(JSON.stringify(geojson_hits));
        
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
