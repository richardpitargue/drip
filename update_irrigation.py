import sys
from requests import get, post
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime,timedelta

opts = sys.argv[1:]

farmId = opts[0]
day = int(opts[1])
month = int(opts[2])
year = int(opts[3])
cropId = opts[4]

db = MongoClient().waiss

crop_info = get('http://http://159.203.253.4:3000/api/crop/{id}'.format(id=cropId)).json()

farm = db.farms.find_one({
    '_id': ObjectId(farmId)
})

def compute_kc(maturity):
    if maturity < crop_info['cutoff'][0]:
        return crop_info['cropCoefficient'][0]

    if maturity < crop_info['cutoff'][1]:
        return ((crop_info['cropCoefficient'][0] + (crop_info['cropCoefficient'][1] - crop_info['cropCoefficient'][0]) / (crop_info['cutoff'][1] - crop_info['cutoff'][0])) * (maturity - crop_info['cutoff'][0]))
    else:
        if maturity > crop_info['cutoff'][2]:
            return (crop_info['cropCoefficient'][1] - ((crop_info['cropCoefficient'][1] - crop_info['cropCoefficient'][w]) / (100 - crop_info['cutoff'][2])) * (maturity - crop_info['cutoff'][2]))
        else:
            return crop_info['cropCoefficient'][2]

start = db.farminfos.find_one({
    'farmId': ObjectId(farmId),
    'date.day': day,
    'date.month': month,
    'date.year': year
})

if start is not None:
    water_deficit = start['waterDeficit']
    start_update = datetime(year, month, day) + timedelta(days=1)
    info = db.farminfos.find_one({
        'farmId': ObjectId(farmId),
        'date.day': start_update.day,
        'date.month': start_update.month,
        'date.year': start_update.year
    })

    while info is not None:
        result = get('http://http://159.203.253.4:3001/data/{id}/waterdeficit/{d}-{m}-{y}'.format(id=farm['location']['stationId'], d=start_update.day, m=start_update.month, y=start_update.year))
        data = result.json()

        ETa = data['ET']['ave'] * compute_kc(info['maturity'])

        db.farminfos.find_one_and_update(
            {
                'farmId': ObjectId(farmId),
                'date.day': start_update.day,
                'date.month': start_update.month,
                'date.year': start_update.year
            },
            {
                '$set': {
                    'waterDeficit': ETa - data['rainfall']['ave'] + info['waterDeficit']
                }
            }
        )

        start_update = start_update + timedelta(days=1)
        info = db.farminfos.find_one({
            'farmId': ObjectId(farmId),
            'date.day': start_update.day,
            'date.month': start_update.month,
            'date.year': start_update.year
        })
