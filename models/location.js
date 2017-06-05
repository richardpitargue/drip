import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
    'name': String,
    'latLng': [Number],
    'stationId': String
});

module.exports = mongoose.model('Location', LocationSchema);
