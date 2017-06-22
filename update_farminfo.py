from requests import get, post
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime,timedelta

db = MongoClient().waiss

def compute_kc(maturity, crop_info):
    if maturity < crop_info['cutoff'][0]:
        return crop_info['cropCoefficient'][0]

    if maturity < crop_info['cutoff'][1]:
        return ((crop_info['cropCoefficient'][0] + (crop_info['cropCoefficient'][1] - crop_info['cropCoefficient'][0]) / (crop_info['cutoff'][1] - crop_info['cutoff'][0])) * (maturity - crop_info['cutoff'][0]))
    else:
        if maturity > crop_info['cutoff'][2]:
            return (crop_info['cropCoefficient'][1] - ((crop_info['cropCoefficient'][1] - crop_info['cropCoefficient'][w]) / (100 - crop_info['cutoff'][2])) * (maturity - crop_info['cutoff'][2]))
        else:
            return crop_info['cropCoefficient'][2]

for farm in db.farms.find():
    crop_info = get('http://159.203.253.4:3000/api/crop/{id}'.format(id=farm['crop'])).json()
    last_updated = (farm['updated'] - timedelta(days=1)).date()
    last_info = db.farminfos.find_one({
        'date.day': last_updated.day,
        'date.month': last_updated.month,
        'date.year': last_updated.year
    })

    water_deficit = last_info['waterDeficit']
    cumulative_gdd = last_info['cumulativeGdd']
    maturity = last_info['maturity']
    gdd_at_maturity = db.crops.find_one({'_id': ObjectId(farm['crop'])})['gddAtMaturity']

    now = datetime.now().date()
    current_date = last_updated + timedelta(days=1)

    while current_date < now:
        result = get('http://159.203.253.4:3001/data/{id}/waterdeficit/{d}-{m}-{y}'.format(id=farm['location']['stationId'], d=current_date.day, m=current_date.month, y=current_date.year))
        data = result.json()

        gdd = data['temp']['ave'] - 10
        cumulative_gdd = cumulative_gdd + gdd
        maturity = cumulative_gdd / float(gdd_at_maturity) * 100
        ETa = data['ET']['ave'] * compute_kc(maturity, crop_info)
        water_deficit = ETa - data['rainfall']['ave'] + water_deficit

        post('http://159.203.253.4:3000/api/farm/info', data={
            'farmId': farm['_id'],
            'day': current_date.day,
            'month': current_date.month,
            'year': current_date.year,
            'waterDeficit': water_deficit,
            'irrigation': 0,
            'gdd': gdd,
            'cumulativeGdd': cumulative_gdd,
            'maturity': maturity
        })

        current_date = current_date + timedelta(days=1)
