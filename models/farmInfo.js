import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FarmInfoSchema = new Schema({
    'farmId': Schema.Types.ObjectId,
    'date': {
        'year': Number,
        'month': Number,
        'day': Number
    },
    'waterDeficit': Number,
    'irrigation': Number,
    'gdd': Number,
    'cumulativeGdd': Number,
    'maturity': Number
});

module.exports = mongoose.model('FarmInfo', FarmInfoSchema);
