const fs = require('fs');

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

// Iterate each hit in old format and convert to geoJSON
json_hits.forEach(function (element) {
    let new_geo_json =
        {
            "geometry": {
                "type": "Point",
                "coordinates": [element.longitude, element.latitude],

            },
            "type": "Feature",
            "properties":
                {
                    "date": element.date,
                    "userTag": element.userTag,
                    "marker": element.marker,
                    "x": element.x,
                    "y": element.y,
                    "z": element.z,
                    "lastx": element.lastx,
                    "lasty": element.lasty,
                    "lastz": element.lastz
                }
        };
    geojson_hits.features.push(new_geo_json);

});

console.log(JSON.stringify(geojson_hits));

