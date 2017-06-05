import shell from 'python-shell';

import Crop from '../models/crop';
import Farm from '../models/farm';
import FarmInfo from '../models/farmInfo';
import Location from '../models/location';

exports.create = (req, res) => {
    let userId = req.body.userId;
    let name = req.body.name;
    let publicFarm = req.body.publicFarm;
    let locationId = req.body.locationId;
    let crop = req.body.crop;
    let variety = req.body.variety;
    let day = req.body.day;
    let month = req.body.month;
    let year = req.body.year;

    console.log(publicFarm);

    if(typeof userId === 'undefined' ||
       typeof name === 'undefined' ||
       typeof locationId === 'undefined'
   ) {
       return res.status(400).send({
           'message': 'Incomplete request details.'
       });
   }

   Location.findById(locationId, (error, result) => {
      if(error) {
          return res.status(500).send(error);
      }

      if(!result) {
          return res.status(404).send({
              'message': 'Location id not found.'
          });
      }

      const stationId = result.stationId;

      Farm.create({
          userId,
          name,
          'public': publicFarm,
          'location': {
              'name': result.name,
              'latLng': result.latLng,
              'stationId': result.stationId
          },
          crop,
          variety,
          'plantingDate': {
              day,
              month,
              year
          },
          updated: new Date()
      }, (error, result) => {
          if(error) {
              return res.status(500).send(error);
          }

          let options = {
              scriptPath: __dirname + '/../',
              args: [result._id, stationId, day, month, year, crop.gddAtMaturity, crop._id]
          }

          shell.run('generate_farminfo.py', options, (err, reslts) => {
              if(err) {
                  console.log(err)
                  return res.status(500).send(err);
              }

              return res.send(result);
          });
      });
   });
}

exports.findAllPublic = (req, res) => {
    Farm.find({'public': true}, (error, result) => {
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

exports.findAllByUser = (req, res) => {
    let userId = req.params.userId;

    if(typeof userId === 'undefined') {
        return res.status(400).send({
            'message': 'Please provide a user id.'
        });
    }

    Farm.find({userId}, (error, result) => {
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

exports.findAll = (req, res) => {
    Farm.find({}, (error, result) => {
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

exports.createFarmInfo = (req, res) => {
    let farmId = req.body.farmId;
    let day = req.body.day;
    let month = req.body.month;
    let year = req.body.year;
    let waterDeficit = req.body.waterDeficit;
    let irrigation = req.body.irrigation;
    let gdd = req.body.gdd;
    let cumulativeGdd = req.body.cumulativeGdd;
    let maturity = req.body.maturity;

    if(typeof farmId === 'undefined' ||
       typeof day === 'undefined' ||
       typeof month === 'undefined' ||
       typeof year === 'undefined' ||
       typeof waterDeficit === 'undefined' ||
       typeof irrigation === 'undefined' ||
       typeof gdd === 'undefined' ||
       typeof cumulativeGdd === 'undefined' ||
       typeof maturity === 'undefined'
   ) {
       return res.status(400).send({
           'message': 'Incomplete request details.'
       });
   }

   FarmInfo.create({
       farmId,
       'date': {
           day,
           month,
           year
       },
       waterDeficit,
       irrigation,
       gdd,
       cumulativeGdd,
       maturity
   }, (error, result) => {
       if(error) {
           return res.status(500).send(error);
       }

       Farm.update({
           '_id': farmId
       }, {
           'updated': new Date()
       }, {}, (error, numAffected) => {
           if(error) {
               return res.status(500).send(error);
           }

           return res.send(result);
       });
   });
}

exports.findAllFarmInfoByFarmId = (req, res) => {
    let farmId = req.params.farmId;

    if(typeof farmId === 'undefined') {
        return res.status(400).send({
            'message': 'Please provide a farm id.'
        });
    }

    FarmInfo.find({farmId}, (error, result) => {
        if(error) {
            return res.status(500).send(error);
        }

        if(result.length === 0) {
            return res.status(404).send({
                'message': 'No data found'
            });
        }

        return res.send(result);
    });
}

exports.findLatestFarmInfo = (req, res) => {
    let farmId = req.params.farmId;

    if(typeof farmId === 'undefined') {
        return res.status(400).send({
            'message': 'Please provide a farm id.'
        });
    }

    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    FarmInfo.findOne({
        'date.day': yesterday.getDate(),
        'date.month': yesterday.getMonth() + 1,
        'date.year': yesterday.getFullYear()
    }, (error, result) => {
        if(error) {
            return res.status(500).send(error);
        }

        if(!result) {
            return res.status(404).send({
                'message': 'No data found'
            });
        }

        return res.send(result);
    });
}

exports.addIrrigation = (req, res) => {
    let farmId = req.params.farmId;
    let cropId = req.body.cropId;

    if(typeof farmId === 'undefined') {
        return res.status(400).send({
            'message': 'Please provide a farm id.'
        });
    }

    let date = {
        day: req.body.day,
        month: req.body.month,
        year: req.body.year
    };
    let irrigation = req.body.irrigation;

    FarmInfo.findOne({farmId,
        'date.day': req.body.day,
        'date.month': req.body.month,
        'date.year': req.body.year
    }, (error, result) => {
        if(error) {
            return res.status(500).send(error);
        }

        if(!result) {
            return res.status(404).send({
                'message': 'No data found'
            });
        }

        let waterDeficit = result.waterDeficit - parseFloat(irrigation);

        FarmInfo.update({farmId,
            'date.day': req.body.day,
            'date.month': req.body.month,
            'date.year': req.body.year
        }, {irrigation}, (err, numAffected) => {
            if(error) {
                return res.status(500).send(error);
            }

            if(!result) {
                return res.status(404).send({
                    'message': 'No data found'
                });
            }

            let options = {
                scriptPath: __dirname + '/../',
                args: [farmId, req.body.day, req.body.month, req.body.year, cropId]
            }

            shell.run('update_irrigation.py', options, (err, reslts) => {
                if(err) {
                    return res.status(500).send(err);
                }

                return res.send({
                    'message': 'Succesfully updated ' + numAffected.nModified + ' farm.'
                });
            });
        });
    });
}
