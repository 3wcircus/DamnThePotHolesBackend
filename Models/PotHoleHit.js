
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PotHoleHitsSchema = new Schema(
    {
        date: String,
        long: Number,
        lat: Number,
        x: Number,
        y: Number,
        z: Number,
        marker: Number
    }
);

const PotHoleHits = mongoose.model('PotHoleHits',PotHoleHitsSchema);

module.exports = PotHoleHits;