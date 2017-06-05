import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FarmSchema = new Schema({
    'userId': Schema.Types.ObjectId,
    'public': Boolean,
    'name': String,
    'location': {
        'name': String,
        'latLng': [Number],
        'stationId': String
    },
    'crop': String,
    'variety': String,
    'plantingDate': {
        'day': Number,
        'month': Number,
        'year': Number
    },
    'updated': Date
});

module.exports = mongoose.model('Farm', FarmSchema);
