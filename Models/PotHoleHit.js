/******************************************
 * FIXME: NOTE this is the old model prior to using geoJSON and needs to be removed when deemed safe
 *
 * @type {module:mongoose}
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// This schema describes the model for a pothole hit reported by a collector
// TODO: Use actual Date data types
const PotHoleHitsSchema = new Schema(
    {
        userTag: String,
        date: String,
        longitude: Number,
        latitude: Number,
        x: Number,
        y: Number,
        z: Number,
        marker: Number,
        lastx: Number,
        lasty: Number,
        lastz: Number,
        active: {
            type: Boolean,
            default: true
        }
    }
);

const PotHoleHits = mongoose.model('PotHoleHits', PotHoleHitsSchema);

module.exports = PotHoleHits;
