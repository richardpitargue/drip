import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CropSchema = new Schema({
    'name': String,
    'variety': [String],
    'cutoff': [Number],
    'mad': Number,
    'cropCoefficient': [Number],
    'deptOfRootZone': Number,
    'gddAtMaturity': Number
});

module.exports = mongoose.model('Crop', CropSchema);
