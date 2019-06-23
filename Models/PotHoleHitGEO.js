const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// This schema describes the model for a pothole hit reported by a collector

var PotHoleHitsGEOSchema = new Schema({
    type: {type: String},
    'geometry' : {
        type: {type: String, default: 'Point'},
        'coordinates' : {
            'type' : [Number],
            'index' : '2dsphere',
            'required' : true
        }
    },
    'properties' : {
        'speed' : Number,
        'measurement' : Number,
        'quality' : String
    }
});

const PotHoleHits = mongoose.model('PotHoleHits', PotHoleHitsGEOSchema);

module.exports = PotHoleHits;
