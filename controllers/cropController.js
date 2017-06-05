import Crop from '../models/crop';

Crop.findOne({}, (error, result) => {
    if(!result) {
        Crop.create({
            'name': 'corn',
            'mad': 0.5,
            'cutoff': [25, 50, 88],
            'cropCoefficient': [0.3, 1.15, 1.05],
            'depthOfRootZone': 1,
            'gddAtMaturity': 1800,
            'variety': ['100-day variety']
        });
    }
});

exports.create = (req, res) => {
    let name = req.body.name;
    let mad = req.body.mad;
    let cutoff = req.body.cutoff;
    let cropCoefficient = req.body.cropCoefficient;
    let depthOfRootZone = req.body.depthOfRootZone;
    let gddAtMaturity = req.body.gddAtMaturity;
    let variety = req.body.variety;

    if(typeof name === 'undefined' ||
       typeof mad === 'undefined' ||
       typeof cutoff === 'undefined' ||
       typeof cropCoefficient === 'undefined' ||
       typeof depthOfRootZone === 'undefined' ||
       typeof gddAtMaturity === 'undefined' ||
       typeof variety === 'undefined'
    ) {
        return res.status(400).send({
            'message': 'Incomplete request details.'
        });
    }

    Crop.create({
        name,
        mad,
        cutoff,
        cropCoefficient,
        depthOfRootZone,
        gddAtMaturity,
        variety
    }, (error, result) => {
        if(error) {
            return res.status(500).send(error);
        }

        res.send(result);
    });
}

exports.findAll = (req, res) => {
    Crop.find({}, (error, result) => {
        if(error) {
            return res.status(500).send(error);
        }

        if(result.length === 0) {
            return res.status(404).send({
                'message': 'No data found.'
            });
        }

        return res.send(result);
    });
}

exports.findById = (req, res) => {
    let _id = req.params.cropId;

    Crop.findOne({_id}, (error, result) => {
        if(error) {
            return res.status(500).send(error);
        }

        if(!result) {
            return res.status(404).send({
                'message': 'No data found.'
            });
        }

        return res.send(result);
    });
}

exports.findOneByName = (req, res) => {
    let name = req.params.name.toLowerCase();

    Crop.findOne({name}, (error, result) => {
        if(error) {
            return res.status(500).send(error);
        }

        if(!result) {
            return res.status(404).send({
                'message': 'No data found.'
            });
        }

        return res.send(result);
    });
}
