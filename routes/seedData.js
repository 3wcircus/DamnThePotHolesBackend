const PotHoleHit = require('../models/PotHoleHit');

module.exports = function (app) {
    app.get('/seeddata', function (req, res) {
        const holeSeedData = [
            {
                date: new Date(),
                long: 37.782551,
                lat: 122.445368,
                x: -1.7812861,
                y: 2.1930888,
                z: 9.050082
            },
            {
                date: new Date(),
                long: 37.754665,
                lat: 122.403242,
                x: -1.7812861,
                y: 2.1930888,
                z: 9.050082
            },
            {
                date: new Date(),
                long: 37.760556,
                lat: 122.445368,
                x: -1.7812861,
                y: 2.1930888,
                z: 9.050082
            }
        ];

        PotHoleHit.create(holeSeedData, function (err, results) {
            res.send(results);
        });


    })
};