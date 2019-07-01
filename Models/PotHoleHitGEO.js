const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// This schema describes the model for a pothole hit reported by a collector

var PotHoleHitsGEOSchema = new Schema({
    type: {type: String},
    'geometry': {
        type: {type: String, default: 'Point'},
        'coordinates': {
            'type': [Number],
            'index': '2dsphere',
            'required': true
        }
    },
    'properties': {
        "date": String,
        "userTag": String,
        "marker": Number,
        "x": Number,
        "y": Number,
        "z": Number,
        "lastx": Number,
        "lasty": Number,
        "lastz": Number,
        "active": {
            type: Boolean,
            default: true
        }
    }
});

const PotHoleHitsG = mongoose.model('PotHoleHitsG', PotHoleHitsGEOSchema);

module.exports = PotHoleHitsG;
